// src/api/connectionApi.ts

import { apiClient } from "../services/api";
import {
  SendConnectionPayload,
  RespondConnectionPayload,
  PendingConnectionUser,
  AcceptedConnectionUser,
} from "../types/connectionTypes";
import { AxiosResponse } from "axios";
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
  await apiClient.put("/connections/respond", payload);
};

/* ================= GET PENDING ================= */

export const getPendingRequestsApi = async (): Promise<
  PendingConnectionUser[]
> => {
  try {
    const response: AxiosResponse<PendingConnectionUser[]> =
      await apiClient.get("/connections/pending");

    console.log("=== Pending Requests ARRAY ===");
    console.log(response.data);

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
  const response = await apiClient.get<AcceptedConnectionUser[]>(
    "/connections/my"
  );

  return response.data ?? [];
};
