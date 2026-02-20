import { create } from "zustand";
import {
  // New APIs
  createConversationApi,
  getMessagesApi,
  sendMessageApi,
  getChatListApi,
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
  ChatListItem,
  // Legacy types
  ConversationListItem,
  LegacyMessage,
  LegacySendMessagePayload,
} from "../types/chatTypes";
import { socketService } from "../services/socket";

interface ChatState {
  conversations: ConversationListItem[];
  chatList: ChatListItem[]; // New: chat list from /api/v1/chat/list
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
  getChatList: () => Promise<void>; // New: fetch chat list

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
  chatList: [],
  messages: {},
  currentChatUserId: null,
  currentConversationId: null,
  loading: false,
  sendingMessage: false,
  error: null,

  getChatList: async () => {
    try {
      set({ loading: true, error: null });
      const res = await getChatListApi();
      
      // Handle different response structures
      const chatListData = (res as any).data || res;
      
      console.log("[ChatStore] Fetched chat list:", chatListData?.length || 0);
      
      set({ chatList: chatListData || [], loading: false });
    } catch (err: any) {
      console.error("[ChatStore] Get chat list error:", err);
      set({ loading: false, error: err.message || "Failed to fetch chat list" });
    }
  },

  createOrGetConversation: async (payload: CreateConversationPayload) => {
    try {
      set({ loading: true, error: null });
      console.log("[ChatStore] Creating conversation with payload:", payload);

      // Create conversation via API - must succeed for chat to work
      const res = await createConversationApi(payload);
      console.log("[ChatStore] Create conversation response:", res);

      // Handle different response structures
      const responseData = (res as any).data || res;
      const conversationId = responseData?.id || responseData;

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
    try {
      set({ loading: true, error: null });
      const res = await getConversationsApi();
      
      // Handle different response structures
      const conversationsData = (res as any).data || res;
      
      console.log("[ChatStore] Fetched conversations:", conversationsData?.length || 0);
      
      // Transform backend format to frontend format if needed
      const formattedConversations: ConversationListItem[] = Array.isArray(conversationsData)
        ? conversationsData.map((conv: any) => ({
            id: conv.id,
            otherUser: conv.otherUser || {
              id: conv.user2?.id || conv.user1?.id,
              name: conv.user2?.name || conv.user1?.name,
              username: conv.user2?.username || conv.user1?.username,
              profilePicUrl: conv.user2?.profilePicUrl || conv.user1?.profilePicUrl,
            },
            lastMessage: conv.lastMessage || {
              content: "",
              createdAt: conv.createdAt || new Date().toISOString(),
              senderId: "",
              seen: true,
            },
            unreadCount: conv.unreadCount || 0,
          }))
        : [];
      
      set({ conversations: formattedConversations, loading: false });
    } catch (err: any) {
      console.error("[ChatStore] Get conversations error:", err);
      set({ loading: false, error: err.message || "Failed to fetch conversations" });
      // Don't clear existing conversations on error
    }
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
    // Use conversationId from message (if provided by backend), 
    // otherwise fall back to currentConversationId or senderId
    const state = get();
    const messageKey = message.conversationId || state.currentConversationId || message.senderId;

    console.log("[ChatStore] Receiving message:", {
      messageId: message.id,
      senderId: message.senderId,
      conversationId: message.conversationId,
      currentConversationId: state.currentConversationId,
      messageKey,
    });

    set((state) => {
      const existingMessages = state.messages[messageKey] || [];
      
      // Check if this is a confirmation of an optimistic message
      // Replace optimistic message if content and sender match within 10 seconds
      const isOptimisticMatch = existingMessages.some(
        (m) => m.id?.startsWith('temp-') && 
               m.senderId === message.senderId && 
               m.content === message.content &&
               Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 10000
      );
      
      if (isOptimisticMatch) {
        // Replace the optimistic message with the real one
        console.log("[ChatStore] Replacing optimistic message with:", message.id);
        return {
          messages: {
            ...state.messages,
            [messageKey]: existingMessages.map((m) =>
              m.id?.startsWith('temp-') && 
              m.senderId === message.senderId && 
              m.content === message.content
                ? { ...message, conversationId: message.conversationId || messageKey }
                : m
            ),
          },
        };
      }
      
      // Check for exact duplicate by ID
      const isDuplicate = existingMessages.some((m) => m.id === message.id);
      if (isDuplicate) {
        console.log("[ChatStore] Duplicate message ignored:", message.id);
        return state;
      }
      
      // Add new message
      return {
        messages: {
          ...state.messages,
          [messageKey]: [...existingMessages, { ...message, conversationId: message.conversationId || messageKey }],
        },
      };
    });

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
      chatList: [],
      messages: {},
      currentChatUserId: null,
      currentConversationId: null,
      error: null,
    });
  },
}));
