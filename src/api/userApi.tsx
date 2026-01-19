import { apiClient } from "../services/api";
import { ApiResponse, User } from "../types/authTypes";

/* ================= GET USER PROFILE ================= */

export const getUserByIdApi = (
  userId: string
): Promise<ApiResponse<User>> => {
  return apiClient.get(`/users/${userId}`);
};

/* ================= UPDATE USER PROFILE ================= */

export type UpdateUserPayload = Partial<{
  name: string;
  bio: string;
  occupation: string;
  education: string;
  lookingFor: string;
  age: number;
  height: number;
  gender: string;
  location: string;
  interests: string[];
  smoking: string;
  drinking: string;
  latitude: number;
  longitude: number;
  locationVisibility: boolean;
}>;

export const updateUserApi = (
  userId: string,
  payload: UpdateUserPayload
): Promise<ApiResponse<User>> => {
  return apiClient.put(`/users/${userId}`, payload);
};

/* ================= UPLOAD PROFILE PICTURE ================= */

export const uploadProfilePictureApi = (
  userId: string,
  file: {
    uri: string;
    name: string;
    type: string;
  }
): Promise<ApiResponse<{ profilePicUrl: string }>> => {
  const formData = new FormData();
  formData.append("profilePicture", file as any);

  return apiClient.post(`/users/${userId}/profile-picture`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/* ================= UPLOAD MULTIPLE PHOTOS ================= */

export const uploadPhotosApi = (
  userId: string,
  photos: {
    uri: string;
    name: string;
    type: string;
  }[]
): Promise<ApiResponse<{ photos: string[] }>> => {
  const formData = new FormData();

  photos.forEach((photo) => {
    formData.append("photos", photo as any);
  });

  return apiClient.post(`/users/${userId}/photos`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
