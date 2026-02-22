import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Modal,
    Pressable,
} from "react-native";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { TicketDetailModal } from "./TicketDetailModal";
import { useBookingStore } from "../../store/bookingStore";
import { ActivityIndicator } from "react-native";
export function TicketTabContent() {
    const { bookings, fetchMyBookings, loading } = useBookingStore();
    const [selectedBooking, setSelectedBooking] = useState<any>(null);

    useEffect(() => {
        fetchMyBookings();
    }, []);

    const getEventStatus = (eventDate: string, eventTime: string) => {
        const now = new Date();
        const eventDateTime = new Date(eventDate);

        const [hours, minutes] = eventTime.split(":").map(Number);
        eventDateTime.setHours(hours);
        eventDateTime.setMinutes(minutes);
        eventDateTime.setSeconds(0);

        const eventEndTime = new Date(
            eventDateTime.getTime() + 2 * 60 * 60 * 1000
        );

        if (now < eventDateTime) return "upcoming";
        if (now <= eventEndTime) return "ongoing";
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
                        No tickets available
                    </Text>
                )}

                {/* 🔥 BOOKINGS LIST */}
                {!loading &&
                    bookings
                        ?.filter((b) => b && b.event && b.ticket)
                        .map((booking) => {
                            const event = booking.event!;
                            const ticket = booking.ticket!;
                            const status = getEventStatus(
                                event.eventDate,
                                event.eventTime
                            );

                            return (
                                <View key={booking.id} style={styles.ticketCard}>
                                    {/* 🔥 CORNER BADGE */}
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            status === "upcoming" && styles.upcomingBadge,
                                            status === "ongoing" && styles.ongoingBadge,
                                            status === "completed" && styles.completedBadge,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusText,
                                                status === "upcoming" && styles.upcomingText,
                                                status === "ongoing" && styles.ongoingText,
                                                status === "completed" && styles.completedText,
                                            ]}
                                        >
                                            {status}
                                        </Text>
                                    </View>

                                    {/* CONTENT STARTS BELOW BADGE */}
                                    <View style={styles.cardContent}>
                                        <Text style={styles.title}>
                                            {event.eventName}
                                        </Text>
                                    </View>


                                    <Text style={styles.subTitle}>
                                        {ticket.ticketLabel} • {ticket.currency}{" "}
                                        {ticket.price}
                                    </Text>

                                    <View style={styles.row}>
                                        <Text style={styles.label}>Date:</Text>
                                        <Text style={styles.value}>
                                            {new Date(
                                                event.eventDate
                                            ).toLocaleDateString()}
                                        </Text>
                                    </View>

                                    <View style={styles.row}>
                                        <Text style={styles.label}>Time:</Text>
                                        <Text style={styles.value}>
                                            {event.eventTime}
                                        </Text>
                                    </View>

                                    <View style={styles.row}>
                                        <Text style={styles.label}>Location:</Text>
                                        <Text style={styles.value}>
                                            {event.venue}, {event.city}
                                        </Text>
                                    </View>

                                    <Pressable
                                        onPress={() =>
                                            setSelectedBooking(booking)
                                        }
                                    >
                                        <LinearGradient
                                            colors={
                                                GRADIENT_COLORS.primary as [
                                                    string,
                                                    string
                                                ]
                                            }
                                            style={styles.qrButton}
                                        >
                                            <Ionicons
                                                name="ticket-outline"
                                                size={20}
                                                color={
                                                    Theme.colors
                                                        .primaryForeground
                                                }
                                                style={{
                                                    marginRight: 8,
                                                }}
                                            />
                                            <Text style={styles.qrText}>
                                                View QR Code
                                            </Text>
                                        </LinearGradient>
                                    </Pressable>
                                </View>
                            );
                        })}
            </ScrollView>

            <Modal
                visible={!!selectedBooking}
                transparent
                animationType="slide"
                onRequestClose={() =>
                    setSelectedBooking(null)
                }
            >
                <TicketDetailModal
                    booking={selectedBooking}
                    onClose={() =>
                        setSelectedBooking(null)
                    }
                />
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

    ticketCard: {
        marginTop: Theme.spacing.l,
        padding: Theme.spacing.l,
        paddingTop: Theme.spacing.l,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: Theme.radius.lg,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        position: "relative",
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
        position: "absolute",
        top: 6,
        right: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 14,
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
        fontSize: 11,
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
    completedBadge: {
        backgroundColor: "rgba(255,255,255,0.08)",
        borderColor: "rgba(255,255,255,0.25)",
    },

    completedText: {
        color: Theme.colors.mutedForeground,
    },

    emptyText: {
        color: Theme.colors.mutedForeground,
        textAlign: "center",
        marginTop: 40,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 60,
    },
    cardContent: {
        marginTop: 30,
    },

});
