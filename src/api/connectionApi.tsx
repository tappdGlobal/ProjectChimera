// src/api/connectionApi.ts

import { apiClient } from "../services/api";
import {
  SendConnectionPayload,
  RespondConnectionPayload,
  PendingConnectionUser,
  AcceptedConnectionUser,
} from "../types/connectionTypes";
import { AxiosResponse } from "axios";

/* ================= COMMON API WRAPPER TYPE ================= */

interface ApiResponse<T> {
  status: number;
  message: string;
  success: boolean;
  data: T;
}

/* ================= SEND CONNECTION ================= */

export const sendConnectionApi = async (
  payload: SendConnectionPayload
): Promise<void> => {
  await apiClient.post("/connections/send", payload);
};

/* ================= RESPOND CONNECTION ================= */

export const respondConnectionApi = async (
  payload: RespondConnectionPayload
): Promise<void> => {
  await apiClient.post("/connections/respond", payload);
};

/* ================= GET PENDING ================= */

export const getPendingRequestsApi = async (): Promise<
  PendingConnectionUser[]
> => {
  try {
    const response: AxiosResponse<PendingConnectionUser[]> =
      await apiClient.get("/connections/pending");

    return response.data ?? [];


  } catch (error: any) {
    console.log("=== Pending Requests Error ===");
    console.log(error?.response?.data || error.message);
    throw error;
  }
};

/* ================= GET ACCEPTED ================= */

export const getAcceptedConnectionsApi = async (): Promise<
  AcceptedConnectionUser[]
> => {
  try {
    const response = await apiClient.get("/connections");

    console.log("🔥 FULL ACCEPTED RESPONSE:", response.data);

    // 🔥 HANDLE BOTH POSSIBLE STRUCTURES
    if (Array.isArray(response.data)) {
      console.log("📦 API returned direct array:", response.data.length);
      return response.data;
    }

    if (Array.isArray(response.data?.data)) {
      console.log("📦 API returned wrapped array:", response.data.data.length);
      return response.data.data;
    }

    console.log("⚠️ Unexpected response structure");
    return [];

  } catch (error: any) {
    console.log("❌ getAcceptedConnectionsApi ERROR:", error);
    return [];
  }
};


