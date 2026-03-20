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
import { useWarningsSuppression } from "./src/hooks/useWarningsSuppression";
import { useUserStore } from "./src/store/userStore";
export default function App() {
  const [initError, setInitError] = useState<string | null>(null);
  const socketInitialized = useRef(false);

  const hydrateAuth = useAuthStore((s) => s.hydrateAuth);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const receiveMessage = useChatStore((s) => s.receiveMessage);
  const userId = useAuthStore((s) => s.userId);
  const fetchUser = useUserStore((s) => s.fetchUser);

  // Suppress non-critical warnings during app initialization
  useWarningsSuppression();
  const profile = useUserStore((s) => s.profile);
  const isFetchingUserRef = useRef(false);



  useEffect(() => {
    if (
      isHydrated &&
      isAuthenticated &&
      userId &&
      !profile &&            // prevents refetch
      !isFetchingUserRef.current
    ) {
      isFetchingUserRef.current = true;

     

      fetchUser(userId).finally(() => {
        isFetchingUserRef.current = false;
      });
    }
  }, [isHydrated, isAuthenticated, userId, profile]);
  useEffect(() => {
    hydrateAuth();

    const init = async () => {
      try {

        if (Platform.OS !== "web") {
          await databaseService.initDatabase();
          await syncService.syncActions();
        }

       
      } catch (error: any) {
        setInitError(error?.message || "Failed to initialize app");
      }
    };

    init();
  }, []);

  // Connect socket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token && !socketInitialized.current) {
      
      socketService.connect(token);

      // Set up global message receiver
      socketService.onReceiveMessage((message) => {
        receiveMessage(message);
      });

      socketInitialized.current = true;
    }

    // Disconnect socket when user logs out
    if (!isAuthenticated && socketInitialized.current) {
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
      </View>
    );
  }

  return (
    <>
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
          </ErrorBoundary>
        </PostHogProvider>
      </SafeAreaProvider>

      {/* GLOBAL TOAST */}
      <Toast position="top" topOffset={60} />
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
});
