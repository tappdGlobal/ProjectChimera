// src/api/wishlistApi.ts

import { apiClient } from "../services/api";
import { AxiosResponse } from "axios";

import {
  WishlistEvent,
  WishlistStatusResponse,
  PaginatedWishlistResponse,
} from "../types/wishlistTypes";

/* ================= ADD TO WISHLIST ================= */

export const addToWishlistApi = async (
  eventId: string
): Promise<void> => {
  try {

    const response = await apiClient.post("/wishlist/add", {
      eventId,
    });

    
  } catch (error: any) {
   
    throw error;
  }
};

/* ================= REMOVE FROM WISHLIST ================= */

export const removeFromWishlistApi = async (
  eventId: string
): Promise<void> => {
  try {

    const response = await apiClient.delete("/wishlist/remove", {
      data: { eventId },
    });

  } catch (error: any) {
    throw error;
  }
};

/* ================= GET USER WISHLIST ================= */

export const getWishlistApi = async (
  page: number = 1,
  limit: number = 20
): Promise<WishlistEvent[]> => {
  try {

    const response: AxiosResponse<PaginatedWishlistResponse> =
      await apiClient.get("/wishlist", {
        params: { page, limit },
      });


    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

/* ================= CHECK WISHLIST STATUS ================= */

export const checkWishlistStatusApi = async (
  eventId: string
): Promise<boolean> => {
  try {

    const response: AxiosResponse<{
      statusCode: number;
      message: string;
      success: boolean;
      data: WishlistStatusResponse;
    }> = await apiClient.get(`/wishlist/status/${eventId}`);


    return response.data.data.isWishlisted;
  } catch (error: any) {
    throw error;
  }
};

/* ================= GET POPULAR WISHLIST ================= */

export const getPopularWishlistApi = async (): Promise<
  WishlistEvent[]
> => {
  try {
    

    const response = await apiClient.get("/wishlist/popular");

   

    // ✅ Backend returns array directly
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error(
      "❌ Popular wishlist error:",
      error?.response?.data || error
    );
    return [];
  }
};