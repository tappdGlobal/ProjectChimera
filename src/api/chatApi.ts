import { apiClient } from "../services/api";
import { ApiResponse } from "../types/authTypes";
import { Conversation, Message, SendMessagePayload, MessagesResponse } from "../types/chatTypes";

/* ================= CREATE/GET CONVERSATION ================= */

export const createConversationApi = (
  otherUserId: string
): Promise<ApiResponse<{ id: string }>> => {
  return apiClient.post("/chat/conversation", { otherUserId });
};

/* ================= GET CONVERSATIONS ================= */

export const getConversationsApi = (): Promise<ApiResponse<Conversation[]>> => {
  return apiClient.get("/chat/conversations");
};

/* ================= GET MESSAGES WITH USER ================= */

export const getMessagesWithUserApi = (
  userId: string,
  page: number = 1,
  limit: number = 50
): Promise<ApiResponse<MessagesResponse>> => {
  return apiClient.get(`/chat/conversations/${userId}?page=${page}&limit=${limit}`);
};

/* ================= SEND MESSAGE ================= */

export const sendMessageApi = (
  payload: SendMessagePayload
): Promise<ApiResponse<Message>> => {
  return apiClient.post("/chat/messages", payload);
};

/* ================= MARK MESSAGES AS READ ================= */

export const markMessagesAsReadApi = (
  userId: string
): Promise<ApiResponse<null>> => {
  return apiClient.post(`/chat/conversations/${userId}/read`);
};
