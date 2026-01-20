import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../store/authStore";
import { AuthStack } from "./AuthStack";
import AppNavigator from "./AppNavigator";
import { SplashScreen } from "../screens/SplashScreen";
import { linking } from "./linking";

export const RootNavigator = () => {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore.setState;

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
    <NavigationContainer linking={linking as any}>
      {token ? <AppNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};
