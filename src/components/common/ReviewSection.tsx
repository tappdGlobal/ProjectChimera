// src/components/common/ReviewSection.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../styles/Theme";

type Review = {
    id: string;
    name: string;
    rating: number;
    date: string;
    comment: string;
};

interface ReviewSectionProps {
    title: string;
    reviews: Review[];
}

export function ReviewSection({ title, reviews }: ReviewSectionProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{title}</Text>

            {reviews.map((review) => (
                <View key={review.id} style={styles.card}>
                    {/* Header row */}
                    <View style={styles.headerRow}>
                        <Text style={styles.name}>{review.name}</Text>

                        <View style={styles.ratingRow}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Ionicons
                                    key={i}
                                    name={i <= review.rating ? "star" : "star-outline"}
                                    size={16}
                                    color="#FACC15"
                                />
                            ))}
                            <Text style={styles.date}>{review.date}</Text>
                        </View>
                    </View>

                    {/* Comment */}
                    <Text style={styles.comment}>{review.comment}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: Theme.spacing.l,
    },

    sectionTitle: {
        color: Theme.colors.foreground,
        fontSize: 20,              // ⬆️ was 18
        fontWeight: "600",
        marginBottom: Theme.spacing.m,
    },

    card: {
        backgroundColor: Theme.colors.card,
        borderRadius: Theme.radius.lg,
        padding: Theme.spacing.m,
        marginBottom: Theme.spacing.m,

        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.12)",

        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Theme.spacing.s,
    },

    name: {
        color: Theme.colors.foreground,
        fontSize: 17,              // ⬆️ was 16
        fontWeight: "600",
    },

    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    date: {
        marginLeft: 10,
        fontSize: 14,              // ⬆️ was 13
        color: Theme.colors.mutedForeground,
    },

    comment: {
        marginTop: 8,
        fontSize: 16,              // ⬆️ was 15
        lineHeight: 24,            // ⬆️ better readability
        color: Theme.colors.mutedForeground,
    },
});

