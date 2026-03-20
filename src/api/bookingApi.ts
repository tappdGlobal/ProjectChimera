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

    const response = await apiClient.post("/bookings", data);


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
