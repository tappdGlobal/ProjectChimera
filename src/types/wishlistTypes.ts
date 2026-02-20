/* ================= TICKET TYPE ================= */

export interface Ticket {
  ticketLabel: string;
  ticketType: string;
  price: number;
  currency: string;
  serviceChargePercentage: number;
  serviceChargeAmount: number;
  payoutAmount: number;
  quantityTotal: number;
  quantitySold: number;
}

/* ================= EVENT TYPE ================= */

export interface WishlistEvent {
  id: string;
  eventName: string;
  genre: string;
  category: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  location: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
  venue: string;
  maxCapacity: number;
  ageLimit: string;
  allowance: string;
  allowAlcohol: boolean;
  allowSmokingAreas: boolean;
  description: string;
  images: string[];
  tickets: Ticket[];
}

/* ================= STATUS RESPONSE ================= */

export interface WishlistStatusResponse {
  isWishlisted: boolean;
}

/* ================= PAGINATED RESPONSE ================= */

export interface PaginatedWishlistResponse {
  statusCode: number;
  message: string;
  success: boolean;
  data: WishlistEvent[];
}