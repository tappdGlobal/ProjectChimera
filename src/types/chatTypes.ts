export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'image' | 'video';
  delivered: boolean;
  seen: boolean;
  createdAt: string;
}

export interface Conversation {
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

export interface SendMessagePayload {
  receiverId: string;
  content: string;
  messageType: 'text' | 'image' | 'video';
}

export interface MessagesResponse {
  messages: Message[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalMessages: number;
    hasMore: boolean;
  };
}
