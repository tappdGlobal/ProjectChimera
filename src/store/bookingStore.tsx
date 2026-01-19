import { create } from "zustand";
import {
  createBookingApi,
  getMyBookingsApi,
  getBookingByIdApi,
  cancelBookingApi,
  confirmBookingApi,
  checkInBookingApi,
  CreateBookingPayload,
  GetMyBookingsParams,
  CheckInPayload,
} from "../api/bookingApi";
import { Booking } from "../types/bookingTypes";

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;

  createBooking: (data: CreateBookingPayload) => Promise<void>;
  fetchMyBookings: (params?: GetMyBookingsParams) => Promise<void>;
  fetchBookingById: (bookingId: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  confirmBooking: (bookingId: string) => Promise<void>;
  checkInBooking: (
    bookingId: string,
    coords: CheckInPayload
  ) => Promise<void>;
  clearBookings: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,

  createBooking: async (data) => {
    try {
      set({ loading: true, error: null });
      const res = await createBookingApi(data);

      set((state) => ({
        bookings: res.data
          ? [...state.bookings, res.data]
          : state.bookings,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchMyBookings: async (params) => {
    try {
      set({ loading: true, error: null });
      const res = await getMyBookingsApi(params);
      set({ bookings: res.data ?? [], loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchBookingById: async (bookingId) => {
    try {
      set({ loading: true, error: null });
      const res = await getBookingByIdApi(bookingId);
      set({ selectedBooking: res.data ?? null, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      set({ loading: true, error: null });
      await cancelBookingApi(bookingId);

      set((state) => ({
        bookings: state.bookings.filter((b) => b.id !== bookingId),
        selectedBooking: null,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  confirmBooking: async (bookingId) => {
    try {
      set({ loading: true, error: null });
      const res = await confirmBookingApi(bookingId);

      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === bookingId && res.data ? res.data : b
        ),
        selectedBooking: res.data ?? state.selectedBooking,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  checkInBooking: async (bookingId, coords) => {
    try {
      set({ loading: true, error: null });
      const res = await checkInBookingApi(bookingId, coords);

      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === bookingId && res.data ? res.data : b
        ),
        selectedBooking: res.data ?? state.selectedBooking,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  clearBookings: () => {
    set({ bookings: [], selectedBooking: null, error: null });
  },
}));
