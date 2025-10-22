// src/screens/NotificationsScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
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
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/Collapsible";

// --- TYPES & MOCK DATA (Consolidated Mock Data to avoid errors) ---

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
  bookedDetails?: { bookedOn: string; peopleCount: number };
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
  userName: string;
  userAvatar: string;
  userId: string;
}
interface EventInteractionNotification extends BaseNotification {
  type: "event_interaction";
  userName: string;
  userAvatar: string;
  eventName: string;
  eventId: string;
  interactionType: "post" | "match";
  content: string;
}
interface HostNotification extends BaseNotification {
  type: "host";
  subType: "posted" | "ongoing" | "upcoming";
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

const mockNotificationsData = {
  events: [
    {
      id: "evt-1",
      type: "recommended",
      eventName: "Jazz Night",
      eventId: "1",
      date: "Dec 23",
      location: "Cafe",
      timestamp: "2 hours ago",
      read: false,
    },
  ] as EventNotification[],
  eventInteraction: [
    {
      id: "ei-1",
      type: "event_interaction",
      userName: "Priya S",
      userAvatar:
        "https://images.unsplash.com/photo-1494790108755-2616b812b833?w=100&h=100&fit=crop&crop=face",
      eventName: "Jazz Night",
      eventId: "1",
      interactionType: "post",
      content: "Posted photos!",
      timestamp: "30 mins ago",
      read: false,
    },
  ] as EventInteractionNotification[],
  chat: [
    {
      id: "chat-1",
      type: "chat",
      userName: "Emma J",
      userAvatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      chatId: "1",
      lastMessage: "Looking forward!",
      timestamp: "5 mins ago",
      read: false,
    },
  ] as ChatNotification[],
  reconnect: [
    {
      id: "rc-1",
      type: "reconnect",
      userName: "Aditi G",
      userAvatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
      userId: "1",
      timestamp: "15 mins ago",
      read: false,
    },
  ] as ReconnectNotification[],
  host: [
    {
      id: "host-1",
      type: "host",
      subType: "upcoming",
      eventName: "House Party",
      eventId: "1",
      details: "Starts in 2 days",
      timestamp: "1 hour ago",
      read: false,
    },
  ] as HostNotification[],
};

export function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(mockNotificationsData);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    events: true,
    eventInteraction: false,
    chat: false,
    reconnect: false,
    host: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const dismissNotification = (
    category: keyof typeof notifications,
    notificationId: string
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [category]: prev[category].filter(
        (notification) => notification.id !== notificationId
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
    Alert.alert("Action", `View Event: ${notification.eventName}`);
  };
  const handleChatClick = (notification: ChatNotification) => {
    Alert.alert("Action", `Open Chat: ${notification.userName}`);
  };
  const handleReconnectClick = () => {
    Alert.alert("Action", "Open Reconnect Tab");
  };
  const handleEventInteractionClick = (
    notification: EventInteractionNotification
  ) => {
    Alert.alert("Action", `View Interaction for ${notification.eventName}`);
  };
  const handleHostClick = (notification: HostNotification) => {
    Alert.alert("Action", `View Host Details: ${notification.eventName}`);
  };

  // --- SUB COMPONENTS ---

  const getBadgeStyle = (
    type: string
  ): { backgroundColor: string; color: string } => {
    switch (type) {
      case "recommended":
        return { backgroundColor: "rgba(96, 165, 250, 0.2)", color: "#60A5FA" };
      case "booked":
        return { backgroundColor: "rgba(74, 222, 128, 0.2)", color: "#4ADE80" };
      case "wishlisted":
        return { backgroundColor: "rgba(251, 191, 36, 0.2)", color: "#FBBF24" };
      case "post":
        return {
          backgroundColor: "rgba(196, 81, 201, 0.2)",
          color: Theme.colors.primary,
        };
      case "match":
        return {
          backgroundColor: "rgba(255, 105, 180, 0.2)",
          color: "#FF69B4",
        };
      case "upcoming":
        return { backgroundColor: "rgba(96, 165, 250, 0.2)", color: "#60A5FA" };
      case "ongoing":
        return { backgroundColor: "rgba(74, 222, 128, 0.2)", color: "#4ADE80" };
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
        !read && styles.notificationCardUnread,
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
          <X size={12} color={Theme.colors.mutedForeground} />
        </TouchableOpacity>
        {children}
      </CardContent>
    </Card>
  );

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
          {/* --- Events Section --- */}
          <Collapsible
            open={openSections.events}
            onOpenChange={() => toggleSection("events")}
          >
            <CollapsibleTrigger>
              <View style={styles.collapsibleTrigger}>
                <Calendar size={20} color={Theme.colors.primary} />
                <Text style={styles.collapsibleText}>Events</Text>
                {getUnreadCount(notifications.events) > 0 && (
                  <Badge style={styles.inlineUnreadBadge}>
                    <Text style={styles.inlineUnreadBadgeText}>
                      {getUnreadCount(notifications.events)}
                    </Text>
                  </Badge>
                )}
                {openSections.events ? (
                  <ChevronUp size={16} color={Theme.colors.mutedForeground} />
                ) : (
                  <ChevronDown size={16} color={Theme.colors.mutedForeground} />
                )}
              </View>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <View style={styles.collapsibleContent}>
                {notifications.events.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    read={notification.read}
                    onDismiss={() =>
                      dismissNotification("events", notification.id)
                    }
                    onClick={() => handleEventClick(notification)}
                  >
                    <View style={styles.contentLayout}>
                      <Text style={styles.cardHeaderTitle}>
                        {notification.eventName}
                      </Text>
                      <Text style={styles.cardHeaderTime}>
                        {notification.timestamp}
                      </Text>
                    </View>
                    <View style={styles.contentLayoutInfo}>
                      <Calendar
                        size={12}
                        color={Theme.colors.mutedForeground}
                      />
                      <Text style={styles.cardInfoText}>
                        {notification.date}
                      </Text>
                    </View>
                    <View style={styles.contentLayoutInfo}>
                      <MapPin size={12} color={Theme.colors.mutedForeground} />
                      <Text style={styles.cardInfoText}>
                        {notification.location}
                      </Text>
                    </View>
                    <Badge
                      style={[
                        styles.inlineBadge,
                        getBadgeStyle(notification.type),
                      ]}
                    >
                      <Text
                        style={{
                          color: getBadgeStyle(notification.type).color,
                          fontSize: 12,
                        }}
                      >
                        {notification.type}
                      </Text>
                    </Badge>
                  </NotificationCard>
                ))}
              </View>
            </CollapsibleContent>
          </Collapsible>

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
  scrollPadding: { padding: 16, gap: 16 },
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
  backButton: { padding: 8, borderRadius: 9999, position: "absolute", left: 8 },
  headerTitleGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  mainHeaderTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "bold",
  },
  unreadBadge: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 9999,
    paddingHorizontal: 6,
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
    padding: 12,
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    width: "100%",
  },
  collapsibleText: {
    color: Theme.colors.foreground,
    fontWeight: "500",
    flex: 1,
    marginLeft: 12,
  },
  collapsibleContent: { paddingHorizontal: 4, marginTop: 12, gap: 12 },
  inlineUnreadBadge: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 9999,
    paddingHorizontal: 6,
    paddingVertical: 2,
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
    backgroundColor: Theme.colors.muted,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: Theme.radius.lg,
  },
  notificationCardUnread: {
    backgroundColor: "rgba(196, 81, 201, 0.05)",
    borderColor: "rgba(196, 81, 201, 0.3)",
  },
  notificationCardContent: { padding: 16, position: "relative" },
  dismissButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 8,
    borderRadius: 9999,
  },

  // Card Content Layout
  contentLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingRight: 30,
  },
  cardHeaderTitle: {
    color: Theme.colors.foreground,
    fontWeight: "bold",
    flexShrink: 1,
    fontSize: 16,
  },
  cardHeaderTime: { color: Theme.colors.mutedForeground, fontSize: 12 },
  contentLayoutInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  cardInfoText: { color: Theme.colors.mutedForeground, fontSize: 14 },
  inlineBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
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
  emptyStateText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
  },
});
