// src/components/ui/Card.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { Theme } from "../../styles/Theme";

interface RNCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onClick?: (event: GestureResponderEvent) => void;
}
interface RNBaseProps {
  children: React.ReactNode;
  style?: ViewStyle | TextStyle;
}

// --- Card (Main Container) ---
export function Card({ children, style, onClick }: RNCardProps) {
  const Comp = onClick ? TouchableOpacity : View;

  return (
    <Comp
      style={[styles.cardBase, style]}
      onPress={onClick}
      activeOpacity={onClick ? 0.9 : 1}
    >
      {children}
    </Comp>
  );
}

// --- CardHeader ---
export function CardHeader({ children, style }: RNBaseProps) {
  // @container/card-header, grid, grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6
  // RN Flexbox approximation for grid structure:
  return (
    <View style={[styles.headerBase, style as ViewStyle]}>{children}</View>
  );
}

// --- CardTitle ---
export function CardTitle({ children, style }: RNBaseProps) {
  // h4 in web component, leading-none
  return <Text style={[styles.titleBase, style as TextStyle]}>{children}</Text>;
}

// --- CardDescription ---
export function CardDescription({ children, style }: RNBaseProps) {
  // text-muted-foreground
  return (
    <Text style={[styles.descriptionBase, style as TextStyle]}>{children}</Text>
  );
}

// --- CardAction (Assuming it holds buttons/icons) ---
export function CardAction({ children, style }: RNBaseProps) {
  // col-start-2 row-span-2 row-start-1 self-start justify-self-end
  // RN Flexbox equivalent for placing an item in the top right of a header
  return (
    <View style={[styles.actionBase, style as ViewStyle]}>{children}</View>
  );
}

// --- CardContent ---
export function CardContent({ children, style }: RNBaseProps) {
  // px-6 [&:last-child]:pb-6 (RN: apply padding, assume vertical stacking for content)
  return (
    <View style={[styles.contentBase, style as ViewStyle]}>{children}</View>
  );
}

// --- CardFooter ---
export function CardFooter({ children, style }: RNBaseProps) {
  // flex items-center px-6 pb-6 [.border-t]:pt-6
  return (
    <View style={[styles.footerBase, style as ViewStyle]}>{children}</View>
  );
}

// --- STYLESHEET (Translation from CSS Classes) ---
const styles = StyleSheet.create({
  // Card Base: bg-card text-card-foreground flex flex-col gap-6 rounded-xl border
  cardBase: {
    backgroundColor: Theme.colors.card,
    color: Theme.colors.cardForeground,
    flexDirection: "column",
    gap: 24, // gap-6 (6 * 4 = 24px)
    borderRadius: Theme.radius.xl, // rounded-xl
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },

  // CardHeader: items-start gap-1.5 px-6 pt-6
  headerBase: {
    flexDirection: "column", // Simplified structure for RN
    gap: 6, // gap-1.5
    paddingHorizontal: 24, // px-6
    paddingTop: 24, // pt-6
  },

  // CardTitle: leading-none (No specific size, usually inherits)
  titleBase: {
    // Assuming a standard h4 size, adjust if needed
    fontSize: 18,
    fontWeight: "bold",
    color: Theme.colors.cardForeground,
  },

  // CardDescription: text-muted-foreground
  descriptionBase: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
  },

  // CardAction (Top Right position within header)
  actionBase: {
    position: "absolute",
    top: 24, // pt-6
    right: 24, // px-6
    zIndex: 10,
  },

  // CardContent: px-6 [&:last-child]:pb-6
  contentBase: {
    paddingHorizontal: 24, // px-6
    paddingBottom: 24, // Assume the last child padding rule applies here
  },

  // CardFooter: flex items-center px-6 pb-6
  footerBase: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});

// Remove duplicate export to avoid redeclaration error
