import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileCreationScreen } from '../screens/ProfileCreationScreen';

import { SCREEN_NAMES, AuthStackParamList } from './Routes';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={SCREEN_NAMES.WELCOME} component={WelcomeScreen} />
      <Stack.Screen name={SCREEN_NAMES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={SCREEN_NAMES.PROFILE_CREATION} component={ProfileCreationScreen} />
    </Stack.Navigator>
  );
};
