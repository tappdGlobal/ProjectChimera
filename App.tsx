import { RootNavigator } from "./src/navigation/RootNavigator";
import { PostHogProvider } from "posthog-react-native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { databaseService } from "./src/services/databaseService";
import { syncService } from "./src/services/syncService";
import { View, Text, StyleSheet } from "react-native";
import { ErrorBoundary } from "./src/components/common/ErrorBoundary";

// NOTE: The main logic from the Figma output App.tsx will move to AppNavigator.tsx

export default function App() {
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        console.log("Initializing database...");
        await databaseService.initDatabase();
        console.log("Database initialized, syncing actions...");
        await syncService.syncActions();
        console.log("App initialization complete");
      } catch (error: any) {
        console.error("App initialization error:", error);
        // Don't block the app from rendering if initialization fails
        // setInitError(error?.message || "Failed to initialize app");
      }
    };
    // Don't await - let app render while initializing
    init();
  }, []);

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {initError}</Text>
        <Text style={styles.errorSubtext}>Check console for details</Text>
      </View>
    );
  }

  return (
    <PostHogProvider
      apiKey="phc_Kexzarq1CiAG9MNk22SfBZEKz4fwkjcHb3Fn2irxXT8"
      options={{
        host: "https://us.i.posthog.com",
      }}
    >
      <ErrorBoundary>
        <RootNavigator />
        <StatusBar style="light" />
      </ErrorBoundary>
    </PostHogProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorSubtext: {
    color: "#888",
    fontSize: 14,
  },
});
