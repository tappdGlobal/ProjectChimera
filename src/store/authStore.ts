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
  verifyEmailApi,
  VerifyEmailPayload,
  googleSigninApi,
  GoogleSigninPayload,
  changeEmailApi,
  ChangeEmailPayload,
  changePasswordApi,
  ChangePasswordPayload,
  deleteAccountApi,
} from "../api/authApi";
import { socketService } from "../services/socket";

interface AuthState {
  userId: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  signup: (data: SignupPayload) => Promise<void>;
  signin: (data: SigninPayload) => Promise<void>;
  login: (data: SigninPayload) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordPayload) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (data: VerifyEmailPayload) => Promise<void>;
  googleSignin: (data: GoogleSigninPayload) => Promise<void>;
  changeEmail: (data: ChangeEmailPayload) => Promise<void>;
  changePassword: (data: ChangePasswordPayload) => Promise<void>;
  deleteAccount: () => Promise<void>;
  hydrateAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isHydrated: false,

  signup: async (data) => {
    try {
      set({ loading: true, error: null });
      const res = await signupApi(data);

      if (res.data?.token && res.data?.user?.id) {
        await AsyncStorage.setItem("token", res.data.token);
        await AsyncStorage.setItem("userId", res.data.user.id);
      }

      set({
        userId: res.data?.user?.id ?? null,
        token: res.data?.token ?? null,
        isAuthenticated: !!res.data?.token,
        loading: false,
      });

      // Connect socket after successful signup (non-blocking)
      if (res.data?.token) {
        try {
          socketService.connect(res.data.token);
        } catch (socketErr) {
          console.warn("Socket connection failed (non-critical):", socketErr);
        }
      }
    } catch (err: any) {
      set({ loading: false, error: err.message || "Signup failed" });
      throw err;
    }
  },

  verifyEmail: async (data) => {
    try {
      set({ loading: true, error: null });
      const res = await verifyEmailApi(data);

      if (res.data?.token && res.data?.user?.id) {
        await AsyncStorage.setItem("token", res.data.token);
        await AsyncStorage.setItem("userId", res.data.user.id);
      }

      set({
        userId: res.data?.user?.id ?? null,
        token: res.data?.token ?? null,
        isAuthenticated: !!res.data?.token,
        loading: false,
      });

      // Connect socket after successful email verification (non-blocking)
      if (res.data?.token) {
        try {
          socketService.connect(res.data.token);
        } catch (socketErr) {
          console.warn("Socket connection failed (non-critical):", socketErr);
        }
      }
    } catch (err: any) {
      set({ loading: false, error: err.message || "Verification failed" });
      throw err;
    }
  },

  signin: async (data) => {
    try {
      set({ loading: true, error: null });

      const res = await signinApi(data);

      // Backend may or may not return user object here
      const userId = (res.data as any)?.user?.id ?? null;

      if (res.data?.token) {
        await AsyncStorage.setItem("token", res.data.token);
        if (userId) {
          await AsyncStorage.setItem("userId", userId);
        }
      }

      set({
        token: res.data?.token ?? null,
        userId,
        isAuthenticated: !!res.data?.token,
        loading: false,
      });

      // Connect socket after successful signin (non-blocking)
      if (res.data?.token) {
        try {
          socketService.connect(res.data.token);
        } catch (socketErr) {
          console.warn("Socket connection failed (non-critical):", socketErr);
        }
      }
    } catch (err: any) {
      set({ loading: false, error: err.message || "Login failed" });
      throw err;
    }
  },

  login: async (data) => {
    return get().signin(data);
  },

  /**
   * Forgot Password Action
   * Calls forgotPasswordApi to send OTP to user's email
   *
   * @param email - User's registered email address
   * @throws Error if API call fails
   *
   * Usage:
   *   const { forgotPassword } = useAuthStore();
   *   await forgotPassword("user@example.com");
   *
   * See:
   *   - authApi.ts for API implementation
   *   - LoginScreen.tsx for UI usage
   */
  forgotPassword: async (email) => {
    try {
      set({ loading: true, error: null });
      await forgotPasswordApi(email);
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  resetPassword: async (data) => {
    try {
      set({ loading: true, error: null });
      await resetPasswordApi(data);
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  logout: async () => {
    // Disconnect socket before logout (non-blocking)
    try {
      socketService.disconnect();
    } catch (socketErr) {
      console.warn("Socket disconnect failed (non-critical):", socketErr);
    }

    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userId");

    set({
      userId: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  googleSignin: async (data) => {
    try {
      set({ loading: true, error: null });

      const res = await googleSigninApi(data);

      if (res.data?.token && res.data?.user?.id) {
        await AsyncStorage.setItem("token", res.data.token);
        await AsyncStorage.setItem("userId", res.data.user.id);
      }

      set({
        userId: res.data?.user?.id ?? null,
        token: res.data?.token ?? null,
        isAuthenticated: !!res.data?.token,
        loading: false,
      });

      // Connect socket after successful Google signin (non-blocking)
      if (res.data?.token) {
        try {
          socketService.connect(res.data.token);
        } catch (socketErr) {
          console.warn("Socket connection failed (non-critical):", socketErr);
        }
      }
    } catch (err: any) {
      set({ loading: false, error: err.message || "Google sign-in failed" });
      throw err;
    }
  },

  changeEmail: async (data) => {
    try {
      set({ loading: true, error: null });
      await changeEmailApi(data);
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message || "Failed to change email" });
      throw err;
    }
  },

  changePassword: async (data) => {
    try {
      set({ loading: true, error: null });
      await changePasswordApi(data);
      set({ loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || "Failed to change password",
      });
      throw err;
    }
  },

  deleteAccount: async () => {
    try {
      set({ loading: true, error: null });
      await deleteAccountApi();

      // Disconnect socket before deleting account (non-blocking)
      try {
        socketService.disconnect();
      } catch (socketErr) {
        console.warn("Socket disconnect failed (non-critical):", socketErr);
      }

      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userId");

      set({
        userId: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message || "Failed to delete account" });
      throw err;
    }
  },

  hydrateAuth: async () => {
    try {
      const [token, userId] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("userId"),
      ]);

      if (token && userId) {
        set({
          token,
          userId,
          isAuthenticated: true,
          isHydrated: true,
        });
        
        // Connect socket after hydration if user is authenticated (non-blocking)
        try {
          socketService.connect(token);
        } catch (socketErr) {
          console.warn("Socket connection failed during hydration (non-critical):", socketErr);
        }
      } else if (token) {
        set({
          token,
          isAuthenticated: true,
          isHydrated: true,
        });
        
        // Connect socket after hydration if user is authenticated (non-blocking)
        try {
          socketService.connect(token);
        } catch (socketErr) {
          console.warn("Socket connection failed during hydration (non-critical):", socketErr);
        }
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
