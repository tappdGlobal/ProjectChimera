import { apiClient } from "../services/api";
import { Event, Ticket } from "../types/eventTypes";

/* ================= CREATE EVENT ================= */

export interface CreateEventPayload {
  eventName: string;
  genre: string;
  category: string;

  eventDate: string;     // ISO
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

export const createEventApi = (
  payload: CreateEventPayload
): Promise<Event> => {
  return apiClient.post("/events/create", payload);
};

/* ================= GET EVENT CATEGORIES ================= */

export interface EventCategory {
  name: string;
  count: number;
  color: string;
}

export const getEventCategoriesApi = (): Promise<{
  categories: EventCategory[];
}> => {
  return apiClient.get("/events/categories");
};
