// src/components/common/RecommendedEvents.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ChevronRight } from "lucide-react-native";
import { EventCard } from "./EventCard";
import { Button } from "../ui/Button";
import { Theme } from "../../styles/Theme";

type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
};

const recommendedEvents: Event[] = [
  {
    id: "1",
    title: "Summer Rooftop Party",
    date: "Sep 22",
    time: "8:00 PM",
    location: "Sky Lounge, Downtown",
    image:
      "https://images.unsplash.com/photo-1709131407822-84a466b130c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: "2",
    title: "Live Jazz Night",
    date: "Sep 24",
    time: "9:00 PM",
    location: "Blue Note Cafe",
    image:
      "https://images.unsplash.com/photo-1631061434620-db65394197e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

interface RecommendedEventsProps {
  onEventSelect?: (event: Event) => void;
  onExploreAllClick?: () => void;
}

export function RecommendedEvents({
  onEventSelect,
  onExploreAllClick,
}: RecommendedEventsProps) {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recommended for You</Text>
      </View>

      {/* HORIZONTAL EVENT LIST */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recommendedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            size="small"
            onClick={() => onEventSelect?.(event)}
          />
        ))}

        {/* EXPLORE ALL */}
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
