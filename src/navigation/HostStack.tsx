// src/navigation/HostStack.tsx

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { HostScreen } from "../screens/HostScreen";
import { PublishedEventsScreen } from "../screens/PublishedEventsScreen";
import { DraftEventsScreen } from "../screens/DraftEventsScreen";
import { SCREEN_NAMES } from "./Routes";

const HostStack = createStackNavigator();

export function HostStackScreen() {
  return (
    <HostStack.Navigator screenOptions={{ headerShown: false }}>
      {/* HostScreen is the main entry point for the tab */}
      <HostStack.Screen name={SCREEN_NAMES.HOST} component={HostScreen} />

      {/* Secondary screens accessible from the HostScreen header/tabs */}
      <HostStack.Screen
        name={SCREEN_NAMES.PUBLISHED_EVENTS}
        component={PublishedEventsScreen}
      />
      <HostStack.Screen
        name={SCREEN_NAMES.DRAFT_EVENTS}
        component={DraftEventsScreen}
      />
    </HostStack.Navigator>
  );
}
