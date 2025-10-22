// src/navigation/Routes.ts

export const SCREEN_NAMES = {
  EXPLORE: "Explore",
  ENGAGE: "Engage",
  HOST: "Host",
  PROFILE: "Profile",
  NOTIFICATIONS: "Notifications",
  PUBLISHED_EVENTS: "PublishedEvents",
  DRAFT_EVENTS: "DraftEvents",
} as const;

export type RootTabParamList = {
  [SCREEN_NAMES.EXPLORE]: undefined;
  [SCREEN_NAMES.ENGAGE]: undefined;
  [SCREEN_NAMES.HOST]: undefined;
  [SCREEN_NAMES.NOTIFICATIONS]: undefined;
  [SCREEN_NAMES.PROFILE]: undefined;
};
