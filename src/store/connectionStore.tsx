// src/store/connectionStore.ts

import { create } from "zustand";
import {
  getPendingRequestsApi,
  respondConnectionApi,
} from "../api/connectionApi";
import { PendingConnectionUser } from "../types/connectionTypes";

interface ConnectionState {
  pendingRequests: PendingConnectionUser[];
  loading: boolean;
  error: string | null;

  fetchPendingRequests: () => Promise<void>;
  respondToRequest: (
    requestId: string,
    action: "ACCEPT" | "REJECT"
  ) => Promise<void>;
}

export const useConnectionStore = create<ConnectionState>((set, get) => {
  console.log("🧠 Connection Store Initialized");

  return {
    pendingRequests: [],
    loading: false,
    error: null,

    // ================= FETCH PENDING =================
    fetchPendingRequests: async () => {
      console.log("🚀 fetchPendingRequests CALLED");

      try {
        set({ loading: true, error: null });

        const data = await getPendingRequestsApi();

        console.log("📦 API Returned:", data);
        console.log("📦 Is Array?", Array.isArray(data));

        set({
          pendingRequests: Array.isArray(data) ? data : [],
          loading: false,
        });

        console.log(
          "✅ Store Updated. New Length:",
          Array.isArray(data) ? data.length : 0
        );

      } catch (err: any) {
        console.log("❌ fetchPendingRequests ERROR:", err);

        set({
          loading: false,
          error:
            err?.response?.data?.message ||
            err?.message ||
            "Something went wrong",
        });
      }
    },

    // ================= ACCEPT / REJECT =================
    respondToRequest: async (requestId, action) => {
      console.log("📨 respondToRequest CALLED");
      console.log("➡️ RequestId:", requestId);
      console.log("➡️ Action:", action);

      try {
        const res = await respondConnectionApi({ requestId, action });

        console.log("✅ API Respond Success:", res);

        const current = get().pendingRequests;
        console.log("📦 Current Store Before Remove:", current);

        const updated = current.filter(
          (user) => user.requestId !== requestId
        );

        set({ pendingRequests: updated });

        console.log("✅ Store Updated After Remove:", updated);

      } catch (error) {
        console.log("❌ respondToRequest ERROR:", error);
      }
    },
  };
});
