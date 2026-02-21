/* ================= USER TYPES (for API responses) ================= */

export interface ChatUser {
  id: string;
  name: string;
  username: string;
  profilePicUrl?: string;
}

/* ================= MESSAGE TYPES ================= */

export interface Message {
  id: string;
  content: string;
  sender: ChatUser;
  isRead: boolean;
  createdAt: string;
}

export interface LegacyMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'image' | 'video';
  delivered: boolean;
  seen: boolean;
  createdAt: string;
  conversationId?: string; // Optional: used for routing socket messages to correct chat
}

/* ================= CONVERSATION TYPES ================= */

export interface Conversation {
  id: string;
  user1: ChatUser;
  user2: ChatUser;
}

export interface ConversationListItem {
  id: string;
  otherUser: {
    id: string;
    name: string;
    username: string;
    profilePicUrl?: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
    seen: boolean;
  };
  unreadCount: number;
}

/* ================= CHAT LIST API TYPES ================= */

export interface ChatListMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
}

export interface ChatListOtherUser {
  id: string;
  name: string;
  username: string;
  profilePicUrl?: string;
}

export interface ChatListItem {
  id: string;                    // conversationId
  updatedAt: string;             // for sorting - most recent first
  otherUser: ChatListOtherUser;  // the other participant
  lastMessage: ChatListMessage | null;  // last message or null if no messages
  unreadCount: number;           // unread messages count
}

/* ================= API REQUEST PAYLOADS ================= */

export interface CreateConversationPayload {
  otherUserId: string;
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
}

export interface LegacySendMessagePayload {
  receiverId: string;
  content: string;
  messageType: 'text' | 'image' | 'video';
}

/* ================= API RESPONSE TYPES ================= */

export interface CreateConversationResponse {
  id: string;
  user1: ChatUser;
  user2: ChatUser;
}

export interface GetMessagesResponse {
  messages: Message[];
}

export interface LegacyMessagesResponse {
  messages: LegacyMessage[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalMessages: number;
    hasMore: boolean;
  };
}
