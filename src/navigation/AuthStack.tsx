import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileCreationScreen } from '../screens/ProfileCreationScreen';
import { AnimatedSplashScreen } from '../screens/AnimatedSplashScreen';

import { SCREEN_NAMES, AuthStackParamList } from './Routes';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <AnimatedSplashScreen
        onAnimationComplete={() => setShowSplash(false)}
      />
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0A0A1F' },
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: {
            opacity: current.progress,
          },
        }),
      }}
      initialRouteName={SCREEN_NAMES.WELCOME}
    >
      <Stack.Screen name={SCREEN_NAMES.WELCOME} component={WelcomeScreen} />
      <Stack.Screen name={SCREEN_NAMES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={SCREEN_NAMES.PROFILE_CREATION} component={ProfileCreationScreen} />
    </Stack.Navigator>
  );
};
