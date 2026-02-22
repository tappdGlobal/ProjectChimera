// src/screens/ReconnectScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { Heart, MapPin, Layers, LayoutGrid, X, Eye, MessageCircle, Clock, UserPlus, ArrowLeft, Briefcase, GraduationCap, RefreshCw } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme, GRADIENT_COLORS } from "../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import ComingSoon from "../components/common/ComingSoon";
import { ProfileDetailModal } from "../components/reconnect/ProfileDetailModal";
import { useConnectionStore } from "../store/connectionStore";
import { useEffect } from "react";
import { Animated, PanResponder, Dimensions } from "react-native";
import Toast from "react-native-toast-message";

// Mock data for List View
// const listData = [
//   {
//     id: "1",
//     name: "Claudia Alves",
//     gender: "Female",
//     age: 24,
//     location: "MATCHA CLUB",
//     image: "https://images.unsplash.com/photo-1615338437154-3b752f3e1a6f?crop=face&fit=crop&w=400&h=400",
//     bio: "Coffee enthusiast and digital nomad. Love exploring new cafes and meeting interesting people.",
//     interests: ["Coffee", "Travel", "Photography", "Yoga"],
//     occupation: "UX Designer",
//     education: "BFA Graphic Design",
//     events: 42,
//     mutualFriends: 5,
//     photos: [
//       "https://images.unsplash.com/photo-1615338437154-3b752f3e1a6f?crop=face&fit=crop&w=400&h=400",
//       "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=face&fit=crop&w=400&h=400",
//     ],
//   },
//   {
//     id: "2",
//     name: "Marcus Rodriguez",
//     gender: "Male",
//     age: 28,
//     location: "DOWNTOWN LOUNGE",
//     image: "https://images.unsplash.com/photo-1633037543479-a70452ea1e12?crop=face&fit=crop&w=400&h=400",
//     bio: "Music producer and DJ. Always looking for new sounds and creative collaborations.",
//     interests: ["Music", "DJing", "Production", "Nightlife"],
//     occupation: "Music Producer",
//     education: "BA Music Technology",
//     events: 38,
//     mutualFriends: 3,
//     photos: [
//       "https://images.unsplash.com/photo-1633037543479-a70452ea1e12?crop=face&fit=crop&w=400&h=400",
//     ],
//   },
//   {
//     id: "3",
//     name: "Sofia Chen",
//     gender: "Female",
//     age: 26,
//     location: "ROOFTOP BAR",
//     image: "https://images.unsplash.com/photo-1687610265701-1255ece05d75?crop=face&fit=crop&w=400&h=400",
//     bio: "Marketing professional by day, cocktail enthusiast by night. Love rooftop vibes.",
//     interests: ["Cocktails", "Marketing", "Networking", "Events"],
//     occupation: "Marketing Manager",
//     education: "MBA Marketing",
//     events: 56,
//     mutualFriends: 8,
//     photos: [
//       "https://images.unsplash.com/photo-1687610265701-1255ece05d75?crop=face&fit=crop&w=400&h=400",
//     ],
//   },
//   {
//     id: "4",
//     name: "David Park",
//     gender: "Male",
//     age: 25,
//     location: "JAZZ CAFE",
//     image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=face&fit=crop&w=400&h=400",
//     bio: "Jazz musician and music teacher. Love performing at intimate venues and jamming with new artists.",
//     interests: ["Jazz", "Piano", "Live Performance", "Teaching", "Vinyl Records"],
//     occupation: "Music Teacher",
//     education: "BA Music Performance",
//     events: 53,
//     mutualFriends: 3,
//     photos: [
//       "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=face&fit=crop&w=400&h=400",
//     ],
//   },
//   {
//     id: "5",
//     name: "Emma Wilson",
//     gender: "Female",
//     age: 27,
//     location: "WINE BAR",
//     image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=face&fit=crop&w=400&h=400",
//     bio: "Wine sommelier and food blogger. Always on the hunt for the perfect pairing.",
//     interests: ["Wine", "Food", "Blogging", "Travel"],
//     occupation: "Sommelier",
//     education: "WSET Level 3",
//     events: 34,
//     mutualFriends: 6,
//     photos: [
//       "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=face&fit=crop&w=400&h=400",
//     ],
//   },
// ];

// Mock data for Crossed Paths

// const crossedPathsData = [
//   {
//     id: "1",
//     name: "Isabella Martinez",
//     age: 25,
//     crossedCount: 3,
//     location: "Sky Lounge, Mumbai",
//     timeAgo: "2 hours ago",
//     distance: "5m away",
//     interests: ["Jazz", "Art", "Coffee"],
//     image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=face&fit=crop&w=400&h=400",
//   },
//   {
//     id: "2",
//     name: "Alex Thompson",
//     age: 28,
//     crossedCount: 1,
//     location: "Central Cafe, Bandra",
//     timeAgo: "5 hours ago",
//     distance: "10m away",
//     interests: ["Tech", "Food"],
//     image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=face&fit=crop&w=400&h=400",
//   },
//   {
//     id: "3",
//     name: "Priya Sharma",
//     age: 26,
//     crossedCount: 2,
//     location: "Innovation Hub, Powai",
//     timeAgo: "Yesterday",
//     distance: "15m away",
//     interests: ["Startup", "Networking", "Yoga"],
//     image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=face&fit=crop&w=400&h=400",
//   },
//   {
//     id: "4",
//     name: "Rahul Verma",
//     age: 29,
//     crossedCount: 5,
//     location: "Downtown Club, Lower Parel",
//     timeAgo: "2 days ago",
//     distance: "20m away",
//     interests: ["Music", "Nightlife", "Sports"],
//     image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=face&fit=crop&w=400&h=400",
//   },
// ];

export function ReconnectScreen() {
  const [activeButton, setActiveButton] = useState<"friendRequests" | "crossedPaths" | "swipe" | "list">("swipe");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hoverButton, setHoverButton] = useState<null | "friendRequests" | "crossedPaths" | "swipe" | "list">(null);
  const [hoveredConnectButton, setHoveredConnectButton] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    pendingRequests,
    fetchPendingRequests,
    loading,
    respondToRequest,
  } = useConnectionStore();

  const screenWidth = Dimensions.get("window").width;
  const position = React.useRef(new Animated.ValueXY()).current;

  const handleAction = async (
    requestId: string,
    action: "ACCEPT" | "REJECT",
    intent?: string[]
  ) => {
    if (actionLoadingId) return;

    setActionLoadingId(requestId);

    const result = await respondToRequest(requestId, action, intent || []);

    if (result?.success) {
      Toast.show({
        type: action === "ACCEPT" ? "success" : "info",
        text1:
          action === "ACCEPT"
            ? "Connection Accepted"
            : "Request Rejected",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: result?.message,
      });
    }

    setActionLoadingId(null);
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await fetchPendingRequests();
      Toast.show({
        type: "success",
        text1: "Refreshed",
        text2: "Latest requests loaded",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Refresh failed",
        text2: error?.message || "Could not load requests",
      });
    } finally {
      setIsRefreshing(false);
    }
  };


  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 5,

      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: 0 });
      },

      onPanResponderRelease: async (_, gestureState) => {
        const user = currentUserRef.current;

        if (!user?.requestId) {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
          return;
        }

        const swipeThreshold = 120;

        if (gestureState.dx > swipeThreshold) {
          Animated.timing(position, {
            toValue: { x: screenWidth, y: 0 },
            duration: 250,
            useNativeDriver: true,
          }).start(async () => {
            await handleAction(user.requestId, "ACCEPT", user.intent);


            position.setValue({ x: 0, y: 0 });
          });

        } else if (gestureState.dx < -swipeThreshold) {
          Animated.timing(position, {
            toValue: { x: -screenWidth, y: 0 },
            duration: 250,
            useNativeDriver: true,
          }).start(async () => {
            await handleAction(user.requestId, "ACCEPT", user.intent);


            position.setValue({ x: 0, y: 0 });
          });

        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      }





    })
  ).current;


  useEffect(() => {
    console.log("📱 ReconnectScreen Mounted");
    fetchPendingRequests();
  }, []);

  const currentUser =
    pendingRequests.length > 0 ? pendingRequests[0] : null;
  const currentUserRef = React.useRef(currentUser);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);


  const renderIntentPills = (intent?: string[]) => {
    if (!intent || intent.length === 0) return null;

    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 8,
          marginTop: 10,
        }}
      >
        {intent.map((item, index) => (
          <View
            key={index}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: Theme.colors.primary,
              backgroundColor: "rgba(255,255,255,0.05)",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: Theme.colors.primary,
                fontWeight: "600",
              }}
            >
              {item.charAt(0) + item.slice(1).toLowerCase()}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderGradientToggle = (
    id: "friendRequests" | "crossedPaths" | "swipe" | "list",
    icon: React.ReactNode,
    label: string,
    shellStyle: any,
  ) => {
    const isActive = activeButton === id;

    if (!isActive) {
      return (
        <TouchableOpacity
          style={shellStyle}
          onPress={() => {
            if (id === "crossedPaths") {
              setShowComingSoon(true);
            } else {
              setActiveButton(id);
            }
          }}
        >
          <View style={styles.toggleInner}>
            {icon}
            <Text style={styles.tabTextInactive}>{label}</Text>
          </View>
        </TouchableOpacity>
      );
    }





    return (
      <Pressable
        onPress={() => {
          if (id === "crossedPaths") {
            setShowComingSoon(true);
          } else {
            setActiveButton(id);
          }
        }}
        onHoverIn={() => setHoverButton(id)}
        onHoverOut={() => setHoverButton(null)}
        style={{ flex: 1 }}
      >
        {({ pressed }) => (
          <LinearGradient
            colors={
              (pressed || hoverButton === id)
                ? (GRADIENT_COLORS.primaryHover as [string, string, ...string[]])
                : (GRADIENT_COLORS.primary as [string, string, ...string[]])
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[shellStyle, styles.gradientActive]}
          >
            <View style={styles.toggleInner}>
              {icon}
              <Text style={styles.tabTextActive}>{label}</Text>
            </View>
          </LinearGradient>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reconnect</Text>
        
        {/* Refresh Button */}
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isRefreshing}
          style={{ padding: 8 }}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={Theme.colors.primary} />
          ) : (
            <RefreshCw size={22} color={Theme.colors.foreground} />
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Selector - Row 1 */}
      <View style={styles.tabContainer}>
        {renderGradientToggle(
          "friendRequests",
          <Heart
            size={16}
            color={activeButton === "friendRequests" ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)"}
            style={styles.tabIcon}
          />,
          "Friend Requests",
          styles.tabButton,
        )}

        {renderGradientToggle(
          "crossedPaths",
          <MapPin
            size={16}
            color={activeButton === "crossedPaths" ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)"}
            style={styles.tabIcon}
          />,
          "Crossed Paths",
          styles.tabButton,
        )}
      </View>

      {/* View Mode Toggle - Row 2 (Hidden when Crossed Paths is active) */}
      {activeButton !== "crossedPaths" && (
        <View style={styles.viewModeContainer}>
          {renderGradientToggle(
            "swipe",
            <Layers
              size={16}
              color={activeButton === "swipe" ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)"}
              style={styles.tabIcon}
            />,
            "Swipe",
            styles.viewModeButton,
          )}

            {renderGradientToggle(
              "list",
              <LayoutGrid
                size={16}
                color={activeButton === "list" ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)"}
                style={styles.tabIcon}
              />,
              "List",
              styles.viewModeButton,
            )}
          </View>
        )}

      {/* Content */}
      {activeButton === "crossedPaths" ? (
        // Crossed Paths List View
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Crossed Paths</Text>
            <Text style={styles.sectionSubtitle}>
              People you've crossed paths with at events
            </Text>
          </View>

          {crossedPathsData.map((user) => (
            <View key={user.id} style={styles.crossedPathCard}>
              <Image source={{ uri: user.image }} style={styles.crossedPathImage} />

              <View style={styles.crossedPathInfo}>
                <Text style={styles.crossedPathName}>
                  {user.name}, {user.age}
                </Text>

                <View style={styles.crossedBadge}>
                  <Text style={styles.crossedBadgeText}>{user.crossedCount}x crossed</Text>
                </View>

                <View style={styles.crossedPathDetailRow}>
                  <MapPin size={14} color="rgba(255, 255, 255, 0.6)" />
                  <Text style={styles.crossedPathDetailText}>{user.location}</Text>
                </View>

                <View style={styles.crossedPathDetailRow}>
                  <Clock size={14} color="rgba(255, 255, 255, 0.6)" />
                  <Text style={styles.crossedPathDetailText}>
                    {user.timeAgo} • {user.distance}
                  </Text>
                </View>

                <View style={styles.interestsContainer}>
                  {user.interests.map((interest, index) => (
                    <View key={index} style={styles.interestTag}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.crossedPathActionButtons}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => {
                      const fullUser = listData.find(u => u.name === user.name) || {
                        ...user,
                        bio: "",
                        occupation: "",
                        education: "",
                        events: 0,
                        mutualFriends: 0,
                        photos: [user.image],
                      };
                      setSelectedUser(fullUser);
                      setShowProfileModal(true);
                    }}
                  >
                    <Eye size={16} color="#FFFFFF" />
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>

                  <Pressable
                    style={styles.connectButton}
                    onHoverIn={() => setHoveredConnectButton(user.id)}
                    onHoverOut={() => setHoveredConnectButton(null)}
                  >
                    {({ pressed }) => (
                      <LinearGradient
                        colors={
                          (pressed || hoveredConnectButton === user.id)
                            ? (GRADIENT_COLORS.primaryHover as [string, string, ...string[]])
                            : (GRADIENT_COLORS.primary as [string, string, ...string[]])
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.connectButtonGradient}
                      >
                        <UserPlus size={16} color="#FFFFFF" />
                        <Text style={styles.connectButtonText}>Connect</Text>
                      </LinearGradient>
                    )}
                  </Pressable>

                  <TouchableOpacity style={styles.chatButton}>
                    <MessageCircle size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : activeButton === "list" ? (
        // List View - Simple profile cards
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.listScrollContent}
        >
          {loading && (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator
                size="large"
                color={Theme.colors.primary}
              />
            </View>
          )}


          {!loading && pendingRequests.length === 0 && (
            <Text style={{ color: "white", textAlign: "center" }}>
              No pending requests
            </Text>
          )}

          {pendingRequests.map((user) => (
            <TouchableOpacity
              key={user.requestId}
              activeOpacity={0.9}
              onPress={() => {
                setSelectedUser(user);
                setShowProfileModal(true);
              }}
              style={{
                backgroundColor: "rgba(169, 1, 109, 0.15)",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                width: "100%",
                overflow: "hidden",
              }}
            >

              {/* 🔹 TOP ROW */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={{
                    uri:
                      user.profilePicUrl ||
                      "https://via.placeholder.com/150",
                  }}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                  }}
                />

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#FFFFFF",
                    }}
                  >
                    {user.name}
                  </Text>

                  <Text
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.7)",
                      marginTop: 2,
                    }}
                  >
                    {user.gender || "N/A"} • {user.location || "Unknown"}
                  </Text>
                </View>

                {/* 🔹 ACTION BUTTONS */}
                <View style={{ flexDirection: "row" }}>
                  {/* ❌ REJECT */}
                  <TouchableOpacity
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: "rgba(255,255,255,0.1)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 8,
                    }}
                    onPress={() =>
                      handleAction(user.requestId, "REJECT", user.intent)
                    }
                    disabled={actionLoadingId === user.requestId}

                  >
                    {actionLoadingId === user.requestId ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <X size={18} color="#FFFFFF" />
                    )}

                  </TouchableOpacity>

                  {/* ❤️ ACCEPT */}
                  <TouchableOpacity
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      overflow: "hidden",
                    }}
                    onPress={async () => {
                      console.log("❤️ Accept clicked:", user.requestId);

                      const result = await respondToRequest(
                        user.requestId,
                        "ACCEPT",
                        user.intent
                      );

                      console.log("📦 Accept API result:", result);

                      if (result?.success) {
                        Toast.show({
                          type: "success",
                          text1: "Connection Accepted",
                        });
                      } else {
                        Toast.show({
                          type: "error",
                          text1: "Accept Failed",
                          text2: result?.message || "Something went wrong",
                        });
                      }
                    }}
                  >
                    <LinearGradient
                      colors={GRADIENT_COLORS.primary as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Heart size={18} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 🔥 BOTTOM INTENT ROW */}
              {user.intent?.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginTop: 14,
                  }}
                >
                  {user.intent.map((item, index) => (
                    <View
                      key={index}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        backgroundColor: "rgba(255,255,255,0.08)",
                        marginRight: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: Theme.colors.primary,
                          fontWeight: "600",
                        }}
                      >
                        {item.charAt(0) + item.slice(1).toLowerCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}

        </ScrollView>

      ) : (
        // Default Profile Card (for Swipe, Friend Requests, List)
        <View style={styles.profileCardContainer}>
          {loading && (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator
                size="large"
                color={Theme.colors.primary}
              />
            </View>
          )}


          {!loading && pendingRequests.length === 0 && (
            <Text style={{ color: "white" }}>
              No pending requests
            </Text>
          )}

          {!loading &&
            pendingRequests.length > 0 && (
              <View style={styles.swipeContainer}>
                <Animated.View
                  style={[
                    styles.profileCard,
                    { transform: [{ translateX: position.x }] },
                  ]}
                  {...panResponder.panHandlers}
                >
                  {/* 👇 Only this wrapper handles tap */}
                  <TouchableOpacity
                    activeOpacity={0.95}
                    style={{ width: "100%", alignItems: "center" }}
                    onPress={() => {
                      if (!currentUser) return;
                      setSelectedUser(currentUser);
                      setShowProfileModal(true);
                    }}
                  >
                    <Image
                      source={{
                        uri:
                          currentUser?.profilePicUrl ||
                          "https://via.placeholder.com/150",
                      }}
                      style={styles.profileImage}
                    />

                    {/* 🔹 NAME */}
<Text
  style={{
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    width: "100%",
    textAlign: "center",
    marginBottom: 8,
  }}
  numberOfLines={1}
>
  {currentUser?.name}
</Text>

{/* 🔹 INTENT PILLS — moved to next line */}
{currentUser?.intent?.length > 0 && (
  <View
    style={{
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginBottom: 12,
    }}
  >
    {currentUser.intent.map((item, index) => (
      <View
        key={index}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: Theme.colors.primary,
          marginHorizontal: 4,
          marginBottom: 6,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            color: Theme.colors.primary,
            fontWeight: "600",
          }}
        >
          {item.charAt(0) + item.slice(1).toLowerCase()}
        </Text>
      </View>
    ))}
  </View>
)}


                    <View style={styles.infoRow}>
                      <View style={styles.infoDot} />
                      <Text style={styles.infoText}>
                        {currentUser?.gender || "N/A"}
                      </Text>

                      <View style={styles.infoDot} />
                      <Text style={styles.infoText}>
                        {currentUser?.location || "Unknown"}
                      </Text>
                    </View>

                    <Text style={styles.tapInstruction}>
                      Tap to view full profile
                    </Text>
                  </TouchableOpacity>

                  {/* 👇 Buttons OUTSIDE TouchableOpacity */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.declineButtonCircle}
                      disabled={actionLoadingId === currentUser?.requestId}
                      onPress={() =>
                        handleAction(
                          currentUser.requestId,
                          "REJECT",
                          currentUser.intent
                        )
                      }
                    >
                      {actionLoadingId === currentUser?.requestId ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <X size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>


                    <TouchableOpacity
                      style={styles.acceptButtonCircle}
                      disabled={actionLoadingId === currentUser?.requestId}
                      onPress={() =>
                        handleAction(
                          currentUser.requestId,
                          "ACCEPT",
                          currentUser.intent
                        )
                      }
                    >
                      <LinearGradient
                        colors={GRADIENT_COLORS.primary as [string, string]}
                        style={styles.acceptButtonGradientCircle}
                      >
                        {actionLoadingId === currentUser?.requestId ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Heart size={20} color="#FFFFFF" />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                  </View>

                  <Text style={styles.buttonInstruction}>
                    Swipe left to reject • Swipe right to accept
                  </Text>
                </Animated.View>
              </View>


            )}


        </View>

      )}

      <ProfileDetailModal
        visible={showProfileModal}
        user={selectedUser}
        onClose={() => setShowProfileModal(false)}
        onAccept={() =>
          handleAction(
            selectedUser.requestId,
            "ACCEPT",
            selectedUser.intent
          )
        }
        onReject={() =>
          handleAction(
            selectedUser.requestId,
            "REJECT",
            selectedUser.intent
          )
        }
        loading={actionLoadingId === selectedUser?.requestId}
      />



      <ComingSoon visible={showComingSoon} onClose={() => setShowComingSoon(false)} />
    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  tabButton: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
  },
  gradientActive: {
    borderColor: "transparent",
  },
  toggleInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabIcon: {
    marginRight: 8,
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  tabTextInactive: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
  },
  viewModeContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  viewModeButton: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
  },

  // Profile Card (Swipe View)
  profileCardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0,
    marginTop: 20, // Add margin to prevent overlap with top buttons
  },


  // Crossed Paths
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  crossedPathCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  crossedPathImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  crossedPathInfo: {
    flex: 1,
  },
  crossedPathName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  crossedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#a9016d",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  crossedBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  crossedPathDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  crossedPathDetailText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  interestTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "transparent",
  },
  interestText: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  crossedPathActionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "transparent",
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  connectButton: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  connectButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  connectButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },

  // List View
  listScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(169, 1, 109, 0.15)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  listCardImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  listCardInfo: {
    flex: 1,
    marginRight: 12,
  },
  listCardName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  listCardDetails: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  listCardButtons: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  listDeclineButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  listAcceptButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  listAcceptButtonGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  nextCard: {
    position: "absolute",
    top: 40,
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
    zIndex: -1,
  },
  swipeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

profileCard: {
  width: "84%",          // earlier 92%
  borderRadius: 26,
  backgroundColor: "#2C1F3F",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.18)",
  paddingVertical: 28,   // earlier 40
  paddingHorizontal: 20, // earlier 28
  alignItems: "center",
},


profileImage: {
  width: 110,   // was 140
  height: 110,
  borderRadius: 55,
  borderWidth: 2,
  borderColor: "rgba(255,255,255,0.25)",
  marginBottom: 14,
},


  profileName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },


  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  infoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D633A6",
    marginHorizontal: 6,
  },

  infoText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },

tapInstruction: {
  fontSize: 11,
  color: "rgba(255,255,255,0.6)",
  marginBottom: 18, // earlier 26
},

actionButtons: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 20,          // earlier 28
  marginBottom: 12,
},


declineButtonCircle: {
  width: 48,   // earlier 56
  height: 48,
  borderRadius: 24,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.4)",
  alignItems: "center",
  justifyContent: "center",
},

acceptButtonCircle: {
  width: 48,
  height: 48,
  borderRadius: 24,
  overflow: "hidden",
},

  acceptButtonGradientCircle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonInstruction: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 6,
  },

});

