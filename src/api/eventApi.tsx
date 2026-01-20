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

/* ================= EVENT API OBJECT ================= */

export const eventApi = {
  createEvent: (payload: CreateEventPayload) => createEventApi(payload),
  getCategories: () => getEventCategoriesApi(),
  getDraftEvents: (): Promise<any> => {
    return apiClient.get("/events/drafts");
  },
  saveDraft: (payload: any): Promise<any> => {
    return apiClient.post("/events/drafts", payload);
  },
  updateDraft: (draftId: string, payload: any): Promise<any> => {
    return apiClient.put(`/events/drafts/${draftId}`, payload);
  },
  deleteDraft: (draftId: string): Promise<any> => {
    return apiClient.delete(`/events/drafts/${draftId}`);
  },
  publishDraft: (draftId: string): Promise<any> => {
    return apiClient.post(`/events/drafts/${draftId}/publish`);
  },
};
