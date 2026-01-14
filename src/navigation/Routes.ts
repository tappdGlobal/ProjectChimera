// src/navigation/Routes.ts

export const SCREEN_NAMES = {
  // Auth
  WELCOME: "Welcome",
  LOGIN: "Login",
  PROFILE_CREATION: "ProfileCreation",

  // App Stack
  MAIN_TABS: "MainTabs",
  EDIT_PROFILE: "EditProfile",
  CHAT_DETAIL: "ChatDetail", // ✅ Added

  // Tabs
  EXPLORE: "Explore",
  EXPLORE_HOME: "ExploreHome",
  ENGAGE: "Engage",
  HOST: "Host",
  PROFILE: "Profile",
  NOTIFICATIONS: "Notifications",

  // Explore Stack
  EVENT_DISCOVERY: "EventDiscovery",
  EVENT_DETAIL: "EventDetail", // ✅ ADD THIS

  // Host Stack
  PUBLISHED_EVENTS: "PublishedEvents",
  DRAFT_EVENTS: "DraftEvents",
} as const;


export type AuthStackParamList = {
  [SCREEN_NAMES.WELCOME]: undefined;
  [SCREEN_NAMES.LOGIN]: undefined;
  [SCREEN_NAMES.PROFILE_CREATION]: undefined;
};

export type RootTabParamList = {
  [SCREEN_NAMES.EXPLORE]: undefined;
  [SCREEN_NAMES.ENGAGE]: undefined;
  [SCREEN_NAMES.HOST]: undefined;
  [SCREEN_NAMES.NOTIFICATIONS]: undefined;
  [SCREEN_NAMES.PROFILE]: undefined;
};

export type AppStackParamList = {
  [SCREEN_NAMES.MAIN_TABS]: undefined;
  [SCREEN_NAMES.EDIT_PROFILE]: undefined;
  [SCREEN_NAMES.CHAT_DETAIL]: {
    chatId: string;
    name: string;
    avatar: string;
  };
};

export type ExploreStackParamList = {
  ExploreScreen: undefined;

  [SCREEN_NAMES.EVENT_DISCOVERY]: {
    category: string;
  };

  [SCREEN_NAMES.EVENT_DETAIL]: {
    event: any; 
  };
};

