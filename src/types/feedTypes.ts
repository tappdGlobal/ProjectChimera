/* ================= TICKET ================= */

export interface FeedTicket {
  id: string; 

  ticketLabel: string;

  // Backend returns: "PAID" | "FREE"
  ticketType: "PAID" | "FREE";

  price?: number;
  currency?: string;

  serviceChargePercentage: number;
  serviceChargeAmount?: number;
  payoutAmount?: number;

  quantityTotal: number;
  quantitySold: number;
}

/* ================= EVENT ================= */

export interface FeedEvent {
  id: string;

  eventName: string;
  description: string;

  genre: string;
  category: string;

  eventType: "public" | "private";

  eventDate: string;
  eventTime: string;

  location: string;
  address: string;
  city: string;
  country: string;
  venue: string;

  latitude?: number | null;
  longitude?: number | null;

  maxCapacity: number;

  genderAllowance?: "ALL" | "MALE" | "FEMALE";

  ageLimit:
    | "SIXTEEN_PLUS"
    | "EIGHTEEN_PLUS"
    | "TWENTY_ONE_PLUS"
    | "TWENTY_FIVE_PLUS";

  allowance: "PUBLIC" | "PRIVATE";

  allowAlcohol: boolean;
  allowSmokingAreas: boolean;

  images: string[];

  tickets: FeedTicket[];

  attendeeCount?: number;
  interestedCount?: number;
  isUserAttending?: boolean;
  isUserInterested?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

/* ================= RESPONSE ================= */

export interface FeedResponse {
  success: boolean;
  data: FeedEvent[];
  nextCursor?: string;
}