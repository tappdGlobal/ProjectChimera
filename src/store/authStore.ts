import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  signupApi,
  signinApi,
  forgotPasswordApi,
  resetPasswordApi,
  SignupPayload,
  SigninPayload,
  ResetPasswordPayload,
} from "../api/authApi";
import { User } from "../types/authTypes";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  signup: (data: any) => Promise<void>;
  signin: (data: SigninPayload) => Promise<void>;
  login: (data: SigninPayload) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordPayload) => Promise<void>;
  logout: () => Promise<void>;
  hydrateAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isHydrated: false,

  signup: async (data) => {
    try {
      set({ loading: true, error: null });
      const res = await signupApi(data);

      if (res.data?.token) {
        await AsyncStorage.setItem("token", res.data.token);
      }

      set({
        user: res.data?.user ?? null,
        token: res.data?.token ?? null,
        isAuthenticated: !!res.data?.token,
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  signin: async (data) => {
    try {
      set({ loading: true, error: null });
      const res = await signinApi(data);

      if (res.data?.token) {
        await AsyncStorage.setItem("token", res.data.token);
      }

      set({
        token: res.data?.token ?? null,
        user: (res.data as any)?.user ?? null,
        isAuthenticated: !!res.data?.token,
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  login: async (data) => {
    return get().signin(data);
  },

  forgotPassword: async (email) => {
    try {
      set({ loading: true, error: null });
      await forgotPasswordApi(email);
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  resetPassword: async (data) => {
    try {
      set({ loading: true, error: null });
      await resetPasswordApi(data);
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  hydrateAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        set({ token, isAuthenticated: true, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch (err: any) {
      console.error("Failed to hydrate auth:", err);
      set({ isHydrated: true });
    }
  },

  clearError: () => set({ error: null }),
}));
