import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SCREEN_NAMES, EngageStackParamList } from "./Routes";

import { EngageScreen } from "../screens/EngageScreen";
import ChatListScreen from "../screens/ChatListScreen";
import ChatDetailScreen from "../screens/ChatDetailScreen";
import { ChatSettingsScreen } from "../screens/ChatSettingsScreen";

const Stack = createNativeStackNavigator<EngageStackParamList>();

export default function EngageStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Engage Home */}
      <Stack.Screen
        name={SCREEN_NAMES.ENGAGE_HOME}
        component={EngageScreen}
      />

      {/* Chat List (NEW – no behavior change yet) */}
      <Stack.Screen
        name={SCREEN_NAMES.CHAT_LIST}
        component={ChatListScreen}
      />

      {/* Chat Detail (EXISTING – untouched) */}
      <Stack.Screen
        name={SCREEN_NAMES.CHAT_DETAIL}
        component={ChatDetailScreen}
      />

      {/* Chat Settings (EXISTING – untouched) */}
      <Stack.Screen
        name={SCREEN_NAMES.CHAT_SETTINGS}
        component={ChatSettingsScreen}
      />
    </Stack.Navigator>
  );
}
