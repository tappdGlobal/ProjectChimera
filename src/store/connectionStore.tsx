import { create } from "zustand";
import { apiClient } from "../services/api";
import { ApiResponse, User } from "../types/authTypes";

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
}

export const useConnectionStore = create<ConnectionState>((set) => ({
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
}));
