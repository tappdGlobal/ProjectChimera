import { create } from "zustand";
import { Event } from "../types/eventTypes";
import {
  addToWishlistApi,
  removeFromWishlistApi,
  getWishlistApi,
  checkWishlistStatusApi,
  getPopularWishlistApi,
} from "../api/wishlistApi";

interface WishlistState {
  wishlist: Event[];
  popular: Event[];
  isWishlisted: boolean;
  loading: boolean;
  error: string | null;

  addToWishlist: (eventId: string) => Promise<void>;
  removeFromWishlist: (eventId: string) => Promise<void>;
  fetchWishlist: (page?: number, limit?: number) => Promise<void>;
  checkWishlistStatus: (eventId: string) => Promise<void>;
  fetchPopularWishlist: () => Promise<void>;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  wishlist: [],
  popular: [],
  isWishlisted: false,
  loading: false,
  error: null,

  addToWishlist: async (eventId) => {
    try {
      set({ loading: true, error: null });
      await addToWishlistApi({ eventId });
      set({ isWishlisted: true, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  removeFromWishlist: async (eventId) => {
    try {
      set({ loading: true, error: null });
      await removeFromWishlistApi({ eventId });
      set((state) => ({
        wishlist: state.wishlist.filter((e) => e.id !== eventId),
        isWishlisted: false,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchWishlist: async (page = 1, limit = 20) => {
    try {
      set({ loading: true, error: null });
      const res = await getWishlistApi({ page, limit });
      set({ wishlist: res.data ?? [], loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  checkWishlistStatus: async (eventId) => {
    try {
      set({ loading: true, error: null });
      const res = await checkWishlistStatusApi(eventId);
      set({
        isWishlisted: res.data?.isWishlisted ?? false,
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchPopularWishlist: async () => {
    try {
      set({ loading: true, error: null });
      const res = await getPopularWishlistApi();
      set({ popular: res.data ?? [], loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  clearWishlist: () => {
    set({
      wishlist: [],
      popular: [],
      isWishlisted: false,
      error: null,
    });
  },
}));
