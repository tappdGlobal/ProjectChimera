import { apiClient } from "../services/api";
import { User } from "./user.model";

export const userApi = {
  /* ================= GET USER ================= */
  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<any>(`/users/${userId}`);
    return response.data; // Unwrap { statusCode, data: User } -> User
  },

  /* ================= UPDATE USER ================= */
  updateUserProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<any>(`/users/${userId}`, data);
    return response.data;
  },

  /* ================= GET CONNECTIONS ================= */
  getConnections: async (userId: string): Promise<any[]> => {
    const response = await apiClient.get<any>(`/users/${userId}/connections`);
    return response.data;
  },

  /* ================= CONNECTION REQUESTS ================= */
  sendConnectionRequest: async (toUserId: string): Promise<any> => {
    const response = await apiClient.post<any>(`/users/${toUserId}/connect`);
    return response.data;
  },

  acceptConnectionRequest: async (requestId: string): Promise<any> => {
    const response = await apiClient.post<any>(
      `/users/requests/${requestId}/accept`
    );
    return response.data;
  },

  rejectConnectionRequest: async (requestId: string): Promise<any> => {
    const response = await apiClient.post<any>(
      `/users/requests/${requestId}/reject`
    );
    return response.data;
  },

  getPendingConnectionRequests: async (userId: string): Promise<any[]> => {
    const response = await apiClient.get<any>(
      `/users/${userId}/requests/pending`
    );
    return response.data;
  },

  /* ================= UPLOAD PHOTOS ================= */
  uploadPhotos: async (
    userId: string,
    photos: string[]
  ): Promise<string[]> => {
    console.log("uploadPhotos calling with:", userId, photos);
    const formData = new FormData();

    photos.forEach((uri, index) => {
      console.log("Appending photo:", uri);
      formData.append("photos", {
        uri,
        name: `photo_${index}.jpg`,
        type: "image/jpeg",
      } as any);
    });

    const response = await apiClient.post(
      `/users/${userId}/photos`,
      formData
    );

    return response.data?.data?.photos || []; // Safely access nested property
  },
};
