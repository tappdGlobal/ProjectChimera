// src/components/common/TrendingEvents.tsx

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { EventCard } from "./EventCard";
import { Button } from "../ui/Button";
import { Theme } from "../../styles/Theme";

const trendingEvents = [
  {
    id: "t1",
    title: "Electronic Music Festival 2024",
    date: "Oct 1-3",
    time: "All Day",
    location: "Central Park Amphitheater",
    image:
      "https://images.unsplash.com/photo-1631061434620-db65394197e2",
  },
  {
    id: "t2",
    title: "Exclusive Nightclub Opening",
    date: "Sep 30",
    time: "11:00 PM",
    location: "The Underground, Midtown",
    image:
      "https://images.unsplash.com/photo-1709131407822-84a466b130c2",
  },
];

interface TrendingEventsProps {
  onEventSelect?: (event: any) => void;   // ✅ FIXED
  onExploreAllClick?: () => void;
  searchQuery?: string;
}

export function TrendingEvents({
  onEventSelect,
  onExploreAllClick,
  searchQuery = "",
}: TrendingEventsProps) {
  // Filter events based on search query
  const filteredEvents = trendingEvents.filter(event =>
    searchQuery === "" ||
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Don't render if no results from search
  if (searchQuery && filteredEvents.length === 0) {
    return null;
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trending in Your Area</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            size="small"
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
