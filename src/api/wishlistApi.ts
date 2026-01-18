import { apiClient } from "../services/api";

/* ===================== TYPES ===================== */

export interface WishlistItem {
  id: string;
  userId: string;
  eventId: string;
  createdAt: string;
  event?: any; // Event object
}

/* ===================== API ===================== */

export const wishlistApi = {
  /* ================= ADD TO WISHLIST ================= */
  addToWishlist: async (eventId: string): Promise<WishlistItem> => {
    const response = await apiClient.post<any>("/wishlist", { eventId });
    return response.data;
  },

  /* ================= REMOVE FROM WISHLIST ================= */
  removeFromWishlist: async (eventId: string): Promise<void> => {
    await apiClient.delete(`/wishlist/${eventId}`);
  },

  /* ================= GET WISHLIST ================= */
  getWishlist: async (userId: string): Promise<WishlistItem[]> => {
    const response = await apiClient.get<any>(`/wishlist/user/${userId}`);
    return response.data;
  },

  /* ================= CHECK WISHLIST STATUS ================= */
  checkWishlistStatus: async (eventId: string): Promise<boolean> => {
    const response = await apiClient.get<any>(`/wishlist/check/${eventId}`);
    return response.data.isWishlisted || false;
  },

  /* ================= TOGGLE WISHLIST ================= */
  toggleWishlist: async (eventId: string): Promise<{ isWishlisted: boolean }> => {
    const response = await apiClient.post<any>("/wishlist/toggle", { eventId });
    return response.data;
  },
};
