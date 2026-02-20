// src/components/common/RecommendedEvents.tsx

import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { EventCard } from "./EventCard";
import { Theme } from "../../styles/Theme";
import { FeedEvent } from "../../types/feedTypes";

interface RecommendedEventsProps {
  events: FeedEvent[];
  loading?: boolean;
  onEventSelect?: (event: FeedEvent) => void;
  searchQuery?: string;
}

export function RecommendedEvents({
  events,
  loading = false,
  onEventSelect,
  searchQuery = "",
}: RecommendedEventsProps) {

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  /* ================= DATE FORMATTER ================= */

const formatEventDateTime = (
  dateStr: string,
  timeStr?: string
) => {
  try {
    let dateObj: Date;

    // ISO format
    if (dateStr.includes("T")) {
      dateObj = new Date(dateStr);
    } 
    // Separate date + time
    else if (timeStr) {
      dateObj = new Date(`${dateStr}T${timeStr}`);
    } 
    // Only date
    else {
      dateObj = new Date(dateStr);
    }

    if (isNaN(dateObj.getTime())) {
      return dateStr;
    }

    // Month Day format (Mar 10)
    const month = dateObj.toLocaleString("en-US", {
      month: "short",
    });

    const day = dateObj.getDate();

    // Time with uppercase AM/PM
    const time = dateObj
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();

    return `${month} ${day} · ${time}`;
  } catch {
    return dateStr;
  }
};

  /* ================= FILTER EVENTS ================= */

  const filteredEvents = events.filter(
    (event) =>
      searchQuery === "" ||
      event.eventName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      event.city
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  if (searchQuery && filteredEvents.length === 0) {
    return null;
  }

  if (!events || events.length === 0) {
    return null;
  }

  /* ================= RENDER ================= */

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Recommended for You
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={{
              id: event.id,
              title: event.eventName,
              date: formatEventDateTime(
                event.eventDate,
                event.eventTime
              ),
              time: "", // combined already
              location: `${event.venue}, ${event.city}`,
              image: event.images?.[0] ?? "",
            }}
            size="small"
            onClick={() => onEventSelect?.(event)}
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
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
