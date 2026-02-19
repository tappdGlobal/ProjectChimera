import { create } from "zustand";
import {
  // New APIs
  createConversationApi,
  getMessagesApi,
  sendMessageApi,
  // Legacy APIs
  getConversationsApi,
  getMessagesWithUserApi,
  markMessagesAsReadApi,
} from "../api/chatApi";
import {
  // New types
  Conversation,
  Message,
  SendMessagePayload,
  CreateConversationPayload,
  // Legacy types
  ConversationListItem,
  LegacyMessage,
  LegacySendMessagePayload,
} from "../types/chatTypes";
import { socketService } from "../services/socket";

interface ChatState {
  conversations: ConversationListItem[];
  messages: Record<string, LegacyMessage[]>; // userId -> messages (legacy format)
  currentChatUserId: string | null;
  currentConversationId: string | null;
  loading: boolean;
  sendingMessage: boolean;
  error: string | null;

  // New API methods
  createOrGetConversation: (payload: CreateConversationPayload) => Promise<string | null>;
  getMessages: (conversationId: string) => Promise<void>;
  sendMessageNew: (payload: SendMessagePayload) => Promise<Message | null>;

  // Legacy methods
  getConversations: () => Promise<void>;
  getMessagesWithUser: (userId: string, page?: number) => Promise<void>;
  sendMessage: (payload: LegacySendMessagePayload, currentUserId?: string) => Promise<LegacyMessage | null>;
  markAsRead: (userId: string) => Promise<void>;
  receiveMessage: (message: LegacyMessage) => void;
  setCurrentChatUser: (userId: string | null) => void;
  clearChatData: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  currentChatUserId: null,
  currentConversationId: null,
  loading: false,
  sendingMessage: false,
  error: null,

  createOrGetConversation: async (payload: CreateConversationPayload) => {
    try {
      set({ loading: true, error: null });
      console.log("[ChatStore] Creating conversation with payload:", payload);

      // Try to create conversation via API
      let conversationId: string | null = null;
      
      try {
        const res = await createConversationApi(payload);
        console.log("[ChatStore] Create conversation response:", res);

        // Handle different response structures
        const responseData = (res as any).data || res;
        conversationId = responseData?.id || responseData;
      } catch (apiErr: any) {
        console.warn("[ChatStore] API call failed, using fallback:", apiErr.response?.status, apiErr.response?.data);
        
        // Fallback: Generate a conversation ID based on user IDs
        // This allows the chat to work even if the backend API is not ready
        const { userId } = await import("../store/authStore").then(m => m.useAuthStore.getState());
        if (userId) {
          // Create a deterministic conversation ID
          const ids = [userId, payload.otherUserId].sort();
          conversationId = `conv_${ids[0]}_${ids[1]}`;
          console.log("[ChatStore] Using fallback conversation ID:", conversationId);
        }
      }

      if (!conversationId) {
        throw new Error("Failed to create or get conversation ID");
      }

      console.log("[ChatStore] Conversation ID:", conversationId);
      set({ currentConversationId: conversationId, loading: false });

      // Join conversation room after creating/getting it (non-blocking)
      try {
        socketService.joinConversation(conversationId);
      } catch (socketErr) {
        console.warn("[ChatStore] Failed to join conversation room (non-critical):", socketErr);
      }

      return conversationId;
    } catch (err: any) {
      console.error("[ChatStore] Create conversation error:", err);
      set({ loading: false, error: err.message || "Failed to create conversation" });
      return null;
    }
  },

  getMessages: async (conversationId: string) => {
    try {
      set({ loading: true, error: null });
      const res = await getMessagesApi(conversationId);
      
      // Handle different response structures
      const responseData = (res as any).data || res;
      
      // The API might return { messages: [...] } or directly [...]
      const messagesData = Array.isArray(responseData) 
        ? responseData 
        : responseData?.messages || [];

      console.log("[ChatStore] Fetched messages:", messagesData.length);

      // Convert new API format to legacy format
      const legacyMessages: LegacyMessage[] = Array.isArray(messagesData)
        ? messagesData.map((msg: any) => ({
            id: msg.id,
            senderId: msg.sender?.id || msg.senderId,
            receiverId: "", // Will be determined from context
            content: msg.content,
            messageType: "text",
            delivered: true,
            seen: msg.isRead,
            createdAt: msg.createdAt,
          }))
        : [];

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: legacyMessages,
        },
        loading: false,
      }));
    } catch (err: any) {
      console.error("Get messages error:", err);
      set({ loading: false, error: err.message || "Failed to fetch messages" });
    }
  },

  sendMessageNew: async (payload: SendMessagePayload) => {
    try {
      set({ sendingMessage: true, error: null });

      const res = await sendMessageApi(payload);
      const messageData = (res as any).data || res;

      // Convert new API format to legacy format
      const legacyMessage: LegacyMessage = {
        id: messageData.id,
        senderId: messageData.sender?.id || "",
        receiverId: "", // Will be determined from context
        content: messageData.content,
        messageType: "text",
        delivered: true,
        seen: messageData.isRead,
        createdAt: messageData.createdAt,
      };

      // Add message to local state
      set((state) => ({
        messages: {
          ...state.messages,
          [payload.conversationId]: [
            ...(state.messages[payload.conversationId] || []),
            legacyMessage,
          ],
        },
        sendingMessage: false,
      }));

      return messageData;
    } catch (err: any) {
      console.error("Send message error:", err);
      set({ sendingMessage: false, error: err.message || "Failed to send message" });
      return null;
    }
  },

  getConversations: async () => {
    // DISABLED: Backend endpoint /chat/conversations does not exist
    // Returning empty conversations list
    set({ conversations: [], loading: false });
  },

  getMessagesWithUser: async (userId: string) => {
    // DISABLED: Backend endpoint GET /chat/messages/{conversationId} may not be fully implemented
    // Messages will be loaded via socket instead
    set({ loading: false });
  },

  sendMessage: async (payload: LegacySendMessagePayload, currentUserId?: string) => {
    try {
      set({ sendingMessage: true, error: null });

      // Try to use socket first (most reliable)
      const { socketService } = await import("../services/socket");
      
      // Get current conversation ID
      const { currentConversationId } = get();
      
      // Get current user ID - use passed value or fallback to auth store
      let senderId = currentUserId;
      if (!senderId) {
        const { useAuthStore } = await import("../store/authStore");
        senderId = useAuthStore.getState().userId || "";
      }
      
      // Ensure senderId is never empty
      if (!senderId) {
        console.error("[ChatStore] Cannot send message: senderId is empty");
        set({ sendingMessage: false, error: "User not authenticated" });
        return null;
      }
      
      if (socketService.isConnected() && currentConversationId) {
        // Send via socket using new format
        socketService.sendMessage(currentConversationId, payload.content);

        // Create optimistic message for UI
        console.log(`[ChatStore] Creating optimistic message with senderId: ${senderId}`);
        const optimisticMessage: LegacyMessage = {
          id: `temp-${Date.now()}`,
          senderId: senderId, // Set current user as sender
          receiverId: payload.receiverId,
          content: payload.content,
          messageType: payload.messageType,
          delivered: false,
          seen: false,
          createdAt: new Date().toISOString(),
        };

        // Add optimistic message to local state using conversationId as key
        set((state) => ({
          messages: {
            ...state.messages,
            [currentConversationId]: [
              ...(state.messages[currentConversationId] || []),
              optimisticMessage,
            ],
          },
          sendingMessage: false,
        }));

        // Refresh conversations disabled - backend endpoint not available
        // get().getConversations();
        
        return optimisticMessage;
      }

      // Fallback: Try REST API with new format if we have conversationId
      if (currentConversationId) {
        try {
          const { sendMessageApi } = await import("../api/chatApi");
          const res = await sendMessageApi({
            conversationId: currentConversationId,
            content: payload.content,
          });
          const messageData = (res as any).data || res;

          // Convert to legacy format - use senderId from API response or fallback to current user
          const legacyMessage: LegacyMessage = {
            id: messageData.id,
            senderId: messageData.sender?.id || senderId,
            receiverId: payload.receiverId,
            content: messageData.content,
            messageType: payload.messageType,
            delivered: true,
            seen: messageData.isRead || false,
            createdAt: messageData.createdAt,
          };

          set((state) => ({
            messages: {
              ...state.messages,
              [currentConversationId]: [
                ...(state.messages[currentConversationId] || []),
                legacyMessage,
              ],
            },
            sendingMessage: false,
          }));

          // get().getConversations(); // Disabled - backend endpoint not available
          return legacyMessage;
        } catch (apiErr) {
          console.warn("REST API failed, message may not be delivered:", apiErr);
        }
      }

      set({ sendingMessage: false, error: "Failed to send message. Please check your connection." });
      return null;
    } catch (err: any) {
      console.error("Send message error:", err);
      set({ sendingMessage: false, error: err.message || "Failed to send message" });
      return null;
    }
  },

  markAsRead: async (userId: string) => {
    // DISABLED: Backend endpoint POST /chat/conversations/{userId}/read does not exist
    // Updating local state only
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.otherUser.id === userId
          ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, seen: true } }
          : conv
      ),
    }));

    // Update messages to mark as seen
    set((state) => ({
      messages: {
        ...state.messages,
        [userId]: (state.messages[userId] || []).map((msg: any) =>
          msg.senderId !== userId ? msg : { ...msg, seen: true }
        ),
      },
    }));
  },

  receiveMessage: (message: LegacyMessage) => {
    // Add message to local state when received via socket
    // Use currentConversationId if available, otherwise fall back to senderId
    const state = get();
    const messageKey = state.currentConversationId || message.senderId;

    set((state) => ({
      messages: {
        ...state.messages,
        [messageKey]: [
          ...(state.messages[messageKey] || []),
          message as any,
        ],
      },
    }));

    // Refresh conversations disabled - backend endpoint not available
    // get().getConversations();
  },

  setCurrentChatUser: (userId: string | null) => {
    set({ currentChatUserId: userId });
    
    if (userId) {
      // Mark messages as read disabled - backend endpoint not available
      // get().markAsRead(userId);
    }
  },

  clearChatData: () => {
    set({
      conversations: [],
      messages: {},
      currentChatUserId: null,
      currentConversationId: null,
      error: null,
    });
  },
}));
