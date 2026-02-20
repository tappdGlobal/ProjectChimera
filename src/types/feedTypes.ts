export interface FeedTicket {
  ticketLabel: string;
  ticketType: "Paid" | "Free";
  price?: number;
  currency?: string;

  serviceChargePercentage: number;
  serviceChargeAmount?: number;
  payoutAmount?: number;

  quantityTotal: number;
  quantitySold: number;
}

export interface FeedEvent {
  id: string;
  eventName: string;
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

  ageLimit:
    | "SIXTEEN_PLUS"
    | "EIGHTEEN_PLUS"
    | "TWENTY_ONE_PLUS"
    | "TWENTY_FIVE_PLUS";

  allowance: "PUBLIC" | "PRIVATE";

  allowAlcohol: boolean;
  allowSmokingAreas: boolean;

  description: string;

  images: string[];

  tickets: FeedTicket[];

  attendeeCount?: number;
  interestedCount?: number;
  isUserAttending?: boolean;
  isUserInterested?: boolean;
  createdAt?: string;
}

export interface FeedResponse {
  success: boolean;
  data: FeedEvent[];
  nextCursor?: string;
}