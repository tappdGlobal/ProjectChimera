import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Theme } from "../../styles/Theme";
export function PreferableMatchSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Preferable Match Section (Placeholder)</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { color: Theme.colors.mutedForeground },
});
