import { databaseService } from './databaseService';

export const syncService = {
  queueAction: async (actionType: string, payload: any) => {
    try {
      const db = databaseService.getDatabase();
      const jsonPayload = JSON.stringify(payload);
      const createdAt = Date.now();
      
      await db.runAsync(
        'INSERT INTO offline_actions (action_type, payload, created_at) VALUES (?, ?, ?)',
        actionType,
        jsonPayload,
        createdAt
      );
      
      console.log(`Action queued: ${actionType}`);
    } catch (error) {
      console.error('Failed to queue action:', error);
    }
  },

  syncActions: async () => {
    try {
      const db = databaseService.getDatabase();
      
      // Fetch unsynced actions
      const actions = await db.getAllAsync('SELECT * FROM offline_actions WHERE synced = 0');
      
      if (actions.length === 0) {
        console.log('No actions to sync');
        return;
      }

      console.log(`Syncing ${actions.length} actions...`);

      for (const action of actions) {
        // @ts-ignore
        const { id, action_type, payload } = action;
        
        // Simulate processing
        console.log(`Processing action ${id}: ${action_type}`, payload);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Mock API delay

        // Mark as synced (or delete)
        await db.runAsync('UPDATE offline_actions SET synced = 1 WHERE id = ?', id);
      }

      console.log('Sync complete');
    } catch (error) {
      console.error('Failed to sync actions:', error);
    }
  },
};
