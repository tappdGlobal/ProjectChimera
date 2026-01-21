import { apiClient } from "../services/api"; // ← your service
import { ApiResponse, User } from "../types/authTypes";

/* ================= SIGN UP ================= */

export interface SignupPayload {
  name: string;
  email: string;
  username: string;
  password: string;
}

export const signupApi = (
  payload: SignupPayload
): Promise<ApiResponse<{ user: User; token: string }>> => {
  return apiClient.post("/auth/signup", payload);
};

/* ================= SIGN IN ================= */

export interface SigninPayload {
  email: string;
  password: string;
}

export const signinApi = (
  payload: SigninPayload
): Promise<ApiResponse<{ token: string }>> => {
  return apiClient.post("/auth/signin", payload);
};

/* ================= FORGOT PASSWORD ================= */

export const forgotPasswordApi = (
  email: string
): Promise<ApiResponse<null>> => {
  return apiClient.post("/auth/forgot-password", { email });
};

/* ================= RESET PASSWORD ================= */

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export const resetPasswordApi = (
  payload: ResetPasswordPayload
): Promise<ApiResponse<null>> => {
  return apiClient.post("/auth/reset-password", payload);
};

/* ================= VERIFY EMAIL ================= */

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export const verifyEmailApi = (
  payload: VerifyEmailPayload
): Promise<ApiResponse<{ user: User; token: string }>> => {
  return apiClient.post("/auth/verify-email", payload);
};
