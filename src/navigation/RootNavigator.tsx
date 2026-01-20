import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/userStore";
import { AuthStack } from "./AuthStack";
import AppNavigator from "./AppNavigator";
import { SplashScreen } from "../screens/SplashScreen";
import { linking } from "./linking";

export const RootNavigator = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);
  
  useEffect(() => {
    useAuthStore.getState().hydrateAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      useUserStore.getState().fetchUser(user.id);
    } else {
      useUserStore.getState().clearUser();
    }
  }, [isAuthenticated, user]);

  if (!isHydrated) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer linking={linking as any}>
      {isAuthenticated ? <AppNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};
