// src/navigation/AppNavigator.tsx

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, StyleSheet } from "react-native";
import { SCREEN_NAMES, RootTabParamList, AppStackParamList } from "./Routes";
import Icon from "react-native-vector-icons/Ionicons"; // Example icon library
import { ExploreScreen } from "../screens/ExploreScreen";
import { HostStackScreen } from "./HostStack";
import { ProfileScreen } from "../screens/ProfileScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { ReconnectScreen } from "../screens/ReconnectScreen";
import { BottomNavigation } from "./BottomNavigation";
import { EditProfileScreen } from "../screens/EditProfileScreen";
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
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="compass-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name={SCREEN_NAMES.ENGAGE}
        component={EngageStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.HOST}
        component={HostStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.NOTIFICATIONS}
        component={ReconnectScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.PROFILE}
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={SCREEN_NAMES.MAIN_TABS} component={MainTabs} />
      <Stack.Screen
        name={SCREEN_NAMES.EDIT_PROFILE}
        component={EditProfileScreen}
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
