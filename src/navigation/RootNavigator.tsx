import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../store/authStore";
import { AuthStack } from "./AuthStack";
import AppNavigator from "./AppNavigator";
import { linking } from "./linking";
import { Platform, View } from "react-native";
import { useRef } from "react";

export const RootNavigator = () => {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore.setState;
  const navigationRef = useRef<any>(null);
  const routeNameRef = useRef<string | undefined>(undefined);

  const [isHydrated, setIsHydrated] = useState(false);

  // 🔹 Hydrate token from storage
  useEffect(() => {
    const hydrateAuth = async () => {
      console.log("RootNavigator: Starting auth hydration...");
      const storedToken = await AsyncStorage.getItem("token");

      if (storedToken) {
        setAuth({ token: storedToken });
        console.log("RootNavigator: Token found and set");
      } else {
        console.log("RootNavigator: No stored token");
      }

      setIsHydrated(true);
      console.log("RootNavigator: Hydration complete");
    };

    hydrateAuth();
  }, []);

  console.log("RootNavigator rendering:", { isHydrated, hasToken: !!token });

  if (!isHydrated) {
    console.log("RootNavigator: Hydrating...");
    // Show blank screen during hydration (very quick)
    return <View style={{ flex: 1, backgroundColor: '#0A0322' }} />;
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
        routeNameRef.current = currentRouteName;
      }}
    >
      {token ? <AppNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};
