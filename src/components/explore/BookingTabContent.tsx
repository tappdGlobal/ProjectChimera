import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Theme } from "../../styles/Theme";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, Users, Award } from "lucide-react-native";
import { TransactionTabContent } from "./TransactionTabContent";
import { TicketTabContent } from "./TicketTabContent";
import { EventTabContent } from "./EventTabContent";
import { useBookingStore } from "../../store/bookingStore";
import { useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

type BookingInnerTab = "events" | "tickets" | "transactions";

export function BookingTabContent({ onBack }: { onBack?: () => void }) {
    const [activeTab, setActiveTab] = useState<BookingInnerTab>("events");
    const { bookings } = useBookingStore();

    const bookedCount =
        bookings?.filter(
            (b) => b && b.status !== "CANCELLED"
        ).length ?? 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={onBack}>
                    <Ionicons
                        name="arrow-back"
                        size={22}
                        color={Theme.colors.foreground}
                    />
                </Pressable>

                <Text style={styles.headerTitle}>Manage Bookings</Text>
                <View style={{ width: 22 }} />
            </View>

            <View style={styles.statsRow}>
                <StatCard
                    icon={<Calendar size={24} color="#d946ef" strokeWidth={1.8} />}
                    value={String(bookedCount)}
                    label="Booked"
                    fullWidth
                />
            </View>

            <View style={styles.tabsWrapper}>
                <View style={styles.tabsContainer}>
                    <Pressable
                        onPress={() => setActiveTab("events")}
                        style={[styles.tab, activeTab === "events" && styles.activeTab]}
                    >
                        <Text style={styles.tabText}>Events</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveTab("tickets")}
                        style={[styles.tab, activeTab === "tickets" && styles.activeTab]}
                    >
                        <Text style={styles.tabText}>Tickets</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveTab("transactions")}
                        style={[
                            styles.tab,
                            activeTab === "transactions" && styles.activeTab,
                        ]}
                    >
                        <Text style={styles.tabText}>Transactions</Text>
                    </Pressable>
                </View>
            </View>

            {activeTab === "events" && <EventTabContent />}
            {activeTab === "tickets" && <TicketTabContent />}
            {activeTab === "transactions" && <TransactionTabContent />}
        </View>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    fullWidth?: boolean;
}

function StatCard({ icon, value, label, fullWidth }: StatCardProps) {
    return (
        <View
            style={[
                styles.card,
                fullWidth && styles.fullWidthCard
            ]}
        >
            {icon}
            <Text style={styles.cardValue}>{value}</Text>
            <Text style={styles.cardLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
        paddingHorizontal: Theme.spacing.m,
        paddingTop: Theme.spacing.l,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: Theme.spacing.l,
    },

    headerTitle: {
        color: Theme.colors.foreground,
        fontSize: 18,
        fontWeight: "600",
    },

    statsRow: {
        marginBottom: Theme.spacing.l,
    },

    card: {
        flex: 1,
        marginHorizontal: 6,
        paddingVertical: Theme.spacing.l,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: Theme.radius.lg,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },

    cardValue: {
        marginTop: 8,
        fontSize: 22,
        fontWeight: "700",
        color: Theme.colors.foreground,
    },

    cardLabel: {
        marginTop: 4,
        fontSize: 13,
        color: Theme.colors.mutedForeground,
    },

    tabsWrapper: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
        marginBottom: Theme.spacing.l,
    },

    tabsContainer: {
        flexDirection: "row",
        backgroundColor: "transparent",
    },

    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
    },

    activeTab: {
        backgroundColor: Theme.colors.primary,
        borderRadius: 20,

        marginHorizontal: 6,
        marginVertical: 4,
    },


    tabText: {
        color: Theme.colors.foreground,
        fontSize: 16,
        fontWeight: "500",
    },
    placeholder: {
        color: Theme.colors.mutedForeground,
        textAlign: "center",
        marginTop: Theme.spacing.l,
    },
    fullWidthCard: {
        marginHorizontal: 0,
        flex: 0,
    },
});
