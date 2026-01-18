import { apiClient } from "../services/api";

/* ===================== TYPES ===================== */


export interface SignupData {
  name: string;
  email: string;
  username: string;
  password: string;
  [key: string]: any; // Allow other fields for now
}

export interface VerifyEmailData {
  email: string;
  otp: string;
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
  
  // Reverting to existing pattern but updating signup for FormData
  signup: async (data: FormData) => {
    const response = await apiClient.post("/auth/signup", data);

    return {
      // Signup doesn't return token immediately in new flow (returns "OTP sent"). 
      // But we need to handle response.
      success: true,
      data: response.data
    };
  },

  verifyEmail: async (data: VerifyEmailData) => {
    const response = await apiClient.post("/auth/verify-email", data);
    return response; // Return full body so store can access .data
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

