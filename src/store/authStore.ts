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
  requestDeleteAccountOtpApi,
  verifyDeleteAccountOtpApi,
  restoreAccountApi,
} from "../api/authApi";
import { ApiResponse, User } from "../types/authTypes";
import { socketService } from "../services/socket";

interface AuthState {
  userId: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  accountStatus: "active" | "pending_deletion" | "deleted" | null;
  restorationDeadline: string | null;

  signup: (data: SignupPayload) => Promise<void>;
  signin: (data: SigninPayload) => Promise<void>;
  login: (data: SigninPayload) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordPayload) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (data: VerifyEmailPayload) => Promise<ApiResponse<{ user: User; token: string }>>;
  googleSignin: (data: GoogleSigninPayload) => Promise<void>;
  changeEmail: (data: ChangeEmailPayload) => Promise<void>;
  changePassword: (data: ChangePasswordPayload) => Promise<void>;
  deleteAccount: () => Promise<void>;
  requestDeleteAccountOtp: () => Promise<void>;
  verifyDeleteAccountOtp: (otp: string) => Promise<{ deletionDate: string; restorationDeadline: string }>;
  restoreAccount: () => Promise<void>;
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
  accountStatus: null,
  restorationDeadline: null,

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
    } catch (err: any) {
      console.error("Signup error details:", err);
      let errorMessage = "Signup failed";
      if (err?.response?.data?.message) {
        errorMessage = String(err.response.data.message);
      } else if (err?.response?.data?.error) {
        errorMessage = String(err.response.data.error);
      } else if (err?.message) {
        errorMessage = String(err.message);
      }
      set({ loading: false, error: errorMessage });
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

      return res;
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

      const token = res.data?.token ?? null;
      
      // Connect socket after successful login
      if (token) {
        socketService.connect(token);
      }
      
      set({
        token,
        userId,
        isAuthenticated: !!token,
        loading: false,
      });
    } catch (err: any) {
      const statusCode = err?.response?.status;
      let errorMessage = err.message || "Login failed";
      
      // Provide user-friendly error messages based on status code
      if (statusCode === 401) {
        errorMessage = "Wrong password";
      } else if (statusCode === 404) {
        errorMessage = "Email not found";
      }
      
      set({ loading: false, error: errorMessage });
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
      const statusCode = err?.response?.status;
      let errorMessage;
      
      // Provide user-friendly error messages based on status code
      if (statusCode === 404) {
        errorMessage = "Email not found";
      } else {
        errorMessage = err?.response?.data?.message || err.message || "Failed to send OTP";
      }
      
      set({ loading: false, error: errorMessage });
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
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userId");

    // Disconnect socket on logout
    socketService.disconnect();
    
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

      const token = res.data?.token ?? null;
      
      // Connect socket after successful Google login
      if (token) {
        socketService.connect(token);
      }
      
      set({
        userId: res.data?.user?.id ?? null,
        token,
        isAuthenticated: !!token,
        loading: false,
      });
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

      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userId");

      set({
        userId: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        accountStatus: "deleted",
      });
    } catch (err: any) {
      set({ loading: false, error: err.message || "Failed to delete account" });
      throw err;
    }
  },

  requestDeleteAccountOtp: async () => {
    try {
      set({ loading: true, error: null });
      await requestDeleteAccountOtpApi();
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message || "Failed to send verification code" });
      throw err;
    }
  },

  verifyDeleteAccountOtp: async (otp: string) => {
    try {
      set({ loading: true, error: null });
      const res = await verifyDeleteAccountOtpApi({ otp });
      
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userId");

      set({
        userId: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        accountStatus: "pending_deletion",
        restorationDeadline: res.data?.restorationDeadline || null,
      });

      return {
        deletionDate: res.data?.deletionDate || new Date().toISOString(),
        restorationDeadline: res.data?.restorationDeadline || new Date().toISOString(),
      };
    } catch (err: any) {
      set({ loading: false, error: err.message || "Failed to verify code" });
      throw err;
    }
  },

  restoreAccount: async () => {
    try {
      set({ loading: true, error: null });
      const res = await restoreAccountApi();

      if (res.data?.token && res.data?.user?.id) {
        await AsyncStorage.setItem("token", res.data.token);
        await AsyncStorage.setItem("userId", res.data.user.id);
      }

      const token = res.data?.token ?? null;
      
      // Connect socket after account restoration
      if (token) {
        socketService.connect(token);
      }

      set({
        userId: res.data?.user?.id ?? null,
        token,
        isAuthenticated: !!token,
        loading: false,
        accountStatus: "active",
        restorationDeadline: null,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message || "Failed to restore account" });
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
        // Connect socket with existing token
        socketService.connect(token);
        
        set({
          token,
          userId,
          isAuthenticated: true,
          isHydrated: true,
        });
      } else if (token) {
        // Connect socket with existing token
        socketService.connect(token);
        
        set({
          token,
          isAuthenticated: true,
          isHydrated: true,
        });
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
