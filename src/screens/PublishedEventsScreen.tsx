// src/screens/PublishedEventsScreen.tsx

import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ViewStyle,
  TextStyle,
  Platform,
  StatusBar,
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
  TrendingUp as TrendingUpIcon,
} from "lucide-react-native";
import Svg, { Path, Line, Circle } from "react-native-svg";
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
import { Textarea } from "../components/ui/Textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/Dialog";

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

const mockReviews = [
  { id: 'r1', userName: 'Sarah M.', rating: 5, date: '2024-06-21', comment: 'Amazing atmosphere and great music! The venue was perfect for networking.' },
  { id: 'r2', userName: 'Mike R.', rating: 4, date: '2024-06-21', comment: 'Good event overall, though the sound could have been better in some areas.' }
];

const getStatusColor = (status: string): TextStyle => {
  switch (status) {
    case "upcoming": return { color: "#60A5FA" };
    case "ongoing": return { color: "#4ADE80" };
    default: return { color: "#9CA3AF" };
  }
};

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={16}
      color={i < rating ? "#FBBF24" : Theme.colors.mutedForeground}
      fill={i < rating ? "#FBBF24" : "none"}
      style={styles.starIcon}
    />
  ));
};

const formatCurrency = (amount: number): string =>
  `₹${amount.toLocaleString()}`;

interface EventCardProps {
  event: PublishedEvent;
  onPress: (event: PublishedEvent) => void;
}

const EventCard = React.memo(({ event, onPress }: EventCardProps) => (
  <Card onClick={() => onPress(event)} style={styles.eventCardBase}>
    <CardContent style={styles.eventCardContent}>
      <View style={styles.eventCardHeader}>
        <Text style={styles.eventCardTitle}>{event.name}</Text>
        <View style={[styles.statusBadge, { borderColor: "rgba(255,255,255,0.2)" }]}>
          <Text style={[styles.statusText, { color: getStatusColor(event.status).color }]}>{event.status}</Text>
        </View>
      </View>
      <Text style={styles.eventCardLocation}>{event.location}</Text>
      <View style={styles.eventCardMetricsGrid}>
        <View style={styles.metricItemLeft}>
          <Text style={styles.metricBigNumber}>{event.registrations}</Text>
          <Text style={styles.metricLabel}>Registrations</Text>
        </View>
        <View style={styles.metricItemRight}>
          <Text style={styles.metricBigNumberGreen}>{formatCurrency(event.netEarnings)}</Text>
          <Text style={styles.metricLabel}>Net Earnings</Text>
        </View>
      </View>
      <View style={styles.eventCardFooter}>
        <View style={styles.flexRowCenter}>
          <Star size={14} color="#FBBF24" fill="#FBBF24" style={{ marginRight: 4 }} />
          <Text style={styles.footerText}>{event.rating} ({event.totalReviews})</Text>
        </View>
        <View style={styles.flexRowCenter}>
          <Users size={14} color={Theme.colors.mutedForeground} style={{ marginRight: 4 }} />
          <Text style={styles.footerText}>{event.connections} connections</Text>
        </View>
      </View>
    </CardContent>
  </Card>
));

const EarningsChart = React.memo(() => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const values = [0, 52000, 75000, 89000, 95000, 102000, 145000];
  const maxY = 180000;

  const getX = (index: number) => (index / (months.length - 1)) * 100;
  const getY = (value: number) => ((maxY - value) / maxY) * 100;

  const points = useMemo(() => values.map((v, i) => ({ x: getX(i), y: getY(v) })), []);
  
  const activePoint = activeIndex !== null ? points[activeIndex] : null;
  const activeValue = activeIndex !== null ? values[activeIndex] : null;
  const activeMonth = activeIndex !== null ? months[activeIndex] : null;

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <TrendingUpIcon size={18} color={Theme.colors.foreground} style={{ marginRight: 8 }} />
        <Text style={styles.chartTitleText}>Earnings Overview</Text>
      </View>

      <View style={styles.chartBody}>
        <View style={styles.chartYAxis}>
          {[180, 135, 90, 45, 0].map((label, i) => (
            <View key={i} style={styles.yAxisLabelContainer}>
              <Text style={styles.chartLabel}>₹{label}k</Text>
              <View style={styles.yTick} />
            </View>
          ))}
        </View>

        <View style={styles.chartAreaContainer}>
          <View style={styles.chartArea}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.gridLineHorizontal, { top: `${i * 25}%` }]} />
            ))}
            {months.map((_, i) => (
              <View key={i} style={[styles.gridLineVertical, { left: `${getX(i)}%` }]} />
            ))}

            <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
              {activePoint && (
                <Line x1={activePoint.x} y1="0" x2={activePoint.x} y2="100" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
              )}
            </Svg>

            {activePoint && (
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: `${activePoint.x}%`,
                  top: `${activePoint.y}%`,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  borderWidth: 1.5,
                  borderColor: "white",
                  backgroundColor: "#110C24",
                  transform: [{ translateX: -5 }, { translateY: -5 }],
                  zIndex: 25,
                }}
              />
            )}

            {activePoint && activeMonth && activeValue !== null && (
              <View
                pointerEvents="none"
                style={[
                  styles.tooltipContainer,
                  {
                    left: activePoint.x > 50 ? `${activePoint.x - 45}%` : `${activePoint.x + 5}%`,
                    top: activePoint.y > 50 ? `${activePoint.y - 35}%` : `${activePoint.y + 5}%`,
                    zIndex: 30,
                  },
                ]}
              >
                <Text style={styles.tooltipMonth}>{activeMonth}</Text>
                <Text style={styles.tooltipValue}>Earnings : ₹{activeValue.toLocaleString()}</Text>
              </View>
            )}

            <View style={[StyleSheet.absoluteFill, { zIndex: 20 }]}>
              <View style={{ flexDirection: "row", flex: 1 }}>
                {months.map((_, i) => (
                  <View
                    key={i}
                    style={{ flex: 1, backgroundColor: "transparent" }}
                    {...({
                      onPointerEnter: () => setActiveIndex(i),
                      onPointerDown: () => setActiveIndex(i),
                    } as any)}
                  />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.chartXAxis}>
            {months.map((m, i) => (
              <View key={i} style={styles.xAxisLabelContainer}>
                <View style={styles.xTick} />
                <Text style={styles.chartLabel}>{m}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
});

interface EventDetailModalProps {
  event: PublishedEvent;
  onClose: () => void;
}

const EventDetailModal = React.memo(({ 
  event, 
  onClose,
}: EventDetailModalProps) => {
  const [activeTab, setActiveTab] = useState("analytics");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = useCallback((reviewId: string) => {
    Alert.alert("Reply Sent", `Reply to ${reviewId} submitted: ${replyText}`);
    setReplyingTo(null);
    setReplyText("");
  }, [replyText]);

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent style={styles.detailModalContent}>
        <TouchableOpacity 
          onPress={onClose}
          style={styles.modalCloseButton}
        >
          <Text style={{ color: 'white', fontSize: 24 }}>×</Text>
        </TouchableOpacity>

        <DialogHeader style={styles.modalHeader}>
          <DialogTitle style={styles.modalTitle}>{event.name}</DialogTitle>
          <DialogDescription style={styles.modalDescription}>
            Analytics, reviews, and financial details for your published event
          </DialogDescription>
        </DialogHeader>

        <View style={styles.modalTabsContainer}>
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
                  style={[
                    styles.modalTabText,
                    activeTab === tab && styles.modalTabTextActive,
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView style={styles.modalContentScroll} showsVerticalScrollIndicator={false}>
          {activeTab === "analytics" && (
            <View style={styles.tabContentContainer}>
              <View style={styles.analyticsStatsRow}>
                <Card style={styles.analyticCard}>
                  <CardContent style={styles.analyticCardContent}>
                    <Users size={32} color="#C026D3" style={styles.mb2} />
                    <Text style={styles.analyticMetricText}>{event.registrations}</Text>
                    <Text style={styles.analyticMetricLabel}>Registered</Text>
                    <View style={styles.analyticsProgressContainer}>
                      <View style={[styles.analyticsProgressFill, { width: `${(event.registrations / event.maxOccupancy) * 100}%` }]} />
                    </View>
                  </CardContent>
                </Card>
                <Card style={styles.analyticCard}>
                  <CardContent style={styles.analyticCardContent}>
                    <TrendingUp size={32} color="#4ADE80" style={styles.mb2} />
                    <Text style={styles.analyticMetricText}>{event.connections}</Text>
                    <Text style={styles.analyticMetricLabel}>Connections Made</Text>
                  </CardContent>
                </Card>
              </View>

              <Card style={styles.ratingsCard}>
                <CardHeader style={styles.ratingsHeader}>
                  <CardTitle style={styles.ratingsTitle}>
                    <Star size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={{ color: 'white' }}>Ratings & Reviews</Text>
                  </CardTitle>
                </CardHeader>
                <CardContent style={styles.ratingsContent}>
                  <View style={styles.ratingsOverview}>
                    <View style={styles.averageRatingContainer}>
                      <Text style={styles.averageRatingValue}>{event.rating}</Text>
                      <Text style={styles.averageRatingLabel}>Average Rating</Text>
                    </View>
                    <View style={styles.ratingBarsContainer}>
                      {[5, 4, 3, 2, 1].map((star) => (
                        <View key={star} style={styles.ratingBarRow}>
                          <Text style={styles.ratingBarStarLabel}>{star}★</Text>
                          <View style={styles.ratingBarBg}>
                            <View style={[styles.ratingBarFill, { width: star === 5 ? '75%' : star === 4 ? '20%' : star === 3 ? '15%' : '10%' }]} />
                          </View>
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
              {mockReviews.map((review) => (
                <Card key={review.id} style={styles.reviewCard}>
                  <CardContent style={styles.reviewCardContent}>
                    <View style={styles.reviewHeaderRow}>
                      <Text style={styles.reviewUserName}>{review.userName}</Text>
                      <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                    <View style={styles.reviewStarsRow}>
                      {renderStars(review.rating)}
                    </View>
                    <Text style={styles.reviewCommentText}>{review.comment}</Text>
                    
                    {replyingTo === review.id ? (
                      <View style={styles.replyInputContainer}>
                        <Textarea
                          value={replyText}
                          onChangeText={setReplyText}
                          placeholder="Write your reply..."
                          style={styles.replyTextarea}
                          placeholderTextColor="rgba(255,255,255,0.4)"
                        />
                        <View style={styles.replyActionsRow}>
                          <TouchableOpacity 
                            style={styles.sendReplyButton}
                            onPress={() => handleReplySubmit(review.id)}
                          >
                            <Text style={styles.sendReplyButtonText}>Send Reply</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.cancelReplyButton}
                            onPress={() => setReplyingTo(null)}
                          >
                            <Text style={styles.cancelReplyButtonText}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={styles.reviewReplyButton}
                        onPress={() => {
                          setReplyingTo(review.id);
                          setReplyText("");
                        }}
                      >
                        <Text style={styles.reviewReplyButtonText}>Reply</Text>
                      </TouchableOpacity>
                    )}
                  </CardContent>
                </Card>
              ))}
            </View>
          )}

          {activeTab === "financials" && (
            <View style={styles.tabContentContainer}>
              <Card style={styles.financialCard}>
                <CardHeader style={styles.financialHeader}>
                  <CardTitle style={styles.financialTitle}>
                    <DollarSign size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={{ color: 'white' }}>Revenue Breakdown</Text>
                  </CardTitle>
                </CardHeader>
                <CardContent style={styles.financialContent}>
                  <View style={styles.financialRow}>
                    <Text style={styles.financialLabel}>Total Revenue:</Text>
                    <Text style={styles.financialValue}>{formatCurrency(event.revenue)}</Text>
                  </View>
                  <View style={styles.financialRow}>
                    <Text style={styles.financialLabel}>TAPPD Service Charge (20%):</Text>
                    <Text style={styles.financialValueDestructive}>-{formatCurrency(event.serviceCharge)}</Text>
                  </View>
                  <View style={styles.financialDivider} />
                  <View style={styles.financialRow}>
                    <Text style={styles.financialNetLabel}>Net Earnings:</Text>
                    <Text style={styles.financialNetValue}>{formatCurrency(event.netEarnings)}</Text>
                  </View>
                </CardContent>
              </Card>

              <Card style={styles.financialCard}>
                <CardHeader style={styles.financialHeader}>
                  <CardTitle style={styles.financialTitle}>
                    <Text style={{ color: 'white' }}>Performance Metrics</Text>
                  </CardTitle>
                </CardHeader>
                <CardContent style={styles.financialContent}>
                  <View style={styles.financialRow}>
                    <Text style={styles.financialLabel}>Occupancy Rate:</Text>
                    <Text style={styles.financialValue}>85%</Text>
                  </View>
                  <View style={styles.financialRow}>
                    <Text style={styles.financialLabel}>Revenue per Attendee:</Text>
                    <Text style={styles.financialValue}>₹1,500</Text>
                  </View>
                  <View style={styles.financialRow}>
                    <Text style={styles.financialLabel}>Connection Rate:</Text>
                    <Text style={styles.financialValue}>92%</Text>
                  </View>
                </CardContent>
              </Card>
            </View>
          )}
        </ScrollView>
      </DialogContent>
    </Dialog>
  );
});

export function PublishedEventsScreen() {
  const navigation = useNavigation();
  const [events] = useState<PublishedEvent[]>(mockPublishedEvents);
  const [selectedEvent, setSelectedEvent] = useState<PublishedEvent | null>(null);

  return (
    <SafeAreaView style={[styles.flex1, { backgroundColor: Theme.colors.background }]} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} translucent={false} />
      <View style={styles.container}>
        <View style={styles.mainHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={Theme.colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.mainHeaderTitle}>Published Events</Text>
          <View style={styles.w10} />
        </View>
        <ScrollView style={styles.flex1} contentContainerStyle={[styles.scrollPadding, { paddingBottom: 40 }]}>
          <View style={styles.statsGrid}>
            <View style={styles.statsCardPurple}>
              <Text style={[styles.statsValueGreen, { fontSize: 18 }]}>₹606,000</Text>
              <Text style={styles.statsLabel}>Total Earnings</Text>
            </View>
            <View style={styles.statsCardPurple}>
              <Text style={[styles.statsValuePurple, { fontSize: 18 }]}>505</Text>
              <Text style={styles.statsLabel}>Total Registrations</Text>
            </View>
          </View>
          <View style={styles.secondaryStatsRow}>
            <Text style={styles.secondaryStatText}>{events.length} events published</Text>
            <Text style={styles.secondaryStatText}>Avg. 4.7★ rating</Text>
          </View>
          <EarningsChart />
          <View style={styles.eventsListContainer}>
            {events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onPress={setSelectedEvent} 
              />
            ))}
          </View>
        </ScrollView>
        {selectedEvent && (
          <EventDetailModal 
            event={selectedEvent} 
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: { flex: 1, backgroundColor: "#0A0322" },
  scrollPadding: { padding: 16, gap: 24 },
  mainHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  mainHeaderTitle: { color: Theme.colors.foreground, fontSize: 16, fontWeight: "500" },
  backButton: { padding: 4 },
  w10: { width: 32 },
  statsGrid: { flexDirection: "row", gap: 12 },
  statsCardPurple: { flex: 1, backgroundColor: "#110C24", borderRadius: 12, paddingVertical: 24, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  statsValueGreen: { color: "#22c55e", fontWeight: "bold", marginBottom: 4 },
  statsValuePurple: { color: "#C026D3", fontWeight: "bold", marginBottom: 4 },
  statsLabel: { color: Theme.colors.mutedForeground, fontSize: 12 },
  secondaryStatsRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4 },
  secondaryStatText: { color: Theme.colors.mutedForeground, fontSize: 13 },
  chartCard: { backgroundColor: "#110C24", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", padding: 20, marginTop: 8, position: "relative", overflow: "hidden" },
  chartHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20, zIndex: 1 },
  chartTitleText: { fontSize: 16, fontWeight: "600", color: Theme.colors.foreground },
  chartBody: { flexDirection: "row", height: 160, zIndex: 1 },
  chartYAxis: { justifyContent: "space-between", paddingRight: 4, height: "100%", paddingBottom: 20 },
  yAxisLabelContainer: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end" },
  yTick: { width: 4, height: 1, backgroundColor: "rgba(255,255,255,0.3)", marginLeft: 4 },
  chartLabel: { color: Theme.colors.mutedForeground, fontSize: 10, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
  chartAreaContainer: { flex: 1 },
  chartArea: { flex: 1, position: "relative", borderLeftWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  gridLineHorizontal: { position: "absolute", left: 0, right: 0, height: 1, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.05)", borderStyle: "dashed" },
  gridLineVertical: { position: "absolute", top: 0, bottom: 0, width: 1, borderLeftWidth: 1, borderColor: "rgba(255,255,255,0.05)", borderStyle: "dashed" },
  tooltipContainer: { position: "absolute", backgroundColor: "rgba(11, 7, 31, 0.8)", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", minWidth: 140, zIndex: 10 },
  tooltipMonth: { color: "white", fontSize: 18, fontWeight: "500", marginBottom: 8 },
  tooltipValue: { color: "white", fontSize: 16, fontWeight: "400" },
  chartXAxis: { flexDirection: "row", justifyContent: "space-between", height: 20 },
  xAxisLabelContainer: { alignItems: "center", width: 30, marginLeft: -15 },
  xTick: { width: 1, height: 4, backgroundColor: "rgba(255,255,255,0.3)", marginBottom: 2 },
  eventsListContainer: { gap: 16 },
  eventCardBase: { backgroundColor: "#110C24", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", overflow: "hidden", position: "relative" },
  eventCardContent: { padding: 20, zIndex: 1 },
  eventCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  eventCardTitle: { fontSize: 16, fontWeight: "bold", color: Theme.colors.foreground },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: "500" },
  eventCardLocation: { color: Theme.colors.mutedForeground, fontSize: 13, marginBottom: 20 },
  eventCardMetricsGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  metricItemLeft: { alignItems: "center", flex: 1 },
  metricItemRight: { alignItems: "center", flex: 1 },
  metricBigNumber: { fontSize: 24, color: "#C026D3", fontWeight: "500", marginBottom: 2 },
  metricBigNumberGreen: { fontSize: 24, color: "#22c55e", fontWeight: "bold", marginBottom: 2 },
  metricLabel: { fontSize: 11, color: Theme.colors.mutedForeground },
  eventCardFooter: { flexDirection: "row", justifyContent: "space-between" },
  flexRowCenter: { flexDirection: "row", alignItems: "center" },
  footerText: { color: Theme.colors.mutedForeground, fontSize: 13 },
  starIcon: { marginHorizontal: 1 },
  detailModalContent: { width: "95%", maxHeight: "92%", padding: 24, backgroundColor: '#0F0821', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalCloseButton: { position: 'absolute', right: 20, top: 20, zIndex: 50 },
  modalHeader: { marginBottom: 20, paddingRight: 40 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  modalDescription: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  modalTabsContainer: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 6, marginBottom: 24 },
  modalTabsList: { flexDirection: "row", gap: 4 },
  modalTabButton: { flex: 1, paddingVertical: 12, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  modalTabButtonActive: { backgroundColor: '#C026D3' },
  modalTabText: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  modalTabTextActive: { color: 'white', fontWeight: "600" },
  modalContentScroll: { flex: 1 },
  tabContentContainer: { gap: 20, paddingBottom: 20 },
  analyticsStatsRow: { flexDirection: 'row', gap: 16 },
  analyticCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 0, overflow: 'hidden' },
  analyticCardContent: { padding: 24, alignItems: 'center' },
  analyticMetricText: { fontSize: 32, color: 'white', fontWeight: 'bold', marginBottom: 4 },
  analyticMetricLabel: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 12 },
  analyticsProgressContainer: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 8 },
  analyticsProgressFill: { height: '100%', backgroundColor: '#C026D3', borderRadius: 3 },
  ratingsCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  ratingsHeader: { padding: 24, paddingBottom: 0 },
  ratingsTitle: { flexDirection: 'row', alignItems: 'center' },
  ratingsContent: { padding: 24 },
  ratingsOverview: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  averageRatingContainer: { alignItems: 'center' },
  averageRatingValue: { fontSize: 48, fontWeight: 'bold', color: '#FFD700' },
  averageRatingLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  ratingBarsContainer: { flex: 1, gap: 8 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ratingBarStarLabel: { width: 24, fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  ratingBarBg: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
  ratingBarFill: { height: '100%', backgroundColor: '#C026D3', borderRadius: 3 },
  reviewCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 20, marginBottom: 12 },
  reviewCardContent: { padding: 24 },
  reviewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewUserName: { fontSize: 18, fontWeight: '600', color: 'white' },
  reviewDate: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  reviewStarsRow: { flexDirection: 'row', marginBottom: 16 },
  reviewCommentText: { fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 22, marginBottom: 20 },
  reviewReplyButton: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  reviewReplyButtonText: { color: 'white', fontSize: 14, fontWeight: '500' },
  replyInputContainer: { marginTop: 8, gap: 16 },
  replyTextarea: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', padding: 16, minHeight: 100, fontSize: 16, textAlignVertical: 'top' },
  replyActionsRow: { flexDirection: 'row', gap: 12 },
  sendReplyButton: { backgroundColor: '#C026D3', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  sendReplyButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  cancelReplyButton: { backgroundColor: 'transparent', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  cancelReplyButtonText: { color: 'white', fontSize: 14, fontWeight: '500' },
  financialCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 20, marginBottom: 16 },
  financialHeader: { padding: 24, paddingBottom: 0 },
  financialTitle: { flexDirection: 'row', alignItems: 'center' },
  financialContent: { padding: 24, gap: 16 },
  financialRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  financialLabel: { fontSize: 16, color: 'rgba(255,255,255,0.6)' },
  financialValue: { fontSize: 16, color: 'white', fontWeight: '500' },
  financialValueDestructive: { fontSize: 16, color: '#FF6B6B', fontWeight: '500' },
  financialDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },
  financialNetLabel: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  financialNetValue: { fontSize: 18, fontWeight: 'bold', color: '#4ADE80' },
  mb2: { marginBottom: 8 },
});
