// src/navigation/AppNavigator.tsx

import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View } from "react-native";
import { SCREEN_NAMES, RootTabParamList, AppStackParamList } from "./Routes";

import { AnimatedSplashScreen } from "../screens/AnimatedSplashScreen";
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
import ChatDetailScreen from "../screens/ChatDetailScreen";

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
        component={ReconnectScreen}
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
  const [showSplash, setShowSplash] = useState(true);

  // ✅ Splash handled here
  if (showSplash) {
    return (
      <AnimatedSplashScreen
        onAnimationComplete={() => setShowSplash(false)}
      />
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#0A0A1F" },
      }}
    >
      <Stack.Screen
        name={SCREEN_NAMES.MAIN_TABS}
        component={MainTabs}
      />

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

      <Stack.Screen
        name={SCREEN_NAMES.CHAT_DETAIL}
        component={ChatDetailScreen}
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
