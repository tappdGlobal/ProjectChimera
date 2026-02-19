import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Users } from "lucide-react-native";
import { Theme } from "../styles/Theme";
import { useFriendStore } from "../store/friendStore";
import { Friend } from "../types/friendTypes";
import { EngageStackParamList } from "../navigation/Routes";
import { SCREEN_NAMES } from "../navigation/Routes";

type NavigationProp = NativeStackNavigationProp<EngageStackParamList>;

const DEFAULT_AVATAR =
  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

export default function ChatListScreen({ embedded = false }: { embedded?: boolean }) {
  const navigation = useNavigation<NavigationProp>();
  const { friends, loading, getFriends } = useFriendStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    // Fetch friends on mount
    getFriends();
  }, []);

  const handleRefresh = () => {
    // Refresh friends list
    getFriends();
  };

  // Filter friends based on search query
  const filteredFriends = friends.filter((friend) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const name = (friend.user.name || friend.user.username).toLowerCase();
    return name.includes(query);
  });

  const handleFriendPress = (friend: Friend) => {
    navigation.navigate(SCREEN_NAMES.CHAT_DETAIL, {
      chatId: friend.user.id,
      name: friend.user.name || friend.user.username,
      avatar: friend.user.avatar || DEFAULT_AVATAR,
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const renderFriend = ({ item }: { item: Friend }) => {
    // Handle different avatar field names from backend
    const avatarUrl = item.user.avatar || (item.user as any).profilePicUrl || DEFAULT_AVATAR;
    
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleFriendPress(item)}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.onlineIndicator} />
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.user.name || item.user.username}
            </Text>
            <Text style={styles.timeText}>
              {formatTime(item.updatedAt)}
            </Text>
          </View>

          <View style={styles.messagePreview}>
            <Text
              style={styles.lastMessage}
              numberOfLines={1}
            >
              Tap to chat
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No friends yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Connect with people to start chatting
      </Text>
      <TouchableOpacity
        style={styles.startChatButton}
        onPress={() => navigation.navigate(SCREEN_NAMES.FRIENDS_LIST)}
      >
        <Text style={styles.startChatButtonText}>View Friends</Text>
      </TouchableOpacity>
    </View>
  );

  const mainContent = (
    <>
      {/* Header with Title, Badge, and Search */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Chats</Text>
          {friends.length > 0 && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{friends.length} friends</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => setShowSearch(!showSearch)}
        >
          <Search size={24} color={Theme.colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <Search size={18} color={Theme.colors.mutedForeground} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            placeholderTextColor={Theme.colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {loading && friends.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredFriends}
          renderItem={renderFriend}
          keyExtractor={(item) => `${item.friendshipId}-${item.user.id}`}
          contentContainerStyle={[
            styles.listContent,
            filteredFriends.length === 0 && styles.emptyListContent,
          ]}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor={Theme.colors.primary}
            />
          }
        />
      )}
    </>
  );

  if (embedded) {
    return (
      <View style={styles.container}>
        {mainContent}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {mainContent}
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Theme.colors.foreground,
  },
  newBadge: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  newBadgeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Theme.colors.muted,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.foreground,
    paddingVertical: 0,
  },
  clearButton: {
    fontSize: 20,
    color: Theme.colors.mutedForeground,
    paddingHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Theme.colors.background,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.muted,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: Theme.colors.background,
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.foreground,
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 13,
    color: Theme.colors.mutedForeground,
  },
  messagePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    color: Theme.colors.foreground,
    fontWeight: "600",
  },
  unreadBadge: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.foreground,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  startChatButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  startChatButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
