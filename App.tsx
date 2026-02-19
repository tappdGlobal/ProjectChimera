import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootNavigator } from "./src/navigation/RootNavigator";
import { databaseService } from "./src/services/databaseService";
import { syncService } from "./src/services/syncService";
import { socketService } from "./src/services/socket";
import { useChatStore } from "./src/store/chatStore";
import { ErrorBoundary } from "./src/components/common/ErrorBoundary";
import { useAuthStore } from "./src/store/authStore";
import Toast from "react-native-toast-message";
import { PostHogProvider } from "posthog-react-native";

export default function App() {
  const [initError, setInitError] = useState<string | null>(null);
  const socketInitialized = useRef(false);

  const hydrateAuth = useAuthStore((s) => s.hydrateAuth);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const receiveMessage = useChatStore((s) => s.receiveMessage);

  useEffect(() => {
    hydrateAuth();

    const init = async () => {
      try {
        console.log("App starting on:", Platform.OS);

        if (Platform.OS !== "web") {
          await databaseService.initDatabase();
          await syncService.syncActions();
        }

        console.log("App initialization complete");
      } catch (error: any) {
        console.error("App initialization error:", error);
        setInitError(error?.message || "Failed to initialize app");
      }
    };

    init();
  }, []);

  // Connect socket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token && !socketInitialized.current) {
      console.log("[App] Connecting socket with token...");
      socketService.connect(token);
      
      // Set up global message receiver
      socketService.onReceiveMessage((message) => {
        console.log("[App] Received message via socket:", message);
        receiveMessage(message);
      });
      
      socketInitialized.current = true;
    }
    
    // Disconnect socket when user logs out
    if (!isAuthenticated && socketInitialized.current) {
      console.log("[App] Disconnecting socket...");
      socketService.disconnect();
      socketInitialized.current = false;
    }
    
    return () => {
      if (socketInitialized.current) {
        socketService.disconnect();
      }
    };
  }, [isAuthenticated, token, receiveMessage]);

  if (!isHydrated) return null;

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {initError}</Text>
        <Text style={styles.errorSubtext}>Check console</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PostHogProvider
        apiKey="phc_FXpHLpLnFGLGRtvZOC9rFDXx8nUPoZVEqhqxslEXyhs"
        options={{
          host: "https://us.i.posthog.com",
          enableSessionReplay: false,
          captureAppLifecycleEvents: true,
        }}
      >
        <ErrorBoundary>
          <RootNavigator />
          <StatusBar style="light" />
          <Toast topOffset={60} />
        </ErrorBoundary>

      </PostHogProvider>
    </SafeAreaProvider>
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
