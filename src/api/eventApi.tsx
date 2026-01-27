import { apiClient } from "../services/api";
import { Event, Ticket } from "../types/eventTypes";

/* ================= TYPES ================= */

export interface CreateEventPayload {
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

  ageLimit:
    | "SIXTEEN_PLUS"
    | "EIGHTEEN_PLUS"
    | "TWENTY_ONE_PLUS"
    | "TWENTY_FIVE_PLUS";

  allowance: "PUBLIC" | "PRIVATE";

  allowAlcohol: boolean;
  allowSmokingAreas: boolean;

  description: string;

  // optional geo
  latitude?: number;
  longitude?: number;

  // files
  images: File[];

  // frontend friendly
  tickets: Ticket[];
}

export type DraftEventPayload = Partial<CreateEventPayload>;

/* ================= HELPERS ================= */

const buildEventFormData = (
  payload: CreateEventPayload
): FormData => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "images") {
      (value as File[]).forEach((file) => {
        formData.append("images", file);
      });
    } else if (key === "tickets") {
      formData.append("tickets", JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
};

/* ================= CREATE EVENT ================= */

export const createEventApi = (
  payload: CreateEventPayload
): Promise<Event> => {
  const formData = buildEventFormData(payload);

  return apiClient.post("/events/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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
  createEvent: (payload: CreateEventPayload) =>
    createEventApi(payload),

  getCategories: () =>
    getEventCategoriesApi(),

  getDraftEvents: (): Promise<Event[]> => {
    return apiClient.get("/events/drafts");
  },

  saveDraft: (
    payload: DraftEventPayload
  ): Promise<Event> => {
    return apiClient.post("/events/drafts", payload);
  },

  updateDraft: (
    draftId: string,
    payload: DraftEventPayload
  ): Promise<Event> => {
    return apiClient.put(`/events/drafts/${draftId}`, payload);
  },

  deleteDraft: (
    draftId: string
  ): Promise<void> => {
    return apiClient.delete(`/events/drafts/${draftId}`);
  },

  publishDraft: (
    draftId: string
  ): Promise<Event> => {
    return apiClient.post(`/events/drafts/${draftId}/publish`);
  },
};
