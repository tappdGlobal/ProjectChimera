// src/components/common/TrendingEvents.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { EventCard } from "./EventCard";
import { Theme } from "../../styles/Theme";
import { FeedEvent } from "../../types/feedTypes";

interface TrendingEventsProps {
  events: FeedEvent[];
  loading?: boolean;
  onEventSelect?: (event: FeedEvent) => void;
  searchQuery?: string;
}
export function TrendingEvents({
  events,
  loading = false,
  onEventSelect,
  searchQuery = "",
}: TrendingEventsProps) {

  /* ================= DATE FORMATTER ================= */

  const formatEventDateTime = (dateStr: string, timeStr?: string) => {
    try {
      let dateObj: Date;

      if (dateStr.includes("T")) {
        dateObj = new Date(dateStr);
      } else if (timeStr) {
        dateObj = new Date(`${dateStr}T${timeStr}`);
      } else {
        dateObj = new Date(dateStr);
      }

      if (isNaN(dateObj.getTime())) return dateStr;

      const month = dateObj.toLocaleString("en-US", { month: "short" });
      const day = dateObj.getDate();

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

  /* ================= FILTER ================= */

  const filteredEvents = (events ?? []).filter(
    (event) =>
      searchQuery === "" ||
      event.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (searchQuery && filteredEvents.length === 0) {
    return null;
  }

  /* ================= RENDER ================= */

  return (
    <View style={styles.container}>
      {/* 🔥 TITLE ALWAYS VISIBLE */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Trending in Your Area
        </Text>
      </View>

      {/* 🔥 CONTENT AREA ONLY LOADING */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : !filteredEvents || filteredEvents.length === 0 ? (
        <Text style={styles.emptyText}>
          No trending events right now
        </Text>
      ) : (
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
                date: formatEventDateTime(event.eventDate, event.eventTime),
                time: "",
                location: `${event.venue}, ${event.city}`,
                image: event.images?.[0] ?? "",
              }}
              size="small"
              onClick={() => onEventSelect?.(event)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  emptyText: {
    color: Theme.colors.mutedForeground,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  loaderContainer: {
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
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
});