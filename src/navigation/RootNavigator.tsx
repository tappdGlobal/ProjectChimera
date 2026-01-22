import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../store/authStore";
import { AuthStack } from "./AuthStack";
import AppNavigator from "./AppNavigator";
import { SplashScreen } from "../screens/SplashScreen";
import { linking } from "./linking";
import { PostHogProvider } from "posthog-react-native";

import { usePostHog } from "posthog-react-native";
import { useRef } from "react";

export const RootNavigator = () => {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore.setState;
  const posthog = usePostHog();
  const navigationRef = useRef<any>(null);
  const routeNameRef = useRef<string | undefined>(undefined);

  const [isHydrated, setIsHydrated] = useState(false);

  // 🔹 Hydrate token from storage
  useEffect(() => {
    const hydrateAuth = async () => {
      const storedToken = await AsyncStorage.getItem("token");

      if (storedToken) {
        setAuth({ token: storedToken });
      }

      setIsHydrated(true);
    };

    hydrateAuth();
  }, []);

  if (!isHydrated) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking as any}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRoute = navigationRef.current?.getCurrentRoute();
        const currentRouteName = currentRoute?.name;

        if (previousRouteName !== currentRouteName && posthog) {
          posthog.screen(currentRouteName);
        }
        routeNameRef.current = currentRouteName;
      }}
    >
      {token ? <AppNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};
