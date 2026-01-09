import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";



export type AvailabilityItem = {
    id: string;
    title: string;
    price: string;
    perks: string[];
    seatsLeft: number;
    onBook?: () => void;
};

interface AvailabilityCardProps {
    item: AvailabilityItem;
}

export function AvailabilityCard({ item }: AvailabilityCardProps) {
    return (
        <View style={styles.card}>
            {/* HEADER */}
            <View style={styles.headerRow}>
                <Text style={styles.title}>{item.title}</Text>

                <LinearGradient
                    colors={GRADIENT_COLORS.primary as [string, string]}
                    style={styles.badge}
                >
                    <Text style={styles.badgeText}>{item.seatsLeft} left</Text>
                </LinearGradient>


            </View>

            {/* PRICE */}
            <Text style={styles.price}>{item.price}</Text>

            {/* PERKS */}
            <View style={styles.perks}>
                {item.perks.map((perk, index) => (
                    <View key={index} style={styles.perkRow}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.perkText}>{perk}</Text>
                    </View>
                ))}
            </View>

            {/* CTA */}
            <TouchableOpacity activeOpacity={0.85} onPress={item.onBook}>
                <LinearGradient
                    colors={GRADIENT_COLORS.primary as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Book Now</Text>
                </LinearGradient>

            </TouchableOpacity>

        </View>
    );
}


const styles = StyleSheet.create({
    card: {
        backgroundColor: Theme.colors.card,
        borderRadius: Theme.radius.xl,
        padding: Theme.spacing.l,
        marginBottom: Theme.spacing.l,

        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",

        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Theme.spacing.s,
    },

    title: {
        color: Theme.colors.foreground,
        fontSize: 20,
        fontWeight: "600",
    },

    badge: {
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },

    badgeText: {
        color: Theme.colors.primaryForeground,
        fontSize: 14,
        fontWeight: "500",
    },

    price: {
        fontSize: 26,
        fontWeight: "700",
        color: Theme.colors.primary,
        marginBottom: Theme.spacing.m,
    },

    perks: {
        marginBottom: Theme.spacing.m,
    },

    perkRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 6,
    },

    bullet: {
        color: Theme.colors.primary,
        fontSize: 18,
        marginRight: 8,
        lineHeight: 22,
    },

    perkText: {
        color: Theme.colors.mutedForeground,
        fontSize: 16,
        lineHeight: 22,
        flex: 1,
    },

    button: {
        marginTop: Theme.spacing.s,
        backgroundColor: Theme.colors.primary,
        borderRadius: Theme.radius.md,
        paddingVertical: 12,
        alignItems: "center",
    },

    buttonText: {
        color: Theme.colors.primaryForeground,
        fontSize: 16,
        fontWeight: "600",
    },
});
