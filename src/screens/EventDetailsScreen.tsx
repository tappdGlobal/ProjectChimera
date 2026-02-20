import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GRADIENT_COLORS } from "../styles/Theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, Linking } from "react-native";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Star,
} from "lucide-react-native";
import {
  useNavigation,
  useRoute,
  RouteProp,
} from "@react-navigation/native";

import { Theme } from "../styles/Theme";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

import {
  ExploreStackParamList,
  SCREEN_NAMES,
} from "../navigation/Routes";

import { FeedEvent } from "../types/feedTypes";

/* ================= ROUTE TYPE ================= */

type RouteType = RouteProp<
  ExploreStackParamList,
  typeof SCREEN_NAMES.EVENT_DETAIL
>;

/* ================= DUMMY REVIEWS (UNCHANGED) ================= */

const REVIEWS = {
  event: [
    {
      id: "r1",
      name: "Priya M.",
      rating: 5,
      date: "Nov 15, 2024",
      text: "Amazing atmosphere! The DJ was incredible and the venue was perfect.",
    },
  ],
  host: [
    {
      id: "h1",
      name: "Vikram P.",
      rating: 5,
      date: "Nov 12, 2024",
      text: "Professional organizing and excellent communication.",
    },
  ],
};

export function EventDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const event: FeedEvent = route.params.event;

  const [activeTab, setActiveTab] = useState<
    "Availability" | "Details" | "Reviews"
  >("Details");

  const { width } = Dimensions.get("window");

  const genderPreference = "Mixed Gender";
  const handleAddToCalendar = async () => {
    try {
      // 1️⃣ Parse ISO date directly
      const baseDate = new Date(event.eventDate);

      if (isNaN(baseDate.getTime())) {
        Alert.alert("Invalid date from API");
        return;
      }

      // 2️⃣ Override hours using eventTime (04:30)
      const [hours, minutes] = event.eventTime
        .split(":")
        .map(Number);

      baseDate.setHours(hours);
      baseDate.setMinutes(minutes);
      baseDate.setSeconds(0);

      const startDate = new Date(baseDate);
      const endDate = new Date(
        startDate.getTime() + 2 * 60 * 60 * 1000
      );

      // 3️⃣ Google calendar format (LOCAL TIME, no UTC conversion)
      const formatDateForGoogle = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");

        return `${yyyy}${mm}${dd}T${hh}${min}00`;
      };

      const start = formatDateForGoogle(startDate);
      const end = formatDateForGoogle(endDate);

      const url =
        `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(event.eventName)}` +
        `&dates=${start}/${end}` +
        `&details=${encodeURIComponent(event.description || "")}` +
        `&location=${encodeURIComponent(
          `${event.venue}, ${event.city}, ${event.country}`
        )}`;

      await Linking.openURL(url);
    } catch (error) {
      console.log("Calendar error:", error);
      Alert.alert("Unable to open calendar");
    }
  };
  const handleOpenMaps = () => {
    if (event.latitude && event.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert("Location not available");
    }
  };
  /* ================= DETAILS TAB ================= */

  const renderDetails = () => (
    <View style={styles.tabContent}>
      <Text style={styles.eventTitleLarge}>
        {event.eventName}
      </Text>

      {/* DATE + CALENDAR */}
      <View style={styles.rowBetween}>
        <View style={styles.row}>
          <Calendar size={20} color={Theme.colors.primary} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.detailItemTitle}>
              {new Date(event.eventDate).toDateString()}
            </Text>
            <Text style={styles.detailItemSubtitle}>
              {event.eventTime}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleAddToCalendar}
        >
          <LinearGradient
            colors={GRADIENT_COLORS.primary as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Text style={styles.gradientButtonText}>
              Add to Calendar
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* LOCATION */}
      <View style={styles.rowBetween}>
        <View style={styles.row}>
          <MapPin size={20} color={Theme.colors.primary} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.detailItemTitle}>
              {event.venue}
            </Text>
            <Text style={styles.detailItemSubtitle}>
              {event.city}, {event.country}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={handleOpenMaps}
        >
          <Text style={styles.outlineButtonText}>
            Open Maps
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* GENDER */}
      <View style={styles.detailItem}>
        <Users size={20} color={Theme.colors.primary} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.detailItemSubtitle}>
            Gender Preference
          </Text>
          <Text style={styles.detailItemTitle}>
            {genderPreference}
          </Text>
        </View>
      </View>

      {/* AGE */}
      <View style={styles.detailItem}>
        <Clock size={20} color={Theme.colors.primary} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.detailItemSubtitle}>
            Age Restrictions
          </Text>
          <Text style={styles.detailItemTitle}>
            {event.ageLimit ?? "Not specified"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>
        About This Event
      </Text>
      <Text style={styles.descriptionText}>
        {event.description}
      </Text>
    </View>
  );

  /* ================= AVAILABILITY TAB ================= */

  const renderAvailability = () => (
    <View style={styles.tabContent}>
      {event.tickets.map((ticket, index) => {
        const available =
          ticket.quantityTotal - (ticket.quantitySold ?? 0);

        return (
          <Card key={index} style={styles.ticketCard}>
            <CardContent style={styles.ticketContent}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketName}>
                  {ticket.ticketLabel}
                </Text>

                <LinearGradient
                  colors={GRADIENT_COLORS.primary as [string, string]}
                  style={styles.leftBadge}
                >
                  <Text style={styles.leftBadgeText}>
                    {available} left
                  </Text>
                </LinearGradient>
              </View>

              <Text style={styles.ticketPrice}>
                {ticket.ticketType === "Free"
                  ? "Free"
                  : `₹${ticket.price}`}
              </Text>

              <TouchableOpacity
                disabled={available === 0}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={GRADIENT_COLORS.primary as [string, string]}
                  style={[
                    styles.bookButton,
                    available === 0 && { opacity: 0.5 },
                  ]}
                >
                  <Text style={styles.bookButtonText}>
                    {available === 0
                      ? "Sold Out"
                      : "Book Now"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </CardContent>
          </Card>
        );
      })}
    </View>
  );

  /* ================= REVIEWS TAB (DUMMY) ================= */

  const renderReviews = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>
        Event Reviews
      </Text>

      {REVIEWS.event.map((review) => (
        <View key={review.id} style={styles.reviewCardNew}>
          {/* Header Row */}
          <View style={styles.reviewHeaderRow}>
            <View style={styles.reviewUserRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {review.name.charAt(0)}
                </Text>
              </View>

              <View>
                <Text style={styles.reviewerNameNew}>
                  {review.name}
                </Text>
                <Text style={styles.reviewDateNew}>
                  {review.date}
                </Text>
              </View>
            </View>

            <View style={styles.ratingRow}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  color={
                    i < review.rating
                      ? "#FFD700"
                      : Theme.colors.mutedForeground
                  }
                  fill={
                    i < review.rating
                      ? "#FFD700"
                      : "transparent"
                  }
                />
              ))}
            </View>
          </View>

          {/* Review Text */}
          <Text style={styles.reviewTextNew}>
            {review.text}
          </Text>
        </View>
      ))}
    </View>
  );

  /* ================= MAIN RETURN ================= */

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft
            size={24}
            color={Theme.colors.foreground}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {event.eventName}
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.galleryContainer}
        >
          {event.images?.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img }}
              style={[
                styles.galleryImage,
                { width: width * 0.8 },
              ]}
            />
          ))}
        </ScrollView>

        <View style={styles.segmentContainer}>
          {(["Availability", "Details", "Reviews"] as const).map(
            (tab, index) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.segmentButton,
                  activeTab === tab && styles.segmentButtonActive,
                  index === 0 && styles.leftEdge,
                  index === 2 && styles.rightEdge,
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === tab && styles.segmentTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {activeTab === "Details" && renderDetails()}
        {activeTab === "Availability" &&
          renderAvailability()}
        {activeTab === "Reviews" && renderReviews()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },

  /* ================= HEADER ================= */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Theme.spacing.m,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },

  headerTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "600",
  },

  /* ================= GALLERY ================= */

  galleryContainer: {
    padding: Theme.spacing.m,
    gap: Theme.spacing.s,
  },

  galleryImage: {
    height: 200,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.muted,
  },

  /* ================= SEGMENTED TABS ================= */

  segmentContainer: {
    flexDirection: "row",
    marginHorizontal: Theme.spacing.m,
    marginTop: Theme.spacing.m,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.lg,
    overflow: "hidden",
  },

  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },

  segmentButtonActive: {
    backgroundColor: Theme.colors.muted,
  },

  segmentText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    fontWeight: "600",
  },

  segmentTextActive: {
    color: Theme.colors.foreground,
  },

  /* ================= CONTENT ================= */

  tabContent: {
    paddingHorizontal: Theme.spacing.m,
    paddingTop: Theme.spacing.m,
    gap: Theme.spacing.m,
  },

  eventTitleLarge: {
    fontSize: 24,
    fontWeight: "700",
    color: Theme.colors.foreground,
  },

  detailsGroup: {
    gap: Theme.spacing.m,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  detailItemTitle: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "500",
  },

  detailItemSubtitle: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.s,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.foreground,
    marginBottom: Theme.spacing.s,
  },

  descriptionText: {
    color: Theme.colors.mutedForeground,
    lineHeight: 22,
    fontSize: 15,
  },

  /* ================= PREMIUM TICKET CARD ================= */

  ticketCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.xl,
    marginBottom: Theme.spacing.l,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },

  ticketContent: {
    padding: Theme.spacing.m,
  },

  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  ticketName: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.foreground,
  },

  leftBadge: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  leftBadgeText: {
    color: Theme.colors.primaryForeground,
    fontSize: 12,
    fontWeight: "600",
  },

  ticketPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: Theme.colors.primary,
    marginTop: Theme.spacing.s,
    marginBottom: Theme.spacing.m,
  },

  featuresList: {
    marginBottom: Theme.spacing.m,
    gap: Theme.spacing.s,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.primary,
    marginRight: 10,
  },

  featureText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },

  bookButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 14,
    borderRadius: Theme.radius.lg,
    alignItems: "center",
  },

  bookButtonText: {
    color: Theme.colors.primaryForeground,
    fontWeight: "600",
    fontSize: 16,
  },

  /* ================= REVIEW CARD ================= */

  reviewCard: {
    backgroundColor: Theme.colors.card,
    borderColor: Theme.colors.border,
    borderWidth: 1,
    marginBottom: Theme.spacing.m,
    borderRadius: Theme.radius.lg,
  },

  reviewContent: {
    padding: Theme.spacing.m,
  },

  reviewerName: {
    color: Theme.colors.foreground,
    fontWeight: "600",
    fontSize: 16,
  },

  reviewText: {
    color: Theme.colors.mutedForeground,
    lineHeight: 20,
    marginTop: 6,
  },

  spacer: {
    height: Theme.spacing.l,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.m,
  },

  primaryButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.radius.md,
  },

  primaryButtonText: {
    color: Theme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: "600",
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.radius.md,
  },

  outlineButtonText: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "500",
  },
  gradientButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Theme.radius.md,
    justifyContent: "center",
    alignItems: "center",
  },

  gradientButtonText: {
    color: Theme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: "600",
  },
  reviewCardNew: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.m,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.m,
  },

  reviewHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  reviewUserRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  avatarText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  reviewerNameNew: {
    color: Theme.colors.foreground,
    fontWeight: "600",
    fontSize: 15,
  },

  reviewDateNew: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },

  ratingRow: {
    flexDirection: "row",
    gap: 2,
  },

  reviewTextNew: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    lineHeight: 20,
  },
});
