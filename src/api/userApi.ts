import { apiClient } from "../services/api";
import { User } from "./user.model";

export const userApi = {
  /* ================= GET USER ================= */
  getUserById: async (userId: string): Promise<User> => {
    return apiClient.get(`/users/${userId}`);
  },

  /* ================= UPLOAD PHOTOS ================= */
  uploadPhotos: async (
    userId: string,
    photos: string[]
  ): Promise<string[]> => {
    const formData = new FormData();

    photos.forEach((uri, index) => {
      formData.append("photos", {
        uri,
        name: `photo_${index}.jpg`,
        type: "image/jpeg",
      } as any);
    });

    const response = await apiClient.post(
      `/users/${userId}/photos`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data.photos; 
  },
};
