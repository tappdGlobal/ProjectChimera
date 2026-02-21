import { apiClient } from "../services/api";
import { ApiResponse } from "../types/authTypes";
import {
  Conversation,
  Message,
  SendMessagePayload,
  CreateConversationPayload,
  CreateConversationResponse,
  ChatListItem,
} from "../types/chatTypes";

/* ============================================================
   CHAT APIs (as per API documentation)
   ============================================================ */

/**
 * POST /chat/conversation
 * Create a new conversation or retrieve existing between two users
 * Request Body: { otherUserId: string }
 * Response: 200 - Conversation created or retrieved successfully
 */
export const createConversationApi = (
  payload: CreateConversationPayload
): Promise<ApiResponse<CreateConversationResponse>> => {
  return apiClient.post("/chat/conversation", payload);
};

/**
 * GET /chat/messages/{conversationId}
 * Get all messages for a conversation
 * Path Parameter: conversationId (string, required)
 * Response: 200 - Messages retrieved successfully
 */
export const getMessagesApi = (
  conversationId: string
): Promise<ApiResponse<Message[]>> => {
  return apiClient.get(`/chat/messages/${conversationId}`);
};

/**
 * POST /chat/messages
 * Send a message in a conversation
 * Request Body: { conversationId: string, content: string }
 * Response: 201 - Message sent
 */
export const sendMessageApi = (
  payload: SendMessagePayload
): Promise<ApiResponse<Message>> => {
  return apiClient.post("/chat/messages", payload);
};

/**
 * GET /chat/list
 * Get chat list with conversations and last message preview
 * Response: 200 - Chat list fetched with conversations sorted by most recent
 */
export const getChatListApi = (): Promise<ApiResponse<ChatListItem[]>> => {
  return apiClient.get("/chat/list");
};

/* ============================================================
   LEGACY APIs (for backward compatibility)
   ============================================================ */

/* ================= GET CONVERSATIONS ================= */

export const getConversationsApi = (): Promise<ApiResponse<Conversation[]>> => {
  return apiClient.get("/chat/conversations");
};

/* ================= GET MESSAGES WITH USER (Uses new API) ================= */

export const getMessagesWithUserApi = (
  conversationId: string
): Promise<ApiResponse<Message[]>> => {
  return apiClient.get(`/chat/messages/${conversationId}`);
};

/* ================= SEND MESSAGE (Legacy) ================= */

export const sendMessageLegacyApi = (
  payload: { receiverId: string; content: string; messageType: string }
): Promise<ApiResponse<Message>> => {
  return apiClient.post("/chat/messages", payload);
};

/* ================= MARK MESSAGES AS READ ================= */

export const markMessagesAsReadApi = (
  userId: string
): Promise<ApiResponse<null>> => {
  return apiClient.post(`/chat/conversations/${userId}/read`);
};
