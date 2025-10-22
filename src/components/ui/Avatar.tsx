// src/components/ui/Avatar.tsx

import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  ImageSourcePropType,
} from "react-native";
import { Theme } from "../../styles/Theme";

// --- 1. Avatar Root ---
interface AvatarProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Avatar({ children, style }: AvatarProps) {
  // size-10 (40px) shrink-0 overflow-hidden rounded-full
  return <View style={[styles.rootBase, style]}>{children}</View>;
}

// --- 2. Avatar Image ---
interface AvatarImageProps {
  src: string;
  alt: string;
  style?: ImageStyle;
}

export function AvatarImage({ src, alt, style }: AvatarImageProps) {
  // aspect-square size-full
  return (
    <Image
      source={{ uri: src } as ImageSourcePropType}
      alt={alt}
      style={[styles.imageBase, style]}
      resizeMode="cover"
    />
  );
}

// --- 3. Avatar Fallback ---
interface AvatarFallbackProps {
  children: React.ReactNode; // Typically initials or an icon
  style?: ViewStyle;
}

export function AvatarFallback({ children, style }: AvatarFallbackProps) {
  // bg-muted flex size-full items-center justify-center rounded-full
  return (
    <View style={[styles.fallbackBase, style]}>
      <Text style={styles.fallbackText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // size-10 (40px)
  rootBase: {
    width: 40,
    height: 40,
    borderRadius: 9999, // rounded-full
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    position: "relative",
  },
  // size-full
  imageBase: {
    width: "100%",
    height: "100%",
    aspectRatio: 1,
  },
  // bg-muted
  fallbackBase: {
    backgroundColor: Theme.colors.muted,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    fontWeight: "500",
  },
});
