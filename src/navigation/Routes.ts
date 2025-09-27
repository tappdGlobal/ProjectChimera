// src/navigation/Routes.ts

export const SCREEN_NAMES = {
  EXPLORE: "Explore",
  ENGAGE: "Engage",
  HOST: "Host",
  NOTIFICATIONS: "Notifications",
  PROFILE: "Profile",
} as const;

export type RootTabParamList = {
  [SCREEN_NAMES.EXPLORE]: undefined;
  [SCREEN_NAMES.ENGAGE]: undefined;
  [SCREEN_NAMES.HOST]: undefined;
  [SCREEN_NAMES.NOTIFICATIONS]: undefined;
  [SCREEN_NAMES.PROFILE]: undefined;
};
