import { apiClient } from "../services/api";

/* ===================== TYPES ===================== */

export interface SignupData {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface SigninData {
  email: string;
  password: string;
}

/* Auth API should ONLY return auth-related data */
export interface AuthResponse {
  token: string;
  userId: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

/* ===================== API ===================== */

export const authApi = {
  signin: async (data: SigninData) => {
    const response = await apiClient.post("/auth/signin", data);

    return {
      token: response.data.token,
      userId: response.data.user.id,
    };
  },

  signup: async (data: SignupData) => {
    const response = await apiClient.post("/auth/signup", data);

    return {
      token: response.data.token,
      userId: response.data.user.id,
    };
  },

  forgotPassword: async (data: ForgotPasswordData) => {
    const response = await apiClient.post(
      "/auth/forgot-password",
      data,
    );
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await apiClient.post(
      "/auth/reset-password",
      data,
    );
    return response.data;
  },
};
