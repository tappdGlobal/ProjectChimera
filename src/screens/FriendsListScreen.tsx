import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Theme } from "../styles/Theme";
import { EngageStackParamList, SCREEN_NAMES } from "../navigation/Routes";
import { getAcceptedConnectionsApi } from "../api/connectionApi";
import { User } from "../types/authTypes";

type NavigationProp = NativeStackNavigationProp<EngageStackParamList>;

const DEFAULT_AVATAR = "https://via.placeholder.com/50";

export default function FriendsListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { createOrGetConversation } = useChatStore();
  const { userId } = useAuthStore();
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const res = await getAcceptedConnectionsApi();
      console.log("Connections API raw response:", res);
      
      let friendsData = (res as any).data || res || [];
      console.log("Extracted friends data:", friendsData);
      console.log("Current userId:", userId);
      
      // The API might return connection objects with fromUser/toUser
      // We need to extract the actual friend user from each connection
      const processedFriends = friendsData.map((item: any) => {
        // If it's a connection request object with fromUser/toUser
        if (item.fromUser && item.toUser) {
          // Return the user who is NOT the current user
          return item.fromUser.id === userId ? item.toUser : item.fromUser;
        }
        // If it's already a user object, return as-is
        return item;
      }).filter((user: User) => user && user.id !== userId); // Filter out self
      
      console.log("Processed friends:", processedFriends);
      setFriends(processedFriends);
    } catch (err: any) {
      console.error("Get friends error:", err);
      // Handle 404 as empty friends list
      if (err.response?.status === 404) {
        setFriends([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  const handleOpenChat = async (friend: User) => {
    // Prevent chatting with yourself
    if (friend.id === userId) {
      Alert.alert("Error", "You cannot chat with yourself.");
      return;
    }
    
    // Follow specification: Always call createOrGetConversation before opening chat
    setProcessingId(friend.id);
    
    try {
      console.log("Creating conversation with:", friend.id);
      const conversationId = await createOrGetConversation({ otherUserId: friend.id });
      
      if (!conversationId) {
        Alert.alert("Error", "Failed to start conversation. You may not be friends with this user.");
        setProcessingId(null);
        return;
      }

      setProcessingId(null);
      
      // Navigate to chat detail screen
      navigation.navigate(SCREEN_NAMES.CHAT_DETAIL, {
        chatId: friend.id,
        name: friend.name || friend.username,
        avatar: friend.profilePicUrl || DEFAULT_AVATAR,
      });
    } catch (error) {
      console.error("Error opening chat:", error);
      Alert.alert("Error", "Unable to start chat. Please ensure you are friends.");
      setProcessingId(null);
    }
  };

  const renderFriend = ({ item }: { item: User }) => {
    const isProcessing = processingId === item.id;

    return (
      <View style={styles.friendItem}>
        <TouchableOpacity onPress={() => handleOpenChat(item)}>
          <Image
            source={{ uri: item.profilePicUrl || DEFAULT_AVATAR }}
            style={styles.avatar}
            contentFit="cover"
          />
        </TouchableOpacity>
        
        <View style={styles.friendInfo}>
          <TouchableOpacity onPress={() => handleOpenChat(item)}>
            <Text style={styles.name}>{item.name || item.username}</Text>
            <Text style={styles.username}>@{item.username}</Text>
          </TouchableOpacity>
          
          <View style={styles.actions}>
            {isProcessing ? (
              <ActivityIndicator size="small" color={Theme.colors.primary} />
            ) : (
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => handleOpenChat(item)}
              >
                <Text style={styles.chatButtonText}>Chat</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading && friends.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends</Text>
        <Text style={styles.friendCount}>{friends.length} friends</Text>
      </View>

      {friends.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No friends yet</Text>
          <Text style={styles.emptySubtext}>
            Send friend requests to connect with people
          </Text>
        </View>
      ) : (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Theme.colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.card,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Theme.colors.foreground,
  },
  friendCount: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.foreground,
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  chatButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  chatButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.foreground,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    textAlign: "center",
  },
});
