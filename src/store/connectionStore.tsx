import { create } from "zustand";
import { apiClient } from "../services/api";
import { ApiResponse, User } from "../types/authTypes";
import { respondConnectionApi } from "../api/connectionApi";

/* ================= TYPES ================= */

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  fromUser: User;
  toUser: User;
  createdAt: string;
  updatedAt: string;
}

/* ================= API ================= */

export const getPendingRequestsApi = (): Promise<
  ApiResponse<ConnectionRequest[]>
> => {
  return apiClient.get("/api/v1/connections/pending");
};

/* ================= STORE ================= */

interface ConnectionState {
  pendingRequests: ConnectionRequest[];
  loading: boolean;
  error: string | null;
  fetchPendingRequests: () => Promise<void>;
  respondToRequest: (
    requestId: string,
    action: "ACCEPT" | "REJECT",
    _intent?: string[]
  ) => Promise<{ success: boolean; message?: string }>;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  pendingRequests: [],
  loading: false,
  error: null,

  fetchPendingRequests: async () => {
    try {
      set({ loading: true, error: null });

      const res = await getPendingRequestsApi();

      set({
        pendingRequests: res.data ?? [],
        loading: false,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || err.message,
      });
    }
  },

  respondToRequest: async (requestId, action, _intent) => {
    try {
      const res = await respondConnectionApi({ requestId, action });
      if (res?.success) {
        set((s) => ({
          pendingRequests: s.pendingRequests.filter((r) => r.id !== requestId),
        }));
        return { success: true };
      }
      return { success: false, message: res?.message };
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message;
      return { success: false, message };
    }
  },
}));
