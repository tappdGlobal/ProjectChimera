import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock } from "lucide-react-native";
import { Theme } from "../../styles/Theme";

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export function MapTabContent({
  title = "Feature Coming Soon",
  description = "We’re working hard to bring this feature to you.",
}: ComingSoonProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Clock size={28} color={Theme.colors.primaryForeground} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.xl,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
    width: "100%",
    maxWidth: 360,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  description: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
