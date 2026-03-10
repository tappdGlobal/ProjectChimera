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
  bookingId?: string;
};

/* ================= STATE INTERFACE ================= */

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;

  loading: boolean;
  error: string | null;

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
      console.log("📤 CREATE BOOKING REQUEST:", data);

      set({ loading: true, error: null });

      const res = await createBookingApi(data);

      console.log("📥 CREATE BOOKING API RESPONSE:", res);

      const booking = res?.data;

      console.log("🆔 BOOKING ID:", booking?.id);

      set((state) => ({
        bookings: booking
          ? [booking, ...state.bookings]
          : state.bookings,
        loading: false,
      }));

      return {
        success: true,
        message: "Booking successful",
        bookingId: booking?.id,
      };
    } catch (error: any) {
      console.log("❌ CREATE BOOKING ERROR:", error);

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
    console.log("📤 FETCH BOOKINGS PARAMS:", params);

    set({ loading: true, error: null });

    const res = await getMyBookingsApi(params);

    console.log("📥 FULL API RESPONSE:", res);
    console.log("📦 BOOKINGS ARRAY:", res?.data);

    set({
      bookings: res?.data || [],
      loading: false,
    });

  } catch (error: any) {
    console.log("❌ FETCH BOOKINGS ERROR:", error);

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
      console.log("🚫 CANCEL BOOKING ID:", id);

      set({ loading: true, error: null });

      await cancelBookingApi(id);

      console.log("✅ BOOKING CANCELLED:", id);

      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === id ? { ...b, status: "CANCELLED" } : b
        ),
        loading: false,
      }));

      return true;
    } catch (error: any) {
      console.log("❌ CANCEL BOOKING ERROR:", error);

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
      console.log("✔️ CONFIRM BOOKING ID:", id);

      set({ loading: true, error: null });

      const res = await confirmBookingApi(id);

      console.log("📥 CONFIRM BOOKING RESPONSE:", res);

      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === id ? res.data : b
        ),
        loading: false,
      }));

      return true;
    } catch (error: any) {
      console.log("❌ CONFIRM BOOKING ERROR:", error);

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
      console.log("📍 CHECK-IN REQUEST:", { id, data });

      set({ loading: true, error: null });

      const res = await checkInBookingApi(id, data);

      console.log("📥 CHECK-IN RESPONSE:", res);

      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === id ? res.data : b
        ),
        loading: false,
      }));

      return true;
    } catch (error: any) {
      console.log("❌ CHECK-IN ERROR:", error);

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