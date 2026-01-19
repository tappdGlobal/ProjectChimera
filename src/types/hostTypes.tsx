import { BookingStatus } from "./bookingTypes";

export interface EventAnalytics {
  totalBookings: number;
  totalCheckedIn: number;
  totalCancelled: number;
  revenue?: number;
}

export interface Guest {
  bookingId: string;
  userId: string;
  name: string;
  email: string;
  status: BookingStatus;
  checkedIn: boolean;
}

export interface Attendance {
  totalGuests: number;
  checkedIn: number;
  insideVenue: number;
}
