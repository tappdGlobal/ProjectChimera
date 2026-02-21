import { create } from "zustand";
import {
  createBookingApi,
  getMyBookingsApi,
  cancelBookingApi,
  confirmBookingApi,
  checkInBookingApi,
} from "../api/bookingApi";

import {
  Booking,
  BookingStatus,
  CreateBookingRequest,
  CheckInRequest,
} from "../types/bookingTypes";

/* ================= RESULT TYPE ================= */

type BookingResult = {
  success: boolean;
  message: string;
};

/* ================= STATE INTERFACE ================= */

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;

  loading: boolean;
  error: string | null;

  /* ================= ACTIONS ================= */

  createBooking: (
    data: CreateBookingRequest
  ) => Promise<BookingResult>;

  fetchMyBookings: (params?: {
    status?: BookingStatus;
    upcoming?: boolean;
  }) => Promise<void>;

  cancelBooking: (id: string) => Promise<boolean>;
  confirmBooking: (id: string) => Promise<boolean>;
  checkInBooking: (
    id: string,
    data: CheckInRequest
  ) => Promise<boolean>;

  setSelectedBooking: (booking: Booking | null) => void;
  clearError: () => void;
}

/* ================= STORE ================= */

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  selectedBooking: null,

  loading: false,
  error: null,

  /* ================= CREATE BOOKING ================= */

  createBooking: async (data) => {
    try {
      set({ loading: true, error: null });

      const res = await createBookingApi(data);

      set((state) => ({
        bookings: [res.data, ...state.bookings],
        loading: false,
      }));

      return {
        success: true,
        message: "Booking successful",
      };
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to create booking";

      set({
        error: backendMessage,
        loading: false,
      });

      return {
        success: false,
        message: backendMessage,
      };
    }
  },

  /* ================= FETCH BOOKINGS ================= */
fetchMyBookings: async (params) => {
  try {
    set({ loading: true, error: null });

    const bookings = await getMyBookingsApi(params);

    set({
      bookings: bookings || [],
      loading: false,
    });

  } catch (error: any) {
    set({
      error:
        error?.response?.data?.message ||
        "Failed to fetch bookings",
      loading: false,
    });
  }
},
  /* ================= CANCEL BOOKING ================= */

  cancelBooking: async (id) => {
    try {
      set({ loading: true, error: null });

      await cancelBookingApi(id);

      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === id
            ? { ...b, status: "CANCELLED" }
            : b
        ),
        loading: false,
      }));

      return true;
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message ||
          "Failed to cancel booking",
        loading: false,
      });

      return false;
    }
  },

  /* ================= CONFIRM BOOKING ================= */

  confirmBooking: async (id) => {
    try {
      set({ loading: true, error: null });

      const res = await confirmBookingApi(id);

      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === id ? res.data : b
        ),
        loading: false,
      }));

      return true;
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message ||
          "Failed to confirm booking",
        loading: false,
      });

      return false;
    }
  },

  /* ================= CHECK-IN ================= */

  checkInBooking: async (id, data) => {
    try {
      set({ loading: true, error: null });

      const res = await checkInBookingApi(id, data);

      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === id ? res.data : b
        ),
        loading: false,
      }));

      return true;
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message ||
          "Check-in failed",
        loading: false,
      });

      return false;
    }
  },

  /* ================= HELPERS ================= */

  setSelectedBooking: (booking) =>
    set({ selectedBooking: booking }),

  clearError: () => set({ error: null }),
}));