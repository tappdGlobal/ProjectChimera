import { databaseService } from './databaseService';
import { userApi } from '../api/userApi';

export const syncService = {
  queueAction: async (actionType: string, payload: any) => {
    try {
      await databaseService.queueOfflineAction(actionType, payload);
      console.log(`Action queued: ${actionType}`);
    } catch (error) {
      console.error('Failed to queue action:', error);
    }
  },

  syncActions: async () => {
    try {
      // Fetch unsynced actions via the databaseService abstraction
      const actions = await databaseService.getUnsyncedActions();

      if (!actions || actions.length === 0) {
        console.log('No actions to sync');
        return;
      }

      console.log(`Syncing ${actions.length} actions...`);

      for (const action of actions) {
        // @ts-ignore
        const { id, action_type, payload } = action;
        
        try {
          if (action_type === 'UPDATE_PROFILE') {
            const userData = JSON.parse(payload);
            await userApi.updateProfile(userData.id, {
              name: userData.name,
              bio: userData.bio,
              profilePicUrl: userData.avatar,
              occupation: userData.occupation,
              education: userData.education,
              lookingFor: userData.lookingFor,
              age: userData.age,
              height: userData.height,
              gender: userData.gender,
              location: userData.location,
              interests: userData.interests,
              smoking: userData.smoking,
              drinking: userData.drinking,
            });
            console.log(`Updated profile for user ${userData.id}`);
          } else {
            console.log(`Unknown action type: ${action_type}`);
          }

          // Mark as synced
          await databaseService.markActionSynced(id);
        } catch (error) {
          console.error(`Failed to process action ${id}: ${action_type}`, error);
          // Optionally, mark as failed or retry later
        }
      }

      console.log('Sync complete');
    } catch (error) {
      console.error('Failed to sync actions:', error);
    }
  },
};
