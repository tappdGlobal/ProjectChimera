// src/navigation/Routes.ts

export const SCREEN_NAMES = {
  // ================= AUTH =================
  WELCOME: "Welcome",
  LOGIN: "Login",
  PROFILE_CREATION: "ProfileCreation",

  // ================= APP STACK =================
  MAIN_TABS: "MainTabs",
  EDIT_PROFILE: "EditProfile",
  CHAT_DETAIL: "ChatDetail",
  CHAT_SETTINGS: "ChatSettings",

  // ================= TABS =================
  EXPLORE: "Explore",
  ENGAGE: "Engage",
  HOST: "Host",
  PROFILE: "Profile",
  NOTIFICATIONS: "Notifications",

  // ================= EXPLORE STACK =================
  EXPLORE_HOME: "ExploreHome",
  EVENT_DISCOVERY: "EventDiscovery",
  EVENT_DETAIL: "EventDetail",

  // ================= ENGAGE STACK =================
  ENGAGE_HOME: "EngageHome",

  // ================= HOST STACK =================
  HOST_MAIN: "HostMain",          // ✅ IMPORTANT (HostScreen)
  DRAFT_EVENTS: "DraftEvents",
  PUBLISHED_EVENTS: "PublishedEvents",

  // ================= STANDALONE =================
  EVENT_DETAILS_SCREEN: "EventDetailsScreen",
  NOTIFICATIONS_SCREEN: "NotificationsScreen",
} as const;

/* ================= AUTH STACK ================= */

export type AuthStackParamList = {
  [SCREEN_NAMES.WELCOME]: undefined;
  [SCREEN_NAMES.LOGIN]: undefined;
  [SCREEN_NAMES.PROFILE_CREATION]: undefined;
};

/* ================= ROOT TABS ================= */

export type RootTabParamList = {
  [SCREEN_NAMES.EXPLORE]: undefined;
  [SCREEN_NAMES.ENGAGE]: undefined;
  [SCREEN_NAMES.HOST]: undefined; // ⬅ HostStack is mounted here
  [SCREEN_NAMES.NOTIFICATIONS]: undefined;
  [SCREEN_NAMES.PROFILE]: undefined;
};

/* ================= APP STACK ================= */

export type AppStackParamList = {
  [SCREEN_NAMES.MAIN_TABS]: undefined;
  [SCREEN_NAMES.EDIT_PROFILE]: undefined;
  [SCREEN_NAMES.CHAT_DETAIL]: {
    chatId: string;
    name: string;
    avatar: string;
  };
  [SCREEN_NAMES.CHAT_SETTINGS]: undefined;
  [SCREEN_NAMES.EVENT_DETAILS_SCREEN]: undefined;
  [SCREEN_NAMES.NOTIFICATIONS_SCREEN]: undefined;
};

/* ================= EXPLORE STACK ================= */

export type ExploreStackParamList = {
  [SCREEN_NAMES.EXPLORE_HOME]: undefined;

  [SCREEN_NAMES.EVENT_DISCOVERY]: {
    category: string;
  };

  [SCREEN_NAMES.EVENT_DETAIL]: {
    event: any;
  };
};

/* ================= ENGAGE STACK ================= */

export type EngageStackParamList = {
  [SCREEN_NAMES.ENGAGE_HOME]: undefined;

  [SCREEN_NAMES.CHAT_DETAIL]: {
    chatId: string;
    name: string;
    avatar: string;
  };

  [SCREEN_NAMES.CHAT_SETTINGS]: undefined;
};

/* ================= HOST STACK ================= */

export type HostStackParamList = {
  [SCREEN_NAMES.HOST_MAIN]: {
    editingDraft?: any; // ✅ Draft edit support
  } | undefined;

  [SCREEN_NAMES.DRAFT_EVENTS]: undefined;

  [SCREEN_NAMES.PUBLISHED_EVENTS]: undefined;
};
