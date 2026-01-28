import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function App() {
  console.log("Test App rendering...");
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello from Tappd!</Text>
      <Text style={styles.subtext}>If you see this, React Native Web is working</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A1F",
  },
  text: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtext: {
    color: "#888",
    fontSize: 16,
  },
});
