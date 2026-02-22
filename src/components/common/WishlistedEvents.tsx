// src/components/common/WishlistedEvents.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Theme } from "../../styles/Theme";
import { WishlistEvent } from "../../types/wishlistTypes";
import { WishlistEventCard } from "./WishlistEventCard";
interface WishlistedEventsProps {
  events?: WishlistEvent[];
  loading?: boolean;
  onEventSelect?: (event: WishlistEvent) => void;
  searchQuery?: string;
}

export function WishlistedEvents({
  events = [],
  loading = false,
  onEventSelect,
  searchQuery = "",
}: WishlistedEventsProps) {

  /* ================= DATE FORMATTER ================= */



  /* ================= SAFE FILTER ================= */

  const filteredEvents = events.filter((event) =>
    searchQuery === "" ||
    event.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Wishlist</Text>
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color={Theme.colors.primary}
          />
        </View>
      </View>
    );
  }

  /* ================= EMPTY ================= */

  if (!filteredEvents || filteredEvents.length === 0) {
    return null;
  }

  /* ================= RENDER ================= */
  console.log("🖼 First wishlist image:", events[0]?.event?.images);
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
        {filteredEvents.map((event) => (
          <WishlistEventCard
            key={event.id}
            event={{
              id: event.event.id,
              title: event.event.eventName,
              date: event.event.eventDate,
              time: event.event.eventTime,
              location: event.event.location || event.event.venue,
              image: event.event.images?.[0],
            }}
            showWishlist
            onClick={() => onEventSelect?.(event.event)}
          />
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  header: {
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
  loaderContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});