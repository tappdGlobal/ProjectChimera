import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Theme } from "../../styles/Theme";
import { useBookingStore } from "../../store/bookingStore";
import { ActivityIndicator } from "react-native";
export function TransactionTabContent() {
  const { bookings, fetchMyBookings, loading } = useBookingStore();

  useEffect(() => {
    fetchMyBookings({ status: "BOOKED" });
  }, []);

  // Only successful bookings
  const completedBookings = bookings?.filter(
    (b) => b && b.ticket && b.event && b.status !== "CANCELLED"
  );

  const total = completedBookings?.reduce(
    (sum, b) => sum + (b.ticket?.price ?? 0),
    0
  );

  return (
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

      {/* 🔥 CONTENT AFTER LOADING */}
      {!loading && (
        <>
          {/* TOTAL SPENT CARD */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Spent</Text>
            <Text style={styles.totalAmount}>
              ₹{(total ?? 0).toLocaleString()}
            </Text>
          </View>

          {completedBookings?.length === 0 && (
            <Text style={styles.emptyText}>
              No transactions found
            </Text>
          )}

          {completedBookings?.map((booking) => {
            const event = booking.event!;
            const ticket = booking.ticket!;

            return (
              <View key={booking.id} style={styles.txnCard}>

                {/* BADGE */}
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>completed</Text>
                </View>

                {/* CONTENT WRAPPER */}
                <View style={styles.cardContent}>

                  <Text style={styles.txnTitle}>
                    {event.eventName}
                  </Text>

                  <Text style={styles.txnId}>
                    Transaction ID: {booking.id}
                  </Text>

                  <View style={styles.divider} />

                  <View style={styles.row}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.value}>
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Ticket Type:</Text>
                    <Text style={styles.value}>
                      {ticket.ticketLabel}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Quantity:</Text>
                    <Text style={styles.value}>1</Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Amount:</Text>
                    <Text style={styles.amount}>
                      ₹{ticket.price}
                    </Text>
                  </View>

                </View>
              </View>

            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingHorizontal: Theme.spacing.m,
  },

  totalCard: {
    marginTop: Theme.spacing.l,
    marginBottom: Theme.spacing.l,
    paddingVertical: Theme.spacing.xl,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Theme.radius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  emptyText: {
    color: Theme.colors.mutedForeground,
    textAlign: "center",
    marginTop: 40,
  },
  totalLabel: {
    color: Theme.colors.mutedForeground,
    fontSize: 16,
  },

  totalAmount: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: "700",
    color: Theme.colors.primary,
  },

  txnCard: {
    marginBottom: Theme.spacing.l,
    padding: Theme.spacing.l,
    paddingTop: Theme.spacing.l, // was xl → too much space
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    position: "relative",
  },


  txnHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  txnTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
  },
  statusBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    paddingHorizontal: 8,   // reduced from 12
    paddingVertical: 3,     // reduced from 6
    backgroundColor: "rgba(34,197,94,0.12)",
    borderRadius: 14,       // smaller radius
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.35)",
  },


  statusText: {
    color: "#22c55e",
    fontSize: 11,           // reduced from 13
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },


  txnId: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    marginBottom: Theme.spacing.s,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: Theme.spacing.m,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  label: {
    color: Theme.colors.mutedForeground,
    fontSize: 15,
  },

  value: {
    color: Theme.colors.foreground,
    fontSize: 15,
  },

  amount: {
    color: Theme.colors.primary,
    fontSize: 17,
    fontWeight: "600",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  cardContent: {
    marginTop: 28,   // was 36 → reduce accordingly
  },


});

