import { apiClient } from "../services/api";
import { Event, Ticket } from "../types/eventTypes";

/* ================= TYPES ================= */

// File object structure for React Native image uploads
export interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

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

  ageLimit: number; // 16, 18, 21, or 25

  allowance: "PUBLIC" | "PRIVATE";

  allowAlcohol: boolean;
  allowSmokingAreas: boolean;

  description: string;

  latitude?: number;
  longitude?: number;

  images: ImageFile[]; // multipart - React Native file format
  tickets: Ticket[];
}

// ✅ Draft = same payload, but all optional
export type DraftEventPayload = Partial<CreateEventPayload>;

/* ================= HELPERS ================= */

// 🔒 DO NOT TOUCH (used by publish & draft)
const buildEventFormData = (
  payload: Partial<CreateEventPayload>
): FormData => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "images") {
      const images = value as ImageFile[];
      
      images.forEach((file, index) => {
        formData.append("images", file as any);
      });
    } else if (key === "tickets") {
      const ticketsJson = JSON.stringify(value);
      formData.append("tickets", ticketsJson);
    } else if (typeof value === "boolean") {
      formData.append(key, value ? "true" : "false");
    } else {
      formData.append(key, String(value));
    }
  });

  const entries: Record<string, any> = {};
  formData.forEach((value, key) => {
    if (key === "images") {
      entries[key] = entries[key] || [];
      entries[key].push("[File object]");
    } else {
      entries[key] = value;
    }
  });

  return formData;
};

/* ================= CREATE EVENT (PUBLISH) ================= */

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

  getDraftEvents: async (): Promise<Event[]> => {
    const res = await apiClient.get("/events/drafts");


    return Array.isArray(res.data) ? res.data : [];
  },

  /* ================= PRIVATE EVENT PIN ================= */

  /* ================= PUBLIC EVENT PIN ================= */

  generatePublicEventPin: async (): Promise<{ message: string }> => {
    const res = await apiClient.post("/events/public/generate-pin");
    return res.data;
  },

  verifyPublicEventPin: async (
    pin: string
  ): Promise<{ message: string }> => {
    const res = await apiClient.post("/events/public/verify-pin", {
      pin,
    });
    return res.data;
  },

  /* ================= DRAFT EVENTS ================= */

  saveDraft: (
    payload: DraftEventPayload
  ): Promise<Event> => {
    const { images, ...jsonPayload } = payload;

    return apiClient.post("/events/drafts", jsonPayload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  updateDraft: (
    draftId: string,
    payload: DraftEventPayload
  ): Promise<Event> => {
    const { images, ...jsonPayload } = payload;

    return apiClient.put(`/events/drafts/${draftId}`, jsonPayload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
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