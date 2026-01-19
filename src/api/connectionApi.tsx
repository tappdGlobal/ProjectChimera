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
