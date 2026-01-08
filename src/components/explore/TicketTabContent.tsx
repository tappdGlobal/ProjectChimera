import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Modal } from "react-native";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { TicketDetailModal } from "./TicketDetailModal";



const tickets = [
    {
        title: "Rooftop Jazz Night",
        type: "VIP",
        code: "VIP-001",
        date: "12/15/2024",
        time: "8:00 PM",
        location: "Sky Lounge, Mumbai",
        status: "upcoming",
    },
    {
        title: "Summer Food Festival",
        type: "Premium",
        code: "PRM-023",
        date: "12/5/2024",
        time: "12:00 PM",
        location: "Central Plaza, Delhi",
        status: "ongoing",
    },
];

export function TicketTabContent() {
    const [showModal, setShowModal] = useState(false);

    return (
        <ScrollView style={styles.container}>
            {tickets.map((ticket, index) => (
                <View key={index} style={styles.ticketCard}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>{ticket.title}</Text>

                        <View
                            style={[
                                styles.statusBadge,
                                ticket.status === "upcoming"
                                    ? styles.upcomingBadge
                                    : styles.ongoingBadge,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    ticket.status === "upcoming"
                                        ? styles.upcomingText
                                        : styles.ongoingText,
                                ]}
                            >
                                {ticket.status}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.subTitle}>
                        {ticket.type} - {ticket.code}
                    </Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Date:</Text>
                        <Text style={styles.value}>{ticket.date}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Time:</Text>
                        <Text style={styles.value}>{ticket.time}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Location:</Text>
                        <Text style={styles.value}>{ticket.location}</Text>
                    </View>

                    <LinearGradient
                        colors={GRADIENT_COLORS.primary as [string, string]}
                        style={styles.qrButton}
                    >
                        <Ionicons
                            name="ticket-outline"
                            size={20}
                            color={Theme.colors.primaryForeground}
                            style={{ marginRight: 8 }}
                        />
                        <Text
                            style={styles.qrText}
                            onPress={() => setShowModal(true)}
                        >
                            View QR Code
                        </Text>
                    </LinearGradient>

                </View>
            ))}
            <Modal
                visible={showModal}
                transparent
                animationType="slide"
            >
                <TicketDetailModal onClose={() => setShowModal(false)} />
            </Modal>

        </ScrollView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
        paddingHorizontal: Theme.spacing.m,
    },

    ticketCard: {
        marginTop: Theme.spacing.l,
        padding: Theme.spacing.l,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: Theme.radius.lg,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    title: {
        color: Theme.colors.foreground,
        fontSize: 19,
        fontWeight: "600",
    },

    subTitle: {
        color: Theme.colors.mutedForeground,
        fontSize: 15,
        marginBottom: Theme.spacing.m,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },

    label: {
        color: Theme.colors.mutedForeground,
        fontSize: 15,
    },

    value: {
        color: Theme.colors.foreground,
        fontSize: 15,
        textAlign: "right",
        maxWidth: "60%",
    },

    statusBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
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

    upcomingText: {
        color: "#60a5fa",
    },

    ongoingText: {
        color: "#22c55e",
    },

    statusText: {
        fontSize: 13,
        fontWeight: "600",
        textTransform: "capitalize",
    },

    qrButton: {
        marginTop: Theme.spacing.l,
        paddingVertical: 14,
        borderRadius: Theme.radius.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    qrText: {
        color: Theme.colors.primaryForeground,
        fontSize: 16,
        fontWeight: "600",
    },
});
