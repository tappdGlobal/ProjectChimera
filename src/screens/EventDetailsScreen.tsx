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
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Info,
  Star,
  ChevronRight,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { Theme } from "../styles/Theme";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

// --- MOCK DATA ---
const EVENT_IMAGES = [
  "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=800&q=80",
  "https://images.unsplash.com/photo-1533174072545-e8d9859f6471?w=800&q=80",
];

const TICKET_TYPES = [
  {
    id: "standard",
    name: "Standard Entry",
    price: "₹1,200",
    left: 45,
    features: ["Entry to event", "1 Welcome drink", "Access to main floor"],
  },
  {
    id: "premium",
    name: "Premium Pass",
    price: "₹2,500",
    left: 23,
    features: [
      "Entry to event",
      "3 Premium drinks",
      "VIP lounge access",
      "Priority entry",
    ],
  },
  {
    id: "table",
    name: "Table for 4",
    price: "₹8,000",
    left: 8,
    features: [
      "Reserved table for 4",
      "Bottle service",
      "Dedicated waiter",
      "Dance floor access",
    ],
  },
];

const REVIEWS = {
  event: [
    {
      id: "r1",
      name: "Priya M.",
      rating: 5,
      date: "Nov 15, 2024",
      text: "Amazing atmosphere! The DJ was incredible and the venue was perfect. Definitely attending the next one!",
    },
    {
      id: "r2",
      name: "Rahul K.",
      rating: 4,
      date: "Nov 10, 2024",
      text: "Great party, good music, and excellent service. The energy was infectious!",
    },
    {
      id: "r3",
      name: "Anisha S.",
      rating: 5,
      date: "Nov 8, 2024",
      text: "Best party I've been to this year! Everything was perfectly organized and the vibes were unmatched.",
    },
  ],
  host: [
    {
      id: "h1",
      name: "Vikram P.",
      rating: 5,
      date: "Nov 12, 2024",
      text: "Professional organizing and excellent communication. The event exceeded all expectations!",
    },
    {
      id: "h2",
      name: "Deepika R.",
      rating: 4,
      date: "Nov 5, 2024",
      text: "Well-organized event with great attention to detail. The host was responsive and accommodating.",
    },
    {
      id: "h3",
      name: "Arjun T.",
      rating: 5,
      date: "Oct 28, 2024",
      text: "Amazing host! Everything was as promised and more. Will definitely book again.",
    },
  ],
};

// --- COMPONENTS ---

const TabButton = ({
  title,
  isActive,
  onPress,
}: {
  title: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.tabButtonActive]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const DetailRow = ({
  icon,
  label,
  subLabel,
  rightElement,
}: {
  icon: React.ReactNode;
  label: string;
  subLabel?: string;
  rightElement?: React.ReactNode;
}) => (
  <View style={styles.detailRow}>
    <View style={styles.detailRowLeft}>
      {icon}
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        {subLabel && <Text style={styles.detailSubLabel}>{subLabel}</Text>}
      </View>
    </View>
    {rightElement}
  </View>
);

const ReviewCard = ({ review }: { review: any }) => (
  <Card style={styles.reviewCard}>
    <CardContent style={styles.reviewContent}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{review.name}</Text>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              color={
                i < review.rating ? "#FACC15" : Theme.colors.mutedForeground
              }
              fill={i < review.rating ? "#FACC15" : "transparent"}
            />
          ))}
          <Text style={styles.reviewDate}>{review.date}</Text>
        </View>
      </View>
      <Text style={styles.reviewText}>{review.text}</Text>
    </CardContent>
  </Card>
);

export function EventDetailsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<
    "Availability" | "Details" | "Reviews"
  >("Details");
  const { width } = Dimensions.get("window");

  const renderDetails = () => (
    <View style={styles.tabContent}>
      <Text style={styles.eventTitleLarge}>Jazz & Wine Night</Text>

      <View style={styles.detailsGroup}>
        <View style={styles.detailItem}>
          <Calendar size={20} color={Theme.colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.detailItemTitle}>Saturday, Dec 21, 2024</Text>
            <Text style={styles.detailItemSubtitle}>8:00 PM - 2:00 AM</Text>
          </View>
          <TouchableOpacity style={styles.actionButtonSmall}>
            <Text style={styles.actionButtonTextSmall}>Add to Calendar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailItem}>
          <MapPin size={20} color={Theme.colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.detailItemTitle}>Blue Note Jazz Cafe</Text>
          </View>
          <TouchableOpacity style={styles.actionButtonSmallOutline}>
            <Text style={styles.actionButtonTextSmallOutline}>Open Maps</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsGroup}>
        <View style={styles.detailItem}>
          <Users size={20} color={Theme.colors.primary} />
          <View>
            <Text style={styles.detailItemSubtitle}>Gender Preference</Text>
            <Text style={styles.detailItemTitle}>Mixed Gender</Text>
          </View>
        </View>
        <View style={styles.detailItem}>
          <Clock size={20} color={Theme.colors.primary} />
          <View>
            <Text style={styles.detailItemSubtitle}>Age Restrictions</Text>
            <Text style={styles.detailItemTitle}>All Ages Welcome</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <SectionTitle title="About This Event" />
      <Text style={styles.descriptionText}>
        Experience the smooth sounds of live jazz in an intimate setting with
        world-class musicians and craft cocktails.
      </Text>
    </View>
  );

  const renderAvailability = () => (
    <View style={styles.tabContent}>
      {TICKET_TYPES.map((ticket) => (
        <Card key={ticket.id} style={styles.ticketCard}>
          <CardContent style={styles.ticketContent}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketName}>{ticket.name}</Text>
              <Badge style={styles.ticketBadge}>
                <Text style={styles.ticketBadgeText}>{ticket.left} left</Text>
              </Badge>
            </View>
            <Text style={styles.ticketPrice}>{ticket.price}</Text>

            <View style={styles.featuresList}>
              {ticket.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </CardContent>
        </Card>
      ))}
    </View>
  );

  const renderReviews = () => (
    <View style={styles.tabContent}>
      <SectionTitle title="Event Reviews" />
      {REVIEWS.event.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      <View style={styles.spacer} />

      <SectionTitle title="Host Reviews" />
      {REVIEWS.host.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Theme.colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jazz & Wine Night</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Image Gallery */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.galleryContainer}
        >
          {EVENT_IMAGES.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img }}
              style={[styles.galleryImage, { width: width * 0.8 }]}
            />
          ))}
        </ScrollView>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <View style={styles.tabWrapper}>
            {(["Availability", "Details", "Reviews"] as const).map((tab) => (
              <TabButton
                key={tab}
                title={tab}
                isActive={activeTab === tab}
                onPress={() => setActiveTab(tab)}
              />
            ))}
          </View>
        </View>

        {/* Content */}
        {activeTab === "Details" && renderDetails()}
        {activeTab === "Availability" && renderAvailability()}
        {activeTab === "Reviews" && renderReviews()}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  galleryContainer: {
    padding: 16,
    gap: 12,
  },
  galleryImage: {
    height: 200,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.muted,
  },
  tabContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabWrapper: {
    flexDirection: "row",
    backgroundColor: "#1e1b2e", // Darker background for tabs
    borderRadius: 9999,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 9999,
  },
  tabButtonActive: {
    // Let's match the screenshot: Looks like the tab bar is standard segmented style.
    // Active tab seems to be highlighted.
    // Actually in screenshot "Details" is selected and has a dark background maybe?
    // Wait, let's use a standard look.
    // Screenshot 1: "Details" is active, looks like it has a bottom border or just text color?
    // Ah, wait. The screenshot shows a capsule style tab switcher.
    // Active tab has a lighter background.
    backgroundColor: Theme.colors.muted,
  },
  tabText: {
    color: Theme.colors.mutedForeground,
    fontWeight: "600",
    fontSize: 14,
  },
  tabTextActive: {
    color: Theme.colors.foreground,
  },
  tabContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  eventTitleLarge: {
    fontSize: 24,
    fontWeight: "bold",
    color: Theme.colors.foreground,
    marginBottom: 8,
  },
  detailsGroup: {
    gap: 16,
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
  actionButtonSmall: {
    backgroundColor: "#9333ea", // Purple-600
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonTextSmall: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtonSmallOutline: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonTextSmallOutline: {
    color: Theme.colors.foreground,
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Theme.colors.foreground,
    marginBottom: 12,
  },
  descriptionText: {
    color: Theme.colors.mutedForeground,
    lineHeight: 22,
    fontSize: 15,
  },

  // Ticket Card
  ticketCard: {
    backgroundColor: "#1e1b2e", // Dark card
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: Theme.radius.lg,
    padding: 0,
  },
  ticketContent: {
    padding: 16,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketName: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "600",
  },
  ticketBadge: {
    backgroundColor: "#be185d", // Pink-700
    borderWidth: 0,
  },
  ticketBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  ticketPrice: {
    color: "#a855f7", // Purple-500
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 8,
  },
  featuresList: {
    gap: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#a855f7",
  },
  featureText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },
  bookButton: {
    backgroundColor: "#9333ea", // Purple-600
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  bookButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Review Card
  reviewCard: {
    backgroundColor: "#1e1b2e",
    borderColor: Theme.colors.border,
    borderWidth: 1,
    marginBottom: 12,
  },
  reviewContent: {
    padding: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerName: {
    color: Theme.colors.foreground,
    fontWeight: "bold",
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewDate: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
    marginLeft: 8,
  },
  reviewText: {
    color: Theme.colors.mutedForeground,
    lineHeight: 20,
  },
  spacer: {
    height: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  detailRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailTextContainer: {
    gap: 2,
  },
  detailLabel: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "500",
  },
  detailSubLabel: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },
});
