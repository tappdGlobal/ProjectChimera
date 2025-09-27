// src/components/ui/Badge.tsx

import React from "react";
import { Text, View, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { Theme } from "../../styles/Theme";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// 1. CVA Translation to StyleSheet
const baseStyles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.radius.md, // rounded-md
    paddingHorizontal: 8, // px-2 equivalent
    paddingVertical: 2, // py-0.5 equivalent
    borderWidth: 1,
    // text-xs (12px), font-medium (500)
  },
  text: {
    fontSize: 12,
    fontWeight: Theme.fontWeights.medium,
    lineHeight: 16, // Ensure vertical centering for single line text
  },
});

const variantStyles = StyleSheet.create({
  default: {
    backgroundColor: Theme.colors.primary,
    borderColor: "transparent", // border-transparent
  },
  defaultText: {
    color: Theme.colors.primaryForeground,
  },
  secondary: {
    backgroundColor: Theme.colors.secondary,
    borderColor: "transparent",
  },
  secondaryText: {
    color: Theme.colors.secondaryForeground,
  },
  destructive: {
    backgroundColor: Theme.colors.destructive,
    borderColor: "transparent",
  },
  destructiveText: {
    color: Theme.colors.foreground, // text-white (foreground)
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: Theme.colors.border, // Default border for outline
  },
  outlineText: {
    color: Theme.colors.foreground,
  },
});

const getVariantStyle = (variant: BadgeVariant) => {
  switch (variant) {
    case "secondary":
      return {
        container: variantStyles.secondary,
        text: variantStyles.secondaryText,
      };
    case "destructive":
      return {
        container: variantStyles.destructive,
        text: variantStyles.destructiveText,
      };
    case "outline":
      return {
        container: variantStyles.outline,
        text: variantStyles.outlineText,
      };
    case "default":
    default:
      return {
        container: variantStyles.default,
        text: variantStyles.defaultText,
      };
  }
};

export function Badge({
  children,
  variant = "default",
  style,
  textStyle,
}: BadgeProps) {
  const { container, text } = getVariantStyle(variant);

  // NOTE: For the specific usage in ExploreAll.tsx with 'gradient-primary',
  // we will handle the color override in the parent component where it is used.

  return (
    <View style={[baseStyles.badge, container, style]}>
      {/* We strip out web-specific elements like Slot and span */}
      <Text style={[baseStyles.text, text, textStyle]}>{children}</Text>
    </View>
  );
}
