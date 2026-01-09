import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Theme } from "../styles/Theme";
import { ReviewSection } from "../components/common/ReviewSection";
import { AvailabilityCard } from "../components/common/AvailabilityCard";
import { EventDetailsSection } from "../components/explore/EventDetailsSection";
type TabKey = "availability" | "details" | "reviews";


const EVENT_REVIEWS = [
    {
        id: "er1",
        name: "Priya M.",
        rating: 5,
        date: "Nov 15, 2024",
        comment:
            "Amazing atmosphere! The DJ was incredible and the venue was perfect. Definitely attending the next one!",
    },
    {
        id: "er2",
        name: "Rahul K.",
        rating: 4,
        date: "Nov 10, 2024",
        comment:
            "Great party, good music, and excellent service. The energy was infectious!",
    },
];

const AVAILABILITY_DATA = [
    {
        id: "1",
        title: "Standard Entry",
        price: "₹1,200",
        seatsLeft: 45,
        perks: [
            "Entry to event",
            "1 Welcome drink",
            "Access to main floor",
        ],
    },
    {
        id: "2",
        title: "Premium Pass",
        price: "₹2,500",
        seatsLeft: 23,
        perks: [
            "Entry to event",
            "3 Premium drinks",
            "VIP lounge access",
        ],
    },
];


const HOST_REVIEWS = [
    {
        id: "hr1",
        name: "Vikram P.",
        rating: 5,
        date: "Nov 12, 2024",
        comment:
            "Professional organizing and excellent communication. The event exceeded all expectations!",
    },
    {
        id: "hr2",
        name: "Deepika R.",
        rating: 4,
        date: "Nov 5, 2024",
        comment:
            "Well-organized event with great attention to detail. The host was responsive and accommodating.",
    },
];

export default function EventDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { event } = route.params;

    const [activeTab, setActiveTab] = useState<TabKey>("details");

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons
                        name="arrow-back"
                        size={22}
                        color={Theme.colors.foreground}
                    />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{event.title}</Text>

                <View style={{ width: 22 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* IMAGE SECTION */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.imageScroll}
                >
                    {(event.images ?? (event.image ? [event.image] : [])).map(
                        (img: string, index: number) => (
                            <Image
                                key={index}
                                source={{ uri: img }}
                                style={[
                                    styles.carouselImage,
                                    index === 0 && styles.firstImage,
                                ]}
                            />
                        )
                    )}
                </ScrollView>


                {/* TABS */}
                <View style={styles.tabsContainer}>
                    {[
                        { key: "availability", label: "Availability" },
                        { key: "details", label: "Details" },
                        { key: "reviews", label: "Reviews" },
                    ].map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => setActiveTab(tab.key as TabKey)}
                                style={[
                                    styles.tab,
                                    isActive && styles.activeTab,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        isActive && styles.activeTabText,
                                    ]}
                                >
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* TAB CONTENT */}
                <View style={styles.content}>
                    {activeTab === "details" && (
                        <EventDetailsSection
                            data={{
                                title: event.title,
                                dateLabel: "Saturday, Dec 21, 2024",
                                timeLabel: "8:00 PM - 2:00 AM",
                                location: event.location,
                                genderPreference: "Mixed Gender",
                                ageRestriction: "18+ Only",
                                description:
                                    "Join us for an unforgettable experience with great music, amazing people, and incredible vibes.",
                                onAddToCalendar: () => console.log("Add to calendar"),
                                onOpenMaps: () => console.log("Open maps"),
                            }}
                        />
                    )}


                    {activeTab === "availability" && (
                        <View style={{ marginTop: Theme.spacing.m }}>
                            {AVAILABILITY_DATA.map((item) => (
                                <AvailabilityCard
                                    key={item.id}
                                    item={{
                                        ...item,
                                        onBook: () => {
                                            console.log("Booking:", item.title);
                                        },
                                    }}
                                />
                            ))}
                        </View>
                    )}


                    {activeTab === "reviews" && (
                        <>
                            <ReviewSection title="Event Reviews" reviews={EVENT_REVIEWS} />
                            <View style={{ height: Theme.spacing.l }} />
                            <ReviewSection title="Host Reviews" reviews={HOST_REVIEWS} />
                        </>
                    )}

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Theme.spacing.m,
        paddingVertical: Theme.spacing.s,
    },

    headerTitle: {
        color: Theme.colors.foreground,
        fontSize: 18,
        fontWeight: "600",
    },

    imageRow: {
        flexDirection: "row",
        paddingHorizontal: Theme.spacing.m,
        gap: Theme.spacing.s,
        marginTop: Theme.spacing.s,
    },

    mainImage: {
        flex: 1,
        height: 160,
        borderRadius: Theme.radius.lg,
    },

    sideImage: {
        width: 80,
        height: 160,
        borderRadius: Theme.radius.lg,
    },

    tabsContainer: {
        flexDirection: "row",
        backgroundColor: Theme.colors.muted,
        margin: Theme.spacing.m,
        borderRadius: Theme.radius.lg,
        padding: 4,
    },

    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: Theme.radius.md,
    },

    activeTab: {
        backgroundColor: Theme.colors.background,
    },

    tabText: {
        color: Theme.colors.mutedForeground,
        fontSize: 14,
        fontWeight: "500",
    },

    activeTabText: {
        color: Theme.colors.foreground,
    },

    content: {
        paddingHorizontal: Theme.spacing.m,
        paddingBottom: Theme.spacing.xl,
    },

    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Theme.spacing.s,
    },

    metaText: {
        marginLeft: 8,
        color: Theme.colors.mutedForeground,
        fontSize: 15,
    },

    placeholderText: {
        color: Theme.colors.mutedForeground,
        fontSize: 14,
        marginTop: Theme.spacing.m,
    },
    imageScroll: {
        paddingHorizontal: Theme.spacing.m,
        gap: Theme.spacing.s,
        marginTop: Theme.spacing.s,
    },

    carouselImage: {
        width: 280,
        height: 160,
        borderRadius: Theme.radius.lg,
    },

    firstImage: {
        width: 320, // slightly larger main image (like design)
    },

});
