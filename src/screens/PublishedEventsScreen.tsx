// src/screens/PublishedEventsScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ViewStyle,
  TextStyle,
  SafeAreaView,
} from "react-native";
import {
  ArrowLeft,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  MessageSquare,
  BarChart3,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { Theme } from "../styles/Theme";

// Migrated UI Components
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Separator } from "../components/ui/Separator";
import { Textarea } from "../components/ui/Textarea"; // Needed for reply logic
// Note: Tabs and Dialog will be integrated directly via Modal/react-native-tab-view if needed,
// but for now we'll use placeholder or native structures for simplicity of a simple modal/view.
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/Dialog";
// Progress component is missing. We will use a basic View/Animated.View as a placeholder.

interface PublishedEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  maxOccupancy: number;
  registrations: number;
  revenue: number;
  serviceCharge: number;
  netEarnings: number;
  rating: number;
  totalReviews: number;
  connections: number;
  status: "upcoming" | "ongoing" | "completed";
  reviews: Array<{
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    reply?: string;
  }>;
}

interface PublishedEventsProps {
  onBack: () => void;
  // Navigation props will be injected by React Navigation
}

// Mock data (from your source file)
const mockPublishedEvents: PublishedEvent[] = [
  {
    id: "pub-1",
    name: "Rooftop Jazz Night",
    date: "2024-06-20",
    location: "Sky Lounge",
    maxOccupancy: 100,
    registrations: 85,
    revenue: 127500,
    serviceCharge: 25500,
    netEarnings: 102000,
    rating: 4.7,
    totalReviews: 42,
    connections: 78,
    status: "completed",
    reviews: [
      {
        id: "r1",
        userName: "Sarah M.",
        rating: 5,
        comment: "Amazing atmosphere!",
        date: "2024-06-21",
      },
    ],
  },
  {
    id: "pub-2",
    name: "Tech Startup Pitch Night",
    date: "2024-07-25",
    location: "Innovation Hub",
    maxOccupancy: 150,
    registrations: 142,
    revenue: 213000,
    serviceCharge: 42600,
    netEarnings: 170400,
    rating: 4.9,
    totalReviews: 67,
    connections: 156,
    status: "upcoming",
    reviews: [],
  },
  {
    id: "pub-3",
    name: "Summer Food Festival",
    date: "2024-07-10",
    location: "Central Plaza",
    maxOccupancy: 300,
    registrations: 278,
    revenue: 417000,
    serviceCharge: 83400,
    netEarnings: 333600,
    rating: 4.5,
    totalReviews: 89,
    connections: 234,
    status: "ongoing",
    reviews: [
      {
        id: "r3",
        userName: "Emma L.",
        rating: 5,
        comment: "Incredible variety of food vendors!",
        date: "2024-07-10",
      },
    ],
  },
];

// Placeholder for Progress Bar
const ProgressBar = ({
  value,
  style,
}: {
  value: number;
  style?: ViewStyle;
}) => (
  <View style={[styles.progressBarContainer, style]}>
    <View style={[styles.progressBarFill, { width: `${value}%` }]} />
  </View>
);

export function PublishedEventsScreen() {
  const navigation = useNavigation();
  const [events] = useState<PublishedEvent[]>(mockPublishedEvents);
  const [selectedEvent, setSelectedEvent] = useState<PublishedEvent | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("analytics");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // --- CALCULATIONS (Used in Overview Stats) ---
  const totalRevenue = events.reduce((sum, event) => sum + event.revenue, 0);
  const totalNetEarnings = events.reduce(
    (sum, event) => sum + event.netEarnings,
    0
  );
  const totalRegistrations = events.reduce(
    (sum, event) => sum + event.registrations,
    0
  );
  const averageRating =
    events.reduce((sum, event) => sum + event.rating, 0) / events.length;

  const getStatusColor = (status: string): TextStyle => {
    switch (status) {
      case "upcoming":
        return { color: "#60A5FA", backgroundColor: "rgba(96, 165, 250, 0.2)" }; // blue
      case "ongoing":
        return { color: "#4ADE80", backgroundColor: "rgba(74, 222, 128, 0.2)" }; // green
      case "completed":
        return {
          color: "#9CA3AF",
          backgroundColor: "rgba(156, 163, 175, 0.2)",
        }; // gray
      default:
        return {
          color: "#9CA3AF",
          backgroundColor: "rgba(156, 163, 175, 0.2)",
        };
    }
  };

  const formatCurrency = (amount: number): string =>
    `₹${amount.toLocaleString()}`;

  const handleReplySubmit = (reviewId: string) => {
    // In a real app, logic to send reply to backend goes here
    Alert.alert("Reply Sent", `Reply to ${reviewId} submitted: ${replyText}`);
    setReplyingTo(null);
    setReplyText("");
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        color={i < rating ? "#FBBF24" : Theme.colors.mutedForeground} // Yellow-400
        fill={i < rating ? "#FBBF24" : "none"}
        style={styles.starIcon}
      />
    ));
  };

  // --- SUB COMPONENTS ---

  const EventCard = ({ event }: { event: PublishedEvent }) => (
    <Card onClick={() => setSelectedEvent(event)} style={styles.eventCardBase}>
      <CardContent style={styles.eventCardContent}>
        <View style={styles.eventCardHeader}>
          <View style={styles.flex1}>
            <Text style={styles.eventCardTitle}>{event.name}</Text>
            <Text style={styles.eventCardLocation}>{event.location}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status).backgroundColor }]}>
            <Text style={{ color: getStatusColor(event.status).color }}>
              {event.status}
            </Text>
          </View>
        </View>

        <View style={styles.eventCardMetricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricPrimaryText}>{event.registrations}</Text>
            <Text style={styles.metricSecondaryText}>Registrations</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricPrimaryTextNet}>
              {formatCurrency(event.netEarnings)}
            </Text>
            <Text style={styles.metricSecondaryText}>Net Earnings</Text>
          </View>
        </View>

        <View style={styles.eventCardFooter}>
          <View style={styles.flexRowCenter}>
            {renderStars(event.rating)}
            <Text style={styles.eventCardRatingText}>
              {event.rating} ({event.totalReviews})
            </Text>
          </View>
          <View style={styles.flexRowCenter}>
            <Users size={16} color={Theme.colors.mutedForeground} />
            <Text style={styles.eventCardRatingText}>
              {event.connections} connections
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );

  const EventDetailModal = ({ event }: { event: PublishedEvent }) => (
    <Dialog open={!!event} onOpenChange={() => setSelectedEvent(null)}>
      <DialogContent style={styles.detailModalContent}>
        <DialogHeader>
          <DialogTitle>{event.name}</DialogTitle>
          <DialogDescription>
            Analytics, reviews, and financial details for your published event
          </DialogDescription>
        </DialogHeader>

        {/* Tabs - Simplified to buttons and conditional rendering for RN */}
        <View style={styles.modalTabsList}>
          {["analytics", "reviews", "financials"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.modalTabButton,
                activeTab === tab && styles.modalTabButtonActive,
              ]}
            >
              <Text
                style={
                  activeTab === tab
                    ? styles.modalTabTextActive
                    : styles.modalTabTextInactive
                }
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <ScrollView style={styles.flex1}>
          {activeTab === "analytics" && (
            <View style={styles.tabContentContainer}>
              {/* Analytics Content */}
              <View style={{ flexDirection: "row", gap: 16 }}>
                <Card style={styles.analyticCard}>
                  <CardContent style={styles.p4}>
                    <Users
                      size={32}
                      color={Theme.colors.primary}
                      style={styles.mxAutoMb2}
                    />
                    <Text style={styles.analyticMetricText}>
                      {event.registrations}
                    </Text>
                    <Text style={styles.analyticMetricLabel}>Registered</Text>
                    <ProgressBar
                      value={(event.registrations / event.maxOccupancy) * 100}
                      style={styles.mt2H2}
                    />
                  </CardContent>
                </Card>
                <Card style={styles.analyticCard}>
                  <CardContent style={styles.p4}>
                    <TrendingUp
                      size={32}
                      color={"#4ADE80"}
                      style={styles.mxAutoMb2}
                    />
                    <Text style={styles.analyticMetricText}>
                      {event.connections}
                    </Text>
                    <Text style={styles.analyticMetricLabel}>
                      Connections Made
                    </Text>
                  </CardContent>
                </Card>
              </View>
              {/* Ratings Card */}
              <Card>
                <CardHeader>
                  <CardTitle style={styles.flexRowCenterGap2}>
                    <Star size={20} /> Ratings & Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent style={styles.p4}>
                  <View style={styles.flexRowGap4}>
                    <View style={{ alignItems: "center" }}>
                      <Text style={styles.ratingText}>{event.rating}</Text>
                      <Text style={styles.analyticMetricLabel}>
                        Average Rating
                      </Text>
                    </View>
                    <View style={styles.flex1}>
                      {/* Simplified Progress Bars */}
                      {[5, 4, 3, 2, 1].map((star) => (
                        <View key={star} style={styles.flexRowCenterGap2}>
                          <Text style={styles.starLabel}>{star}★</Text>
                          <ProgressBar
                            value={star === 5 ? 70 : star === 4 ? 20 : 10}
                            style={styles.h2}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                </CardContent>
              </Card>
            </View>
          )}

          {activeTab === "reviews" && (
            <View style={styles.tabContentContainer}>
              {/* Reviews Content */}
              {event.reviews.length === 0 ? (
                <View style={styles.emptyState}>
                  <MessageSquare
                    size={48}
                    color={Theme.colors.mutedForeground}
                    style={styles.mxAutoMb4}
                  />
                  <Text style={styles.emptyStateText}>No reviews yet</Text>
                </View>
              ) : (
                event.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent style={styles.p4}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewUserName}>
                          {review.userName}
                        </Text>
                        <Text style={styles.reviewDate}>{review.date}</Text>
                      </View>
                      <View style={styles.flexRowCenterGap2}>
                        {renderStars(review.rating)}
                      </View>
                      <Text style={styles.reviewComment}>{review.comment}</Text>

                      {/* Reply Logic */}
                      {review.reply && (
                        <View style={styles.hostReplyBox}>
                          <Text style={styles.hostReplyTitle}>Host Reply:</Text>
                          <Text style={styles.hostReplyText}>
                            {review.reply}
                          </Text>
                        </View>
                      )}

                      {!review.reply && (
                        <View style={styles.mt3}>
                          {replyingTo === review.id ? (
                            <View style={styles.spaceY2}>
                              <Textarea
                                value={replyText}
                                onChangeText={setReplyText}
                                placeholder="Write your reply..."
                                rows={2}
                              />
                              <View style={styles.flexRowGap2}>
                                <Button
                                  size="sm"
                                  onClick={() => handleReplySubmit(review.id)}
                                >
                                  Send Reply
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setReplyingTo(null)}
                                >
                                  Cancel
                                </Button>
                              </View>
                            </View>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReplyingTo(review.id)}
                            >
                              Reply
                            </Button>
                          )}
                        </View>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </View>
          )}

          {activeTab === "financials" && (
            <View style={styles.tabContentContainer}>
              {/* Financials Content */}
              <Card>
                <CardHeader>
                  <CardTitle style={styles.flexRowCenterGap2}>
                    <DollarSign size={20} /> Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent style={styles.p4}>
                  <View style={styles.spaceY2}>
                    <View style={styles.flexRowSpaceBetween}>
                      <Text style={styles.financialLabel}>Total Revenue:</Text>
                      <Text style={styles.financialValue}>
                        {formatCurrency(event.revenue)}
                      </Text>
                    </View>
                    <View style={styles.flexRowSpaceBetween}>
                      <Text style={styles.financialLabel}>
                        TAPPD Service Charge (20%):
                      </Text>
                      <Text style={styles.financialDestructiveValue}>
                        -{formatCurrency(event.serviceCharge)}
                      </Text>
                    </View>
                    <Separator
                      style={{ backgroundColor: Theme.colors.border }}
                    />
                    <View style={styles.flexRowSpaceBetween}>
                      <Text style={styles.financialNetLabel}>
                        Net Earnings:
                      </Text>
                      <Text style={styles.financialNetValue}>
                        {formatCurrency(event.netEarnings)}
                      </Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent style={styles.p4}>
                  <View style={styles.spaceY2}>
                    <View style={styles.flexRowSpaceBetween}>
                      <Text style={styles.financialLabel}>Occupancy Rate:</Text>
                      <Text style={styles.financialValue}>
                        {Math.round(
                          (event.registrations / event.maxOccupancy) * 100
                        )}
                        %
                      </Text>
                    </View>
                    {/* ... other metrics ... */}
                  </View>
                </CardContent>
              </Card>
            </View>
          )}
        </ScrollView>
      </DialogContent>
    </Dialog>
  );

  // --- MAIN RENDER ---
  return (
    <SafeAreaView style={styles.flex1}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.mainHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={Theme.colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.mainHeaderTitle}>Published Events</Text>
          <View style={styles.w10} />
        </View>

        {/* Overview Stats */}
        <View style={styles.overviewContainer}>
          <View style={styles.overviewGrid}>
            <Card style={styles.overviewCard}>
              <CardContent style={styles.p3}>
                <Text style={styles.overviewMetricNet}>
                  {formatCurrency(totalNetEarnings)}
                </Text>
                <Text style={styles.overviewMetricLabel}>Total Earnings</Text>
              </CardContent>
            </Card>
            <Card style={styles.overviewCard}>
              <CardContent style={styles.p3}>
                <Text style={styles.overviewMetricPrimary}>
                  {totalRegistrations}
                </Text>
                <Text style={styles.overviewMetricLabel}>
                  Total Registrations
                </Text>
              </CardContent>
            </Card>
          </View>
          <View style={styles.overviewFooter}>
            <Text style={styles.overviewFooterText}>
              {events.length} events published
            </Text>
            <Text style={styles.overviewFooterText}>
              Avg. {averageRating.toFixed(1)}★ rating
            </Text>
          </View>
        </View>

        {/* Events List */}
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollPaddingList}
        >
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </ScrollView>

        {/* Event Detail Modal */}
        {selectedEvent && <EventDetailModal event={selectedEvent} />}
      </View>
    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  // --- Shared Styles ---
  mainHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  mainHeaderTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    padding: 8,
    borderRadius: 9999,
  },
  w10: { width: 40 }, // Space placeholder
  flexRowCenter: { flexDirection: "row", alignItems: "center" },
  flexRowCenterGap2: { flexDirection: "row", alignItems: "center", gap: 8 },
  flexRowGap4: { flexDirection: "row", gap: 16 },
  flexRowSpaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  p3: { padding: 12 },
  p4: { padding: 16 },
  mxAutoMb2: { alignSelf: "center", marginBottom: 8 },
  mt2H2: { marginTop: 8, height: 8 },
  textAlignCeneter: { textAlign: "center" as "center" },
  h2: { height: 8 },
  mt3: { marginTop: 12 },
  spaceY2: { gap: 8 },
  flexRowGap2: { flexDirection: "row", gap: 8 },
  emptyState: { paddingVertical: 48, alignItems: "center" },
  emptyStateText: { color: Theme.colors.mutedForeground },
  mxAutoMb4: { alignSelf: "center", marginBottom: 16 },

  // --- Overview Section ---
  overviewContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  overviewGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: Theme.colors.muted,
    borderColor: Theme.colors.border,
  },
  overviewMetricNet: {
    fontSize: 18,
    color: "#4ADE80", // Green-400
    fontWeight: "bold",
  },
  overviewMetricPrimary: {
    fontSize: 18,
    color: Theme.colors.primary,
    fontWeight: "bold",
  },
  overviewMetricLabel: {
    fontSize: 12,
    color: Theme.colors.mutedForeground,
  },
  overviewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overviewFooterText: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
  },

  // --- Event Card (List) ---
  scrollPaddingList: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 16,
  },
  eventCardBase: {
    backgroundColor: Theme.colors.muted,
    borderColor: Theme.colors.border,
  },
  eventCardContent: {
    padding: 16,
    gap: 12,
  },
  eventCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  eventCardTitle: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "bold",
  },
  eventCardLocation: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
    fontSize: 10,
    fontWeight: "500",
  },
  eventCardMetricsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: Theme.colors.border,
  },
  metricItem: {
    alignItems: "center",
  },
  metricPrimaryText: {
    fontSize: 20,
    color: Theme.colors.primary,
    fontWeight: "bold",
  },
  metricPrimaryTextNet: {
    fontSize: 20,
    color: "#4ADE80", // Green-400
    fontWeight: "bold",
  },
  metricSecondaryText: {
    fontSize: 10,
    color: Theme.colors.mutedForeground,
  },
  eventCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  eventCardRatingText: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    marginLeft: 4,
  },
  starIcon: {
    marginHorizontal: 1,
  },

  // --- Detail Modal ---
  detailModalContent: {
    width: "95%",
    maxHeight: "90%",
    padding: 16, // Adjust padding for modal
  },
  modalTabsList: {
    flexDirection: "row",
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: "hidden",
    marginTop: 16,
  },
  modalTabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTabButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  modalTabTextActive: {
    color: Theme.colors.foreground,
    fontWeight: "bold",
  },
  modalTabTextInactive: {
    color: Theme.colors.mutedForeground,
  },
  tabContentContainer: {
    paddingVertical: 16,
    gap: 16,
  },
  analyticCard: {
    flex: 1,
    backgroundColor: Theme.colors.muted,
    borderColor: Theme.colors.border,
  },
  analyticMetricText: {
    fontSize: 24,
    color: Theme.colors.foreground,
    fontWeight: "bold",
  },
  analyticMetricLabel: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
  },
  ratingText: {
    fontSize: 32,
    color: "#FBBF24",
    fontWeight: "bold",
  },
  starLabel: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    width: "100%",
    backgroundColor: Theme.colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Theme.colors.primary,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  reviewUserName: {
    color: Theme.colors.foreground,
    fontWeight: "bold",
  },
  reviewDate: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },
  reviewComment: {
    color: Theme.colors.mutedForeground,
    marginBottom: 8,
  },
  hostReplyBox: {
    borderLeftWidth: 2,
    borderLeftColor: Theme.colors.primary,
    paddingLeft: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(196, 81, 201, 0.1)", // primary/10 approximation
    marginBottom: 8,
  },
  hostReplyTitle: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  hostReplyText: {
    color: Theme.colors.foreground,
    fontSize: 14,
  },
  financialLabel: { color: Theme.colors.mutedForeground },
  financialValue: { color: Theme.colors.foreground },
  financialDestructiveValue: { color: "#F87171" }, // Red-400
  financialNetLabel: { color: Theme.colors.foreground, fontWeight: "bold" },
  financialNetValue: { color: "#4ADE80", fontWeight: "bold" }, // Green-400
});
