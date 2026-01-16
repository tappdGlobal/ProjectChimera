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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  MessageSquare,
  BarChart3,
  TrendingUp as TrendingUpIcon, // Rename to avoid conflict if we create a component
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
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
    revenue: 127500, // Implied from net earnings / 0.8
    serviceCharge: 25500,
    netEarnings: 102000,
    rating: 4.7,
    totalReviews: 42,
    connections: 78,
    status: "completed",
    reviews: [],
  },
  {
    id: "pub-2",
    name: "Tech Startup Pitch Night",
    date: "2024-07-25",
    location: "Innovation Hub",
    maxOccupancy: 200,
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
    maxOccupancy: 350,
    registrations: 278,
    revenue: 417000,
    serviceCharge: 83400,
    netEarnings: 333600,
    rating: 4.5,
    totalReviews: 89,
    connections: 234,
    status: "ongoing",
    reviews: [],
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

  const EarningsChart = () => (
    <Card style={styles.chartCard}>
      <CardHeader>
        <CardTitle style={styles.chartTitle}>
          <TrendingUpIcon
            size={20}
            color={Theme.colors.foreground}
            style={{ marginRight: 8 }}
          />
          Earnings Overview
        </CardTitle>
      </CardHeader>
      <CardContent style={styles.chartContent}>
        {/* Y-Axis Labels */}
        <View style={styles.chartYAxis}>
          <Text style={styles.chartLabel}>₹180k</Text>
          <Text style={styles.chartLabel}>₹135k</Text>
          <Text style={styles.chartLabel}>₹90k</Text>
          <Text style={styles.chartLabel}>₹45k</Text>
          <Text style={styles.chartLabel}>₹0k</Text>
        </View>

        {/* Chart Area */}
        <View style={styles.chartArea}>
          {/* Grid Lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.gridLine, { top: `${i * 25}%` }]} />
          ))}

          {/* Visual Chart Placeholder (Gradient Area) */}
          <LinearGradient
            colors={["rgba(192, 38, 211, 0.5)", "rgba(192, 38, 211, 0.0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.chartGradientArea}
          />
          <View style={styles.chartLine} />

          {/* X-Axis Labels */}
          <View style={styles.chartXAxis}>
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m) => (
              <Text key={m} style={styles.chartLabel}>
                {m}
              </Text>
            ))}
          </View>
        </View>
      </CardContent>
    </Card>
  );

  const EventCard = ({ event }: { event: PublishedEvent }) => (
    <Card onClick={() => setSelectedEvent(event)} style={styles.eventCardBase}>
      <CardContent style={styles.eventCardContent}>
        {/* Header: Title + Badge */}
        <View style={styles.eventCardHeader}>
          <Text style={styles.eventCardTitle}>{event.name}</Text>
          <View
            style={[
              styles.statusBadge,
              { borderColor: getStatusColor(event.status).color },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(event.status).color },
              ]}
            >
              {event.status}
            </Text>
          </View>
        </View>

        {/* Location */}
        <Text style={styles.eventCardLocation}>{event.location}</Text>

        {/* Metrics Grid */}
        <View style={styles.eventCardMetricsGrid}>
          {/* Registrations */}
          <View style={styles.metricItemLeft}>
            <Text style={styles.metricBigNumber}>{event.registrations}</Text>
            <Text style={styles.metricLabel}>Registrations</Text>
          </View>

          {/* Earnings */}
          <View style={styles.metricItemRight}>
            <Text style={styles.metricBigNumberGreen}>
              {formatCurrency(event.netEarnings)}
            </Text>
            <Text style={styles.metricLabel}>Net Earnings</Text>
          </View>
        </View>

        {/* Footer: Rating + Connections */}
        <View style={styles.eventCardFooter}>
          <View style={styles.flexRowCenter}>
            <Star
              size={14}
              color="#FBBF24"
              fill="#FBBF24"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.footerText}>
              {event.rating} ({event.totalReviews})
            </Text>
          </View>
          <View style={styles.flexRowCenter}>
            <Users
              size={14}
              color={Theme.colors.mutedForeground}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.footerText}>
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
    <SafeAreaView style={styles.flex1} edges={["top", "bottom"]}>
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

        <ScrollView
          style={styles.flex1}
          contentContainerStyle={[styles.scrollPadding, { paddingBottom: 40 }]}
        >
          {/* Top Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statsCardPurple}>
              <Text style={[styles.statsValueGreen, { fontSize: 18 }]}>
                ₹606,000
              </Text>
              <Text style={styles.statsLabel}>Total Earnings</Text>
            </View>
            <View style={styles.statsCardPurple}>
              <Text style={[styles.statsValuePurple, { fontSize: 18 }]}>
                505
              </Text>
              <Text style={styles.statsLabel}>Total Registrations</Text>
            </View>
          </View>

          {/* Secondary Stats Row */}
          <View style={styles.secondaryStatsRow}>
            <Text style={styles.secondaryStatText}>
              {events.length} events published
            </Text>
            <Text style={styles.secondaryStatText}>Avg. 4.7★ rating</Text>
          </View>

          {/* Earnings Chart */}
          <EarningsChart />

          {/* Events List */}
          <View style={styles.eventsListContainer}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </View>
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
  scrollPadding: {
    padding: 16,
    gap: 24,
  },
  // Header
  mainHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  mainHeaderTitle: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "500",
  },
  backButton: {
    padding: 4,
  },
  w10: { width: 32 },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statsCardPurple: {
    flex: 1,
    backgroundColor: "#18122F", // Dark purple bg
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statsValueGreen: {
    color: "#22c55e",
    fontWeight: "bold",
    marginBottom: 4,
  },
  statsValuePurple: {
    color: "#C026D3",
    fontWeight: "bold",
    marginBottom: 4,
  },
  statsLabel: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },

  // Secondary Stats
  secondaryStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  secondaryStatText: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
  },

  // Chart
  chartCard: {
    backgroundColor: "#18122F",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 16,
  },
  chartTitle: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 16,
    color: Theme.colors.foreground,
    marginBottom: 16,
  },
  chartContent: {
    flexDirection: "row",
    height: 180,
  },
  chartYAxis: {
    justifyContent: "space-between",
    paddingRight: 8,
    height: "100%",
    paddingBottom: 20, // Align with X axis space
  },
  chartLabel: {
    color: Theme.colors.mutedForeground,
    fontSize: 10,
  },
  chartArea: {
    flex: 1,
    height: "100%",
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  chartXAxis: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chartGradientArea: {
    position: "absolute",
    bottom: 20, // Above X-Axis
    left: 0,
    right: 0,
    height: "100%", // Simplified
    opacity: 0.3,
  },
  chartLine: {
    // Placeholder for line
  },

  // Event List
  eventsListContainer: {
    gap: 16,
  },
  eventCardBase: {
    backgroundColor: "#18122F",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  eventCardContent: {
    padding: 20,
  },
  eventCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  eventCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Theme.colors.foreground,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
  },
  eventCardLocation: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
    marginBottom: 20,
  },
  eventCardMetricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  metricItemLeft: {
    alignItems: "center",
    flex: 1,
  },
  metricItemRight: {
    alignItems: "center",
    flex: 1,
  },
  metricBigNumber: {
    fontSize: 24,
    color: "#C026D3",
    fontWeight: "500",
    marginBottom: 2,
  },
  metricBigNumberGreen: {
    fontSize: 24,
    color: "#22c55e",
    fontWeight: "bold",
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: Theme.colors.mutedForeground,
  },
  eventCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flexRowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
  },

  // Shared / Utils
  flexRowCenterGap2: { flexDirection: "row", alignItems: "center", gap: 8 },
  flexRowGap4: { flexDirection: "row", gap: 16 },
  p3: { padding: 12 },
  p4: { padding: 16 },
  mt2H2: { marginTop: 8, height: 8 },
  h2: { height: 8 },
  mt3: { marginTop: 12 },
  spaceY2: { gap: 8 },
  flexRowGap2: { flexDirection: "row", gap: 8 },
  mxAutoMb2: { alignSelf: "center", marginBottom: 8 },
  mxAutoMb4: { alignSelf: "center", marginBottom: 16 },

  // Modal Styles (Preserved)
  detailModalContent: { width: "95%", maxHeight: "90%", padding: 16 },
  modalTabsList: {
    flexDirection: "row",
    marginTop: 16,
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  modalTabButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTabButtonActive: { backgroundColor: Theme.colors.primary },
  modalTabTextActive: { color: Theme.colors.foreground, fontWeight: "bold" },
  modalTabTextInactive: { color: Theme.colors.mutedForeground },
  tabContentContainer: { paddingVertical: 16, gap: 16 },
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
  analyticMetricLabel: { fontSize: 14, color: Theme.colors.mutedForeground },
  ratingText: { fontSize: 24, fontWeight: "bold" },
  starLabel: { width: 20, fontSize: 12, color: Theme.colors.mutedForeground },
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyStateText: { color: Theme.colors.mutedForeground },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviewUserName: { fontWeight: "bold", color: Theme.colors.foreground },
  reviewDate: { fontSize: 12, color: Theme.colors.mutedForeground },
  reviewComment: { marginTop: 8, color: Theme.colors.foreground },
  hostReplyBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Theme.colors.muted,
    borderRadius: 8,
  },
  hostReplyTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: Theme.colors.primary,
    marginBottom: 4,
  },
  hostReplyText: { fontSize: 12, color: Theme.colors.mutedForeground },
  flexRowSpaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  financialLabel: { color: Theme.colors.mutedForeground },
  financialValue: { color: Theme.colors.foreground, fontWeight: "500" },
  financialDestructiveValue: {
    color: Theme.colors.destructive,
    fontWeight: "500",
  },
  financialNetLabel: { color: Theme.colors.foreground, fontWeight: "bold" },
  financialNetValue: { color: "#22c55e", fontWeight: "bold" },
  starIcon: { marginHorizontal: 1 },
  progressBarContainer: {
    height: 4,
    backgroundColor: Theme.colors.border,
    borderRadius: 2,
    overflow: "hidden",
    flex: 1,
  },
  progressBarFill: { height: "100%", backgroundColor: Theme.colors.primary },
});
