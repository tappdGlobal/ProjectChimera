// src/screens/ReconnectScreen.tsx

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  PanResponder,
} from "react-native";
import { Heart, MapPin, Layers, LayoutGrid, X, Eye, MessageCircle, Clock, UserPlus, ArrowLeft, Briefcase, GraduationCap } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme, GRADIENT_COLORS } from "../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import Modal from "react-native-modal";
import ComingSoon from "../components/common/ComingSoon";
import { useAuthStore } from "../store/authStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, 400);
const STACK_SIZE = 3;
const WHEEL_PEEK_Y = 18;
const WHEEL_PEEK_X = 14;
const WHEEL_SCALE_STEP = 0.06;
const SWIPE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 0.35;

// Dummy cards for guest (nobody logged in) to test swipe
const DUMMY_SWIPE_CARDS = [
  {
    id: "d1",
    name: "Alex Morgan",
    gender: "Female",
    age: 26,
    location: "SKY LOUNGE",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=face&fit=crop&w=400&h=400",
    bio: "Product designer and coffee lover. Always up for rooftop events.",
    interests: ["Design", "Coffee", "Travel"],
    occupation: "Product Designer",
    education: "BDes",
    events: 28,
    mutualFriends: 2,
    photos: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=face&fit=crop&w=400&h=400"],
  },
  {
    id: "d2",
    name: "Jordan Lee",
    gender: "Male",
    age: 29,
    location: "DOWNTOWN BAR",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=face&fit=crop&w=400&h=400",
    bio: "Music and tech. Love live gigs and meetups.",
    interests: ["Music", "Tech", "Startups"],
    occupation: "Software Engineer",
    education: "BTech",
    events: 35,
    mutualFriends: 4,
    photos: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=face&fit=crop&w=400&h=400"],
  },
  {
    id: "d3",
    name: "Sam Taylor",
    gender: "Non-binary",
    age: 25,
    location: "JAZZ CAFE",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=face&fit=crop&w=400&h=400",
    bio: "Jazz and poetry nights. Always exploring new spots.",
    interests: ["Jazz", "Writing", "Art"],
    occupation: "Writer",
    education: "BA English",
    events: 19,
    mutualFriends: 3,
    photos: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=face&fit=crop&w=400&h=400"],
  },
];

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

/** Shape expected for swipe/list cards. Map API responses to this for real-time data. */
export type ListUser = (typeof listData)[0];

export function ReconnectScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [activeButton, setActiveButton] = useState<"friendRequests" | "crossedPaths" | "swipe" | "list">("swipe");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalTab, setModalTab] = useState<"about" | "photos">("about");
  const [hoverButton, setHoverButton] = useState<null | "friendRequests" | "crossedPaths" | "swipe" | "list">(null);
  const [hoveredConnectButton, setHoveredConnectButton] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ListUser | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [swipeDeck, setSwipeDeck] = useState<ListUser[]>([]);
  const swipeOutAnim = useRef(new Animated.Value(0)).current;
  const cardPanX = useRef(new Animated.Value(0)).current;
  const goToNextCardRef = useRef<(dir: "left" | "right") => void>(() => {});
  const topCardUserRef = useRef<ListUser | null>(null);
  const openProfileModalRef = useRef<() => void>(() => {});

  // Data source: replace with API when ready (e.g. profiles from GET /reconnect/profiles).
  // Swipe logic only needs an array of ListUser; accept/reject can then call POST to persist.
  const fullDeck: ListUser[] = isAuthenticated ? listData : (DUMMY_SWIPE_CARDS as ListUser[]);

  useEffect(() => {
    if (activeButton === "swipe") {
      const source = isAuthenticated ? listData : (DUMMY_SWIPE_CARDS as ListUser[]);
      setSwipeDeck((prev) => (prev.length === 0 ? [...source] : prev));
    }
  }, [activeButton, isAuthenticated]);

  const goToNextCard = (direction: "left" | "right") => {
    if (swipeDeck.length === 0) return;
    cardPanX.setValue(0);
    Animated.spring(swipeOutAnim, {
      toValue: direction === "left" ? -1 : 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 0,
    }).start(() => {
      swipeOutAnim.setValue(0);
      setSwipeDeck((prev) => {
        const next = prev.slice(1);
        if (next.length === 0) return [...fullDeck];
        return next;
      });
    });
  };
  goToNextCardRef.current = goToNextCard;

  const cardPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, { dx }) => Math.abs(dx) > 8,
        onPanResponderMove: (_, { dx }) => {
          cardPanX.setValue(dx);
        },
        onPanResponderRelease: (_, { dx, vx, dy }) => {
          const shouldSwipeLeft = dx < -SWIPE_THRESHOLD || vx < -SWIPE_VELOCITY_THRESHOLD;
          const shouldSwipeRight = dx > SWIPE_THRESHOLD || vx > SWIPE_VELOCITY_THRESHOLD;
          const isTap = Math.abs(dx) < 25 && Math.abs(dy) < 25;
          if (shouldSwipeLeft) {
            goToNextCardRef.current("left");
          } else if (shouldSwipeRight) {
            goToNextCardRef.current("right");
          } else if (isTap) {
            openProfileModalRef.current();
          } else {
            Animated.spring(cardPanX, {
              toValue: 0,
              useNativeDriver: true,
              speed: 24,
              bounciness: 8,
            }).start();
          }
        },
      }),
    []
  );

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
        // Swipe / Friend Requests: stack of cards, remove on accept/reject, circular reset when empty
        <ScrollView
          style={styles.swipeScrollView}
          contentContainerStyle={styles.swipeScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileCardContainer}>
            <View style={[styles.swipeStack, { width: CARD_WIDTH }]}>
              {swipeDeck.length === 0 ? (
                <View style={styles.emptyDeckPlaceholder}>
                  <Text style={styles.emptyDeckText}>No profiles right now</Text>
                  <Text style={styles.emptyDeckSubtext}>Check back later</Text>
                </View>
              ) : (
              Array.from({ length: Math.min(STACK_SIZE, swipeDeck.length) }).map((_, stackPos) => {
              const user = swipeDeck[stackPos];
              const isTop = stackPos === 0;
              const scale = 1 - stackPos * WHEEL_SCALE_STEP;
              const translateY = stackPos * WHEEL_PEEK_Y;
              const translateX = stackPos * WHEEL_PEEK_X;
              const zIndex = STACK_SIZE - stackPos;

              const cardBody = (
                <>
                  <Image source={{ uri: user.image }} style={styles.profileImage} />
                  <Text style={styles.profileName}>{user.name}</Text>
                  <View style={styles.infoRow}>
                    <View style={styles.infoDot} />
                    <Text style={styles.infoText}>{user.gender}</Text>
                    <View style={styles.infoDot} />
                    <Text style={styles.infoText}>{user.location}</Text>
                  </View>
                  <Text style={styles.tapInstruction}>Tap to view full profile</Text>
                </>
              );

              const cardActions = isTop && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.declineButtonCircle}
                    onPress={() => goToNextCard("left")}
                  >
                    <X size={24} color="#1A1535" strokeWidth={2.5} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptButtonCircle}
                    onPress={() => goToNextCard("right")}
                  >
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
              );

              if (isTop) {
                topCardUserRef.current = user;
                openProfileModalRef.current = () => {
                  setSelectedUser(user);
                  setShowProfileModal(true);
                };
                const slideX = swipeOutAnim.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [-CARD_WIDTH, 0, CARD_WIDTH],
                });
                const opacity = swipeOutAnim.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [0, 1, 0],
                });
                const translateX = Animated.add(cardPanX, slideX);
                const rotate = cardPanX.interpolate({
                  inputRange: [-CARD_WIDTH / 2, 0, CARD_WIDTH / 2],
                  outputRange: ["-8deg", "0deg", "8deg"],
                });
                return (
                  <Animated.View
                    key={`${user.id}-${stackPos}-top`}
                    style={[
                      styles.profileCard,
                      styles.swipeCardLayer,
                      styles.swipeCardShadow,
                      {
                        zIndex,
                        transform: [
                          { translateY: 0 },
                          { translateX },
                          { scale: 1 },
                          { rotate },
                        ],
                        opacity,
                      },
                    ]}
                  >
                    <View style={styles.swipeCardTapArea} {...cardPanResponder.panHandlers}>
                      {cardBody}
                    </View>
                    {cardActions}
                  </Animated.View>
                );
              }

              return (
                <View
                  key={`${user.id}-${stackPos}`}
                  style={[
                    styles.profileCard,
                    styles.swipeCardLayer,
                    styles.swipeCardShadow,
                    {
                      zIndex,
                      transform: [
                        { translateY },
                        { translateX },
                        { scale },
                      ],
                    },
                  ]}
                  pointerEvents="none"
                >
                  {cardBody}
                </View>
              );
            })
              )}
          </View>
          <Text style={styles.buttonInstruction}>Use the buttons to accept or decline</Text>
        </View>
        </ScrollView>
      )}

      {/* Profile Modal Pop-up */}
      <Modal
        isVisible={showProfileModal}
        onBackdropPress={() => setShowProfileModal(false)}
        backdropOpacity={0.75}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={280}
        animationOutTiming={220}
        hasBackdrop={true}
        coverScreen={true}
        useNativeDriver={true}
        style={styles.modal}
        avoidKeyboard={true}
      >
        <View style={styles.modalContainer} pointerEvents="box-none">
          <View style={styles.modalCardNew} pointerEvents="auto">
            <ScrollView style={styles.modalScrollViewNew} showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContentNew}>
              <LinearGradient
                colors={GRADIENT_COLORS.primary as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalHeaderNew}
              >
                <View style={styles.modalHeaderButtonsRow}>
                  <TouchableOpacity onPress={() => setShowProfileModal(false)} style={styles.modalHeaderButtonNew}>
                    <ArrowLeft size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowProfileModal(false)} style={styles.modalHeaderButtonNew}>
                    <X size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              <View style={styles.profileImageWrapper}>
                <Image
                  source={{ uri: selectedUser?.image || "https://images.unsplash.com/photo-1615338437154-3b752f3e1a6f?crop=face&fit=crop&w=400&h=400" }}
                  style={styles.modalProfileImageNew}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.modalUserInfoNew}>
                <Text style={styles.modalUserNameNew}>{selectedUser?.name || "Claudia Alves"}</Text>
                <Text style={styles.modalUserDetailsNew}>{selectedUser?.age || 24} years old • {selectedUser?.gender || "Female"}</Text>
                <View style={styles.modalLocationRowNew}>
                  <MapPin size={14} color={Theme.colors.primary} />
                  <Text style={styles.modalLocationTextNew}>{selectedUser?.location || "MATCHA CLUB"}</Text>
                </View>
                <View style={styles.modalStatsNew}>
                  <View style={styles.statItemNew}>
                    <Text style={styles.statNumberNew}>{selectedUser?.events ?? 42}</Text>
                    <Text style={styles.statLabelNew}>Events</Text>
                  </View>
                  <View style={styles.statItemNew}>
                    <Text style={styles.statNumberNew}>{selectedUser?.mutualFriends ?? 5}</Text>
                    <Text style={styles.statLabelNew}>Mutual Friends</Text>
                  </View>
                </View>
                <View style={styles.modalActionButtonsNew}>
                  <TouchableOpacity style={styles.modalDeclineButtonNew}>
                    <X size={18} color="#FFFFFF" />
                    <Text style={styles.modalDeclineButtonTextNew}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalAcceptButtonNew}>
                    <LinearGradient
                      colors={GRADIENT_COLORS.primary as [string, string, ...string[]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.modalAcceptButtonGradientNew}
                    >
                      <Heart size={18} color="#FFFFFF" fill="#FFFFFF" />
                      <Text style={styles.modalAcceptButtonTextNew}>Accept</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                <View style={styles.modalTabsNew}>
                  <TouchableOpacity style={styles.modalTabNew} onPress={() => setModalTab("about")}>
                    <Text style={[styles.modalTabTextNew, modalTab === "about" && styles.modalTabTextActiveNew]}>About</Text>
                    {modalTab === "about" && <View style={styles.modalTabUnderlineNew} />}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalTabNew} onPress={() => setModalTab("photos")}>
                    <Text style={[styles.modalTabTextNew, modalTab === "photos" && styles.modalTabTextActiveNew]}>Photos</Text>
                    {modalTab === "photos" && <View style={styles.modalTabUnderlineNew} />}
                  </TouchableOpacity>
                </View>
                <View style={styles.tabContentNew}>
                  {modalTab === "about" ? (
                    <View style={styles.aboutContentNew}>
                      <View style={styles.aboutSectionNew}>
                        <Text style={styles.aboutTitleNew}>About</Text>
                        <Text style={styles.aboutTextNew}>{selectedUser?.bio || "Coffee enthusiast and digital nomad. Love exploring new cafes and meeting interesting people."}</Text>
                      </View>
                      <View style={styles.aboutSectionNew}>
                        <Text style={styles.aboutTitleNew}>Interests</Text>
                        <View style={styles.interestsGridNew}>
                          {(selectedUser?.interests || ["Coffee", "Travel", "Photography", "Yoga"]).map((interest, index) => (
                            <View key={index} style={styles.interestChipNew}>
                              <Text style={styles.interestChipTextNew}>{interest}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      <View style={styles.detailRowNew}>
                        <View style={styles.detailIconContainerNew}>
                          <Briefcase size={18} color="#FFFFFF" />
                        </View>
                        <View style={styles.detailTextContainerNew}>
                          <Text style={styles.detailLabelNew}>Occupation</Text>
                          <Text style={styles.detailValueNew}>{selectedUser?.occupation || "UX Designer"}</Text>
                        </View>
                      </View>
                      <View style={styles.detailRowNew}>
                        <View style={styles.detailIconContainerNew}>
                          <GraduationCap size={18} color="#FFFFFF" />
                        </View>
                        <View style={styles.detailTextContainerNew}>
                          <Text style={styles.detailLabelNew}>Education</Text>
                          <Text style={styles.detailValueNew}>{selectedUser?.education || "BFA Graphic Design"}</Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.photosContentNew}>
                      <View style={styles.photosGridNew}>
                        {(selectedUser?.photos?.length ? selectedUser.photos : selectedUser?.image ? [selectedUser.image] : []).map((photo, index) => (
                          <Image key={index} source={{ uri: photo }} style={styles.photoItemNew} resizeMode="cover" />
                        ))}
                      </View>
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
  swipeScrollView: {
    flex: 1,
  },
  swipeScrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  profileCardContainer: {
    flex: 1,
    minHeight: 440,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  emptyDeckPlaceholder: {
    padding: 40,
    alignItems: "center",
  },
  emptyDeckText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  emptyDeckSubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  swipeStack: {
    height: 460,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  swipeCardLayer: {
    position: "absolute",
    top: 0,
  },
  swipeCardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  swipeCardTapArea: {
    alignItems: "center",
    alignSelf: "stretch",
    flex: 1,
    minHeight: 280,
  },
  profileCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(30, 25, 55, 0.98)",
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
    color: "rgba(255, 255, 255, 0.85)",
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
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(20, 18, 40, 0.9)",
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
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalCardNew: {
    width: "100%",
    maxWidth: 380,
    minHeight: 420,
    maxHeight: "85%",
    backgroundColor: "#0D0D1A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeaderNew: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 56,
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
    marginTop: -52,
    marginBottom: 16,
    zIndex: 10,
  },
  modalProfileImageNew: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
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
    color: "#FFFFFF",
    fontWeight: "600",
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
    borderColor: "rgba(160, 32, 160, 0.5)",
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
    left: "20%",
    right: "20%",
    height: 3,
    backgroundColor: Theme.colors.primary,
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
    backgroundColor: "rgba(26, 21, 53, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(160, 32, 160, 0.4)",
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
    marginBottom: 16,
  },
  detailIconContainerNew: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(160, 32, 160, 0.2)",
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
