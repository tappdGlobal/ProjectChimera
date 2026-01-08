import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";
import { Ionicons } from "@expo/vector-icons";

type ExploreTabKey = "explore" | "map" | "bookings";

interface ExploreTabProps {
    activeTab: ExploreTabKey;
    onChange: (tab: ExploreTabKey) => void;
}

export function ExploreTab({ activeTab, onChange }: ExploreTabProps) {
    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                {renderTab("explore", "Explore", "search", activeTab, onChange)}
                {renderTab("map", "Map", "map-outline", activeTab, onChange)}
                {renderTab("bookings", "Bookings", "ticket-outline", activeTab, onChange)}
            </View>

        </View>
    );
}

function renderTab(
    key: ExploreTabKey,
    label: string,
    icon: keyof typeof Ionicons.glyphMap,
    activeTab: ExploreTabKey,
    onChange: (tab: ExploreTabKey) => void
) {
    const isActive = activeTab === key;

    const Content = (
        <>
            <Ionicons
                name={icon}
                size={18}
                color={
                    isActive
                        ? Theme.colors.primaryForeground
                        : Theme.colors.mutedForeground
                }
                style={styles.icon}
            />
            <Text
                style={isActive ? styles.activeText : styles.inactiveText}
            >
                {label}
            </Text>
        </>
    );

    if (isActive) {
        return (
            <LinearGradient
                key={key}
                colors={GRADIENT_COLORS.primary as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activeTab}
            >
                <View style={styles.tabContent}>
                    {Content}
                </View>

                {/* 🔥 Active bottom indicator */}
                <View style={styles.activeIndicator} />
            </LinearGradient>
        );
    }


    return (
        <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={styles.inactiveTab}
        >
            <View style={styles.tabContent}>
                {Content}
            </View>
        </Pressable>
    );

}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
    },

    container: {
        flexDirection: "row",
        width: "100%",
        height: 56, // 🔥 increased height (matches image)
        backgroundColor: "transparent",
    },

    activeTab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },

    inactiveTab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },

    icon: {
        marginRight: 6,
    },
    tabContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },

    activeIndicator: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 2, // 🔥 thin line
        backgroundColor: Theme.colors.primary, // 🔥 pink line
    },

    activeText: {
        color: Theme.colors.primaryForeground,
        fontWeight: Theme.fontWeights.medium,
        fontSize: 14,
    },

    inactiveText: {
        color: Theme.colors.mutedForeground,
        fontWeight: Theme.fontWeights.medium,
        fontSize: 14,
    },

});
