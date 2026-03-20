// src/api/wishlistApi.ts

import { apiClient } from "../services/api";
import { AxiosResponse } from "axios";

import {
  WishlistEvent,
  WishlistStatusResponse,
} from "../types/wishlistTypes";

/* ================= ADD TO WISHLIST ================= */

export const addToWishlistApi = async (
  eventId: string
): Promise<void> => {
  try {

    await apiClient.post("/wishlist/add", { eventId });

  } catch (error: any) {

    // 🔥 NORMAL CASE → ALREADY EXISTS
    if (
      error?.response?.status === 409 ||
      error?.response?.data?.error?.code === "CONFLICT"
    ) {
      throw error; // let store handle it silently
    }

    // 🚨 REAL ERROR ONLY
    

    throw error;
  }
};


/* ================= REMOVE FROM WISHLIST ================= */

export const removeFromWishlistApi = async (
  eventId: string
): Promise<void> => {
  try {

    await apiClient.delete("/wishlist/remove", {
      data: { eventId },
    });

  } catch (error: any) {

    // 🔥 NORMAL CASE → ALREADY REMOVED
    if (
      error?.response?.status === 404 ||
      error?.response?.data?.error?.code === "NOT_FOUND"
    ) {
      throw error; // store handles gracefully
    }

    

    throw error;
  }
};


/* ================= GET USER WISHLIST ================= */

export const getWishlistApi = async (): Promise<WishlistEvent[]> => {
  try {

    const response = await apiClient.get("/wishlist");

    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : [];

    return data;

  } catch (error: any) {

   

    return [];
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

export const getPopularWishlistApi = async (): Promise<WishlistEvent[]> => {
  try {
    const response = await apiClient.get("/wishlist/popular");
    return Array.isArray(response.data) ? response.data : [];

  } catch (error: any) {

    

    return [];
  }
};