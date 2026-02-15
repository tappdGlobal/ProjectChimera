import { create } from "zustand";
import {
  createConversationApi,
  getConversationsApi,
  getMessagesWithUserApi,
  sendMessageApi,
  markMessagesAsReadApi,
} from "../api/chatApi";
import { Conversation, Message, SendMessagePayload } from "../types/chatTypes";
import { socketService } from "../services/socket";

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // userId -> messages
  currentChatUserId: string | null;
  currentConversationId: string | null;
  loading: boolean;
  sendingMessage: boolean;
  error: string | null;

  createOrGetConversation: (otherUserId: string) => Promise<string | null>;
  getConversations: () => Promise<void>;
  getMessagesWithUser: (userId: string, page?: number) => Promise<void>;
  sendMessage: (payload: SendMessagePayload) => Promise<Message | null>;
  markAsRead: (userId: string) => Promise<void>;
  receiveMessage: (message: Message) => void;
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

  createOrGetConversation: async (otherUserId: string) => {
    try {
      set({ loading: true, error: null });
      const res = await createConversationApi(otherUserId);
      const conversationData = (res as any).data || res;
      const conversationId = conversationData.id || conversationData;
      
      set({ currentConversationId: conversationId, loading: false });
      
      // Join conversation room after creating/getting it (non-blocking)
      try {
        socketService.joinConversation(conversationId);
      } catch (socketErr) {
        console.warn("Failed to join conversation room (non-critical):", socketErr);
      }
      
      return conversationId;
    } catch (err: any) {
      console.error("Create conversation error:", err);
      set({ loading: false, error: err.message || "Failed to create conversation" });
      return null;
    }
  },

  getConversations: async () => {
    try {
      set({ loading: true, error: null });
      const res = await getConversationsApi();
      const conversationsData = (res as any).data || res;
      set({
        conversations: Array.isArray(conversationsData) ? conversationsData : [],
        loading: false,
      });
    } catch (err: any) {
      console.error("Get conversations error:", err);
      set({ loading: false, error: err.message || "Failed to fetch conversations" });
    }
  },

  getMessagesWithUser: async (userId: string, page: number = 1) => {
    try {
      set({ loading: true, error: null });
      const res = await getMessagesWithUserApi(userId, page);
      const responseData = (res as any).data || res;
      const messagesData = responseData.messages || responseData || [];

      set((state) => ({
        messages: {
          ...state.messages,
          [userId]: Array.isArray(messagesData) ? messagesData : [],
        },
        loading: false,
      }));
    } catch (err: any) {
      console.error("Get messages error:", err);
      set({ loading: false, error: err.message || "Failed to fetch messages" });
    }
  },

  sendMessage: async (payload: SendMessagePayload) => {
    try {
      set({ sendingMessage: true, error: null });
      
      // Use REST API to send message
      const res = await sendMessageApi(payload);
      const messageData = (res as any).data || res;

      // Add message to local state
      set((state) => ({
        messages: {
          ...state.messages,
          [payload.receiverId]: [
            ...(state.messages[payload.receiverId] || []),
            messageData,
          ],
        },
        sendingMessage: false,
      }));

      // Refresh conversations to update last message
      get().getConversations();

      return messageData;
    } catch (err: any) {
      console.error("Send message error:", err);
      set({ sendingMessage: false, error: err.message || "Failed to send message" });
      return null;
    }
  },

  markAsRead: async (userId: string) => {
    try {
      await markMessagesAsReadApi(userId);

      // Update conversations to mark as read
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
          [userId]: (state.messages[userId] || []).map((msg) =>
            msg.senderId !== userId ? msg : { ...msg, seen: true }
          ),
        },
      }));
    } catch (err: any) {
      console.error("Mark as read error:", err);
    }
  },

  receiveMessage: (message: Message) => {
    // Add message to local state when received via socket
    const userId = message.senderId;

    set((state) => ({
      messages: {
        ...state.messages,
        [userId]: [
          ...(state.messages[userId] || []),
          message,
        ],
      },
    }));

    // Refresh conversations to update last message
    get().getConversations();
  },

  setCurrentChatUser: (userId: string | null) => {
    set({ currentChatUserId: userId });
    
    if (userId) {
      // Mark messages as read when opening chat
      get().markAsRead(userId);
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
