/* ================= TICKETS ================= */

export interface Ticket {
  ticketLabel: string;
  ticketType: "PAID" | "FREE";

  // only for PAID
  price?: number;
  currency?: string;

  serviceChargePercentage: number;
  quantityTotal: number;
}

/* ================= EVENT ================= */

export interface Event {
  _id: string; // Mongo ID (required)

  eventName: string;
  genre: string;
  category: string;
  eventType: "public" | "private";

  eventDate: string; // ISO
  eventTime: string;

  location: string;
  address: string;
  city: string;
  country: string;
  venue: string;

  maxCapacity: number;

  ageLimit: number; // 16, 18, 21, or 25

  allowance: "PUBLIC" | "PRIVATE";

  allowAlcohol: boolean;
  allowSmokingAreas: boolean;

  description: string;

  // optional geo
  latitude?: number;
  longitude?: number;

  // image URLs returned by backend
  images: string[];

  tickets: Ticket[];

  // public event verification
  pinVerified?: boolean;

  // timestamps (backend adds these)
  createdAt?: string;
  updatedAt?: string;
}

/* ================= PUBLIC PIN API ================= */

export interface PublicPinResponse {
  message: string;
}

export interface VerifyPinPayload {
  pin: string;
}

/* ================= DRAFT EVENT ================= */

export type DraftEvent = Partial<Event> & {
  _id: string;
};