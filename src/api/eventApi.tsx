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
    // Skip only undefined and null, but keep false, 0, and empty strings
    if (value === undefined || value === null) return;

    if (key === "images") {
      const images = value as ImageFile[];
      if (images.length === 0) {
        console.warn("⚠️ No images provided in payload");
      }
      images.forEach((file, index) => {
        console.log(`📎 Appending image ${index}:`, file.name, file.type);
        formData.append("images", file as any);
      });
    } else if (key === "tickets") {
      const ticketsJson = JSON.stringify(value);
      console.log("🎟️ Tickets JSON:", ticketsJson);
      formData.append("tickets", ticketsJson);
    } else if (typeof value === "boolean") {
      // Explicitly convert booleans to strings
      formData.append(key, value ? "true" : "false");
    } else {
      formData.append(key, String(value));
    }
  });

  // Debug: Log all form data entries
  console.log("📋 FormData entries:");
  const entries: Record<string, any> = {};
  formData.forEach((value, key) => {
    if (key === "images") {
      entries[key] = entries[key] || [];
      entries[key].push("[File object]");
    } else {
      entries[key] = value;
    }
  });
  console.log(JSON.stringify(entries, null, 2));

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
