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
import { FriendRequest } from "../types/friendTypes";
import { Theme } from "../styles/Theme";
import { useNavigation } from "@react-navigation/native";

const DEFAULT_AVATAR = "https://via.placeholder.com/50";

export default function FriendRequestsScreen() {
  const navigation = useNavigation();
  const {
    friendRequests,
    loading,
    getFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useFriendStore();

  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    await getFriendRequests();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    const success = await acceptFriendRequest(requestId);
    setProcessingId(null);

    if (success) {
      Alert.alert("Success", "Friend request accepted!");
    } else {
      Alert.alert("Error", "Failed to accept friend request. Please try again.");
    }
  };

  const handleReject = async (requestId: string) => {
    Alert.alert(
      "Reject Friend Request",
      "Are you sure you want to reject this request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setProcessingId(requestId);
            const success = await rejectFriendRequest(requestId);
            setProcessingId(null);

            if (!success) {
              Alert.alert("Error", "Failed to reject friend request. Please try again.");
            }
          },
        },
      ]
    );
  };

  const renderRequest = ({ item }: { item: FriendRequest }) => {
    const isProcessing = processingId === item.requestId;

    return (
      <View style={styles.requestItem}>
        <Image
          source={{ uri: item.sender.avatar || DEFAULT_AVATAR }}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.requestInfo}>
          <Text style={styles.name}>{item.sender.name || item.sender.username}</Text>
          <Text style={styles.username}>@{item.sender.username}</Text>
          <Text style={styles.time}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {isProcessing ? (
          <ActivityIndicator size="small" color={Theme.colors.primary} />
        ) : (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => handleAccept(item.requestId)}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleReject(item.requestId)}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading && friendRequests.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friend Requests</Text>
      </View>

      {friendRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No friend requests</Text>
          <Text style={styles.emptySubtext}>
            When someone sends you a friend request, it will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={friendRequests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.requestId}
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
  listContent: {
    padding: 16,
  },
  requestItem: {
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
  requestInfo: {
    flex: 1,
    marginLeft: 12,
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
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: Theme.colors.mutedForeground,
  },
  actions: {
    flexDirection: "column",
    gap: 8,
  },
  acceptButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  rejectButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minWidth: 80,
    alignItems: "center",
  },
  rejectButtonText: {
    color: Theme.colors.mutedForeground,
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
