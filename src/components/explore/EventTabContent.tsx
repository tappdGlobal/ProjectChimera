import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Modal, Pressable } from "react-native";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { TicketDetailModal } from "./TicketDetailModal";

const events = [
  {
    title: "Rooftop Jazz Night",
    location: "Sky Lounge, Mumbai",
    date: "12/15/2024",
    time: "8:00 PM",
    status: "upcoming",
  },
  {
    title: "Tech Startup Pitch Night",
    location: "Innovation Hub, Bangalore",
    date: "11/28/2024",
    time: "6:30 PM",
    status: "completed",
    rating: 5,
  },
  {
    title: "Summer Food Festival",
    location: "Central Plaza, Delhi",
    date: "12/5/2024",
    time: "12:00 PM",
    status: "ongoing",
  },
  {
    title: "AI Developers Meetup",
    location: "Cyber Hub, Gurugram",
    date: "12/18/2024",
    time: "5:00 PM",
    status: "upcoming",
  },
  {
    title: "Indie Music Concert",
    location: "Phoenix Mall, Pune",
    date: "11/10/2024",
    time: "7:30 PM",
    status: "completed",
    rating: 4,
  },
];

export function EventTabContent() {
  const [showTicketModal, setShowTicketModal] = useState(false);
  return (
    <>
      <ScrollView style={styles.container}>
        {events.map((item, index) => (
          <View key={index} style={styles.card}>
            {/* TOP */}
            <View style={styles.topRow}>
              <View style={styles.imagePlaceholder} />

              <View style={styles.info}>
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <View
                    style={[
                      styles.badge,
                      item.status === "upcoming" && styles.upcomingBadge,
                      item.status === "ongoing" && styles.ongoingBadge,
                      item.status === "completed" && styles.completedBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        item.status === "upcoming" && styles.upcomingText,
                        item.status === "ongoing" && styles.ongoingText,
                        item.status === "completed" && styles.completedText,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.location}>{item.location}</Text>

                <View style={styles.metaRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={15}
                    color={Theme.colors.mutedForeground}
                  />
                  <Text style={styles.metaText}>{item.date}</Text>

                  <Ionicons
                    name="time-outline"
                    size={15}
                    color={Theme.colors.mutedForeground}
                    style={{ marginLeft: 14 }}
                  />
                  <Text style={styles.metaText}>{item.time}</Text>
                </View>
              </View>
            </View>

            {/* BUTTON */}
            <Pressable onPress={() => setShowTicketModal(true)}>
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
                <Text style={styles.buttonText}>View Ticket</Text>
              </LinearGradient>
            </Pressable>


            {/* RATING */}
            {item.rating && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={18} color="#facc15" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>
        ))}


      </ScrollView>
      <Modal
        visible={showTicketModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTicketModal(false)}
      >
        <TicketDetailModal onClose={() => setShowTicketModal(false)} />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingHorizontal: Theme.spacing.m,
  },

  card: {
    marginTop: Theme.spacing.l,
    padding: Theme.spacing.l,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  topRow: {
    flexDirection: "row",
    marginBottom: Theme.spacing.l,
  },

  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: Theme.radius.md,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginRight: Theme.spacing.m,
  },

  info: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },

  location: {
    color: Theme.colors.mutedForeground,
    fontSize: 15,
    marginTop: 4,
  },

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

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
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

  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  upcomingText: { color: "#60a5fa" },
  ongoingText: { color: "#22c55e" },
  completedText: { color: Theme.colors.mutedForeground },

  button: {
    marginTop: Theme.spacing.m,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingVertical: 14,
    paddingHorizontal: 28,

    borderRadius: Theme.radius.lg,

    marginLeft: 64 + Theme.spacing.m,
  },




  buttonText: {
    color: Theme.colors.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Theme.spacing.m,
  },

  ratingText: {
    color: Theme.colors.foreground,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },
});
