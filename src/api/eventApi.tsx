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

  latitude?: number;
  longitude?: number;

  images: File[]; // multipart
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
      (value as File[]).forEach((file) => {
        formData.append("images", file as any);
      });
    } else if (key === "tickets") {
      formData.append("tickets", JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
};

/* ================= CREATE EVENT (PUBLISH) ================= */

// ❌ UNCHANGED
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
  // ❌ UNCHANGED
  createEvent: (payload: CreateEventPayload) =>
    createEventApi(payload),

  getCategories: () =>
    getEventCategoriesApi(),

  // ✅ FIXED: unwrap backend response → always return array
  getDraftEvents: async (): Promise<Event[]> => {
    const res = await apiClient.get("/events/drafts");

    console.log(
      "📦 getDraftEvents API raw response:",
      JSON.stringify(res.data, null, 2)
    );

    // 🔑 BACKEND RETURNS ARRAY DIRECTLY
    return Array.isArray(res.data) ? res.data : [];
  },


  // ✅ Draft create (multipart, no required fields)
  saveDraft: (
    payload: DraftEventPayload
  ): Promise<Event> => {
    const formData = buildEventFormData(payload);

    return apiClient.post("/events/drafts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // ✅ Draft update (multipart)
  updateDraft: (
    draftId: string,
    payload: DraftEventPayload
  ): Promise<Event> => {
    const formData = buildEventFormData(payload);

    return apiClient.put(`/events/drafts/${draftId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
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
