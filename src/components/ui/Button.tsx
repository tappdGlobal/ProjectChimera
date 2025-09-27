// src/components/ui/Button.tsx

import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from "react-native";
import { Theme } from "../../styles/Theme";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  // We'll map the `className` logic to specific style props if needed
}

// --- 1. CVA Base and Shared Styles ---
const baseStyles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: Theme.radius.md, // rounded-md
    // text-sm (14px), font-medium (500)
  },
  text: {
    fontSize: 14,
    fontWeight: Theme.fontWeights.medium,
    textAlign: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});

// --- 2. Size Variants Translation ---
const sizeStyles = StyleSheet.create({
  default: {
    minHeight: 36, // h-9
    paddingHorizontal: 16, // px-4
    paddingVertical: 8, // py-2 (default, for no icon)
  },
  sm: {
    minHeight: 32, // h-8
    borderRadius: Theme.radius.md,
    paddingHorizontal: 12, // px-3
    gap: 6, // gap-1.5
  },
  lg: {
    minHeight: 40, // h-10
    borderRadius: Theme.radius.md,
    paddingHorizontal: 24, // px-6
  },
  icon: {
    width: 36, // size-9
    height: 36, // size-9
    borderRadius: Theme.radius.md,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});

// --- 3. Color/Variant Translation ---
const variantStyles = StyleSheet.create({
  default: { backgroundColor: Theme.colors.primary },
  defaultText: { color: Theme.colors.primaryForeground },
  // Destructive uses white text on destructive background (mapped to foreground/destructive)
  destructive: { backgroundColor: Theme.colors.destructive },
  destructiveText: { color: Theme.colors.foreground },
  // Outline uses transparent background with border
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  outlineText: { color: Theme.colors.foreground },
  secondary: { backgroundColor: Theme.colors.secondary },
  secondaryText: { color: Theme.colors.secondaryForeground },
  ghost: { backgroundColor: "transparent" },
  ghostText: { color: Theme.colors.foreground },
  link: { backgroundColor: "transparent" },
  linkText: { color: Theme.colors.primary, textDecorationLine: "underline" },
});

const getVariantStyle = (variant: ButtonVariant) => {
  switch (variant) {
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
    case "secondary":
      return {
        container: variantStyles.secondary,
        text: variantStyles.secondaryText,
      };
    case "ghost":
      return { container: variantStyles.ghost, text: variantStyles.ghostText };
    case "link":
      return { container: variantStyles.link, text: variantStyles.linkText };
    case "default":
    default:
      return {
        container: variantStyles.default,
        text: variantStyles.defaultText,
      };
  }
};

export function Button({
  children,
  variant = "default",
  size = "default",
  onClick,
  style,
  textStyle,
}: ButtonProps) {
  const { container: variantContainer, text: variantText } =
    getVariantStyle(variant);
  const sizeContainer = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onClick}
      style={[baseStyles.button, variantContainer, sizeContainer, style]}
      activeOpacity={0.7} // Simulates transition: hover:bg-primary/90
    >
      <Text style={[baseStyles.text, variantText, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
}
