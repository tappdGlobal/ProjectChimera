import { apiClient } from "../services/api";
import { ApiResponse } from "../types/authTypes";
import { NearbyAttendee, InterestMatch } from "../types/socialTypes";

/* ================= NEARBY ATTENDEES ================= */

export interface NearbyAttendeesParams {
  eventId: string;
  radius?: number; // default 0.5 km
}

export const getNearbyAttendeesApi = (
  params: NearbyAttendeesParams
): Promise<ApiResponse<NearbyAttendee[]>> => {
  return apiClient.get("/social/nearby-attendees", { params });
};

/* ================= EVENT ATTENDEES ================= */

export const getEventAttendeesApi = (
  eventId: string
): Promise<ApiResponse<NearbyAttendee[]>> => {
  return apiClient.get(`/social/event/${eventId}/attendees`);
};

/* ================= MATCH BY INTERESTS ================= */

export interface MatchByInterestsParams {
  eventId: string;
}

export const matchByInterestsApi = (
  params: MatchByInterestsParams
): Promise<ApiResponse<InterestMatch[]>> => {
  return apiClient.get("/social/match-by-interests", { params });
};

/* ================= LOCATION VISIBILITY ================= */

export interface UpdateLocationVisibilityPayload {
  isVisible: boolean;
}

export const updateLocationVisibilityApi = (
  payload: UpdateLocationVisibilityPayload
): Promise<ApiResponse<null>> => {
  return apiClient.patch("/social/location-visibility", payload);
};
