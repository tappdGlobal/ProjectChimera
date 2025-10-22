import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Theme } from "../../styles/Theme";
export function ChatSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Chat Section (Placeholder)</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { color: Theme.colors.mutedForeground },
});
