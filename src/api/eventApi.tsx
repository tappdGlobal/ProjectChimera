import { apiClient } from "../services/api";
import { ApiResponse } from "../types/authTypes";
import { Event } from "../types/eventTypes";

/* ================= CREATE EVENT ================= */

export interface Ticket {
  ticketLabel: string;
  ticketType: "FREE" | "PAID";
  price: number;
  currency: string;
  serviceChargePercentage: number;
  quantityTotal: number;
}

export interface CreateEventPayload {
  eventName: string;
  genre: string;
  category: string;
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

export const createEventApi = (
  payload: CreateEventPayload
): Promise<ApiResponse<Event>> => {
  return apiClient.post("/events/create", payload);
};

/* ================= GET EVENT CATEGORIES ================= */

export interface EventCategory {
  name: string;
  count: number;
  color: string;
}

export const getEventCategoriesApi = (): Promise<
  ApiResponse<{ categories: EventCategory[] }>
> => {
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
