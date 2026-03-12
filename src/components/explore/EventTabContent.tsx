import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Image,
} from "react-native";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { TicketDetailModal } from "./TicketDetailModal";
import { useEffect } from "react";
import { useBookingStore } from "../../store/bookingStore";
import { ActivityIndicator } from "react-native";
import ComingSoon from "../common/ComingSoon";
export function EventTabContent() {
  const { bookings, fetchMyBookings, loading } = useBookingStore();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  useEffect(() => {
    fetchMyBookings();
  }, []);

  const getEventStatus = (eventDate?: string, eventTime?: string) => {
    if (!eventDate || !eventTime) return "upcoming";

    const now = new Date();
    const eventDateTime = new Date(eventDate);

    const [hours, minutes] = eventTime?.split(":")?.map(Number) ?? [0, 0];

    eventDateTime.setHours(hours);
    eventDateTime.setMinutes(minutes);
    eventDateTime.setSeconds(0);

    const eventEndTime = new Date(eventDateTime.getTime() + 2 * 60 * 60 * 1000);

    if (now < eventDateTime) return "upcoming";
    if (now >= eventDateTime && now <= eventEndTime) return "ongoing";
    return "completed";
  };
  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: Theme.spacing.xl,
          flexGrow: 1,
        }}
      >
        {/* 🔥 LOADER */}
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator
              size="large"
              color={Theme.colors.primary}
            />
          </View>
        )}

        {/* 🔥 EMPTY STATE */}
        {!loading && bookings?.length === 0 && (
          <Text style={styles.emptyText}>
            No bookings yet
          </Text>
        )}

        {/* 🔥 BOOKINGS LIST */}
        {!loading &&
          bookings
            ?.filter((booking) => booking && booking.event)
            .map((booking) => {
              const event = booking.event!;

              const status = getEventStatus(
                event.eventDate,
                event.eventTime
              );

              return (
                <View key={booking.id} style={styles.card}>

                  {/* 🔥 STATUS BADGE (TOP RIGHT CORNER) */}
                  <View
                    style={[
                      styles.badge,
                      status === "upcoming" && styles.upcomingBadge,
                      status === "ongoing" && styles.ongoingBadge,
                      status === "completed" && styles.completedBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        status === "upcoming" && styles.upcomingText,
                        status === "ongoing" && styles.ongoingText,
                        status === "completed" && styles.completedText,
                      ]}
                    >
                      {status}
                    </Text>
                  </View>

                  {/* 🔥 CONTENT STARTS BELOW BADGE */}
                  <View style={styles.cardContent}>

                    {/* IMAGE */}
                    <Image
                      source={{
                        uri: event.images?.[0] ?? "https://via.placeholder.com/150",
                      }}
                      style={styles.image}
                      resizeMode="cover"
                    />

                    {/* TITLE */}
                    <Text style={styles.title}>
                      {event.eventName}
                    </Text>

                    {/* LOCATION */}
                    <Text style={styles.location}>
                      {event.venue}, {event.city}
                    </Text>

                    {/* DATE + TIME */}
                    <View style={styles.metaRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={15}
                        color={Theme.colors.mutedForeground}
                      />
                      <Text style={styles.metaText}>
                        {new Date(event.eventDate).toLocaleDateString()}
                      </Text>

                      <Ionicons
                        name="time-outline"
                        size={15}
                        color={Theme.colors.mutedForeground}
                        style={{ marginLeft: 14 }}
                      />
                      <Text style={styles.metaText}>
                        {event.eventTime}
                      </Text>
                    </View>

                  </View>

                  {/* 🔥 BUTTON */}
                  <Pressable
                    onPress={() => {
                      setSelectedBooking(booking);
                    }}
                  >
                    <LinearGradient
                      colors={GRADIENT_COLORS.primary as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.button}
                    >
                      <Ionicons
                        name="ticket-outline"
                        size={18}
                        color={Theme.colors.primaryForeground}
                        style={{ marginRight: 10 }}
                      />
                      <Text style={styles.buttonText}>
                        View Ticket
                      </Text>
                    </LinearGradient>
                  </Pressable>

                </View>


              );
            })}
      </ScrollView>

      {selectedBooking && (
        <Modal transparent animationType="slide">
          <TicketDetailModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
          />
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingHorizontal: Theme.spacing.m,
    paddingBottom: Theme.spacing.l * 2,
  },

  /* CARD */
  card: {
    marginTop: Theme.spacing.l,
    padding: Theme.spacing.l,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    position: "relative",
  },

  /* STATUS BADGE */
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  upcomingBadge: {
    backgroundColor: "rgba(59,130,246,0.12)",
    borderColor: "rgba(147,197,253,0.6)",
  },

  ongoingBadge: {
    backgroundColor: "rgba(34,197,94,0.12)",
    borderColor: "rgba(134,239,172,0.6)",
  },

  completedBadge: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.25)",
  },

  upcomingText: { color: "#60a5fa" },
  ongoingText: { color: "#22c55e" },
  completedText: { color: Theme.colors.mutedForeground },

  /* CONTENT BELOW BADGE */
  cardContent: {
    marginTop: 24,
  },

  /* IMAGE */
  image: {
    width: "100%",
    height: 150,
    borderRadius: Theme.radius.md,
    marginBottom: 12,
  },

  /* TEXT */
  title: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "600",
  },

  location: {
    color: Theme.colors.mutedForeground,
    fontSize: 15,
    marginTop: 4,
  },

  /* DATE + TIME */
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  metaText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    marginLeft: 6,
  },

  /* BUTTON */
  button: {
    marginTop: Theme.spacing.m,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: Theme.radius.lg,
  },

  buttonText: {
    color: Theme.colors.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },

  /* LOADER + EMPTY */
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },

  emptyText: {
    color: Theme.colors.mutedForeground,
    textAlign: "center",
    marginTop: 60,
  },
});

