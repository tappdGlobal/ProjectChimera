import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SCREEN_NAMES, ExploreStackParamList } from "./Routes";

import { ExploreScreen } from "../screens/ExploreScreen";
import EventDiscoveryScreen from "../screens/EventDiscoveryScreen";
import { EventDetailsScreen } from "../screens/EventDetailsScreen";
import { CategoryEventsScreen } from "../screens/CategoryEventsScreen";
import { Theme } from "../styles/Theme";

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStack() {
  return (
    <Stack.Navigator
      initialRouteName={SCREEN_NAMES.EXPLORE_HOME}
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.background,
        },
        headerTintColor: Theme.colors.foreground,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      {/* Explore Home */}
      <Stack.Screen
        name={SCREEN_NAMES.EXPLORE_HOME}
        component={ExploreScreen}
        options={{ headerShown: false }}
      />

      {/* Event Discovery */}
      <Stack.Screen
        name={SCREEN_NAMES.EVENT_DISCOVERY}
        component={EventDiscoveryScreen}
        options={{ headerShown: false }}
      />

      {/* Event Detail */}
      <Stack.Screen
        name={SCREEN_NAMES.EVENT_DETAIL}
        component={EventDetailsScreen}
        options={{ headerShown: false }}
      />

      {/* Category Events Screen */}
      <Stack.Screen
        name={SCREEN_NAMES.CATEGORY_EVENTS}
        component={CategoryEventsScreen}
        options={({ route }) => ({
          title: route.params.category,
          headerShown: true,
        })}
      />
    </Stack.Navigator>
  );
}