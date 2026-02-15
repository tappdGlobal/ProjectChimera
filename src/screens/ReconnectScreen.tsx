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
} from "react-native";
import { Heart, MapPin, Layers, LayoutGrid, X, Eye, MessageCircle, Clock, UserPlus, ArrowLeft, Briefcase, GraduationCap } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme, GRADIENT_COLORS } from "../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import Modal from "react-native-modal";
import ComingSoon from "../components/common/ComingSoon";

// Mock data for List View
const listData = [
  {
    id: "1",
    name: "Claudia Alves",
    gender: "Female",
    age: 24,
    location: "MATCHA CLUB",
    image: "https://images.unsplash.com/photo-1615338437154-3b752f3e1a6f?crop=face&fit=crop&w=400&h=400",
    bio: "Coffee enthusiast and digital nomad. Love exploring new cafes and meeting interesting people.",
    interests: ["Coffee", "Travel", "Photography", "Yoga"],
    occupation: "UX Designer",
    education: "BFA Graphic Design",
    events: 42,
    mutualFriends: 5,
    photos: [
      "https://images.unsplash.com/photo-1615338437154-3b752f3e1a6f?crop=face&fit=crop&w=400&h=400",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=face&fit=crop&w=400&h=400",
    ],
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    gender: "Male",
    age: 28,
    location: "DOWNTOWN LOUNGE",
    image: "https://images.unsplash.com/photo-1633037543479-a70452ea1e12?crop=face&fit=crop&w=400&h=400",
    bio: "Music producer and DJ. Always looking for new sounds and creative collaborations.",
    interests: ["Music", "DJing", "Production", "Nightlife"],
    occupation: "Music Producer",
    education: "BA Music Technology",
    events: 38,
    mutualFriends: 3,
    photos: [
      "https://images.unsplash.com/photo-1633037543479-a70452ea1e12?crop=face&fit=crop&w=400&h=400",
    ],
  },
  {
    id: "3",
    name: "Sofia Chen",
    gender: "Female",
    age: 26,
    location: "ROOFTOP BAR",
    image: "https://images.unsplash.com/photo-1687610265701-1255ece05d75?crop=face&fit=crop&w=400&h=400",
    bio: "Marketing professional by day, cocktail enthusiast by night. Love rooftop vibes.",
    interests: ["Cocktails", "Marketing", "Networking", "Events"],
    occupation: "Marketing Manager",
    education: "MBA Marketing",
    events: 56,
    mutualFriends: 8,
    photos: [
      "https://images.unsplash.com/photo-1687610265701-1255ece05d75?crop=face&fit=crop&w=400&h=400",
    ],
  },
  {
    id: "4",
    name: "David Park",
    gender: "Male",
    age: 25,
    location: "JAZZ CAFE",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=face&fit=crop&w=400&h=400",
    bio: "Jazz musician and music teacher. Love performing at intimate venues and jamming with new artists.",
    interests: ["Jazz", "Piano", "Live Performance", "Teaching", "Vinyl Records"],
    occupation: "Music Teacher",
    education: "BA Music Performance",
    events: 53,
    mutualFriends: 3,
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=face&fit=crop&w=400&h=400",
    ],
  },
  {
    id: "5",
    name: "Emma Wilson",
    gender: "Female",
    age: 27,
    location: "WINE BAR",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=face&fit=crop&w=400&h=400",
    bio: "Wine sommelier and food blogger. Always on the hunt for the perfect pairing.",
    interests: ["Wine", "Food", "Blogging", "Travel"],
    occupation: "Sommelier",
    education: "WSET Level 3",
    events: 34,
    mutualFriends: 6,
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=face&fit=crop&w=400&h=400",
    ],
  },
];

// Mock data for Crossed Paths
const crossedPathsData = [
  {
    id: "1",
    name: "Isabella Martinez",
    age: 25,
    crossedCount: 3,
    location: "Sky Lounge, Mumbai",
    timeAgo: "2 hours ago",
    distance: "5m away",
    interests: ["Jazz", "Art", "Coffee"],
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=face&fit=crop&w=400&h=400",
  },
  {
    id: "2",
    name: "Alex Thompson",
    age: 28,
    crossedCount: 1,
    location: "Central Cafe, Bandra",
    timeAgo: "5 hours ago",
    distance: "10m away",
    interests: ["Tech", "Food"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=face&fit=crop&w=400&h=400",
  },
  {
    id: "3",
    name: "Priya Sharma",
    age: 26,
    crossedCount: 2,
    location: "Innovation Hub, Powai",
    timeAgo: "Yesterday",
    distance: "15m away",
    interests: ["Startup", "Networking", "Yoga"],
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=face&fit=crop&w=400&h=400",
  },
  {
    id: "4",
    name: "Rahul Verma",
    age: 29,
    crossedCount: 5,
    location: "Downtown Club, Lower Parel",
    timeAgo: "2 days ago",
    distance: "20m away",
    interests: ["Music", "Nightlife", "Sports"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=face&fit=crop&w=400&h=400",
  },
];

export function ReconnectScreen() {
  const [activeButton, setActiveButton] = useState<"friendRequests" | "crossedPaths" | "swipe" | "list">("swipe");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalTab, setModalTab] = useState<"about" | "photos">("about");
  const [hoverButton, setHoverButton] = useState<null | "friendRequests" | "crossedPaths" | "swipe" | "list">(null);
  const [hoveredConnectButton, setHoveredConnectButton] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<typeof listData[0] | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

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
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reconnect</Text>

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
      </View>

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
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.listScrollContent}>
          {listData.map((user) => (
            <TouchableOpacity 
              key={user.id} 
              style={styles.listCard}
              onPress={() => {
                setSelectedUser(user);
                setShowProfileModal(true);
              }}
              activeOpacity={0.9}
            >
              <Image source={{ uri: user.image }} style={styles.listCardImage} />
              <View style={styles.listCardInfo}>
                <Text style={styles.listCardName}>{user.name}</Text>
                <Text style={styles.listCardDetails}>
                  {user.gender} • {user.location}
                </Text>
              </View>
              <View style={styles.listCardButtons}>
                <TouchableOpacity style={styles.listDeclineButton}>
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.listAcceptButton}>
                  <LinearGradient
                    colors={GRADIENT_COLORS.primary as [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.listAcceptButtonGradient}
                  >
                    <Heart size={20} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        // Default Profile Card (for Swipe, Friend Requests, List)
        <View style={styles.profileCardContainer}>
          <TouchableOpacity 
            style={styles.profileCard}
            onPress={() => {
              setSelectedUser(listData[0]);
              setShowProfileModal(true);
            }}
            activeOpacity={0.9}
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1615338437154-3b752f3e1a6f?crop=face&fit=crop&w=400&h=400",
              }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>Claudia Alves</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoDot} />
              <Text style={styles.infoText}>Female</Text>
              <View style={styles.infoDot} />
              <Text style={styles.infoText}>MATCHA CLUB</Text>
            </View>
            <Text style={styles.tapInstruction}>Tap to view full profile</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.declineButtonCircle}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButtonCircle}>
                <LinearGradient
                  colors={GRADIENT_COLORS.primary as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.acceptButtonGradientCircle}
                >
                  <Heart size={24} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          <Text style={styles.buttonInstruction}>Use the buttons to accept or decline</Text>
        </View>
      )}

      {/* Profile Modal Pop-up */}
      <Modal
        isVisible={showProfileModal}
        onBackdropPress={() => setShowProfileModal(false)}
        backdropOpacity={0.8}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={200}
        animationOutTiming={200}
        hasBackdrop={true}
        coverScreen={true}
        useNativeDriver={true}
        style={{ margin: 0, padding: 0 }}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.8)" }}>
          <View style={{ width: "90%", maxWidth: 380, maxHeight: "80%", backgroundColor: "#0D0D1A", borderRadius: 20, overflow: "hidden" }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header with Gradient */}
              <LinearGradient
                colors={GRADIENT_COLORS.primary as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 50, alignItems: "center" }}
              >
                {/* Buttons Row */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 10 }}>
                  <TouchableOpacity onPress={() => setShowProfileModal(false)} style={{ padding: 8 }}>
                    <ArrowLeft size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowProfileModal(false)} style={{ padding: 8 }}>
                    <X size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              
              {/* Profile Photo - Overlapping */}
              <View style={{ alignItems: "center", marginTop: -50, marginBottom: 16 }}>
                <Image
                  source={{ uri: selectedUser?.image || "https://images.unsplash.com/photo-1615338437154-3b752f3e1a6f?crop=face&fit=crop&w=400&h=400" }}
                  style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: "#0D0D1A" }}
                  resizeMode="cover"
                />
              </View>

              {/* Content */}
              <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, alignItems: "center" }}>
                {/* Name & Details */}
                <Text style={{ fontSize: 26, fontWeight: "bold", color: "#FFFFFF", marginBottom: 4 }}>{selectedUser?.name || "Claudia Alves"}</Text>
                <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>{selectedUser?.age || 24} years old • {selectedUser?.gender || "Female"}</Text>
                
                {/* Location */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                  <MapPin size={14} color="#E91E8C" />
                  <Text style={{ fontSize: 13, color: "#E91E8C", marginLeft: 4, fontWeight: "600", textTransform: "uppercase" }}>{selectedUser?.location || "MATCHA CLUB"}</Text>
                </View>

                {/* Stats */}
                <View style={{ flexDirection: "row", gap: 40, marginBottom: 20 }}>
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 28, fontWeight: "bold", color: "#FFFFFF" }}>{selectedUser?.events || 42}</Text>
                    <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Events</Text>
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 28, fontWeight: "bold", color: "#FFFFFF" }}>{selectedUser?.mutualFriends || 5}</Text>
                    <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Mutual Friends</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: "row", gap: 12, width: "100%", marginBottom: 20 }}>
                  <TouchableOpacity style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", gap: 6 }}>
                    <X size={18} color="#FFFFFF" />
                    <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "600" }}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, borderRadius: 10, overflow: "hidden" }}>
                    <LinearGradient
                      colors={GRADIENT_COLORS.primary as [string, string, ...string[]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 13, gap: 6 }}
                    >
                      <Heart size={18} color="#FFFFFF" fill="#FFFFFF" />
                      <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "600" }}>Accept</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={{ flexDirection: "row", width: "100%", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" }}>
                  <TouchableOpacity style={{ flex: 1, alignItems: "center", paddingVertical: 12 }} onPress={() => setModalTab("about")}>
                    <Text style={{ fontSize: 15, fontWeight: modalTab === "about" ? "600" : "500", color: modalTab === "about" ? "#FFFFFF" : "rgba(255,255,255,0.6)" }}>About</Text>
                    {modalTab === "about" && <View style={{ position: "absolute", bottom: 0, left: "25%", right: "25%", height: 3, backgroundColor: "#E91E8C", borderRadius: 2 }} />}
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, alignItems: "center", paddingVertical: 12 }} onPress={() => setModalTab("photos")}>
                    <Text style={{ fontSize: 15, fontWeight: modalTab === "photos" ? "600" : "500", color: modalTab === "photos" ? "#FFFFFF" : "rgba(255,255,255,0.6)" }}>Photos</Text>
                    {modalTab === "photos" && <View style={{ position: "absolute", bottom: 0, left: "25%", right: "25%", height: 3, backgroundColor: "#E91E8C", borderRadius: 2 }} />}
                  </TouchableOpacity>
                </View>

                {/* Tab Content */}
                <View style={{ width: "100%", marginTop: 16 }}>
                  {modalTab === "about" ? (
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF", marginBottom: 8 }}>About</Text>
                      <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 22, marginBottom: 16 }}>{selectedUser?.bio || "Coffee enthusiast and digital nomad. Love exploring new cafes and meeting interesting people."}</Text>
                      
                      <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF", marginBottom: 10 }}>Interests</Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                        {(selectedUser?.interests || ["Coffee", "Travel", "Photography", "Yoga"]).map((interest, index) => (
                          <View key={index} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }}>
                            <Text style={{ color: "#FFFFFF", fontSize: 13 }}>{interest}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(233,30,140,0.15)", alignItems: "center", justifyContent: "center" }}>
                          <Briefcase size={18} color="#FFFFFF" />
                        </View>
                        <View>
                          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Occupation</Text>
                          <Text style={{ fontSize: 15, color: "#FFFFFF", fontWeight: "500" }}>{selectedUser?.occupation || "UX Designer"}</Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(233,30,140,0.15)", alignItems: "center", justifyContent: "center" }}>
                          <GraduationCap size={18} color="#FFFFFF" />
                        </View>
                        <View>
                          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Education</Text>
                          <Text style={{ fontSize: 15, color: "#FFFFFF", fontWeight: "500" }}>{selectedUser?.education || "BFA Graphic Design"}</Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      {(selectedUser?.photos || [selectedUser?.image]).map((photo, index) => (
                        <Image key={index} source={{ uri: photo }} style={{ width: "48%", aspectRatio: 1, borderRadius: 8 }} resizeMode="cover" />
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
  },
  tabButtonActive: {
    // kept for compatibility; active uses gradient now
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
  },
  viewModeButton: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
  },
  viewModeButtonActive: {
    // kept for compatibility; active uses gradient now
  },
  profileCardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  profileCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(169, 1, 109, 0.15)",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 24,
  },
  profileName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.primary,
    marginHorizontal: 4,
  },
  infoText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  tapInstruction: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 24,
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 24,
    justifyContent: "center",
  },
  declineButtonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButtonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
  },
  acceptButtonGradientCircle: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonInstruction: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginTop: 16,
  },
  // Crossed Paths Styles
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
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  // List View Styles
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
  // Modal Styles - New Design (Centered like Figma)
  modal: {
    margin: 0,
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalCardNew: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "85%",
    backgroundColor: "#0D0D1A",
    borderRadius: 24,
    overflow: "hidden",
  },
  modalHeaderNew: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 60,
    alignItems: "center",
  },
  modalHeaderButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  modalHeaderButtonNew: {
    padding: 8,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  modalScrollViewNew: {
    flex: 1,
  },
  modalScrollContentNew: {
    paddingBottom: 24,
  },
  profileImageWrapper: {
    alignItems: "center",
    marginTop: -60,
    marginBottom: 16,
    zIndex: 10,
  },
  modalProfileImageNew: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#0D0D1A",
    backgroundColor: "#0D0D1A",
  },
  modalUserInfoNew: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  modalUserNameNew: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  modalUserDetailsNew: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 8,
  },
  modalLocationRowNew: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 6,
  },
  modalLocationTextNew: {
    fontSize: 14,
    color: "#E91E8C",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  modalStatsNew: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 48,
    marginBottom: 24,
  },
  statItemNew: {
    alignItems: "center",
  },
  statNumberNew: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabelNew: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
  },
  modalActionButtonsNew: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
    width: "100%",
    paddingHorizontal: 8,
  },
  modalDeclineButtonNew: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    gap: 8,
  },
  modalDeclineButtonTextNew: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalAcceptButtonNew: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalAcceptButtonGradientNew: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    gap: 8,
  },
  modalAcceptButtonTextNew: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalTabsNew: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    width: "100%",
    marginBottom: 20,
  },
  modalTabNew: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    position: "relative",
  },
  modalTabActiveNew: {
    // Active state handled by underline
  },
  modalTabTextNew: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  modalTabTextActiveNew: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  modalTabUnderlineNew: {
    position: "absolute",
    bottom: 0,
    left: "25%",
    right: "25%",
    height: 3,
    backgroundColor: "#E91E8C",
    borderRadius: 2,
  },
  tabContentNew: {
    width: "100%",
  },
  aboutContentNew: {
    width: "100%",
  },
  aboutSectionNew: {
    marginBottom: 24,
  },
  aboutTitleNew: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  aboutTextNew: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 24,
  },
  interestsGridNew: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  interestChipNew: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  interestChipTextNew: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  detailRowNew: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  detailIconContainerNew: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(233, 30, 140, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailTextContainerNew: {
    flex: 1,
  },
  detailLabelNew: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: 3,
  },
  detailValueNew: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  photosContentNew: {
    width: "100%",
  },
  photosGridNew: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  photoItemNew: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});
});
