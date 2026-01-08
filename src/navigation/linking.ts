import * as Linking from 'expo-linking';

export const linking = {
  prefixes: [Linking.createURL('/'), 'tappd://'],
  config: {
    screens: {
      // Auth Stack
      Login: 'login',
      ProfileCreation: 'create-profile',
      
      // App Stack
      MainTabs: {
        screens: {
          Explore: 'explore',
          Engage: 'engage',
          Host: 'host',
          Notifications: 'notifications',
          Profile: 'profile',
        },
      },
      EditProfile: 'edit-profile',
    },
  },
};
