export interface Ticket {
  ticketLabel: string;
  ticketType: "PAID" | "FREE";
  price: number;
  currency: string;               // ✅ flexible
  serviceChargePercentage: number;
  quantityTotal: number;
}

export interface Event {
  id?: string;                     // ✅ optional

  eventName: string;
  genre: string;
  category: string;

  eventDate: string;               // ISO string
  eventTime: string;

  location: string;
  address: string;
  city: string;
  country: string;
  venue: string;

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

  tickets: Ticket[];
}
