import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/userStore";
import { AuthStack } from "./AuthStack";
import AppNavigator from "./AppNavigator";
import { SplashScreen } from "../screens/SplashScreen";
import { linking } from "./linking";

// Default user for testing when bypassing auth
const DEFAULT_TEST_USER: User = {
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  username: 'testuser',
  bio: 'This is a test profile',
  occupation: 'Developer',
  education: 'Computer Science',
  lookingFor: 'Friends & Events',
  age: 25,
  height: 175,
  gender: 'Other',
  location: 'New York, NY',
  interests: ['Technology', 'Music', 'Sports'],
  smoking: 'Never',
  drinking: 'Socially',
  profilePicUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=face&fit=crop&w=400&h=400',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=face&fit=crop&w=400&h=400',
  photos: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=face&fit=crop&w=400&h=400',
  ],
  locationVisibility: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    notifications: true,
    privacy: false,
  },
};

export const RootNavigator = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  
  useEffect(() => {
    useAuthStore.getState().hydrateAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      useUserStore.getState().fetchUser();
    } else {
      useUserStore.getState().clearUser();
    }
  }, [isAuthenticated]);

  if (!isHydrated) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer linking={linking as any}>
      {isAuthenticated ? <AppNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};
