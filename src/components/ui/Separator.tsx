// src/components/ui/Separator.tsx

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Theme } from "../../styles/Theme";

interface SeparatorProps {
  className?: string; // e.g., "bg-white/10"
  style?: ViewStyle;
}

export function Separator({ className, style }: SeparatorProps) {
  // Translate "bg-white/10" (which is Theme.colors.border or a custom muted style)
  const colorStyle: ViewStyle = {
    backgroundColor: Theme.colors.border, // Use border color as the default separator color
  };

  return <View style={[styles.base, colorStyle, style]} />;
}

const styles = StyleSheet.create({
  // border-b border-white/10 in context
  base: {
    height: 1, // h-[1px]
    width: "100%",
    marginVertical: 8, // Add some vertical margin for visibility (can be overridden)
  },
});
