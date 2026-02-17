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

/**
 * Forgot Password API
 * Endpoint: POST /api/v1/auth/forgot-password
 * Documentation: https://tappd-backend-1.onrender.com/api-docs/#/Auth/post_api_v1_auth_forgot_password
 *
 * Request Body:
 *   - email: string (required) - User's registered email address
 *
 * Response:
 *   - Success (200): OTP sent successfully to the provided email
 *   - Error (400): Invalid email format
 *   - Error (404): User not found with the provided email
 *
 * Flow:
 *   1. User clicks "Forgot password?" on LoginScreen
 *   2. User enters their email in ChangePasswordPopup
 *   3. This API is called to send OTP to the user's email
 *   4. User receives OTP and enters it along with new password
 *   5. resetPasswordApi is called to complete the password reset
 *
 * Used in:
 *   - LoginScreen.tsx (via authStore.forgotPassword)
 *   - ChangePasswordPopup component
 */
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

/* ================= RESEND VERIFICATION CODE ================= */

export const resendVerificationCodeApi = (
  email: string
): Promise<ApiResponse<null>> => {
  return apiClient.post("/auth/resend-verification", { email });
};

/* ================= GOOGLE SIGN IN ================= */

export interface GoogleSigninPayload {
  idToken: string;
}

export const googleSigninApi = (
  payload: GoogleSigninPayload
): Promise<ApiResponse<{ user: User; token: string }>> => {
  return apiClient.post("/auth/google-signin", payload);
};

/* ================= CHANGE EMAIL ================= */

export interface ChangeEmailPayload {
  newEmail: string;
}

export const changeEmailApi = (
  payload: ChangeEmailPayload
): Promise<ApiResponse<{ user: User }>> => {
  return apiClient.patch("/auth/change-email", payload);
};

/* ================= CHANGE PASSWORD ================= */

export interface ChangePasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export const changePasswordApi = (
  payload: ChangePasswordPayload
): Promise<ApiResponse<null>> => {
  return apiClient.post("/auth/change-password", payload);
};

/* ================= DELETE ACCOUNT ================= */

export const deleteAccountApi = (): Promise<ApiResponse<null>> => {
  return apiClient.delete("/auth/account");
};

/* ================= REQUEST DELETE ACCOUNT OTP ================= */

export const requestDeleteAccountOtpApi = (): Promise<ApiResponse<null>> => {
  return apiClient.post("/account/delete/request-otp");
};

/* ================= VERIFY DELETE ACCOUNT OTP ================= */

export interface VerifyDeleteAccountOtpPayload {
  otp: string;
}

export const verifyDeleteAccountOtpApi = (
  payload: VerifyDeleteAccountOtpPayload
): Promise<ApiResponse<{ deletionDate: string; restorationDeadline: string }>> => {
  return apiClient.post("/account/delete/verify-otp", payload);
};

/* ================= RESTORE DELETED ACCOUNT ================= */

export const restoreAccountApi = (): Promise<ApiResponse<{ user: User; token: string }>> => {
  return apiClient.post("/auth/account/restore");
};
