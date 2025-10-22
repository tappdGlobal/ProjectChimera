// src/screens/ReconnectScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { X, Heart, LayoutGrid, Layers } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../styles/Theme";
import { Button } from "../components/ui/Button";

// --- MOCK DATA ---
interface FriendRequest {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  image: string;
}

const initialRequests: FriendRequest[] = [
  {
    id: "1",
    name: "Claudia Alves",
    age: 24,
    gender: "Female",
    location: "MATCHA CLUB",
    image:
      "https://images.unsplash.com/photo-1615338437154-3b752f3e1a6f?crop=face&fit=crop&w=400&h=400",
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    age: 28,
    gender: "Male",
    location: "DOWNTOWN LOUNGE",
    image:
      "https://images.unsplash.com/photo-1633037543479-a70452ea1e12?crop=face&fit=crop&w=400&h=400",
  },
  {
    id: "3",
    name: "Sofia Chen",
    age: 26,
    gender: "Female",
    location: "ROOFTOP BAR",
    image:
      "https://images.unsplash.com/photo-1687610265701-1255ece05d75?crop=face&fit=crop&w=400&h=400",
  },
];
// --- END MOCK DATA ---

export function ReconnectScreen() {
  const navigation = useNavigation();
  const [viewMode, setViewMode] = useState<"swipe" | "list">("swipe");
  const [requests, setRequests] = useState(initialRequests);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleButtonAction = (
    action: "accept" | "decline",
    requestId: string
  ) => {
    // Filter out the dismissed request
    const newRequests = requests.filter((req) => req.id !== requestId);
    setRequests(newRequests);

    // Logic to update currentIndex to stay within bounds or move to the next item
    if (newRequests.length > 0) {
      // If current index is now out of bounds, reset it. Otherwise, keep it the same
      // to move to the 'new' item now at that position.
      setCurrentIndex((prevIndex) =>
        Math.min(prevIndex, newRequests.length - 1)
      );
    } else {
      setCurrentIndex(0); // Reset index if list is empty
    }
  };

  const currentRequest = requests[currentIndex];

  if (requests.length === 0) {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateTitle}>No more friend requests!</Text>
        <Text style={styles.emptyStateText}>
          Check back later for new connections.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.flex1} edges={["top"]}>
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reconnect</Text>

          {/* View Mode Toggle */}
          <View style={styles.toggleContainer}>
            <Button
              variant={viewMode === "swipe" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCurrentIndex(0);
                setViewMode("swipe");
              }}
              style={styles.toggleButton}
            >
              <Layers
                size={16}
                color={
                  viewMode === "swipe"
                    ? Theme.colors.primaryForeground
                    : Theme.colors.foreground
                }
                style={styles.mr2}
              />
              <Text
                style={
                  viewMode === "swipe"
                    ? styles.toggleTextActive
                    : styles.toggleTextInactive
                }
              >
                Swipe
              </Text>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              style={styles.toggleButton}
            >
              <LayoutGrid
                size={16}
                color={
                  viewMode === "list"
                    ? Theme.colors.primaryForeground
                    : Theme.colors.foreground
                }
                style={styles.mr2}
              />
              <Text
                style={
                  viewMode === "list"
                    ? styles.toggleTextActive
                    : styles.toggleTextInactive
                }
              >
                List
              </Text>
            </Button>
          </View>
        </View>

        {viewMode === "swipe" ? (
          <View style={styles.swipeContainer}>
            {currentRequest && (
              <View style={styles.profileCard}>
                {/* Profile Image */}
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: currentRequest.image }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Profile Info */}
                <Text style={styles.profileName}>{currentRequest.name}</Text>
                <View style={styles.infoRow}>
                  <View style={styles.infoPill}>
                    <View style={styles.infoDot} />
                    <Text style={styles.infoText}>{currentRequest.gender}</Text>
                  </View>
                  <View style={styles.infoPill}>
                    <View style={styles.infoDot} />
                    <Text style={styles.infoText}>
                      {currentRequest.location}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <Button
                    onClick={() =>
                      handleButtonAction("decline", currentRequest.id)
                    }
                    variant="outline"
                    size="icon"
                    style={styles.declineButton}
                  >
                    <X size={24} color={Theme.colors.foreground} />
                  </Button>
                  <Button
                    onClick={() =>
                      handleButtonAction("accept", currentRequest.id)
                    }
                    size="icon"
                    style={styles.acceptButton}
                  >
                    <Heart size={24} color={Theme.colors.primaryForeground} />
                  </Button>
                </View>
              </View>
            )}
            <Text style={styles.instructionText}>
              Use the buttons to accept or decline
            </Text>
          </View>
        ) : (
          /* List View */
          <ScrollView
            style={styles.listScrollView}
            contentContainerStyle={styles.listContent}
          >
            {requests.map((request) => (
              <View key={request.id} style={styles.listItemCard}>
                <Image
                  source={{ uri: request.image }}
                  style={styles.listImage}
                  resizeMode="cover"
                />
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{request.name}</Text>
                  <Text style={styles.listDetails}>
                    {request.gender} • {request.location}
                  </Text>
                </View>
                <View style={styles.listActions}>
                  <Button
                    onClick={() => handleButtonAction("decline", request.id)}
                    variant="outline"
                    size="icon"
                    style={styles.declineButtonSmall}
                  >
                    <X size={16} color={Theme.colors.foreground} />
                  </Button>
                  <Button
                    onClick={() => handleButtonAction("accept", request.id)}
                    size="icon"
                    style={styles.acceptButtonSmall}
                  >
                    <Heart size={16} color={Theme.colors.primaryForeground} />
                  </Button>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  flex1: { flex: 1 },
  mainContainer: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  headerTitle: {
    color: Theme.colors.foreground,
    fontSize: 24,
    marginBottom: 16,
    fontWeight: "bold",
  },
  toggleContainer: { flexDirection: "row", gap: 8, justifyContent: "center" },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Theme.radius.xl,
  },
  toggleTextActive: {
    color: Theme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: "500",
  },
  toggleTextInactive: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "500",
  },
  mr2: { marginRight: 8 },

  // --- Swipe View ---
  swipeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  profileCard: {
    width: 320,
    maxWidth: "100%",
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.xl,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  imageWrapper: {
    width: 192,
    height: 192,
    borderRadius: 9999,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: Theme.colors.border,
    marginBottom: 24,
  },
  profileImage: { width: "100%", height: "100%" },
  profileName: {
    color: Theme.colors.foreground,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  infoPill: { flexDirection: "row", alignItems: "center", gap: 4 },
  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
  },
  infoText: { color: Theme.colors.mutedForeground, fontSize: 14 },
  actionButtons: { flexDirection: "row", gap: 24, justifyContent: "center" },
  declineButton: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    backgroundColor: Theme.colors.muted,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 0,
  },
  acceptButton: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    backgroundColor: Theme.colors.primary,
    padding: 0,
  },
  instructionText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    marginTop: 24,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background,
  },
  emptyStateTitle: {
    color: Theme.colors.foreground,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyStateText: { color: Theme.colors.mutedForeground, textAlign: "center" },

  // --- List View ---
  listScrollView: { flex: 1, paddingHorizontal: 16 },
  listContent: { paddingVertical: 16, gap: 16 },
  listItemCard: {
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.xl,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  listImage: { width: 64, height: 64, borderRadius: 9999, marginRight: 16 },
  listInfo: { flex: 1, marginRight: 16 },
  listName: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "bold",
  },
  listDetails: { color: Theme.colors.mutedForeground, fontSize: 14 },
  listActions: { flexDirection: "row", gap: 8 },
  declineButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: Theme.colors.muted,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 0,
  },
  acceptButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: Theme.colors.primary,
    padding: 0,
  },
});
