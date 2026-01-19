export type BookingStatus =
  | "RESERVED"
  | "BOOKED"
  | "CHECKED_IN"
  | "CANCELLED";

export interface Booking {
  id: string;
  eventId: string;
  ticketId: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}
