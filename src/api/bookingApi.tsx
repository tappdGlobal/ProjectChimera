import { apiClient } from "../services/api";
import { ApiResponse } from "../types/authTypes";
import { Booking, BookingStatus } from "../types/bookingTypes";

/* ================= CREATE BOOKING ================= */

export interface CreateBookingPayload {
  eventId: string;
  ticketId: string;
}

export const createBookingApi = (
  payload: CreateBookingPayload
): Promise<ApiResponse<Booking>> => {
  return apiClient.post("/bookings", payload);
};

/* ================= GET MY BOOKINGS ================= */

export interface GetMyBookingsParams {
  status?: BookingStatus;
  upcoming?: boolean;
}

export const getMyBookingsApi = (
  params?: GetMyBookingsParams
): Promise<ApiResponse<Booking[]>> => {
  return apiClient.get("/bookings/my-bookings", { params });
};

/* ================= GET BOOKING BY ID ================= */

export const getBookingByIdApi = (
  bookingId: string
): Promise<ApiResponse<Booking>> => {
  return apiClient.get(`/bookings/${bookingId}`);
};

/* ================= CANCEL BOOKING ================= */

export const cancelBookingApi = (
  bookingId: string
): Promise<ApiResponse<null>> => {
  return apiClient.delete(`/bookings/${bookingId}`);
};

/* ================= CONFIRM BOOKING ================= */

export const confirmBookingApi = (
  bookingId: string
): Promise<ApiResponse<Booking>> => {
  return apiClient.post(`/bookings/${bookingId}/confirm`);
};

/* ================= CHECK-IN BOOKING ================= */

export interface CheckInPayload {
  latitude: number;
  longitude: number;
}

export const checkInBookingApi = (
  bookingId: string,
  payload: CheckInPayload
): Promise<ApiResponse<Booking>> => {
  return apiClient.post(`/bookings/${bookingId}/check-in`, payload);
};
