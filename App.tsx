import { RootNavigator } from "./src/navigation/RootNavigator";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { databaseService } from "./src/services/databaseService";
import { syncService } from "./src/services/syncService";
import { View, Text, StyleSheet, Platform } from "react-native";
import { ErrorBoundary } from "./src/components/common/ErrorBoundary";
import { useAuthStore } from "./src/store/authStore";

export default function App() {
  const [initError, setInitError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setDebugLog(prev => [...prev.slice(-5), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const hydrateAuth = useAuthStore((s) => s.hydrateAuth);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    // ✅ Restore token + userId from AsyncStorage
    hydrateAuth();

    const init = async () => {
      try {
        addLog(`App starting on ${Platform.OS}`);
        if (Platform.OS !== 'web') {
          addLog("Initializing database...");
          await databaseService.initDatabase();
          addLog("Database initialized, syncing actions...");
          await syncService.syncActions();
        }
        addLog("App initialization complete");
      } catch (error: any) {
        console.error("App initialization error:", error);
        addLog(`Init error: ${error.message}`);
        // Don't block the app from rendering if initialization fails
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

  console.log("App rendering...", Platform.OS);

  return (
    <>
      <ErrorBoundary>
        {Platform.OS === 'web' ? (
          // Web: Don't use PostHog
          <>
            <RootNavigator />
            <StatusBar style="light" />
          </>
        ) : (
          // Native: Use PostHog
          <PostHogProvider
            apiKey="phc_FXpHLpLnFGLGRtvZOC9rFDXx8nUPoZVEqhqxslEXyhs"
            options={{
              host: "https://us.i.posthog.com",
            }}
          >
            <RootNavigator />
            <StatusBar style="light" />
          </PostHogProvider>
        )}
      </ErrorBoundary>
    </>
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
  debugOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    maxHeight: 120,
    zIndex: 9999,
  },
  debugTitle: {
    color: '#0f0',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugText: {
    color: '#0f0',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});
