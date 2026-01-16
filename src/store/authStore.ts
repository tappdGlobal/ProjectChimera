import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, User, SigninData, SignupData } from '../api/authApi';
import { userApi } from '../api/userApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: SigninData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
  toggleSettings: (key: 'notifications' | 'privacy') => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (data: SigninData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.signin(data);
      const { user, token } = response;

      // Store token
      await AsyncStorage.setItem('authToken', token);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Login failed'
      });
      throw error;
    }
  },

  signup: async (data: SignupData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.signup(data);
      const { user, token } = response;

      // Store token
      await AsyncStorage.setItem('authToken', token);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Signup failed'
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      set({
        user: null,
        isAuthenticated: false,
        error: null
      });
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          // Fetch current user profile to validate token and get user data
          const user = await userApi.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) {
          // Token might be invalid, clear it
          console.warn('Token validation failed, clearing auth:', error);
          await AsyncStorage.removeItem('authToken');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Check auth error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  updateUser: (user: User) => set({ user }),

  clearError: () => set({ error: null }),

  toggleSettings: (key) => set((state) => {
    if (!state.user) return state;
    const currentSettings = state.user.settings || { notifications: true, privacy: false };
    return {
        user: {
            ...state.user,
            settings: {
                ...currentSettings,
                [key]: !currentSettings[key]
            }
        }
    };
  }),
}));
