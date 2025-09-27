// TAPPDAAPP/App.tsx
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import React from "react";

// NOTE: The main logic from the Figma output App.tsx will move to AppNavigator.tsx

export default function App() {
  return (
    <NavigationContainer>
      {/* We are placing the primary navigation logic here */}
      <AppNavigator />
      <StatusBar style="light" />
      {/* Assuming the app uses a dark/black theme based on Figma background color */}
    </NavigationContainer>
  );
}
