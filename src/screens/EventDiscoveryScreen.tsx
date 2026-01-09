import React from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Pressable
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../styles/Theme";

type Event = {
    id: string;
    title: string;
    category: string;
    date: string;
    time: string;
    location: string;
    attending: number;
    image: string;
};

const EVENTS: Event[] = [
    // 🎯 Date Night
    {
        id: "dn1",
        title: "Romantic Candlelight Dinner",
        category: "Date Night",
        date: "Feb 14, 2025",
        time: "8:00 PM",
        location: "Rosewood Café",
        attending: 60,
        image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
    },
    {
        id: "dn2",
        title: "Moonlight Rooftop Date",
        category: "Date Night",
        date: "Feb 20, 2025",
        time: "9:00 PM",
        location: "Skyline Rooftop",
        attending: 45,
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    },

    // 🏖 Pool Party
    {
        id: "pp1",
        title: "Splash Pool Party",
        category: "Pool Party",
        date: "Mar 10, 2025",
        time: "4:00 PM",
        location: "Aqua Club",
        attending: 180,
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    },
    {
        id: "pp2",
        title: "Neon Pool Bash",
        category: "Pool Party",
        date: "Mar 18, 2025",
        time: "6:00 PM",
        location: "Resort Arena",
        attending: 220,
        image: "https://images.unsplash.com/photo-1515169067865-5387ec356754",
    },

    // 🏠 House Party
    {
        id: "hp1",
        title: "House Party Extravaganza",
        category: "House Party",
        date: "Jan 25, 2025",
        time: "8:30 PM",
        location: "Downtown Villa",
        attending: 90,
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    },
    {
        id: "hp2",
        title: "Friends & Beats Night",
        category: "House Party",
        date: "Feb 1, 2025",
        time: "9:00 PM",
        location: "City Loft",
        attending: 110,
        image: "https://images.unsplash.com/photo-1506157786151-b8491531f063",
    },

    // 🎵 Music Events
    {
        id: "me1",
        title: "Live Jazz Night",
        category: "Music Events",
        date: "Jan 30, 2025",
        time: "7:30 PM",
        location: "Blue Note Club",
        attending: 140,
        image: "https://images.unsplash.com/photo-1497032205916-ac775f0649ae",
    },
    {
        id: "me2",
        title: "Indie Music Fest",
        category: "Music Events",
        date: "Feb 5, 2025",
        time: "6:00 PM",
        location: "Open Arena",
        attending: 300,
        image: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2",
    },

    // 🕊 Lowkey Sufi Events
    {
        id: "se1",
        title: "Sufi Mehfil Evening",
        category: "Lowkey Sufi Events",
        date: "Feb 12, 2025",
        time: "7:00 PM",
        location: "Heritage Haveli",
        attending: 80,
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    },
    {
        id: "se2",
        title: "Soulful Sufi Night",
        category: "Lowkey Sufi Events",
        date: "Feb 22, 2025",
        time: "8:00 PM",
        location: "Cultural Center",
        attending: 95,
        image: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47",
    },

    // 🕺 Clubbing
    {
        id: "cl1",
        title: "Saturday Night Clubbing",
        category: "Clubbing",
        date: "Jan 27, 2025",
        time: "10:00 PM",
        location: "Pulse Nightclub",
        attending: 350,
        image: "https://images.unsplash.com/photo-1514516870926-2061bfc8f98a",
    },
    {
        id: "cl2",
        title: "EDM Club Night",
        category: "Clubbing",
        date: "Feb 8, 2025",
        time: "10:30 PM",
        location: "Neon Club",
        attending: 420,
        image: "https://images.unsplash.com/photo-1506157786151-b8491531f063",
    },

    // 🎬 Movie Night
    {
        id: "mn1",
        title: "Outdoor Movie Night",
        category: "Movie Night",
        date: "Feb 3, 2025",
        time: "7:00 PM",
        location: "City Park",
        attending: 160,
        image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
    },
    {
        id: "mn2",
        title: "Classic Movie Marathon",
        category: "Movie Night",
        date: "Feb 15, 2025",
        time: "6:00 PM",
        location: "Indie Theatre",
        attending: 120,
        image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26",
    },
];



export default function EventDiscoveryScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { category } = route.params;

    const filteredEvents = EVENTS.filter(
        (event) => event.category === category
    );

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{category}</Text>
                <View style={{ width: 22 }} />
            </View>

            {/* EVENT LIST */}

            <FlatList
                data={filteredEvents}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() =>
                            navigation.navigate("EventDetail", {
                                event: {
                                    ...item,
                                    images: [
                                        item.image,
                                        "https://images.unsplash.com/photo-1486325212027-8081e485255e",
                                        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
                                    ],
                                },
                            })

                        }
                        style={({ pressed }) => [
                            styles.cardPressable,
                            styles.cardHover,
                            pressed && styles.cardPressed,
                        ]}
                    >
                        <View style={styles.card}>
                            <Image source={{ uri: item.image }} style={styles.image} />

                            <View style={styles.info}>
                                <Text style={styles.title}>{item.title}</Text>

                                <View style={styles.row}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={16}
                                        color={Theme.colors.primary}
                                    />
                                    <Text style={styles.meta}>
                                        {item.date} • {item.time}
                                    </Text>
                                </View>

                                <View style={styles.row}>
                                    <Ionicons
                                        name="location-outline"
                                        size={16}
                                        color={Theme.colors.primary}
                                    />
                                    <Text style={styles.meta}>{item.location}</Text>
                                </View>

                                <View style={styles.row}>
                                    <Ionicons
                                        name="people-outline"
                                        size={16}
                                        color={Theme.colors.primary}
                                    />
                                    <Text style={styles.meta}>
                                        {item.attending} attending
                                    </Text>
                                </View>

                                {/* Wishlist Button (separate press target) */}
                                <Pressable
                                    onPress={() => {
                                        /* wishlist later */
                                    }}
                                    style={({ pressed }) => [
                                        styles.wishlistBtn,
                                        pressed && { opacity: 0.85 },
                                    ]}
                                >
                                    <Ionicons
                                        name="heart-outline"
                                        size={22}
                                        color={Theme.colors.foreground}
                                    />
                                    <Text style={styles.wishlistText}>Add to Wishlist</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Pressable>
                )}



            />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B021F",
        paddingHorizontal: 16,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 16,
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
    },

    card: {
        flexDirection: "row",
        backgroundColor: "#1A1033",
        borderRadius: 18,
        padding: 12,
        marginBottom: 16,
    },

    image: {
        width: 90,
        height: 90,
        borderRadius: 14,
    },

    info: {
        flex: 1,
        marginLeft: 12,
    },

    title: {
        fontSize: 18,            // ⬆️ increased
        fontWeight: "600",
        color: "#fff",
        marginBottom: 8,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },

    meta: {
        color: "#D1C4E9",
        marginLeft: 8,
        fontSize: 14,            // ⬆️ increased
    },

    wishlistBtn: {
        marginTop: Theme.spacing.m,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        paddingVertical: 10,
        paddingHorizontal: 16,

        borderRadius: Theme.radius.md,          // ✅ rectangular, clean
        borderWidth: 1,
        borderColor: Theme.colors.primary,      // ✅ violet-pink border

        backgroundColor: Theme.colors.secondary // ✅ subtle violet fill
    },

    wishlistText: {
        marginLeft: 8,
        fontSize: 17,
        fontWeight: Theme.fontWeights.medium,
        color: Theme.colors.foreground,         // ✅ white text
    },
    cardPressable: {
        cursor: "pointer",                // ✅ web only
    },

    cardHover: {
        opacity: 0.97,                    // subtle hover feedback
    },

    cardPressed: {
        opacity: 0.9,                     // press feedback
    },

});
