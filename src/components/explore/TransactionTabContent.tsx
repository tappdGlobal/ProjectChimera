import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Theme } from "../../styles/Theme";

const transactions = [
  {
    title: "Rooftop Jazz Night",
    txnId: "TXN1234567890",
    date: "12/1/2024",
    type: "VIP",
    qty: 1,
    amount: 1500,
  },
  {
    title: "Tech Startup Pitch Night",
    txnId: "TXN0987654321",
    date: "11/20/2024",
    type: "Standard",
    qty: 1,
    amount: 500,
  },
  {
    title: "Summer Food Festival",
    txnId: "TXN1122334455",
    date: "11/28/2024",
    type: "Premium",
    qty: 1,
    amount: 800,
  },
  {
    title: "Indie Music Concert",
    txnId: "TXN6677889900",
    date: "10/15/2024",
    type: "Standard",
    qty: 2,
    amount: 1000,
  },
  {
    title: "Designers Meetup",
    txnId: "TXN5566778899",
    date: "09/30/2024",
    type: "VIP",
    qty: 1,
    amount: 700,
  },
];

export function TransactionTabContent() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Spent</Text>
        <Text style={styles.totalAmount}>₹{total.toLocaleString()}</Text>
      </View>

      {transactions.map((item, index) => (
        <View key={index} style={styles.txnCard}>
          <View style={styles.txnHeader}>
            <Text style={styles.txnTitle}>{item.title}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>completed</Text>
            </View>
          </View>

          <Text style={styles.txnId}>Transaction ID: {item.txnId}</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{item.date}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Ticket Type:</Text>
            <Text style={styles.value}>{item.type}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Quantity:</Text>
            <Text style={styles.value}>{item.qty}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Amount:</Text>
            <Text style={styles.amount}>₹{item.amount}</Text>
          </View>
        </View>
      ))}
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
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  txnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  txnTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "600",
  },

 statusBadge: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  backgroundColor: "rgba(34,197,94,0.08)", // lighter green background
  borderRadius: 20,
  borderWidth: 1,                          // light green border
  borderColor: "rgba(34,197,94,0.35)",
},

statusText: {
  color: "rgba(34,197,94,0.85)",            // lighter green text
  fontSize: 13,
  fontWeight: "500",                        // slightly lighter weight
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
});

