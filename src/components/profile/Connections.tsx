import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
} from "react-native";
import { Button } from "../ui/Button";
import { Theme } from "../../styles/Theme";
import { useConnectionStore } from "../../store/connectionStore";
import { ConnectionDetailModal } from "./ConnectionDetailModal";
import Toast from "react-native-toast-message";


const { width } = Dimensions.get("window");

interface Props {
    userId?: string;
    defaultAvatar: string;
}

export const Connections = ({ userId, defaultAvatar }: Props) => {
    const {
        acceptedConnections,
        fetchAcceptedConnections,
        loading,
    } = useConnectionStore();

    const [connectionFilter, setConnectionFilter] = useState<
        "all" | "friend" | "match" | "business"
    >("all");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);


    useEffect(() => {
        console.log("📥 Connections Screen Mounted");

        const loadConnections = async () => {
            console.log("🚀 Calling fetchAcceptedConnections...");
            await fetchAcceptedConnections();
            console.log("✅ fetchAcceptedConnections finished");
        };

        loadConnections();
    }, []);



    return (
        <View style={styles.tabContent}>
            {/* Filters */}
            <View style={styles.filterBar}>
                {[
                    { label: "All", value: "all" },
                    { label: "Friends", value: "friend" },
                    { label: "Relationship", value: "match" },
                    { label: "Networking", value: "business" },
                ].map((filter) => (
                    <TouchableOpacity
                        key={filter.value}
                        onPress={() => setConnectionFilter(filter.value as any)}
                        style={[
                            styles.filterButton,
                            connectionFilter === filter.value && styles.filterButtonActive,
                        ]}
                    >
                        <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            style={[
                                styles.filterButtonText,
                                connectionFilter === filter.value && styles.filterButtonTextActive,
                            ]}
                        >
                            {filter.label}
                        </Text>

                    </TouchableOpacity>
                ))}
            </View>



            {/* Connections Grid */}
            {loading ? (
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            ) : (
                <View style={styles.connectionsGrid}>
                    {acceptedConnections
                        .filter((c: any) => {
                            if (connectionFilter === "all") return true;

                            if (connectionFilter === "friend")
                                return c.intent?.includes("FRIENDSHIP");

                            if (connectionFilter === "match")
                                return c.intent?.includes("RELATIONSHIP");

                            if (connectionFilter === "business")
                                return c.intent?.includes("NETWORKING");

                            return true;
                        })
                        .map((connection: any) => (
                            <TouchableOpacity
                                key={connection.id}
                                style={styles.connectionCardGrid}
                                activeOpacity={0.9}
                                onPress={() => {
                                    console.log("🟣 Opening profile:", connection.name);
                                    setSelectedUser(connection);
                                    setShowModal(true);
                                }}
                            >

                                <Image
                                    source={{
                                        uri:
                                            connection.photo ||
                                            connection.profilePicUrl ||
                                            defaultAvatar,
                                    }}
                                    style={styles.connectionAvatarLarge}
                                />

                                <Text style={styles.connectionName}>
                                    {connection.name}
                                </Text>

                                {/* 🔹 AGE */}
                                {connection.age && (
                                    <Text style={styles.connectionAge}>
                                        {connection.age} years old
                                    </Text>
                                )}

                                {/* 🔹 INTENT PILLS */}
                                <View style={styles.intentRow}>
                                    {connection.intent?.map((i: string, index: number) => {
                                        let label = "";
                                        let pillStyle = styles.friendPill;

                                        if (i === "FRIENDSHIP") {
                                            label = "friend";
                                            pillStyle = styles.friendPill;
                                        }

                                        if (i === "RELATIONSHIP") {
                                            label = "match";
                                            pillStyle = styles.matchPill;
                                        }

                                        if (i === "NETWORKING") {
                                            label = "business";
                                            pillStyle = styles.businessPill;
                                        }

                                        return (
                                            <View key={index} style={[styles.intentPillBase, pillStyle]}>
                                                <Text style={styles.intentText}>{label}</Text>
                                            </View>
                                        );
                                    })}
                                </View>


                            </TouchableOpacity>
                        ))}
                </View>

            )}
            <ConnectionDetailModal
                visible={showModal}
                user={selectedUser}
                onClose={() => setShowModal(false)}
            />

        </View>

    );
};

const styles = StyleSheet.create({
    tabContent: { paddingVertical: 24 },


    filterBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: 18,
    },




    filterButton: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
    },



    filterButtonActive: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },


    filterButtonText: {
        color: Theme.colors.mutedForeground,
        fontSize: 13,
        fontWeight: "600",
    },

    filterButtonTextActive: {
        color: Theme.colors.foreground,
    },



    sectionTitle: {
        color: Theme.colors.foreground,
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
    },

    connectionCard: {
        flexDirection: "row",
        marginBottom: 16,
    },

    connectionAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },

    connectionAvatarLarge: {
        width: 110,
        height: 110,
        borderRadius: 55,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.12)",
    },


    connectionName: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 16,
        textAlign: "center",
    },


    connectionAge: {
        color: "rgba(255,255,255,0.65)",
        fontSize: 13,
        marginTop: 4,
        marginBottom: 10,
    },


    actionRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
    },

    acceptBtn: {
        backgroundColor: Theme.colors.primary,
        flex: 1,
    },
    connectionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginTop: 10,
    },


    connectionCardGrid: {
        width: (width - 60) / 2,
        backgroundColor: "#1B1533",
        borderRadius: 20,
        paddingVertical: 24,
        paddingHorizontal: 16,
        alignItems: "center",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
    },

    intentRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 10,
        width: "100%",
    },




    intentPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: "#2563EB", // blue pill
    },

    intentPillBase: {
        width: "48%",            // 👈 KEY LINE (forces 2 per row)
        paddingVertical: 8,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },



    intentText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
        textTransform: "lowercase",
    },

    // 🔵 FRIEND
    friendPill: {
        backgroundColor: "#2563EB", // blue
    },

    // 🟣 MATCH
    matchPill: {
        backgroundColor: "#DB2777",
    },

    // 🟡 BUSINESS
    businessPill: {
        backgroundColor: "#F59E0B",
    },


});
