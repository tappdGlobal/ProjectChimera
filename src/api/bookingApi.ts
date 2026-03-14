import { apiClient } from "../services/api";
import {
  Booking,
  BookingStatus,
  CreateBookingRequest,
  ConfirmBookingResponse,
  CancelBookingResponse,
  CheckInRequest,
  CheckInResponse,
} from "../types/bookingTypes";

/* ================= CREATE BOOKING ================= */

export const createBookingApi = async (
  data: CreateBookingRequest
): Promise<Booking> => {
  try {
    console.log("📤 CREATE BOOKING REQUEST:", data);

    const response = await apiClient.post("/bookings", data);

    console.log("✅ CREATE BOOKING RESPONSE:", response);
    console.log("🆔 BOOKING ID:", response?.id);

    return response;
  } catch (error: any) {
    console.log("❌ CREATE BOOKING ERROR:", error);
    console.log("⚠️ BACKEND ERROR:", error?.response?.data);

    throw error;
  }
};

/* ================= GET MY BOOKINGS ================= */

export const getMyBookingsApi = async (params?: {
  status?: BookingStatus;
  upcoming?: boolean;
}): Promise<Booking[]> => {
  try {
    console.log("📤 GET MY BOOKINGS PARAMS:", params);

    const response = await apiClient.get("/bookings/my-bookings", {
      params,
    });

    console.log("✅ GET MY BOOKINGS RESPONSE:", response);

    return response;
  } catch (error: any) {

    throw error;
  }
};

/* ================= GET BOOKING BY ID ================= */

export const getBookingByIdApi = async (
  id: string
): Promise<Booking> => {
  try {
    console.log("📤 GET BOOKING BY ID:", id);

    const response = await apiClient.get(`/bookings/${id}`);

    console.log("✅ GET BOOKING RESPONSE:", response);

    return response;
  } catch (error: any) {
    console.log("❌ GET BOOKING ERROR:", error);
    console.log("⚠️ BACKEND ERROR:", error?.response?.data);

    throw error;
  }
};

/* ================= CANCEL BOOKING ================= */

export const cancelBookingApi = async (
  id: string
): Promise<CancelBookingResponse> => {
  try {
    console.log("📤 CANCEL BOOKING ID:", id);

    const response = await apiClient.delete(`/bookings/${id}`);

    console.log("✅ CANCEL BOOKING RESPONSE:", response);

    return response;
  } catch (error: any) {
    console.log("❌ CANCEL BOOKING ERROR:", error);
    console.log("⚠️ BACKEND ERROR:", error?.response?.data);

    throw error;
  }
};

/* ================= CONFIRM BOOKING ================= */

export const confirmBookingApi = async (
  id: string
): Promise<ConfirmBookingResponse> => {
  try {
    console.log("📤 CONFIRM BOOKING ID:", id);

    const response = await apiClient.post(`/bookings/${id}/confirm`);

    console.log("✅ CONFIRM BOOKING RESPONSE:", response);

    return response;
  } catch (error: any) {
    console.log("❌ CONFIRM BOOKING ERROR:", error);
    console.log("⚠️ BACKEND ERROR:", error?.response?.data);

    throw error;
  }
};

/* ================= CHECK-IN ================= */

export const checkInBookingApi = async (
  id: string,
  data: CheckInRequest
): Promise<CheckInResponse> => {
  try {
    console.log("📤 CHECK-IN REQUEST:", { id, ...data });

    const response = await apiClient.post(`/bookings/${id}/check-in`, data);

    console.log("✅ CHECK-IN RESPONSE:", response);

    return response;
  } catch (error: any) {
    console.log("❌ CHECK-IN ERROR:", error);
    console.log("⚠️ BACKEND ERROR:", error?.response?.data);

    throw error;
  }
};
