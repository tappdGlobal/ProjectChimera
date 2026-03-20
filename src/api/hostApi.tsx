import { apiClient } from "../services/api";
import { ApiResponse } from "../types/authTypes";
import { EventAnalytics, Guest, Attendance, HostEvent } from "../types/hostTypes";

/* ================= HOST EVENTS LIST ================= */

export const getHostEventsApi = async (): Promise<ApiResponse<HostEvent[]>> => {
  
  const response = await apiClient.get('/host/events');
  return response;
};

/* ================= EVENT ANALYTICS ================= */

export const getEventAnalyticsApi = (
  eventId: string
): Promise<ApiResponse<EventAnalytics>> => {
  return apiClient.get(`/host/events/${eventId}/analytics`);
};

/* ================= GUEST LIST ================= */

export interface GuestListParams {
  status?: string;
  checkedIn?: boolean;
}

export const getEventGuestsApi = (
  eventId: string,
  params?: GuestListParams
): Promise<ApiResponse<Guest[]>> => {
  return apiClient.get(`/host/events/${eventId}/guests`, { params });
};

/* ================= ATTENDANCE ================= */

export const getEventAttendanceApi = (
  eventId: string
): Promise<ApiResponse<Attendance>> => {
  return apiClient.get(`/host/events/${eventId}/attendance`);
};

/* ================= ENTRY GATES ================= */

export const closeEntryApi = (
  eventId: string
): Promise<ApiResponse<null>> => {
  return apiClient.post(`/host/events/${eventId}/close-entry`);
};

export const openEntryApi = (
  eventId: string
): Promise<ApiResponse<null>> => {
  return apiClient.post(`/host/events/${eventId}/open-entry`);
};

/* ================= MANUAL SCAN ================= */

export interface ManualScanPayload {
  bookingId: string;
}

export const manualScanApi = (
  eventId: string,
  payload: ManualScanPayload
): Promise<ApiResponse<null>> => {
  return apiClient.post(`/host/events/${eventId}/scan`, payload);
};
