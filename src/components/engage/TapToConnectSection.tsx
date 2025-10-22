import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Theme } from "../../styles/Theme";
export function TapToConnectSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tap to Connect Section (Placeholder)</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { color: Theme.colors.mutedForeground },
});
