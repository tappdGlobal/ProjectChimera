import { create } from "zustand";
import {
  getPendingRequestsApi,
  respondConnectionApi,
  getAcceptedConnectionsApi,
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

  removeLocally: (requestId: string) => void;
}

export const useConnectionStore = create<ConnectionState>((set, get) => {
  console.log("🧠 Connection Store Initialized");

  return {
    pendingRequests: [],
    acceptedConnections: [],
    loading: false,
    error: null,

    // ================= FETCH PENDING =================
    fetchPendingRequests: async () => {
      console.log("🚀 fetchPendingRequests CALLED");

      try {
        set({ loading: true, error: null });

        const res = await getPendingRequestsApi();

        console.log("📦 Pending RAW API Response:", res);
        console.log("📊 Pending Type:", typeof res);
        console.log("📊 Pending IsArray:", Array.isArray(res));

        set({
          pendingRequests: Array.isArray(res) ? res : [],
          loading: false,
        });

        console.log("✅ Pending Store Updated. Length:", res?.length ?? 0);
      } catch (err: any) {
        console.log("❌ fetchPendingRequests ERROR:", err?.response?.data || err.message);

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
      console.log("📥 fetchAcceptedConnections CALLED");

      try {
        set({ loading: true });

        const res = await getAcceptedConnectionsApi();

        console.log("📦 Accepted RAW API Response:", res);
        console.log("📊 Accepted Type:", typeof res);
        console.log("📊 Accepted IsArray:", Array.isArray(res));
        console.log("📊 Accepted Length:", res?.length);

        set({
          acceptedConnections: Array.isArray(res) ? res : [],
          loading: false,
        });

        console.log(
          "✅ Accepted Store Updated:",
          get().acceptedConnections.length
        );
      } catch (error: any) {
        console.log(
          "❌ fetchAcceptedConnections ERROR:",
          error?.response?.data || error.message
        );

        set({ loading: false });
      }
    },

    // ================= ACCEPT / REJECT =================
    respondToRequest: async (requestId, action, intent) => {
      console.log("📨 respondToRequest CALLED");
      console.log("➡️ RequestId:", requestId);
      console.log("➡️ Action:", action);
      console.log("➡️ Intent:", intent);

      try {
        const response = await respondConnectionApi({
          requestId,
          action,
          intent,
        });

        console.log("✅ Respond API Response:", response);

        // Remove from pending list
        const updated = get().pendingRequests.filter(
          (user) => user.requestId !== requestId
        );

        console.log("🧹 Removing from pending list. Before:", get().pendingRequests.length);
        console.log("🧹 After removal:", updated.length);

        set({ pendingRequests: updated });

        // If accepted, refresh accepted list automatically
        if (action === "ACCEPT") {
          console.log("🔄 ACCEPT detected. Refreshing accepted connections...");
          await get().fetchAcceptedConnections();
        }

        return {
          success: true,
          message: "Success",
        };
      } catch (error: any) {
        console.log(
          "❌ respondToRequest ERROR:",
          error?.response?.data || error.message
        );

        return {
          success: false,
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong",
        };
      }
    },

    // ================= LOCAL REMOVE =================
    removeLocally: (requestId) => {
      console.log("🧹 removeLocally CALLED");

      const updated = get().pendingRequests.filter(
        (user) => user.requestId !== requestId
      );

      console.log("🧹 Local Remove. Before:", get().pendingRequests.length);
      console.log("🧹 Local Remove. After:", updated.length);

      set({ pendingRequests: updated });
    },
  };
});
