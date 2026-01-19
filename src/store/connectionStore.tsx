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

/* ================= SEND REQUEST ================= */

export interface SendConnectionPayload {
  toUserId: string;
}

export const sendConnectionApi = (
  payload: SendConnectionPayload
): Promise<ApiResponse<null>> => {
  return apiClient.post("/connections/send", payload);
};

/* ================= RESPOND REQUEST ================= */

export type ConnectionAction = "ACCEPT" | "REJECT";

export interface RespondConnectionPayload {
  requestId: string;
  action: ConnectionAction;
}

export const respondConnectionApi = (
  payload: RespondConnectionPayload
): Promise<ApiResponse<null>> => {
  return apiClient.post("/connections/respond", payload);
};

/* ================= GET REQUESTS ================= */

export const getConnectionRequestsApi = (): Promise<
  ApiResponse<ConnectionRequest[]>
> => {
  return apiClient.get("/connections");
};

/* ================= GET ACCEPTED ================= */

export const getAcceptedConnectionsApi = (): Promise<
  ApiResponse<User[]>
> => {
  return apiClient.get("/connections/accepted");
};


interface ConnectionState {
  requests: ConnectionRequest[];
  connections: User[];
  loading: boolean;
  error: string | null;

  sendRequest: (data: SendConnectionPayload) => Promise<void>;
  respondRequest: (data: RespondConnectionPayload) => Promise<void>;
  fetchRequests: () => Promise<void>;
  fetchConnections: () => Promise<void>;
  clearConnections: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  requests: [],
  connections: [],
  loading: false,
  error: null,

  sendRequest: async (data) => {
    try {
      set({ loading: true, error: null });
      await sendConnectionApi(data);
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  respondRequest: async (data) => {
    try {
      set({ loading: true, error: null });
      await respondConnectionApi(data);

      // remove handled request locally
      set((state) => ({
        requests: state.requests.filter(
          (req) => req.id !== data.requestId
        ),
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchRequests: async () => {
    try {
      set({ loading: true, error: null });
      const res = await getConnectionRequestsApi();
      set({ requests: res.data ?? [], loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchConnections: async () => {
    try {
      set({ loading: true, error: null });
      const res = await getAcceptedConnectionsApi();
      set({ connections: res.data ?? [], loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  clearConnections: () => {
    set({ requests: [], connections: [], error: null });
  },
}));
