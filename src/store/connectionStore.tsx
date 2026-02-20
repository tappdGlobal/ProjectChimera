// src/store/connectionStore.ts

import { create } from "zustand";
import {
  getPendingRequestsApi,
  respondConnectionApi,
  getAcceptedConnectionsApi,
  unfriendConnectionApi,
} from "../api/connectionApi";

import {
  PendingConnectionUser,
  AcceptedConnectionUser,
  ConnectionAction,
  ConnectionIntent,
} from "../types/connectionTypes";

interface RespondResult {
  success: boolean;
  message: string;
}

interface ConnectionState {
  pendingRequests: PendingConnectionUser[];
  acceptedConnections: AcceptedConnectionUser[];
  loading: boolean;
  error: string | null;

  fetchPendingRequests: () => Promise<void>;
  fetchAcceptedConnections: () => Promise<void>;

  respondToRequest: (
    requestId: string,
    action: ConnectionAction,
    intent: ConnectionIntent[]
  ) => Promise<RespondResult>;

  unfriendConnection: (friendId: string) => Promise<RespondResult>;

  removeLocally: (requestId: string) => void;
}

export const useConnectionStore = create<ConnectionState>((set, get) => {

  return {
    pendingRequests: [],
    acceptedConnections: [],
    loading: false,
    error: null,

    // ================= FETCH PENDING =================
    fetchPendingRequests: async () => {

      try {
        set({ loading: true, error: null });

        const res = await getPendingRequestsApi();


        set({
          pendingRequests: Array.isArray(res) ? res : [],
          loading: false,
        });

      } catch (err: any) {

        set({
          loading: false,
          error:
            err?.response?.data?.message ||
            err?.message ||
            "Something went wrong",
        });
      }
    },

    // ================= FETCH ACCEPTED =================
    fetchAcceptedConnections: async () => {

      try {
        set({ loading: true });

        const res = await getAcceptedConnectionsApi();


        set({
          acceptedConnections: Array.isArray(res) ? res : [],
          loading: false,
        });
      } catch (error: any) {
        set({ loading: false });
      }
    },

    // ================= ACCEPT / REJECT =================
    respondToRequest: async (requestId, action, intent) => {
      try {
        const response = await respondConnectionApi({
          requestId,
          action,
          intent,
        });

        // Remove from pending list
        const updated = get().pendingRequests.filter(
          (user) => user.requestId !== requestId
        );

        set({ pendingRequests: updated });

        // 🔥 If accepted, refresh accepted list automatically
        if (action === "ACCEPT") {
          await get().fetchAcceptedConnections();
        }

        return {
          success: true,
          message: "Success",
        };
      } catch (error: any) {
        return {
          success: false,
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong",
        };
      }
    },

    // ================= UNFRIEND / REMOVE CONNECTION =================
    unfriendConnection: async (friendId) => {
      try {
        await unfriendConnectionApi(friendId);

        // Remove from accepted connections list
        const updated = get().acceptedConnections.filter(
          (connection) => connection.id !== friendId
        );

        set({ acceptedConnections: updated });

        return {
          success: true,
          message: "User has been unfriended successfully",
        };
      } catch (error: any) {
        return {
          success: false,
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Failed to unfriend user",
        };
      }
    },

    // ================= LOCAL REMOVE =================
    removeLocally: (requestId) => {

      const updated = get().pendingRequests.filter(
        (user) => user.requestId !== requestId
      );

      set({ pendingRequests: updated });
    },
  };
});
