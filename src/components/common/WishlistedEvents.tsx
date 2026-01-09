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
      "https://images.unsplash.com/photo-1655238865814-1e57e8dff451",
    isWishlisted: true,
  },
  {
    id: "w2",
    title: "Silent Film & Wine Tasting",
    date: "Oct 8",
    time: "6:30 PM",
    location: "Historic Movie Palace",
    image:
      "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0",
    isWishlisted: true,
  },
];

interface WishlistedEventsProps {
  onEventSelect?: (event: any) => void;   // ✅ FIXED
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
            showWishlist={true}
            onClick={() => onEventSelect?.(event)}   // ✅ PASS FULL EVENT
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

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContent: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 8,
  },
  exploreAllWrapper: {
    flexShrink: 0,
    width: 128,
    justifyContent: "center",
    alignItems: "center",
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
  },
});
