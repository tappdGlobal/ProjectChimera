import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PostHog } from "posthog-react-native";
import {
  signupApi,
  signinApi,
  forgotPasswordApi,
  resetPasswordApi,
  SignupPayload,
  SigninPayload,
  ResetPasswordPayload,
  verifyEmailApi,
  VerifyEmailPayload,
  googleSigninApi,
  GoogleSigninPayload,
} from "../api/authApi";
import { User } from "../types/authTypes";

// Test user credentials for development
export const TEST_CREDENTIALS = {
  email: "test@tappd.com",
  password: "Test123!",
  user: {
    id: "test-user-123",
    name: "Harsh Arora",
    email: "test@tappd.com",
    username: "harsharora",
    age: 22,
    bio: "Exploring every day like its theist ✨",
    occupation: "Founder",
    education: "MAIT, Delhi",
    gender: "MALE" as const,
    location: "New Delhi, India",
    profilePicUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542103749-8ef597ac45be?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400&h=600&fit=crop",
    ],
    interests: [
      "Entrepreneurship",
      "Growth Marketing",
      "Startups",
      "Tech",
      "Strategy",
      "Innovation",
    ],
    lookingFor: "FRIENDSHIP" as const,
    height: 178, // 5'10"
    smoking: "NO" as const,
    drinking: "SOCIALLY" as const,
    locationVisibility: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as User,
};

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
  verifyEmail: (data: VerifyEmailPayload) => Promise<void>;
  googleSignin: (data: GoogleSigninPayload) => Promise<void>;
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
        if (res.data?.user) {
          await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
        }
      }

      set({
        user: res.data?.user ?? null,
        token: res.data?.token ?? null,
        isAuthenticated: !!res.data?.token,
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message || "Signup failed" });
      throw err;
    }
  },

  verifyEmail: async (data) => {
    try {
      set({ loading: true, error: null });
      const res = await verifyEmailApi(data);

      if (res.data?.token) {
        await AsyncStorage.setItem("token", res.data.token);
        if (res.data?.user) {
          await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
        }
      }

      set({
        user: res.data?.user ?? null,
        token: res.data?.token ?? null,
        isAuthenticated: !!res.data?.token,
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message || "Verification failed" });
      throw err;
    }
  },

  signin: async (data) => {
    try {
      set({ loading: true, error: null });

      // Call the real API
      const res = await signinApi(data);

      if (res.data?.token) {
        await AsyncStorage.setItem("token", res.data.token);
        if ((res.data as any)?.user) {
          await AsyncStorage.setItem(
            "user",
            JSON.stringify((res.data as any).user),
          );
        }
      }

      set({
        token: res.data?.token ?? null,
        user: (res.data as any)?.user ?? null,
        isAuthenticated: !!res.data?.token,
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message || "Login failed" });
      throw err;
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
    await AsyncStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  googleSignin: async (data) => {
    try {
      set({ loading: true, error: null });

      const res = await googleSigninApi(data);

      if (res.data?.token) {
        await AsyncStorage.setItem("token", res.data.token);
        if (res.data?.user) {
          await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
        }
      }

      set({
        user: res.data?.user ?? null,
        token: res.data?.token ?? null,
        isAuthenticated: !!res.data?.token,
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message || "Google sign-in failed" });
      throw err;
    }
  },

  hydrateAuth: async () => {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("user"),
      ]);

      if (token && userJson) {
        const user = JSON.parse(userJson);
        set({ token, user, isAuthenticated: true, isHydrated: true });
      } else if (token) {
        // Have token but no user data - set authenticated but no user
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
