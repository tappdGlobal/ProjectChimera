import { apiClient } from "../services/api";

/* ===================== TYPES ===================== */

export interface EventTicket {
  ticketLabel: string;
  ticketType: string;
  price: number;
  currency?: string;
  serviceChargePercentage: number;
  quantityTotal: number;
}

export interface CreateEventData {
  eventName: string;
  genre: string;
  category: string;
  eventDate: string;
  eventTime: string;
  location: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  country?: string;
  venue?: string;
  maxCapacity: number;
  ageLimit: string;
  allowance: string;
  allowAlcohol?: boolean;
  allowSmokingAreas?: boolean;
  description: string;
  images?: string[];
  tickets: EventTicket[];
}

export interface EventDraftData {
  name: string;
  genre: string;
  category: string;
  date: string;
  time: string;
  location: string;
  maxOccupancy: number;
  ageRestriction: string;
  genderAllowance: string;
  alcoholAllowed: boolean;
  smokingAllowed: boolean;
  description: string;
  photos: string[];
  tickets: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export interface Event {
  id: string;
  eventName: string;
  genre: string;
  category: string;
  eventDate: string;
  eventTime: string;
  location: string;
  maxCapacity: number;
  ageLimit: string;
  allowance: string;
  description: string;
  images?: string[];
  tickets: EventTicket[];
  hostId: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventCategory {
  name: string;
  count: number;
  color: string;
}

export interface NearbyEventsParams {
  lat: number;
  lng: number;
  radius?: number;
  category?: string;
}

export interface MapBounds {
  ne_lat: number;
  ne_lng: number;
  sw_lat: number;
  sw_lng: number;
}

/* ===================== API ===================== */

export const eventApi = {
  /* ================= CREATE EVENT ================= */
  createEvent: async (eventData: CreateEventData): Promise<Event> => {
    const response = await apiClient.post<any>("/events/create", eventData);
    return response.data;
  },

  /* ================= GET NEARBY EVENTS ================= */
  getNearbyEvents: async (params: NearbyEventsParams): Promise<Event[]> => {
    const { lat, lng, radius = 10, category } = params;
    const queryParams = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      ...(category && { category }),
    });

    const response = await apiClient.get<any>(
      `/events/nearby?${queryParams.toString()}`,
    );
    return response.data;
  },

  /* ================= GET MAP EVENTS ================= */
  getMapEvents: async (bounds: MapBounds, category?: string): Promise<any> => {
    const queryParams = new URLSearchParams({
      ne_lat: bounds.ne_lat.toString(),
      ne_lng: bounds.ne_lng.toString(),
      sw_lat: bounds.sw_lat.toString(),
      sw_lng: bounds.sw_lng.toString(),
      ...(category && { category }),
    });

    const response = await apiClient.get<any>(
      `/events/map?${queryParams.toString()}`,
    );
    return response.data; // Returns GeoJSON FeatureCollection
  },

  /* ================= GET EVENT CATEGORIES ================= */
  getEventCategories: async (): Promise<EventCategory[]> => {
    const response = await apiClient.get<any>("/events/categories");
    return response.data;
  },

  /* ================= GET EVENT LOCATION ================= */
  getEventLocation: async (eventId: string): Promise<any> => {
    const response = await apiClient.get<any>(`/events/${eventId}/location`);
    return response.data;
  },

  /* ================= DRAFT MANAGEMENT ================= */
  getDraftEvents: async (): Promise<any[]> => {
    const response = await apiClient.get<any>("/events/drafts");
    return response.data;
  },

  saveDraft: async (draftData: EventDraftData): Promise<any> => {
    const response = await apiClient.post<any>("/events/drafts", draftData);
    return response.data;
  },

  updateDraft: async (
    draftId: string,
    draftData: EventDraftData,
  ): Promise<any> => {
    const response = await apiClient.put<any>(
      `/events/drafts/${draftId}`,
      draftData,
    );
    return response.data;
  },

  deleteDraft: async (draftId: string): Promise<void> => {
    await apiClient.delete(`/events/drafts/${draftId}`);
  },

  publishDraft: async (draftId: string): Promise<Event> => {
    const response = await apiClient.post<any>(
      `/events/drafts/${draftId}/publish`,
    );
    return response.data;
  },

  /* ================= USER EVENTS ================= */
  getUserEvents: async (userId: string): Promise<Event[]> => {
    const response = await apiClient.get<any>(`/events/user/${userId}`);
    return response.data;
  },

  /* ================= UPDATE/DELETE EVENT ================= */
  updateEvent: async (
    eventId: string,
    eventData: Partial<CreateEventData>,
  ): Promise<Event> => {
    const response = await apiClient.put<any>(`/events/${eventId}`, eventData);
    return response.data;
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    await apiClient.delete(`/events/${eventId}`);
  },
};
