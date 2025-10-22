// src/navigation/AppNavigator.tsx

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import { SCREEN_NAMES, RootTabParamList } from "./Routes";
import Icon from "react-native-vector-icons/Ionicons"; // Example icon library
import { ExploreScreen } from "../screens/ExploreScreen";
import { HostStackScreen } from "./HostStack";
import { ProfileScreen } from "../screens/ProfileScreen";
import { EngageScreen } from "../screens/EngageScreen"; // <<< NEW IMPORT
import { NotificationsScreen } from "../screens/NotificationsScreen"; // <<< NEW IMPORT
import { ReconnectScreen } from "../screens/ReconnectScreen";
import { BottomNavigation } from "./BottomNavigation";

// --- TEMPORARY SCREEN PLACEHOLDERS ---
// These will be replaced with the actual components from src/screens/ later.

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenText}>Welcome to the {name} Screen</Text>
    <Text style={styles.screenSubText}>
      (Content from Figma Make's {name}.tsx will go here)
    </Text>
  </View>
);

const Tab = createBottomTabNavigator<RootTabParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName={SCREEN_NAMES.EXPLORE}
      // FIX: Apply custom tab bar component
      tabBar={(props) => <BottomNavigation {...props} />}
      screenOptions={{
        headerShown: false,
        // We will remove the custom styles for the default tab bar here
        // since we are using a custom component.
        tabBarStyle: { height: 0, display: "none" }, // Hide the default bar
      }}
    >
      <Tab.Screen
        name={SCREEN_NAMES.EXPLORE}
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="compass-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.ENGAGE}
        component={EngageScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="people-outline" color={color} size={size} />
          ),
        }}
      />
      {/* <Tab.Screen
        name={SCREEN_NAMES.RECONNECT} // Assuming you used RECONNECT as a screen name
        component={ReconnectScreen} // <<< USE THE REAL SCREEN
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="people-outline" color={color} size={size} />
          ),
        }}
      /> */}
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
        name={SCREEN_NAMES.NOTIFICATIONS} // Use NOTIFICATIONS tab ID for now, as it corresponds to the position
        component={ReconnectScreen} // <<< USE REAL RECONNECT SCREEN
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

export default AppNavigator;

// Basic styles for placehoder and Tab Bar (will be refined with actual theme later)
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E1E", // Dark background to match assumption in root App.tsx
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
  tabBar: {
    backgroundColor: "#1E1E1E",
    borderTopColor: "#333",
    height: 90, // Increased height for safe area context padding
    paddingBottom: 25,
  },
});
