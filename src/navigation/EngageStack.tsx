import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SCREEN_NAMES, EngageStackParamList } from "./Routes";

import { EngageScreen } from "../screens/EngageScreen";
import { ChatDetailScreen } from "../components/engage/ChatDetailScreen";
import { ChatSettingsScreen } from "../screens/ChatSettingsScreen";

const Stack = createNativeStackNavigator<EngageStackParamList>();

export default function EngageStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={SCREEN_NAMES.ENGAGE_HOME} component={EngageScreen} />
      <Stack.Screen
        name={SCREEN_NAMES.CHAT_DETAIL}
        component={ChatDetailScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.CHAT_SETTINGS}
        component={ChatSettingsScreen}
      />
    </Stack.Navigator>
  );
}
