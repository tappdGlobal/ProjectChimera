// src/components/navigation/BottomNavigation.tsx

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Home, Search, Users, Calendar, User } from "lucide-react-native";
import { Theme, GRADIENT_COLORS } from "../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { SCREEN_NAMES } from "../navigation/Routes";

// Map icon names to components
const IconMap = {
  [SCREEN_NAMES.ENGAGE]: Home, // Mapped Home icon to Engage tab ID from source
  [SCREEN_NAMES.EXPLORE]: Search,
  [SCREEN_NAMES.HOST]: Calendar,
  [SCREEN_NAMES.NOTIFICATIONS]: Users, // The source used Users for Reconnect/Notifications
  [SCREEN_NAMES.PROFILE]: User,
  reconnect: Users, // We will use this in the Explore placeholder for now
};

// Map labels to tab names
const LabelMap = {
  [SCREEN_NAMES.ENGAGE]: "Engage",
  [SCREEN_NAMES.EXPLORE]: "Explore",
  [SCREEN_NAMES.HOST]: "Host",
  [SCREEN_NAMES.NOTIFICATIONS]: "Reconnect", // Mapped to the Reconnect component/name
  [SCREEN_NAMES.PROFILE]: "Profile",
};

export function BottomNavigation({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <LinearGradient
      colors={GRADIENT_COLORS.primary as [string, string, ...string[]]} // Using the gradient for the entire bar
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Fix type error: route.name may not exist in IconMap or LabelMap, so use string indexing and fallback
          const tabName = route.name;
          const IconComponent = IconMap[tabName as keyof typeof IconMap] || Home; // Default to Home if not found
          const label =
            LabelMap[tabName as keyof typeof LabelMap] || tabName;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              // @ts-expect-error: tabBarTestID is not in BottomTabNavigationOptions type, but may be present at runtime
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
            >
              <View
                style={[
                  styles.tabButton,
                  isFocused && styles.tabButtonActive, // bg-white/20 effect
                ]}
              >
                <IconComponent
                  size={20}
                  // Active tabs are white, inactive are white/70
                  color={
                    isFocused
                      ? Theme.colors.primaryForeground
                      : Theme.colors.mutedForeground
                  }
                />
                <Text
                  style={[
                    styles.tabLabel,
                    isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                  ]}
                >
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    // Fixed bottom bar styles from source: fixed bottom-0 left-0 right-0 gradient-primary border-t border-border
    borderTopWidth: 1,
    borderColor: Theme.colors.border,
    paddingBottom: 0, // This is controlled by safe area in the calling component (AppNavigator)
  },
  tabBarInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 8, // py-2 equivalent
    paddingHorizontal: 16, // px-4 equivalent
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  tabButton: {
    // flex flex-col items-center gap-1 py-2 px-3 rounded-lg
    flexDirection: "column",
    alignItems: "center",
    gap: 4, // gap-1 equivalent
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Theme.radius.lg,
  },
  tabButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)", // bg-white/20
  },
  tabLabel: {
    fontSize: 12, // text-xs
  },
  tabLabelActive: {
    color: Theme.colors.primaryForeground, // text-white
  },
  tabLabelInactive: {
    color: Theme.colors.mutedForeground, // text-white/70
  },
});
