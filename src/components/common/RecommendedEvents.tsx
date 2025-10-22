// src/components/common/RecommendedEvents.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { ChevronRight } from "lucide-react-native";
import { EventCard } from "./EventCard"; // Use our migrated EventCard
import { Button } from "../ui/Button";
import { Theme } from "../../styles/Theme";

const recommendedEvents = [
  {
    id: "1",
    title: "Summer Rooftop Party",
    date: "Sep 22",
    time: "8:00 PM",
    location: "Sky Lounge, Downtown",
    image:
      "https://images.unsplash.com/photo-1709131407822-84a466b130c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodGxpZmUlMjBwYXJ0eSUyMGV2ZW50fGVufDF8fHx8MTc1ODE1NTg4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "2",
    title: "Live Jazz Night",
    date: "Sep 24",
    time: "9:00 PM",
    location: "Blue Note Cafe",
    image:
      "https://images.unsplash.com/photo-1631061434620-db65394197e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNsaXZlJTIwbXVzaWMlMjBjb25jZXJ0fGVufDF8fHx8MTc1ODA1OTIzM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  // ... rest of the events are in the source file, using the first two as examples ...
];

interface RecommendedEventsProps {
  onEventSelect?: (eventId: string, eventName: string) => void;
  onExploreAllClick?: () => void;
}

export function RecommendedEvents({
  onEventSelect,
  onExploreAllClick,
}: RecommendedEventsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recommended for You</Text>
      </View>

      {/* ScrollView for horizontal list (replacing overflow-x-auto scrollbar-hide) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recommendedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            size="small" // w-64 equivalent in web
            onClick={() => onEventSelect?.(event.id, event.title)}
          />
        ))}

        {/* Explore All button (at the end of the scroll list) */}
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
