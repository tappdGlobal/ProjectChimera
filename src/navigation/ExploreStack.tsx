import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SCREEN_NAMES } from "./Routes";

import { ExploreScreen } from "../screens/ExploreScreen";
import EventDiscoveryScreen from "../screens/EventDiscoveryScreen";
import EventDetailScreen from "../screens/EventDetailScreen";

const Stack = createNativeStackNavigator();

export default function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={SCREEN_NAMES.EXPLORE_HOME}
        component={ExploreScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.EVENT_DISCOVERY}
        component={EventDiscoveryScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.EVENT_DETAIL}
        component={EventDetailScreen}
      />
    </Stack.Navigator>
  );
}
