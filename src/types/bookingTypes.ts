/* ================= BOOKING STATUS ================= */

export type BookingStatus =
  | "RESERVED"
  | "BOOKED"
  | "CHECKED_IN"
  | "CANCELLED";

/* ================= CORE BOOKING ================= */

export interface Booking {
  id: string;

  userId: string;
  eventId: string;
  ticketId: string;

  status: BookingStatus;

  createdAt: string;
  updatedAt: string;

  // Optional relations (if populated from backend)
  event?: EventSummary;
  ticket?: TicketSummary;
}

/* ================= CREATE BOOKING ================= */

export interface CreateBookingRequest {
  eventId: string;
  ticketId: string;
}

export interface CreateBookingResponse {
  success: boolean;
  message: string;
  data: Booking;
}

/* ================= MY BOOKINGS QUERY ================= */

export interface GetMyBookingsQuery {
  status?: BookingStatus;
  upcoming?: boolean;
}

/* ================= CONFIRM BOOKING ================= */

export interface ConfirmBookingResponse {
  success: boolean;
  message: string;
  data: Booking;
}

/* ================= CHECK-IN ================= */

export interface CheckInRequest {
  latitude: number;
  longitude: number;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  data: Booking;
}

/* ================= CANCEL BOOKING ================= */

export interface CancelBookingResponse {
  success: boolean;
  message: string;
}

/* ================= OPTIONAL RELATED TYPES ================= */

/* ================= OPTIONAL RELATED TYPES ================= */

export interface EventSummary {
  id: string;

  eventName: string;
  eventDate: string;
  eventTime: string;

  venue: string;
  city: string;

  images?: string[];

  latitude?: number;
  longitude?: number;

  geoFenceRadius?: number;
}

export interface TicketSummary {
  id: string;
  name: string;
  price: number;
}