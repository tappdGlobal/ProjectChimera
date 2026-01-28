import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";

import { RootNavigator } from "./src/navigation/RootNavigator";
import { databaseService } from "./src/services/databaseService";
import { syncService } from "./src/services/syncService";
import { ErrorBoundary } from "./src/components/common/ErrorBoundary";
import { useAuthStore } from "./src/store/authStore";

import { PostHogProvider } from "posthog-react-native";

export default function App() {
  const [initError, setInitError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setDebugLog((prev) => [
      ...prev.slice(-5),
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const hydrateAuth = useAuthStore((s) => s.hydrateAuth);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    hydrateAuth();

    const init = async () => {
      try {
        addLog(`App starting on ${Platform.OS}`);

        if (Platform.OS !== "web") {
          addLog("Initializing database...");
          await databaseService.initDatabase();

          addLog("Database initialized, syncing actions...");
          await syncService.syncActions();
        }

        addLog("App initialization complete");
      } catch (error) {
        const err = error as any;

        console.error("App initialization error:", err);
        addLog(`Init error: ${err?.message || "Unknown error"}`);

        setInitError(err?.message || "Failed to initialize app");

        // Optional retry (safe)
        try {
          await databaseService.initDatabase();
          await syncService.syncActions();
        } catch (retryErr) {
          console.error("Retry failed:", retryErr);
        }
      }
    };

    init();
  }, []);

  // Wait until auth is restored
  if (!isHydrated) {
    return null; // or splash screen
  }

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {initError}</Text>
        <Text style={styles.errorSubtext}>Check console for details</Text>
      </View>
    );
  }

  console.log("App rendering...", Platform.OS);

  return (
    <ErrorBoundary>
      {Platform.OS === "web" ? (
        <>
          <RootNavigator />
          <StatusBar style="light" />
        </>
      ) : (
        <PostHogProvider
          apiKey="phc_FXpHLpLnFGLGRtvZOC9rFDXx8nUPoZVEqhqxslEXyhs"
          options={{ host: "https://us.i.posthog.com" }}
        >
          <RootNavigator />
          <StatusBar style="light" />
        </PostHogProvider>
      )}
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
