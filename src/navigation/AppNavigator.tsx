// src/navigation/AppNavigator.tsx

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import { SCREEN_NAMES, RootTabParamList } from "./Routes";
import Icon from "react-native-vector-icons/Ionicons"; // Example icon library
import { ExploreScreen } from "../screens/ExploreScreen";
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
const EngageScreen = () => <PlaceholderScreen name={SCREEN_NAMES.ENGAGE} />;
const HostScreen = () => <PlaceholderScreen name={SCREEN_NAMES.HOST} />;
const NotificationsScreen = () => (
  <PlaceholderScreen name={SCREEN_NAMES.NOTIFICATIONS} />
);
const ProfileScreen = () => <PlaceholderScreen name={SCREEN_NAMES.PROFILE} />;

// -------------------------------------

const Tab = createBottomTabNavigator<RootTabParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName={SCREEN_NAMES.EXPLORE}
      screenOptions={{
        headerShown: false, // We'll manage headers inside the screens
        tabBarShowLabel: false, // Assuming the BottomNavigation component only uses icons
        tabBarStyle: styles.tabBar,
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
      <Tab.Screen
        name={SCREEN_NAMES.HOST}
        component={HostScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="notifications-outline" color={color} size={size} />
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
