import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Home, Search, Users, Calendar, User } from "lucide-react-native";
import { Theme, GRADIENT_COLORS } from "../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { SCREEN_NAMES } from "../navigation/Routes";

/* ---------------- ICON MAP ---------------- */
const IconMap = {
  [SCREEN_NAMES.ENGAGE]: Home,
  [SCREEN_NAMES.EXPLORE]: Search,
  [SCREEN_NAMES.RECONNECT]: Users,
  [SCREEN_NAMES.HOST]: Calendar,
  [SCREEN_NAMES.PROFILE]: User,
};

/* ---------------- LABEL MAP ---------------- */
const LabelMap = {
  [SCREEN_NAMES.ENGAGE]: "Engage",
  [SCREEN_NAMES.EXPLORE]: "Explore",
  [SCREEN_NAMES.RECONNECT]: "Reconnect",
  [SCREEN_NAMES.HOST]: "Host",
  [SCREEN_NAMES.PROFILE]: "Profile",
};

export function BottomNavigation({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <LinearGradient
      colors={GRADIENT_COLORS.primary as [string, string, ...string[]]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const tabName = route.name as keyof typeof IconMap;
          const IconComponent = IconMap[tabName] ?? Home;
          const label = LabelMap[tabName] ?? route.name;

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
              // @ts-expect-error runtime only
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
            >
              <View
                style={[
                  styles.tabButton,
                  isFocused && styles.tabButtonActive,
                ]}
              >
                <IconComponent
                  size={20}
                  color={
                    isFocused
                      ? Theme.colors.primaryForeground
                      : Theme.colors.mutedForeground
                  }
                />
                <Text
                  style={[
                    styles.tabLabel,
                    isFocused
                      ? styles.tabLabelActive
                      : styles.tabLabelInactive,
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

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderColor: Theme.colors.border,
  },

  tabBarInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
  },

  tabButton: {
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Theme.radius.lg,
  },

  tabButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  tabLabel: {
    fontSize: 12,
  },

  tabLabelActive: {
    color: Theme.colors.primaryForeground,
  },

  tabLabelInactive: {
    color: Theme.colors.mutedForeground,
  },
});
