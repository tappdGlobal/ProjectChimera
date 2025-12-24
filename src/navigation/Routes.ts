// src/navigation/Routes.ts

export const SCREEN_NAMES = {
  // Auth
  LOGIN: "Login",
  PROFILE_CREATION: "ProfileCreation",

  // App Stack
  MAIN_TABS: "MainTabs",
  EDIT_PROFILE: "EditProfile",

  // Tabs
  EXPLORE: "Explore",
  ENGAGE: "Engage",
  HOST: "Host",
  PROFILE: "Profile",
  NOTIFICATIONS: "Notifications",
  
  // Host Stack
  PUBLISHED_EVENTS: "PublishedEvents",
  DRAFT_EVENTS: "DraftEvents",
} as const;

export type AuthStackParamList = {
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
};
