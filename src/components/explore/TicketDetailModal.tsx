import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  onClose: () => void;
}

export function TicketDetailModal({ onClose }: Props) {
  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        {/* ❌ CLOSE BUTTON (ALWAYS VISIBLE) */}
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
          <Ionicons name="close" size={26} color={Theme.colors.foreground} />
        </Pressable>

        {/* ✅ SCROLLABLE CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.headerTitle}>Your Ticket</Text>
          <Text style={styles.subtitle}>
            Show this QR code at the venue entrance
          </Text>

          {/* QR */}
          <View style={styles.qrCard}>
            <View style={styles.qrBox}>
              <Ionicons
                name="ticket-outline"
                size={64}
                color={Theme.colors.primary}
              />
              <Text style={styles.code}>VIP-001</Text>
            </View>
          </View>

          {/* INFO CARD */}
          <View style={styles.infoCard}>
            <Text style={styles.eventTitle}>Rooftop Jazz Night</Text>

            <InfoRow label="Date:" value="12/15/2024" />
            <InfoRow label="Time:" value="8:00 PM" />
            <InfoRow label="Ticket Type:" value="VIP" />
            <InfoRow label="Ticket Number:" value="VIP-001" />
          </View>

          {/* DOWNLOAD */}
          <LinearGradient
            colors={GRADIENT_COLORS.primary as [string, string]}
            style={styles.downloadBtn}
          >
            <Text style={styles.downloadText}>Download Ticket</Text>
          </LinearGradient>

          {/* UBER */}
          <View style={styles.rideCard}>
            <View style={styles.rideHeader}>
              <View style={styles.rideIcon}>
                <Ionicons name="car-outline" size={20} color="#000" />
              </View>

              <View>
                <Text style={styles.rideTitle}>Need a ride?</Text>
                <Text style={styles.rideSubtitle}>
                  Book an Uber to the venue
                </Text>
              </View>
            </View>

            <Pressable style={styles.uberButton}>
              <Ionicons name="car-outline" size={18} color="#000" />
              <Text style={styles.uberText}>Book Uber</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}



const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },

  sheet: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",           // 🔥 prevents overflow
    position: "relative",
  },

  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 100,                // 🔥 ALWAYS on top
    padding: 8,
  },

  content: {
    padding: Theme.spacing.l,
    paddingTop: 48,             // 🔥 space for close button
  },

  headerTitle: {
    color: Theme.colors.foreground,
    fontSize: 20,
    fontWeight: "600",
  },

  subtitle: {
    marginTop: 6,
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },

  qrCard: {
    marginTop: Theme.spacing.l,
    backgroundColor: "#fff",
    borderRadius: Theme.radius.lg,
    paddingVertical: Theme.spacing.xl,
    alignItems: "center",
  },

  qrBox: {
    width: 220,
    height: 220,
    borderRadius: Theme.radius.lg,
    borderWidth: 4,
    borderColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  code: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  infoCard: {
    marginTop: Theme.spacing.l,
    padding: Theme.spacing.l,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  eventTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Theme.spacing.m,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: {
    color: Theme.colors.mutedForeground,
    fontSize: 15,
  },

  value: {
    color: Theme.colors.foreground,
    fontSize: 15,
  },

  downloadBtn: {
    marginTop: Theme.spacing.l,
    paddingVertical: 16,
    borderRadius: Theme.radius.lg,
    alignItems: "center",
  },

  downloadText: {
    color: Theme.colors.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },

  rideCard: {
    marginTop: Theme.spacing.l,
    marginBottom: Theme.spacing.xl,
    padding: Theme.spacing.l,
    backgroundColor: "#0b0b0b",
    borderRadius: Theme.radius.lg,
  },

  rideHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.m,
  },

  rideIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.m,
  },

  rideTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  rideSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 2,
  },

  uberButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: Theme.radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  uberText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
});
