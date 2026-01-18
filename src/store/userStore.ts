import { create } from "zustand";
import { User } from "../api/user.model";
import { userApi } from "../api/userApi";
import { useAuthStore } from "./authStore";

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  uploadPhotos: (photos: string[]) => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  /* ================= FETCH USER ================= */
  fetchUser: async () => {
    const userId = useAuthStore.getState().userId;
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      const user = await userApi.getUserById(userId);
      set({ user, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error?.message || "Failed to load user",
      });
    }
  },

  /* ================= UPDATE USER ================= */
  updateUser: async (data: Partial<User>) => {
    const userId = useAuthStore.getState().userId;
    if (!userId) return;

    set({ isLoading: true, error: null });

    try {
      const updatedUser = await userApi.updateUserProfile(userId, data);
      set({ user: updatedUser, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error?.message || "Failed to update profile",
      });
      throw error;
    }
  },

  /* ================= UPLOAD PHOTOS ================= */
  uploadPhotos: async (newPhotos: string[]) => {
    const userId = useAuthStore.getState().userId;
    const currentUser = get().user;

    if (!userId || !currentUser) return;

    set({ isLoading: true, error: null });

    try {
      const updatedPhotos = await userApi.uploadPhotos(
        userId,
        newPhotos
      );

      set({
        user: {
          ...currentUser,
          photos: updatedPhotos,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error?.message || "Photo upload failed",
      });
    }
  },

  clearUser: () => set({ user: null }),
}));
