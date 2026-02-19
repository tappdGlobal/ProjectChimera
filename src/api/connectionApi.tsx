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
    throw error;
  }
};

/* ================= GET ACCEPTED ================= */

export const getAcceptedConnectionsApi = async (): Promise<
  AcceptedConnectionUser[]
> => {
  try {
    const response = await apiClient.get("/connections");

    // 🔥 HANDLE BOTH POSSIBLE STRUCTURES
    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }

    return [];

  } catch (error: any) {
    return [];
  }
};


