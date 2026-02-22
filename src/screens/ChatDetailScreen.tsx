import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowLeft, Send, MoreVertical } from "lucide-react-native";
import { Theme } from "../styles/Theme";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import { LegacyMessage as Message } from "../types/chatTypes";
import { EngageStackParamList } from "../navigation/Routes";

type RouteType = RouteProp<EngageStackParamList, "ChatDetail">;
type NavigationType = NativeStackNavigationProp<EngageStackParamList, "ChatDetail">;

export default function ChatDetailScreen() {
  const route = useRoute<RouteType>();
  const navigation = useNavigation<NavigationType>();
  const { chatId, name, avatar } = route.params;

  const { userId } = useAuthStore();
  const {
    messages,
    loading: storeLoading,
    sendingMessage,
    currentConversationId,
    createOrGetConversation,
    getMessages,
    sendMessage,
    receiveMessage,
    setCurrentChatUser,
    clearChatData,
  } = useChatStore();

  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Use conversationId if available, otherwise fall back to chatId for socket messages
  const messageKey = currentConversationId || chatId;
  const userMessages = messages[messageKey] || [];

  useEffect(() => {
    // Reset state when chatId changes
    setIsLoadingChat(true);
    setError(null);
    setMessageText("");
    
    // Initialize chat: Create conversation and load messages
    const initializeChat = async () => {
      try {
        setCurrentChatUser(chatId);
        
        // Step 1: Create or get conversation (ensure it exists on backend)
        const convId = await createOrGetConversation({ otherUserId: chatId });
        if (!convId) {
          setError("Failed to create conversation. You may not be friends with this user.");
          setIsLoadingChat(false);
          return;
        }
        
        // Step 2: Try to load messages
        try {
          await getMessages(convId);
        } catch (msgErr: any) {
          // If conversation not found on backend, try to recreate it
          if (msgErr.response?.status === 404) {
            console.log("[ChatDetail] Conversation not found on backend, attempting to recreate...");
            
            // Force create conversation on backend
            const { createConversationApi } = await import("../api/chatApi");
            try {
              const res = await createConversationApi({ otherUserId: chatId });
              const newConvId = (res as any).data?.id || (res as any).data;
              
              if (newConvId) {
                // Update current conversation ID
                useChatStore.setState({ currentConversationId: newConvId });
                // Try loading messages again with new ID
                await getMessages(newConvId);
              }
            } catch (createErr) {
              console.error("[ChatDetail] Failed to recreate conversation:", createErr);
            }
          }
        }
        
        setIsLoadingChat(false);
      } catch (err: any) {
        console.error("Chat initialization error:", err);
        setError(err.message || "Unable to start chat. Please check if you are friends.");
        setIsLoadingChat(false);
      }
    };

    initializeChat();

    return () => {
      setCurrentChatUser(null);
    };
  }, [chatId]);

  useEffect(() => {
    // Listen for incoming messages via socket
    const handleIncomingMessage = (message: Message) => {
      console.log("[ChatDetail] Received message via socket:", message);
      
      // Only process messages for the current conversation
      // Message should have conversationId from backend, or we check sender
      const isForCurrentChat = 
        message.conversationId === currentConversationId ||
        message.senderId === chatId ||
        message.receiverId === chatId;
      
      console.log("[ChatDetail] Message for current chat?", isForCurrentChat, {
        messageConversationId: message.conversationId,
        currentConversationId,
        messageSenderId: message.senderId,
        chatId,
      });
      
      if (isForCurrentChat) {
        // Check if message already exists (avoid duplicates from optimistic updates)
        const existingMessages = userMessages || [];
        const isDuplicate = existingMessages.some(
          (m) => m.id === message.id || 
                 (m.content === message.content && 
                  m.senderId === message.senderId &&
                  Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5000)
        );
        
        if (!isDuplicate) {
          receiveMessage(message);
        } else {
          console.log("[ChatDetail] Duplicate message ignored:", message.id);
        }
      }
    };

    // Subscribe to socket messages
    import("../services/socket").then(({ socketService }) => {
      socketService.onReceiveMessage(handleIncomingMessage);
      console.log("[ChatDetail] Subscribed to socket messages for chat:", chatId);
    });

    return () => {
      import("../services/socket").then(({ socketService }) => {
        socketService.removeMessageCallback(handleIncomingMessage);
        console.log("[ChatDetail] Unsubscribed from socket messages");
      });
    };
  }, [receiveMessage, chatId, currentConversationId, userMessages]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (userMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [userMessages.length]);

  const handleRefresh = async () => {
    // Refresh messages by re-fetching from server
    if (currentConversationId) {
      await getMessages(currentConversationId);
    }
  };

  const handleSendMessage = async () => {
    if (messageText.trim() === "" || sendingMessage) return;
    if (!userId) {
      console.error("[ChatDetail] Cannot send message: userId is not available");
      return;
    }

    const text = messageText.trim();
    console.log(`[ChatDetail] Sending message with userId: ${userId}`);
    setMessageText("");

    // Send message via REST API
    await sendMessage({
      receiverId: chatId,
      content: text,
      messageType: "text",
    }, userId);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.senderId === userId;
    
    // Debug logging
    console.log(`[ChatDetail] Message ${index}: senderId="${item.senderId}", userId="${userId}", isMyMessage=${isMyMessage}`);

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
            ]}
          >
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No messages yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Send a message to start the conversation
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Theme.colors.foreground} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image source={{ uri: avatar }} style={styles.headerAvatar} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{name}</Text>
            <Text style={styles.headerStatus}>Active now</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={24} color={Theme.colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>
            Make sure you are friends before chatting.
          </Text>
        </View>
      )}

      {/* Messages List */}
      {isLoadingChat ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={userMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            userMessages.length === 0 && styles.emptyMessagesList,
          ]}
          ListEmptyComponent={renderEmptyState}
          inverted={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
          refreshControl={
            <RefreshControl
              refreshing={storeLoading}
              onRefresh={handleRefresh}
              tintColor={Theme.colors.primary}
            />
          }
        />
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={error ? "Cannot send messages" : "Type a message..."}
            placeholderTextColor={Theme.colors.mutedForeground}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
            editable={!error && !isLoadingChat}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (messageText.trim() === "" || sendingMessage || error) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={messageText.trim() === "" || sendingMessage || !!error}
          >
            {sendingMessage ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Send size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.muted,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.foreground,
  },
  headerStatus: {
    fontSize: 12,
    color: Theme.colors.mutedForeground,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyMessagesList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.foreground,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    textAlign: "center",
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
    width: "100%",
  },
  myMessageContainer: {
    justifyContent: "flex-end",
    flexDirection: "row-reverse",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "70%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: Theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: Theme.colors.muted,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: "white",
  },
  otherMessageText: {
    color: Theme.colors.foreground,
  },
  messageTime: {
    fontSize: 11,
  },
  myMessageTime: {
    color: "rgba(255,255,255,0.7)",
  },
  otherMessageTime: {
    color: Theme.colors.mutedForeground,
  },
  keyboardAvoidingView: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8, // Reduced bottom padding since SafeAreaView no longer handles bottom
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: Theme.colors.muted,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    color: Theme.colors.foreground,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#fca5a5",
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#991b1b",
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: "#b91c1c",
  },
});
