import { create } from "zustand";
import { User } from "../types/authTypes";
import {
  getUserByIdApi,
  updateUserApi,
  uploadProfilePictureApi,
  uploadPhotosApi,
  deletePhotoApi,
  UpdateUserPayload,
} from "../api/userApi";
import { useAuthStore } from "./authStore";

interface UserState {
  profile: User | null;
  loading: boolean;
  error: string | null;

  fetchUser: (userId: string) => Promise<void>;
  updateUser: (userId: string, data: UpdateUserPayload) => Promise<void>;
  uploadProfilePicture: (
    userId: string,
    file: { uri: string; name: string; type: string },
  ) => Promise<void>;
  uploadPhotos: (
    userId: string,
    photos: { uri: string; name: string; type: string }[],
  ) => Promise<void>;
  deletePhoto: (userId: string, photoUrl: string) => Promise<void>;
  clearUser: () => void;
  setProfile: (user: User) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  setProfile: (user: User) => {
    set({ profile: user });
  },

  fetchUser: async (userId) => {
    try {
      set({ loading: true, error: null });
      const res = await getUserByIdApi(userId);
      set({ profile: res.data ?? null, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  updateUser: async (userId, data) => {
    try {
      set({ loading: true, error: null });
      const res = await updateUserApi(userId, data);
      set({ profile: res.data ?? null, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  uploadProfilePicture: async (userId, file) => {
    try {
      set({ loading: true, error: null });
      const res = await uploadProfilePictureApi(userId, file);

      set((state) => ({
        profile: state.profile
          ? { ...state.profile, profilePicUrl: res.data?.profilePicUrl }
          : state.profile,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  uploadPhotos: async (userId, photos) => {
    try {
      set({ loading: true, error: null });
      const res = await uploadPhotosApi(userId, photos);

      set((state) => ({
        profile: state.profile
          ? { ...state.profile, photos: res.data?.photos ?? [] }
          : state.profile,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  deletePhoto: async (userId, photoUrl) => {
    try {
      set({ loading: true, error: null });
      const res = await deletePhotoApi(userId, photoUrl);

      set((state) => ({
        profile: state.profile
          ? { ...state.profile, photos: res.data?.photos ?? [] }
          : state.profile,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  clearUser: () => {
    set({ profile: null, error: null });
  },
}));
