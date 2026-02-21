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
    actionLoading: Record<string, boolean>;

    fetchWishlist: () => Promise<void>;
    addToWishlist: (eventId: string) => Promise<void>;
    removeFromWishlist: (eventId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    wishlist: [],
    loading: false,
    actionLoading: {},

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

            set({
                wishlist: data,
                loading: false,
            });
        } catch (error) {
            console.error("Fetch wishlist error:", error);
            set({ loading: false });
        }
    },

    /* ================= ADD ================= */
    addToWishlist: async (eventId: string) => {
        try {
            set((state: WishlistState) => ({
                actionLoading: { ...state.actionLoading, [eventId]: true },
            }));

            await addToWishlistApi(eventId);

            Toast.show({
                type: "success",
                text1: "Added to wishlist",
                position: "top",
            });

            // refresh wishlist from backend
            await get().fetchWishlist();

        } catch (error: any) {

            // already exists
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
            set((state: WishlistState) => ({
                actionLoading: { ...state.actionLoading, [eventId]: false },
            }));
        }
    },

    /* ================= REMOVE ================= */

    removeFromWishlist: async (eventId: string) => {
        try {
            set((state: WishlistState) => ({
                actionLoading: { ...state.actionLoading, [eventId]: true },
            }));

            await removeFromWishlistApi(eventId);

            set((state: WishlistState) => ({
                wishlist: state.wishlist.filter(
                    (item) => item.event?.id !== eventId
                ),
            }));

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
            set((state: WishlistState) => ({
                actionLoading: { ...state.actionLoading, [eventId]: false },
            }));
        }
    },
}));