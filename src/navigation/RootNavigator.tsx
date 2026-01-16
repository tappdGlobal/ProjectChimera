import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { AuthStack } from './AuthStack';
import AppNavigator from './AppNavigator'; // This is our AppStack (Tab Navigator)
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import { SplashScreen } from '../screens/SplashScreen';
import { User } from '../api/authApi';

import { linking } from './linking';
import { notificationService } from '../services/notificationService';

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
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
    // Only register for notifications on native platforms
    if (Platform.OS !== 'web') {
      notificationService.registerForPushNotificationsAsync().catch((error) => {
        console.warn('Failed to register for notifications:', error);
      });
    }
  }, [checkAuth]);

  useEffect(() => {
    // Show splash screen for 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Show splash screen
  if (showSplash) {
    return <SplashScreen />;
  }

  // Show loading indicator while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Show appropriate navigator based on auth state
  return (
    <NavigationContainer linking={linking as any}>
      {isAuthenticated ? <AppNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
});
