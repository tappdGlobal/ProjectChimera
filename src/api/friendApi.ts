import { apiClient } from "../services/api";
import { ApiResponse } from "../types/authTypes";
import { Friend, FriendRequest, SendFriendRequestPayload, AcceptFriendRequestPayload } from "../types/friendTypes";

/* ================= GET FRIENDS LIST ================= */

export const getFriendsApi = (): Promise<ApiResponse<Friend[]>> => {
  return apiClient.get("/friends");
};

/* ================= GET FRIEND REQUESTS ================= */

export const getFriendRequestsApi = (): Promise<ApiResponse<FriendRequest[]>> => {
  return apiClient.get("/friends/requests");
};

/* ================= SEND FRIEND REQUEST ================= */

export const sendFriendRequestApi = (
  payload: SendFriendRequestPayload
): Promise<ApiResponse<FriendRequest>> => {
  return apiClient.post("/friends/request", payload);
};

/* ================= ACCEPT FRIEND REQUEST ================= */

export const acceptFriendRequestApi = (
  payload: AcceptFriendRequestPayload
): Promise<ApiResponse<Friend>> => {
  return apiClient.post("/friends/accept", payload);
};

/* ================= REJECT FRIEND REQUEST ================= */

export const rejectFriendRequestApi = (
  requestId: string
): Promise<ApiResponse<null>> => {
  return apiClient.post("/friends/reject", { requestId });
};

/* ================= BLOCK USER ================= */

export const blockUserApi = (
  userId: string
): Promise<ApiResponse<null>> => {
  return apiClient.post("/friends/block", { userId });
};

/* ================= UNBLOCK USER ================= */

export const unblockUserApi = (
  userId: string
): Promise<ApiResponse<null>> => {
  return apiClient.post("/friends/unblock", { userId });
};

/* ================= REMOVE FRIEND ================= */

export const removeFriendApi = (
  friendshipId: string
): Promise<ApiResponse<null>> => {
  return apiClient.delete(`/friends/${friendshipId}`);
};
