// src/store/wishlistStore.ts

import { create } from "zustand";
import {
    addToWishlistApi,
    removeFromWishlistApi,
    getWishlistApi,
    checkWishlistStatusApi,
    getPopularWishlistApi,
    WishlistEvent,
} from "../api/wishlistApi";
import Toast from "react-native-toast-message";
interface WishlistState {
    wishlist: WishlistEvent[];
    popularWishlist: WishlistEvent[];
    isWishlistedMap: Record<string, boolean>;

    loading: boolean;
    loadingPopular: boolean;

    /* Actions */
    fetchWishlist: (page?: number, limit?: number) => Promise<void>;
    fetchPopularWishlist: () => Promise<void>;
    checkWishlistStatus: (eventId: string) => Promise<boolean>;
    addToWishlist: (eventId: string) => Promise<void>;
    removeFromWishlist: (eventId: string) => Promise<void>;
    toggleWishlist: (eventId: string) => Promise<void>;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    wishlist: [],
    popularWishlist: [],
    isWishlistedMap: {},

    loading: false,
    loadingPopular: false,

    /* ================= FETCH USER WISHLIST ================= */

    fetchWishlist: async (page = 1, limit = 20) => {
        try {
            set({ loading: true });

            const data = await getWishlistApi(page, limit);

            const wishlistMap: Record<string, boolean> = {};
            data.forEach((event) => {
                wishlistMap[event.id] = true;
            });

            set({
                wishlist: data,
                isWishlistedMap: wishlistMap,
                loading: false,
            });
        } catch (error) {
            console.error("Fetch wishlist error:", error);
            set({ loading: false });
        }
    },

    /* ================= FETCH POPULAR ================= */

    fetchPopularWishlist: async () => {
        try {
            set({ loadingPopular: true });

            const data = await getPopularWishlistApi();

            set({
                popularWishlist: data,
                loadingPopular: false,
            });
        } catch (error) {
            console.error("Fetch popular wishlist error:", error);
            set({ loadingPopular: false });
        }
    },

    /* ================= CHECK STATUS ================= */

    checkWishlistStatus: async (eventId: string) => {
        try {
            const isWishlisted = await checkWishlistStatusApi(eventId);

            set((state) => ({
                isWishlistedMap: {
                    ...state.isWishlistedMap,
                    [eventId]: isWishlisted,
                },
            }));

            return isWishlisted;
        } catch (error) {
            console.error("Check wishlist status error:", error);
            return false;
        }
    },

    /* ================= ADD ================= */
    addToWishlist: async (eventId: string) => {
        try {
            await addToWishlistApi(eventId);

            set((state) => ({
                isWishlistedMap: {
                    ...state.isWishlistedMap,
                    [eventId]: true,
                },
            }));

            Toast.show({
                type: "success",
                text1: "Added to wishlist",
                position: "top",
                visibilityTime: 1500,
            });

        } catch (error: any) {

            if (error?.response?.status === 409) {
                Toast.show({
                    type: "info",
                    text1: "Event already in wishlist",
                    position: "top",
                    visibilityTime: 2000,
                });
                return;
            }

            Toast.show({
                type: "error",
                text1: "Something went wrong",
                position: "top",
                visibilityTime: 2000,
            });

            console.error("Add to wishlist error:", error);
        }
    },
    /* ================= REMOVE ================= */
    /* ================= REMOVE ================= */

    removeFromWishlist: async (eventId: string) => {
        try {
            await removeFromWishlistApi(eventId);

            Toast.show({
                type: "success",
                text1: "Removed from wishlist",
                position: "top",
                visibilityTime: 1500,
            });

            // 🔥 Force fresh fetch from backend
            await get().fetchWishlist();

        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: "Failed to remove from wishlist",
                position: "top",
                visibilityTime: 2000,
            });

            console.error("Remove from wishlist error:", error);
        }
    },
    /* ================= TOGGLE ================= */

    toggleWishlist: async (eventId: string) => {
        const { isWishlistedMap } = get();
        const isWishlisted = isWishlistedMap[eventId];

        if (isWishlisted) {
            await get().removeFromWishlist(eventId);
        } else {
            await get().addToWishlist(eventId);
        }
    },

    /* ================= CLEAR ================= */

    clearWishlist: () => {
        set({
            wishlist: [],
            isWishlistedMap: {},
        });
    },
}));