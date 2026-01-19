import { apiClient } from "../services/api";
import { ApiResponse } from "../types/authTypes";
import { Event } from "../types/eventTypes";

/* ================= ADD TO WISHLIST ================= */

export interface AddToWishlistPayload {
  eventId: string;
}

export const addToWishlistApi = (
  payload: AddToWishlistPayload
): Promise<ApiResponse<null>> => {
  return apiClient.post("/wishlist/add", payload);
};

/* ================= REMOVE FROM WISHLIST ================= */

export const removeFromWishlistApi = (
  payload: AddToWishlistPayload
): Promise<ApiResponse<null>> => {
  return apiClient.delete("/wishlist/remove", {
    data: payload,
  });
};

/* ================= GET USER WISHLIST ================= */

export interface GetWishlistParams {
  page?: number;
  limit?: number;
}

export const getWishlistApi = (
  params?: GetWishlistParams
): Promise<ApiResponse<Event[]>> => {
  return apiClient.get("/wishlist", { params });
};

/* ================= CHECK WISHLIST STATUS ================= */

export const checkWishlistStatusApi = (
  eventId: string
): Promise<ApiResponse<{ isWishlisted: boolean }>> => {
  return apiClient.get(`/wishlist/status/${eventId}`);
};

/* ================= POPULAR WISHLIST EVENTS ================= */

export const getPopularWishlistApi = (): Promise<ApiResponse<Event[]>> => {
  return apiClient.get("/wishlist/popular");
};
