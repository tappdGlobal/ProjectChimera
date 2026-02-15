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
import { useFriendStore } from "../store/friendStore";
import { useChatStore } from "../store/chatStore";
import { Friend } from "../types/friendTypes";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Theme } from "../styles/Theme";
import { EngageStackParamList, SCREEN_NAMES } from "../navigation/Routes";

type RootStackParamList = {
  ChatDetail: { chatId: string; username: string; profileImage?: string };
  // Add other routes as needed
};

type NavigationProp = NativeStackNavigationProp<EngageStackParamList>;

const DEFAULT_AVATAR = "https://via.placeholder.com/50";

export default function FriendsListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { friends, loading, getFriends, removeFriend, blockUser } = useFriendStore();
  const { createOrGetConversation } = useChatStore();
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    await getFriends();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    Alert.alert(
      "Remove Friend",
      "Are you sure you want to remove this friend? This will also block them.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setProcessingId(friendshipId);
            const success = await removeFriend(friendshipId);
            setProcessingId(null);

            if (!success) {
              Alert.alert("Error", "Failed to remove friend. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleBlockUser = async (userId: string) => {
    Alert.alert(
      "Block User",
      "Are you sure you want to block this user? This will also remove them as a friend.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            setProcessingId(userId);
            const success = await blockUser(userId);
            setProcessingId(null);

            if (!success) {
              Alert.alert("Error", "Failed to block user. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleOpenChat = async (friend: Friend) => {
    // Follow specification: Always call createOrGetConversation before opening chat
    setProcessingId(friend.user.id);
    
    try {
      const conversationId = await createOrGetConversation(friend.user.id);
      
      if (!conversationId) {
        Alert.alert("Error", "Failed to start conversation. Please try again.");
        setProcessingId(null);
        return;
      }

      setProcessingId(null);
      
      // Navigate to chat detail screen
      navigation.navigate(SCREEN_NAMES.CHAT_DETAIL, {
        chatId: friend.user.id,
        name: friend.user.name || friend.user.username,
        avatar: friend.user.avatar || DEFAULT_AVATAR,
      });
    } catch (error) {
      console.error("Error opening chat:", error);
      Alert.alert("Error", "Unable to start chat. Please ensure you are friends.");
      setProcessingId(null);
    }
  };

  const renderFriend = ({ item }: { item: Friend }) => {
    const isProcessing = processingId === item.friendshipId;

    return (
      <View style={styles.friendItem}>
        <TouchableOpacity onPress={() => handleOpenChat(item)}>
          <Image
            source={{ uri: item.user.avatar || DEFAULT_AVATAR }}
            style={styles.avatar}
            contentFit="cover"
          />
        </TouchableOpacity>
        
        <View style={styles.friendInfo}>
          <TouchableOpacity onPress={() => handleOpenChat(item)}>
            <Text style={styles.name}>{item.user.name || item.user.username}</Text>
            <Text style={styles.username}>@{item.user.username}</Text>
          </TouchableOpacity>
          
          <View style={styles.actions}>
            {isProcessing ? (
              <ActivityIndicator size="small" color={Theme.colors.primary} />
            ) : (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFriend(item.friendshipId)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.blockButton}
              onPress={() => handleBlockUser(item.user.id)}
            >
              <Text style={styles.blockButtonText}>Block</Text>
            </TouchableOpacity>
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
          keyExtractor={(item) => item.friendshipId}
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
  removeButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.destructive,
  },
  removeButtonText: {
    color: Theme.colors.destructive,
    fontSize: 12,
    fontWeight: "600",
  },
  blockButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  blockButtonText: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
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
