import * as Linking from 'expo-linking';

export const linking = {
  prefixes: [Linking.createURL('/'), 'tappd://'],
  config: {
    screens: {
      // Auth Stack
      Login: 'login',
      ProfileCreation: 'create-profile',
      
      // App Stack (Nested via RootNavigator logic, but we map screens directly if possible or via nested navigators)
      // Since RootNavigator switches based on Auth state, deep links might be tricky if not authenticated.
      // For now, we assume the user is authenticated for App links.
      
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
