import { apiClient } from '../services/api';

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

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  bio?: string;
  occupation?: string;
  education?: string;
  lookingFor?: string;
  age?: number;
  height?: number;
  gender?: string;
  location?: string;
  interests: string[];
  smoking?: string;
  drinking?: string;
  profilePicUrl?: string;
  photos: string[];
  latitude?: number;
  longitude?: number;
  locationVisibility: boolean;
  lastLocationUpdate?: string;
  createdAt: string;
  updatedAt: string;
  phone?: string;
  avatar?: string;
  isVerified?: boolean;
  emailVerifiedAt?: string;
  settings?: {
    notifications: boolean;
    privacy: boolean;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
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

export const authApi = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await apiClient.post('/v1/auth/signup', data, false);
    return response.data;
  },

  signin: async (data: SigninData): Promise<AuthResponse> => {
    const response = await apiClient.post('/v1/auth/signin', data, false);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<any> => {
    const response = await apiClient.post('/v1/auth/forgot-password', data, false);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData): Promise<any> => {
    const response = await apiClient.post('/v1/auth/reset-password', data, false);
    return response.data;
  },

  // Add other auth-related endpoints as needed
  // verifyEmail, etc.
};