import { apiClient } from "../services/api";

/* ===================== TYPES ===================== */

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: string;
  createdAt: string;
  user?: any; // User object
}

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: string;
  createdAt: string;
  fromUser?: any; // User object
}

/* ===================== API ===================== */

export const connectionApi = {
  /* ================= GET CONNECTIONS ================= */
  getConnections: async (userId: string): Promise<Connection[]> => {
    const response = await apiClient.get<any>(`/users/${userId}/connections`);
    return response.data;
  },

  /* ================= SEND CONNECTION REQUEST ================= */
  sendConnectionRequest: async (toUserId: string): Promise<ConnectionRequest> => {
    const response = await apiClient.post<any>(`/users/${toUserId}/connect`);
    return response.data;
  },

  /* ================= ACCEPT CONNECTION REQUEST ================= */
  acceptConnectionRequest: async (requestId: string): Promise<ConnectionRequest> => {
    const response = await apiClient.post<any>(
      `/users/requests/${requestId}/accept`
    );
    return response.data;
  },

  /* ================= REJECT CONNECTION REQUEST ================= */
  rejectConnectionRequest: async (requestId: string): Promise<ConnectionRequest> => {
    const response = await apiClient.post<any>(
      `/users/requests/${requestId}/reject`
    );
    return response.data;
  },

  /* ================= GET PENDING REQUESTS ================= */
  getPendingConnectionRequests: async (userId: string): Promise<ConnectionRequest[]> => {
    const response = await apiClient.get<any>(
      `/users/${userId}/requests/pending`
    );
    return response.data;
  },

  /* ================= REMOVE CONNECTION ================= */
  removeConnection: async (connectionId: string): Promise<void> => {
    await apiClient.delete(`/connections/${connectionId}`);
  },
};
