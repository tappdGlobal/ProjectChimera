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

// Track recent requests to prevent duplicates
const recentRequests = new Map<string, number>();

export const createBookingApi = async (
  data: CreateBookingRequest
): Promise<Booking> => {
  try {
    // Create unique key for this request
    const requestKey = `${data.eventId}-${data.ticketId}`;
    const now = Date.now();
    
    // Check if same request was made in last 10 seconds
    const lastRequest = recentRequests.get(requestKey);
    if (lastRequest && now - lastRequest < 10000) {
      console.log("🚫 API BLOCKED: Duplicate request detected", requestKey);
      throw new Error("Duplicate booking request");
    }
    
    // Track this request
    recentRequests.set(requestKey, now);
    console.log("📤 API CALL:", requestKey, data);
    
    const response = await apiClient.post("/bookings", data);
    
    console.log("📥 API RESPONSE:", response);
    
    // Handle different response formats
    if (response?.data) {
      return response.data;
    }
    if (response?.booking) {
      return response.booking;
    }
    return response;
  } catch (error: any) {
    throw error;
  }
};

/* ================= GET MY BOOKINGS ================= */

export const getMyBookingsApi = async (params?: {
  status?: BookingStatus;
  upcoming?: boolean;
}): Promise<Booking[]> => {
  try {

    const response = await apiClient.get("/bookings/my-bookings", {
      params,
    });

    // Handle different response formats
    if (Array.isArray(response)) {
      return response;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (response?.bookings && Array.isArray(response.bookings)) {
      return response.bookings;
    }
    
    // Return empty array if no valid data found
    return [];
  } catch (error: any) {

    throw error;
  }
};

/* ================= GET BOOKING BY ID ================= */

export const getBookingByIdApi = async (
  id: string
): Promise<Booking> => {
  try {

    const response = await apiClient.get(`/bookings/${id}`);


    return response;
  } catch (error: any) {

    throw error;
  }
};

/* ================= CANCEL BOOKING ================= */

export const cancelBookingApi = async (
  id: string
): Promise<CancelBookingResponse> => {
  try {

    const response = await apiClient.delete(`/bookings/${id}`);


    return response;
  } catch (error: any) {

    throw error;
  }
};

/* ================= CONFIRM BOOKING ================= */

export const confirmBookingApi = async (
  id: string
): Promise<ConfirmBookingResponse> => {
  try {

    const response = await apiClient.post(`/bookings/${id}/confirm`);


    return response;
  } catch (error: any) {

    throw error;
  }
};

/* ================= CHECK-IN ================= */

export const checkInBookingApi = async (
  id: string,
  data: CheckInRequest
): Promise<CheckInResponse> => {
  try {

    const response = await apiClient.post(`/bookings/${id}/check-in`, data);


    return response;
  } catch (error: any) {

    throw error;
  }
};
