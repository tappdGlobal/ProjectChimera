// src/screens/NotificationsScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import {
  ArrowLeft,
  ChevronDown,
  X,
  Calendar,
  MapPin,
  MessageCircle,
  Users,
  Star,
  Bell,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../styles/Theme";

// Migrated UI Components
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/Collapsible";
import { useAnalytics } from "../hooks/useAnalytics";

// --- TYPES & MOCK DATA ---

interface BaseNotification {
  id: string;
  timestamp: string;
  read: boolean;
}

interface EventNotification extends BaseNotification {
  type: "recommended" | "wishlisted" | "booked";
  eventName: string;
  eventId: string;
  date: string;
  location: string;
  bookedDetails?: string; // Special field for the green text
}

interface ChatNotification extends BaseNotification {
  type: "chat";
  userName: string;
  userAvatar: string;
  chatId: string;
  lastMessage: string;
}

interface ReconnectNotification extends BaseNotification {
  type: "reconnect";
  title: string;
  subtitle: string;
  userAvatar: string;
}

interface EventInteractionNotification extends BaseNotification {
  type: "event_interaction";
  userName: string;
  userAvatar: string;
  eventName: string;
  eventId: string;
  interactionType: "New Post" | "New Match";
  content: string;
}

interface HostNotification extends BaseNotification {
  type: "host";
  subType: "Event Posted" | "Ongoing Event" | "Upcoming Event";
  eventName: string;
  eventId: string;
  details: string;
}

type AnyNotification =
  | EventNotification
  | ChatNotification
  | ReconnectNotification
  | EventInteractionNotification
  | HostNotification;

const AVATAR_PRIYA =
  "https://images.unsplash.com/photo-1494790108755-2616b812b833?w=100&h=100&fit=crop&crop=face";
const AVATAR_VIKRAM =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face";
const AVATAR_EMMA =
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face";
const AVATAR_MICHAEL =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face";
const AVATAR_SARAH =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face";
const AVATAR_ADITI =
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face";
const AVATAR_ROHAN =
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face";

const mockNotificationsData = {
  events: [
    {
      id: "evt-1",
      type: "recommended",
      eventName: "Jazz & Wine Night",
      eventId: "1",
      date: "Dec 23, 2024",
      location: "Blue Note Cafe",
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: "evt-2",
      type: "booked",
      eventName: "Rooftop Pool Party",
      eventId: "2",
      date: "Dec 25, 2024",
      location: "Sky Lounge",
      timestamp: "1 day ago",
      read: true,
      bookedDetails: "Booked on Dec 20, 2024 at 3:30 PM for 2 people",
    },
    {
      id: "evt-3",
      type: "wishlisted",
      eventName: "Tech Startup Mixer",
      eventId: "3",
      date: "Dec 28, 2024",
      location: "Innovation Hub",
      timestamp: "2 days ago",
      read: false,
    },
  ] as EventNotification[],
  eventInteraction: [
    {
      id: "ei-1",
      type: "event_interaction",
      userName: "Priya Sharma",
      userAvatar: AVATAR_PRIYA,
      eventName: "Jazz & Wine Night",
      eventId: "1",
      interactionType: "New Post",
      content: "Just posted amazing photos from the jazz session!",
      timestamp: "30 minutes ago",
      read: false,
    },
    {
      id: "ei-2",
      type: "event_interaction",
      userName: "Vikram Patel",
      userAvatar: AVATAR_VIKRAM,
      eventName: "Rooftop Pool Party",
      eventId: "2",
      interactionType: "New Match",
      content: "You have a new connection match!",
      timestamp: "2 hours ago",
      read: false,
    },
  ] as EventInteractionNotification[],
  chat: [
    {
      id: "chat-1",
      type: "chat",
      userName: "Emma Johnson",
      userAvatar: AVATAR_EMMA,
      chatId: "1",
      lastMessage: "Looking forward to the jazz night!",
      timestamp: "5 minutes ago",
      read: false,
    },
    {
      id: "chat-2",
      type: "chat",
      userName: "Michael Chen",
      userAvatar: AVATAR_MICHAEL,
      chatId: "2",
      lastMessage: "Great meeting you at the pool party",
      timestamp: "20 minutes ago",
      read: false,
    },
    {
      id: "chat-3",
      type: "chat",
      userName: "Sarah Williams",
      userAvatar: AVATAR_SARAH,
      chatId: "3",
      lastMessage: "The concert was amazing! 🎵",
      timestamp: "1 hour ago",
      read: false,
    },
  ] as ChatNotification[],
  reconnect: [
    {
      id: "rc-1",
      type: "reconnect",
      title: "New Connection Request",
      subtitle: "You have a request from Aditi Gupta",
      userAvatar: AVATAR_ADITI,
      timestamp: "15 minutes ago",
      read: false,
    },
    {
      id: "rc-2",
      type: "reconnect",
      title: "New Connection Request",
      subtitle: "You have a request from Rohan Malhotra",
      userAvatar: AVATAR_ROHAN,
      timestamp: "3 hours ago",
      read: false,
    },
  ] as ReconnectNotification[],
  host: [
    {
      id: "host-1",
      type: "host",
      subType: "Upcoming Event",
      eventName: "Private House Party",
      eventId: "1",
      details: "Your event starts in 2 days - 45 people registered",
      timestamp: "1 hour ago",
      read: false,
    },
    {
      id: "host-2",
      type: "host",
      subType: "Event Posted",
      eventName: "Wine Tasting Evening",
      eventId: "2",
      details: "Your event has been approved and is now live!",
      timestamp: "6 hours ago",
      read: false,
    },
    {
      id: "host-3",
      type: "host",
      subType: "Ongoing Event",
      eventName: "Business Networking Mixer",
      eventId: "3",
      details: "Event is currently ongoing - 23 attendees checked in",
      timestamp: "2 hours ago",
      read: false,
    },
  ] as HostNotification[],
};

export function NotificationsScreen() {
  const navigation = useNavigation();
  useAnalytics("NotificationsScreen");
  const [notifications, setNotifications] = useState(mockNotificationsData);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    events: true,
    eventInteraction: true,
    chat: true,
    reconnect: true,
    host: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const dismissNotification = (
    category: keyof typeof notifications,
    notificationId: string,
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [category]: prev[category].filter(
        (notification) => notification.id !== notificationId,
      ),
    }));
  };

  const getUnreadCount = (categoryNotifications: AnyNotification[]): number => {
    return categoryNotifications.filter((n) => !n.read).length;
  };

  const getTotalUnreadCount = (): number => {
    return Object.values(notifications)
      .flat()
      .filter((n) => !n.read).length;
  };

  // --- HANDLERS (for future implementation) ---
  const handleEventClick = (notification: EventNotification) => {
    // Navigate to EventDetails if it's the specific event, or generic for now
    if (notification.eventName === "Jazz & Wine Night") {
      navigation.navigate("EventDetailsScreen" as never);
    } else {
      Alert.alert("Action", `View Event: ${notification.eventName}`);
    }
  };

  // --- HELPER COMPONENTS ---

  const getBadgeStyle = (
    type: string,
  ): { backgroundColor: string; color: string } => {
    switch (type) {
      case "recommended":
      case "Upcoming Event":
        return { backgroundColor: "rgba(59, 130, 246, 0.2)", color: "#60A5FA" }; // Blue
      case "booked":
      case "Ongoing Event":
        return { backgroundColor: "rgba(34, 197, 94, 0.2)", color: "#4ADE80" }; // Green
      case "wishlisted":
        return { backgroundColor: "rgba(234, 179, 8, 0.2)", color: "#FACC15" }; // Yellow
      case "post":
      case "New Post":
      case "Event Posted":
        return {
          backgroundColor: "rgba(168, 85, 247, 0.2)",
          color: "#A855F7",
        }; // Purple
      case "match":
      case "New Match":
        return {
          backgroundColor: "rgba(236, 72, 153, 0.2)",
          color: "#F472B6",
        }; // Pink
      default:
        return {
          backgroundColor: Theme.colors.muted,
          color: Theme.colors.mutedForeground,
        };
    }
  };

  const NotificationCard = ({
    children,
    onDismiss,
    read = false,
    onClick,
  }: {
    children: React.ReactNode;
    onDismiss: () => void;
    read?: boolean;
    onClick?: () => void;
  }) => (
    <Card
      style={[
        styles.notificationCardBase,
        !read ? styles.notificationCardUnread : {},
      ]}
      onClick={onClick}
    >
      <CardContent style={styles.notificationCardContent}>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          style={styles.dismissButton}
        >
          <X size={16} color={Theme.colors.mutedForeground} />
        </TouchableOpacity>
        {children}
      </CardContent>
    </Card>
  );

  const renderSectionHeader = (
    title: string,
    key: string,
    icon: React.ReactNode,
    categoryData: AnyNotification[],
  ) => {
    const unreadCount = getUnreadCount(categoryData);
    return (
      <Collapsible
        key={key}
        open={openSections[key]}
        onOpenChange={() => toggleSection(key)}
      >
        <CollapsibleTrigger>
          <View style={styles.collapsibleTrigger}>
            <View style={styles.triggerLeft}>
              {icon}
              <Text style={styles.collapsibleText}>{title}</Text>
              {unreadCount > 0 && (
                <Badge style={styles.inlineUnreadBadge}>
                  <Text style={styles.inlineUnreadBadgeText}>
                    {unreadCount}
                  </Text>
                </Badge>
              )}
            </View>
            <ChevronDown size={16} color={Theme.colors.mutedForeground} />
          </View>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <View style={styles.collapsibleContent}>
            {/* Render content based on key */}

            {/* EVENTS */}
            {key === "events" &&
              (categoryData as EventNotification[]).map((n) => (
                <NotificationCard
                  key={n.id}
                  read={n.read}
                  onDismiss={() => dismissNotification("events", n.id)}
                  onClick={() => handleEventClick(n)}
                >
                  <View style={styles.contentLayout}>
                    <Text style={styles.cardHeaderTitle}>{n.eventName}</Text>
                    <Text style={styles.cardHeaderTime}>{n.timestamp}</Text>
                  </View>
                  <View style={styles.contentLayoutInfo}>
                    <Calendar size={14} color={Theme.colors.mutedForeground} />
                    <Text style={styles.cardInfoText}>{n.date}</Text>
                  </View>
                  <View style={styles.contentLayoutInfo}>
                    <MapPin size={14} color={Theme.colors.mutedForeground} />
                    <Text style={styles.cardInfoText}>{n.location}</Text>
                  </View>
                  {/* Booked custom text */}
                  {n.type === "booked" && n.bookedDetails && (
                    <Text style={styles.bookedText}>{n.bookedDetails}</Text>
                  )}
                  <Badge
                    style={[styles.inlineBadge, getBadgeStyle(n.type)]}
                    variant="outline"
                  >
                    <Text
                      style={{
                        color: getBadgeStyle(n.type).color,
                        fontSize: 12,
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}
                    >
                      {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
                    </Text>
                  </Badge>
                </NotificationCard>
              ))}

            {/* EVENT INTERACTION */}
            {key === "eventInteraction" &&
              (categoryData as EventInteractionNotification[]).map((n) => (
                <NotificationCard
                  key={n.id}
                  read={n.read}
                  onDismiss={() =>
                    dismissNotification("eventInteraction", n.id)
                  }
                >
                  <View style={styles.row}>
                    <Image
                      source={{ uri: n.userAvatar }}
                      style={styles.avatar}
                    />
                    <View style={styles.flex1}>
                      <View style={styles.contentLayout}>
                        <Text style={styles.cardHeaderTitle}>{n.userName}</Text>
                        <Text style={styles.cardHeaderTime}>{n.timestamp}</Text>
                      </View>
                      <Text style={styles.cardInfoText}>{n.content}</Text>
                      <Text
                        style={[
                          styles.cardInfoText,
                          { color: Theme.colors.primary, marginTop: 4 },
                        ]}
                      >
                        in {n.eventName}
                      </Text>
                      <Badge
                        style={[
                          styles.inlineBadge,
                          getBadgeStyle(n.interactionType),
                        ]}
                      >
                        <Text
                          style={{
                            color: getBadgeStyle(n.interactionType).color,
                            fontSize: 12,
                          }}
                        >
                          {n.interactionType}
                        </Text>
                      </Badge>
                    </View>
                  </View>
                </NotificationCard>
              ))}

            {/* CHAT */}
            {key === "chat" &&
              (categoryData as ChatNotification[]).map((n) => (
                <NotificationCard
                  key={n.id}
                  read={n.read}
                  onDismiss={() => dismissNotification("chat", n.id)}
                >
                  <View style={styles.row}>
                    <Image
                      source={{ uri: n.userAvatar }}
                      style={styles.avatar}
                    />
                    <View style={styles.flex1}>
                      <View style={styles.contentLayout}>
                        <Text style={styles.cardHeaderTitle}>{n.userName}</Text>
                        <Text style={styles.cardHeaderTime}>{n.timestamp}</Text>
                      </View>
                      <Text
                        style={[
                          styles.cardInfoText,
                          { color: Theme.colors.foreground, marginTop: 4 },
                        ]}
                      >
                        {n.lastMessage}
                      </Text>
                    </View>
                  </View>
                </NotificationCard>
              ))}

            {/* RECONNECT */}
            {key === "reconnect" &&
              (categoryData as ReconnectNotification[]).map((n) => (
                <NotificationCard
                  key={n.id}
                  read={n.read}
                  onDismiss={() => dismissNotification("reconnect", n.id)}
                >
                  <View style={styles.row}>
                    <Image
                      source={{ uri: n.userAvatar }}
                      style={styles.avatar}
                    />
                    <View style={styles.flex1}>
                      <View style={styles.contentLayout}>
                        <Text style={styles.cardHeaderTitle}>{n.title}</Text>
                        <Text style={styles.cardHeaderTime}>{n.timestamp}</Text>
                      </View>
                      <Text style={styles.cardInfoText}>{n.subtitle}</Text>
                    </View>
                  </View>
                </NotificationCard>
              ))}

            {/* HOST */}
            {key === "host" &&
              (categoryData as HostNotification[]).map((n) => (
                <NotificationCard
                  key={n.id}
                  read={n.read}
                  onDismiss={() => dismissNotification("host", n.id)}
                >
                  <View style={styles.contentLayout}>
                    <Text style={styles.cardHeaderTitle}>{n.eventName}</Text>
                    <Text style={styles.cardHeaderTime}>{n.timestamp}</Text>
                  </View>
                  <Text style={styles.cardInfoText}>{n.details}</Text>
                  <Badge style={[styles.inlineBadge, getBadgeStyle(n.subType)]}>
                    <Text
                      style={{
                        color: getBadgeStyle(n.subType).color,
                        fontSize: 12,
                      }}
                    >
                      {n.subType}
                    </Text>
                  </Badge>
                </NotificationCard>
              ))}
          </View>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // --- MAIN RENDER ---
  return (
    <SafeAreaView style={styles.flex1} edges={["top"]}>
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.mainHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={Theme.colors.foreground} />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.mainHeaderTitle}>Notifications</Text>
            {getTotalUnreadCount() > 0 && (
              <Badge style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {getTotalUnreadCount()}
                </Text>
              </Badge>
            )}
          </View>

          <View style={styles.w10} />
        </View>

        {/* Notifications Content */}
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollPadding}
        >
          {renderSectionHeader(
            "Events",
            "events",
            <Calendar size={20} color={Theme.colors.primary} />,
            notifications.events,
          )}
          {renderSectionHeader(
            "Event Interaction",
            "eventInteraction",
            <Users size={20} color={Theme.colors.primary} />,
            notifications.eventInteraction,
          )}
          {renderSectionHeader(
            "Chat",
            "chat",
            <MessageCircle size={20} color={Theme.colors.primary} />,
            notifications.chat,
          )}
          {renderSectionHeader(
            "Reconnect",
            "reconnect",
            <Users size={20} color={Theme.colors.primary} />,
            notifications.reconnect,
          )}
          {renderSectionHeader(
            "Host",
            "host",
            <Star size={20} color={Theme.colors.primary} />,
            notifications.host,
          )}

          {/* --- Empty State --- */}
          {getTotalUnreadCount() === 0 &&
            Object.values(notifications).flat().length === 0 && (
              <View style={styles.emptyState}>
                <Bell
                  size={32}
                  color={Theme.colors.mutedForeground}
                  style={styles.emptyStateIcon}
                />
                <Text style={styles.emptyStateTitle}>No notifications yet</Text>
              </View>
            )}

          <View style={styles.safeBottom} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  flex1: { flex: 1 },
  mainContainer: { flex: 1, backgroundColor: Theme.colors.background },
  scrollPadding: { padding: 16, gap: 12 },
  w10: { width: 40 },
  safeBottom: { height: 80 },

  // Header
  mainHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  backButton: { padding: 8, borderRadius: 9999 },
  headerTitleGroup: { flexDirection: "row", alignItems: "center", gap: 12 },
  mainHeaderTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "bold",
  },
  unreadBadge: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 0,
  },
  unreadBadgeText: {
    color: Theme.colors.foreground,
    fontSize: 12,
    fontWeight: "bold",
  },

  // Collapsible Trigger
  collapsibleTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    width: "100%",
  },
  triggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  collapsibleText: {
    color: Theme.colors.foreground,
    fontWeight: "600",
    marginLeft: 12,
    fontSize: 16,
  },
  collapsibleContent: { paddingHorizontal: 4, marginTop: 8, gap: 12 },
  inlineUnreadBadge: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderWidth: 0,
    marginLeft: 8,
  },
  inlineUnreadBadgeText: {
    color: Theme.colors.foreground,
    fontSize: 12,
    fontWeight: "bold",
  },

  // Notification Card
  notificationCardBase: {
    backgroundColor: Theme.colors.muted, // Keep default dark card
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: Theme.radius.lg,
  },
  notificationCardUnread: {
    // Optional
  },
  notificationCardContent: { padding: 16, position: "relative" },
  dismissButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
    borderRadius: 9999,
    zIndex: 10,
  },

  // Card Content Layout
  row: {
    flexDirection: "row",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.muted,
  },
  contentLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingRight: 30, // Make room for dismiss button
    marginBottom: 4,
  },
  cardHeaderTitle: {
    color: Theme.colors.foreground,
    fontWeight: "bold",
    flexShrink: 1,
    fontSize: 16,
    marginBottom: 4,
  },
  cardHeaderTime: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
  contentLayoutInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  cardInfoText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    flexShrink: 1,
  },

  // Booked Text
  bookedText: {
    color: "#22c55e", // Green-500
    fontSize: 14,
    marginTop: 8,
    fontWeight: "500",
  },

  inlineBadge: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyStateIcon: { marginBottom: 16 },
  emptyStateTitle: {
    color: Theme.colors.mutedForeground,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
