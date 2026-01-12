import { apiClient } from '../services/api';
import { User } from './authApi';

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  profilePicUrl?: string;
  occupation?: string;
  education?: string;
  lookingFor?: string;
  age?: number;
  height?: number;
  gender?: string;
  location?: string;
  interests?: string[];
  smoking?: string;
  drinking?: string;
  // Add other updatable fields as needed
}

export const userApi = {
  updateProfile: async (userId: string, data: UpdateProfileData): Promise<User> => {
    const response = await apiClient.put(`/v1/users/${userId}`, data);
    return response.data;
  },

  getProfile: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/v1/users/${userId}`);
    return response.data;
  },

  getConnections: async (): Promise<any[]> => {
    const response = await apiClient.get('/v1/connections/accepted');
    return response.data;
  },

  // Add other user-related endpoints as needed
};