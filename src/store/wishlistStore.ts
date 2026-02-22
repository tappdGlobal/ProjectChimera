// src/store/wishlistStore.ts

import { create } from "zustand";
import {
  addToWishlistApi,
  removeFromWishlistApi,
  getWishlistApi,
  WishlistEvent,
} from "../api/wishlistApi";
import Toast from "react-native-toast-message";

interface WishlistState {
  wishlist: WishlistEvent[];
  loading: boolean;

  // maps
  isWishlistedMap: Record<string, boolean>;
  wishlistLoadingMap: Record<string, boolean>;

  // actions
  fetchWishlist: () => Promise<void>;
  addToWishlist: (eventId: string) => Promise<void>;
  removeFromWishlist: (eventId: string) => Promise<void>;
  toggleWishlist: (eventId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [],
  loading: false,

  // 🔥 IMPORTANT: initialize maps (prevents undefined crash)
  isWishlistedMap: {},
  wishlistLoadingMap: {},

  /* ================= FETCH ================= */

  fetchWishlist: async () => {
    try {
      set({ loading: true });

      const response = await getWishlistApi();

      const data =
        Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

      // build map from wishlist
      const map: Record<string, boolean> = {};
      data.forEach((item) => {
        if (item.event?.id) {
          map[item.event.id] = true;
        }
      });

      set({
        wishlist: data,
        loading: false,
        isWishlistedMap: map,
      });
    } catch (error) {
      console.error("Fetch wishlist error:", error);
      set({ loading: false });
    }
  },

  /* ================= ADD ================= */

  addToWishlist: async (eventId: string) => {
    try {
      set((state) => ({
        wishlistLoadingMap: {
          ...state.wishlistLoadingMap,
          [eventId]: true,
        },
      }));

      await addToWishlistApi(eventId);

      Toast.show({
        type: "success",
        text1: "Added to wishlist",
        position: "top",
      });

      // refresh from backend
      await get().fetchWishlist();
    } catch (error: any) {
      if (
        error?.response?.status === 409 ||
        error?.error?.code === "CONFLICT"
      ) {
        Toast.show({
          type: "info",
          text1: "Event already in wishlist",
          position: "top",
        });
        return;
      }

      if (__DEV__) console.error("Add wishlist error:", error);

      Toast.show({
        type: "error",
        text1: "Failed to add",
        position: "top",
      });
    } finally {
      set((state) => ({
        wishlistLoadingMap: {
          ...state.wishlistLoadingMap,
          [eventId]: false,
        },
      }));
    }
  },

  /* ================= REMOVE ================= */

  removeFromWishlist: async (eventId: string) => {
    try {
      set((state) => ({
        wishlistLoadingMap: {
          ...state.wishlistLoadingMap,
          [eventId]: true,
        },
      }));

      await removeFromWishlistApi(eventId);

      // update locally
      set((state) => {
        const updated = state.wishlist.filter(
          (item) => item.event?.id !== eventId
        );

        const updatedMap: Record<string, boolean> = {};
        updated.forEach((item) => {
          if (item.event?.id) {
            updatedMap[item.event.id] = true;
          }
        });

        return {
          wishlist: updated,
          isWishlistedMap: updatedMap,
        };
      });

      Toast.show({
        type: "success",
        text1: "Removed from wishlist",
        position: "top",
      });
    } catch (error: any) {
      if (
        error?.response?.status === 404 ||
        error?.error?.code === "NOT_FOUND"
      ) {
        Toast.show({
          type: "info",
          text1: "Already removed from wishlist",
          position: "top",
        });
        return;
      }

      if (__DEV__) console.error("Remove wishlist error:", error);

      Toast.show({
        type: "error",
        text1: "Failed to remove",
        position: "top",
      });
    } finally {
      set((state) => ({
        wishlistLoadingMap: {
          ...state.wishlistLoadingMap,
          [eventId]: false,
        },
      }));
    }
  },

  /* ================= TOGGLE ================= */

  toggleWishlist: async (eventId: string) => {
    const { isWishlistedMap, addToWishlist, removeFromWishlist } = get();

    if (isWishlistedMap[eventId]) {
      await removeFromWishlist(eventId);
    } else {
      await addToWishlist(eventId);
    }
  },
}));