import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Home, Search, Users, Calendar, User } from "lucide-react-native";
import { Theme, GRADIENT_COLORS } from "../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { SCREEN_NAMES } from "../navigation/Routes";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  [SCREEN_NAMES.RECONNECT]: "Reconnect", // 👈 stays same
  [SCREEN_NAMES.HOST]: "Host",
  [SCREEN_NAMES.PROFILE]: "Profile",
};

export function BottomNavigation({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {

  // 👇 detects Android navigation bar / gesture height
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={GRADIENT_COLORS.primary as [string, string, ...string[]]}
      style={[
        styles.container,
        { paddingBottom: insets.bottom } // 👈 pushes tab above system buttons
      ]}
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
              activeOpacity={0.8}
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

                {/* 🔥 prevents "Reconnect" from wrapping */}
                <Text
                  numberOfLines={1}
                  ellipsizeMode="clip"
                  adjustsFontSizeToFit
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
    paddingTop: 4,
  },

  tabBarInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 6,
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
    minWidth: 68, // ensures "Reconnect" fits
  },

  tabButton: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: Theme.radius.lg,
  },

  tabButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
    includeFontPadding: false,
    width: "100%",
  },

  tabLabelActive: {
    color: Theme.colors.primaryForeground,
    fontWeight: "600",
  },

  tabLabelInactive: {
    color: Theme.colors.mutedForeground,
  },
});
