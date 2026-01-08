import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Theme } from "../../styles/Theme";

export function MapTabContent() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map view coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.background,
  },
  text: {
    color: Theme.colors.mutedForeground,
    fontSize: 16,
    fontWeight: Theme.fontWeights.medium,
  },
});
