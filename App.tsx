import { RootNavigator } from "./src/navigation/RootNavigator";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { databaseService } from "./src/services/databaseService";
import { syncService } from "./src/services/syncService";
import { View, Text, StyleSheet } from "react-native";
import { ErrorBoundary } from "./src/components/common/ErrorBoundary";
import { useAuthStore } from "./src/store/authStore";

export default function App() {
  const [initError, setInitError] = useState<string | null>(null);

  const hydrateAuth = useAuthStore((s) => s.hydrateAuth);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    // ✅ Restore token + userId from AsyncStorage
    hydrateAuth();

    const init = async () => {
      try {
        console.log("Initializing database...");
        await databaseService.initDatabase();

        console.log("Database initialized, syncing actions...");
        await syncService.syncActions();

        console.log("App initialization complete");
      } catch (error: any) {
        console.error("App initialization error:", error);
        // setInitError(error?.message || "Failed to initialize app");
      }
    };

    init();
  }, []);

  // ✅ Prevent app from rendering before auth hydration completes
  if (!isHydrated) {
    return null; // or splash screen / loader
  }

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {initError}</Text>
        <Text style={styles.errorSubtext}>Check console for details</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <RootNavigator />
      <StatusBar style="light" />
    </ErrorBoundary>
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
