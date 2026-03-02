import { BookingStatus } from "./bookingTypes";

export interface HostEvent {
  id: string;
  eventName: string;
  category: string;
  eventType: string;
  eventDatetime: string;
  location: string;
  maxCapacity: number;
  entryOpen: boolean;
  bookedCount: number;
  checkedInCount: number;
}

export interface EventAnalytics {
  eventStats: {
    totalPeopleRegistered: number;
    totalCheckedIn: number;
    maxCapacity: number;
  };
  earnings: {
    totalEarnings: number;
    tappdServiceCharge: number;
    netEarnings: number;
  };
  performance: {
    occupancyRate: number;
    revenuePerAttendee: number;
    connectionRate: number;
  };
  engagement: {
    connectionsMade: number;
    activeConnectors: number;
    avgConnectionsPerUser: number;
  };
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
