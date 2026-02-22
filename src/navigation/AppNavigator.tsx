// src/navigation/AppNavigator.tsx

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, StyleSheet, Platform } from "react-native";
import { SCREEN_NAMES, RootTabParamList, AppStackParamList } from "./Routes";
// Icons are handled by BottomNavigation component, so we use a simple placeholder
const Icon = ({ name, color, size }: any) => (
  <View style={{ width: size, height: size, backgroundColor: color }} />
);
import { ExploreScreen } from "../screens/ExploreScreen";
import { HostStackScreen } from "./HostStack";
import { ProfileScreen } from "../screens/ProfileScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { ReconnectScreen } from "../screens/ReconnectScreen";
import { BottomNavigation } from "./BottomNavigation";
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { EventDetailsScreen } from "../screens/EventDetailsScreen";
import CreatePostScreen from "../screens/CreatePostScreen";
import ExploreStack from "./ExploreStack";
import EngageStack from "./EngageStack";

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<AppStackParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName={SCREEN_NAMES.EXPLORE}
      tabBar={(props) => <BottomNavigation {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 0, display: "none" },
      }}
    >
      <Tab.Screen
        name={SCREEN_NAMES.EXPLORE}
        component={ExploreStack}
      />

      <Tab.Screen
        name={SCREEN_NAMES.ENGAGE}
        component={EngageStack}
      />

      <Tab.Screen
        name={SCREEN_NAMES.RECONNECT}
        component={ReconnectScreen} // ✅ REAL TAB
      />

      <Tab.Screen
        name={SCREEN_NAMES.HOST}
        component={HostStackScreen}
      />

      <Tab.Screen
        name={SCREEN_NAMES.PROFILE}
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={SCREEN_NAMES.MAIN_TABS}
        component={MainTabs}
      />

      {/* 🔔 Notifications opens from bell icon */}
      <Stack.Screen
        name={SCREEN_NAMES.NOTIFICATIONS}
        component={NotificationsScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.EDIT_PROFILE}
        component={EditProfileScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.EVENT_DETAILS_SCREEN}
        component={EventDetailsScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.CREATE_POST}
        component={CreatePostScreen}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
  },
  screenText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  screenSubText: {
    fontSize: 14,
    color: "#AAA",
    marginTop: 10,
  },
});
