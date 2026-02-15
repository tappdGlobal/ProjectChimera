import { apiClient } from "../services/api";
import { ApiResponse, User } from "../types/authTypes";

/* ================= GET USER PROFILE ================= */

export const getUserByIdApi = async (
  userId: string
): Promise<ApiResponse<User>> => {
  console.log("📡 [API] getUserByIdApi called");
  console.log("➡️ userId:", userId);

  try {
    const res = await apiClient.get(`/users/${userId}`);

    console.log("✅ [API] getUserByIdApi success");
    console.log("📦 response data:", res.data);

    return res;
  } catch (error: any) {
    console.log("❌ [API] getUserByIdApi failed");
    console.log("🧨 error:", error?.response?.data || error.message || error);
    throw error;
  }
};

/* ================= UPDATE USER PROFILE ================= */

export type UpdateUserPayload = Partial<{
  name: string;
  bio: string;
  occupation: string;
  education: string;
  lookingFor: string[];
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
  photos: string[];
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

/* ================= DELETE PHOTO ================= */

export const deletePhotoApi = (
  userId: string,
  photoUrl: string
): Promise<ApiResponse<User>> => {
  // Get current user to get photos array
  return getUserByIdApi(userId).then((userResponse) => {
    if (!userResponse.data) {
      throw new Error("User not found");
    }

    const currentPhotos = userResponse.data.photos || [];
    const updatedPhotos = currentPhotos.filter((photo) => photo !== photoUrl);

    // Update user with new photos array
    return updateUserApi(userId, {
      photos: updatedPhotos,
    });
  });
};