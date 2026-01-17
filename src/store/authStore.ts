import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, SigninData, SignupData } from "../api/authApi";

interface AuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (data: SigninData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  hydrateAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  isAuthenticated: false,
  isHydrated: false,
  isLoading: false,
  error: null,

  /* ================= HYDRATE (APP START) ================= */
  hydrateAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      // console.log("HYDRATE AUTH → token:", token);
      // console.log("HYDRATE AUTH → userId:", userId);
      set({
        token,
        userId,
        isAuthenticated: !!token && !!userId,
        isHydrated: true,
      });
    } catch {
      set({
        token: null,
        userId: null,
        isAuthenticated: false,
        isHydrated: true,
      });
    }
  },

  /* ================= LOGIN ================= */
  login: async (data: SigninData) => {
    set({ isLoading: true, error: null });

    try {
      const { token, userId } = await authApi.signin(data);

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userId", userId);

      set({
        token,
        userId,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error?.response?.data?.message || "Login failed",
      });
      throw error;
    }
  },

  /* ================= SIGNUP ================= */
  signup: async (data: SignupData) => {
    set({ isLoading: true, error: null });

    try {
      const { token, userId } = await authApi.signup(data);

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userId", userId);

      set({
        token,
        userId,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error?.response?.data?.message || "Signup failed",
      });
      throw error;
    }
  },

  /* ================= LOGOUT ================= */
  logout: async () => {
    await AsyncStorage.multiRemove(["token", "userId"]);

    set({
      token: null,
      userId: null,
      isAuthenticated: false,
    });
  },

  clearError: () => set({ error: null }),
}));
