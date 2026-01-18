import { apiClient } from "../services/api";

/* ===================== TYPES ===================== */

export interface CreateBookingData {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  paymentMethod?: string;
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  totalAmount: number;
  status: string; // PENDING, CONFIRMED, CANCELLED
  paymentStatus: string; // PENDING, COMPLETED, FAILED
  bookingDate: string;
  createdAt: string;
  updatedAt: string;
  event?: any; // Event object
  ticketType?: any; // Ticket type object
}

export interface BookingDetails extends Booking {
  qrCode?: string;
  checkInStatus?: string;
  checkInTime?: string;
}

/* ===================== API ===================== */

export const bookingApi = {
  /* ================= CREATE BOOKING ================= */
  createBooking: async (bookingData: CreateBookingData): Promise<Booking> => {
    const response = await apiClient.post<any>("/bookings", bookingData);
    return response.data;
  },

  /* ================= GET USER BOOKINGS ================= */
  getUserBookings: async (userId: string): Promise<Booking[]> => {
    const response = await apiClient.get<any>(`/bookings/user/${userId}`);
    return response.data;
  },

  /* ================= GET BOOKING DETAILS ================= */
  getBookingDetails: async (bookingId: string): Promise<BookingDetails> => {
    const response = await apiClient.get<any>(`/bookings/${bookingId}`);
    return response.data;
  },

  /* ================= CANCEL BOOKING ================= */
  cancelBooking: async (bookingId: string): Promise<Booking> => {
    const response = await apiClient.post<any>(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  /* ================= GET EVENT BOOKINGS (HOST) ================= */
  getEventBookings: async (eventId: string): Promise<Booking[]> => {
    const response = await apiClient.get<any>(`/bookings/event/${eventId}`);
    return response.data;
  },

  /* ================= CHECK IN BOOKING ================= */
  checkInBooking: async (bookingId: string): Promise<BookingDetails> => {
    const response = await apiClient.post<any>(`/bookings/${bookingId}/checkin`);
    return response.data;
  },

  /* ================= VERIFY QR CODE ================= */
  verifyQRCode: async (qrCode: string): Promise<BookingDetails> => {
    const response = await apiClient.post<any>("/bookings/verify-qr", {
      qrCode,
    });
    return response.data;
  },
};
