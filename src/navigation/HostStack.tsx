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
      <HostStack.Screen
        name={SCREEN_NAMES.HOST_MAIN}
        component={HostScreen}
      />

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

