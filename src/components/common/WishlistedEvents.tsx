// src/components/common/WishlistedEvents.tsx

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { EventCard } from "./EventCard";
import { Button } from "../ui/Button";
import { Theme } from "../../styles/Theme";

const wishlistedEvents = [
  {
    id: "w1",
    title: "Intimate House Concert",
    date: "Oct 5",
    time: "7:00 PM",
    location: "Artist's Studio, Brooklyn",
    image:
      "https://images.unsplash.com/photo-1655238865814-1e57e8dff451?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxob3VzZSUyMHBhcnR5JTIwZnJpZW5kc3xlbnwxfHx8fDE3NTgxNTU4OTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isWishlisted: true,
  },
  {
    id: "w2",
    title: "Silent Film & Wine Tasting",
    date: "Oct 8",
    time: "6:30 PM",
    location: "Historic Movie Palace",
    image:
      "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxtb3ZpZSUyMHRoZWF0ZXIlMjBjaW5lbWF8ZW58MXx8fHwxNzU4MTUzMjUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isWishlisted: true,
  },
  // ... rest of the events
];

interface WishlistedEventsProps {
  onEventSelect?: (eventId: string, eventName: string) => void;
  onExploreAllClick?: () => void;
}

export function WishlistedEvents({
  onEventSelect,
  onExploreAllClick,
}: WishlistedEventsProps) {
  if (wishlistedEvents.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Wishlist</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {wishlistedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            size="small"
            showWishlist={true} // Explicitly show the Heart icon
            onClick={() => onEventSelect?.(event.id, event.title)}
          />
        ))}

        <View style={styles.exploreAllWrapper}>
          <Button
            variant="outline"
            onClick={onExploreAllClick}
            style={styles.exploreAllButton}
            textStyle={styles.exploreAllText}
          >
            Explore All
            <ChevronRight
              size={16}
              color={Theme.colors.primary}
              style={styles.chevron}
            />
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

// Inside src/components/common/RecommendedEvents.tsx, TrendingEvents.tsx, AND WishlistedEvents.tsx

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16, // Keep header text aligned
    marginBottom: 16,
  },
  headerTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "bold",
  },
  // FIX: This style now controls ALL horizontal padding/gap
  scrollContent: {
    flexDirection: "row",
    paddingHorizontal: 16, // Left and Right padding for the whole scroll view
    gap: 16, // Use Flexbox 'gap' property for consistent spacing between items
    paddingBottom: 8,
  },
  cardSpacing: {
    // REMOVED: marginRight: 16, - Let the 'gap' property handle spacing
  },
  // FIX: Ensure Explore All button is centered and styled correctly
  exploreAllWrapper: {
    flexShrink: 0,
    width: 128,
    justifyContent: "center",
    alignItems: "center",
    // MARGINS REMOVED: rely on scrollContent's padding/gap
  },
  exploreAllButton: {
    borderColor: Theme.colors.primary,
    borderWidth: 1,
    borderRadius: 9999,
    minHeight: 40,
  },
  exploreAllText: {
    color: Theme.colors.primary,
  },
  chevron: {
    marginLeft: 4,
    color: Theme.colors.primary,
  },
});
