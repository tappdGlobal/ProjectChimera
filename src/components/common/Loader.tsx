// src/components/ui/Loader.tsx

import React from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  Text,
  TextStyle,
} from "react-native";
import { Theme } from "../../styles/Theme";

type LoaderSize = "small" | "large";
type LoaderVariant = "default" | "overlay" | "inline";

interface LoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  text?: string;
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullScreen?: boolean;
}

export function Loader({
  size = "small",
  variant = "default",
  text,
  color = Theme.colors.primary,
  style,
  textStyle,
  fullScreen = false,
}: LoaderProps) {
  if (variant === "overlay") {
    return (
      <View style={[styles.overlayContainer, fullScreen && styles.fullScreen, style]}>
        <View style={styles.overlayContent}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          {text && (
            <Text style={[styles.overlayText, textStyle]}>{text}</Text>
          )}
        </View>
      </View>
    );
  }

  if (variant === "inline") {
    return (
      <View style={[styles.inlineContainer, style]}>
        <ActivityIndicator size={size} color={color} />
        {text && <Text style={[styles.inlineText, textStyle]}>{text}</Text>}
      </View>
    );
  }

  // Default variant
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.m,
  },
  text: {
    marginTop: Theme.spacing.s,
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    fontWeight: Theme.fontWeights.medium,
  },
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineText: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    fontWeight: Theme.fontWeights.medium,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 3, 34, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  fullScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayContent: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  overlayText: {
    marginTop: Theme.spacing.m,
    fontSize: 14,
    color: Theme.colors.foreground,
    fontWeight: Theme.fontWeights.medium,
    textAlign: "center",
  },
});
