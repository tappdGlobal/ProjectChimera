// src/components/common/TrendingEvents.tsx

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { EventCard } from "./EventCard"; // Use our migrated EventCard
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
      "https://images.unsplash.com/photo-1631061434620-db65394197e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNsaXZlJTIwbXVzaWMlMjBjb25jZXJ0fGVufDF8fHx8MTc1ODA1OTIzM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "t2",
    title: "Exclusive Nightclub Opening",
    date: "Sep 30",
    time: "11:00 PM",
    location: "The Underground, Midtown",
    image:
      "https://images.unsplash.com/photo-1709131407822-84a466b130c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodGxpZmUlMjBwYXJ0eSUyMGV2ZW50fGVufDF8fHx8MTc1ODE1NTg4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  // ... rest of the events
];

interface TrendingEventsProps {
  onEventSelect?: (eventId: string, eventName: string) => void;
  onExploreAllClick?: () => void;
}

export function TrendingEvents({
  onEventSelect,
  onExploreAllClick,
}: TrendingEventsProps) {
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
        {trendingEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            size="small"
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
