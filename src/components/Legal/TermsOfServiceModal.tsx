import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Theme } from "../../styles/Theme";
import { X, ChevronLeft, FileText } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

interface TermsOfServiceModalProps {
    visible: boolean;
    onClose: () => void;
}

/* ---------- Section data ---------- */
const SECTIONS = [
    {
        type: "intro" as const,
        title: "",
        points: [] as string[],
    },
    {
        type: "section" as const,
        title: "1. Use of Platform",
        points: [
            "You agree to use TAPPD only for lawful purposes and in accordance with applicable regulations",
            "You must be at least 18 years of age to use the platform",
            "You will not use the platform for any illegal, fraudulent, or unauthorized purpose",
            "You will not attempt to interfere with, disrupt, or hack the platform",
            "You will respect other users and maintain appropriate conduct",
        ],
    },
    {
        type: "section" as const,
        title: "2. Account Responsibility",
        points: [
            "You are responsible for maintaining the confidentiality of your account credentials",
            "You must provide accurate, current, and complete information during registration",
            "You are responsible for all activities that occur under your account",
            "You must notify us immediately of any unauthorized access or security breach",
            "TAPPD reserves the right to suspend or terminate accounts that violate these terms",
        ],
    },
    {
        type: "section" as const,
        title: "3. Payments & Fees",
        points: [
            "All payments processed through TAPPD are governed by RBI and NPCI guidelines",
            "TAPPD charges a 20% service fee on ticket sales and event transactions",
            "All prices and fees are displayed in Indian Rupees (INR) unless otherwise stated",
            "You agree to pay all applicable fees and charges",
            "TAPPD is not responsible for bank charges or payment gateway fees",
        ],
    },
    {
        type: "section" as const,
        title: "4. Content & Intellectual Property",
        points: [
            "All platform content, branding, logos, and trademarks are property of TAPPD Private Limited",
            "Unauthorized reproduction or distribution of TAPPD content is prohibited",
            "You retain ownership of content you upload, but grant TAPPD a license to use it",
            "You must not upload content that violates intellectual property rights of others",
            "TAPPD may remove any content that violates these terms",
        ],
    },
    {
        type: "section" as const,
        title: "5. Liability & Disclaimers",
        points: [
            "TAPPD is not liable for damages arising from third-party payment failures or service interruptions",
            "We do not guarantee uninterrupted or error-free service",
            "TAPPD is not responsible for event cancellations or changes made by organizers",
            "Maximum liability is limited to the amount paid for the specific service",
        ],
    },
    {
        type: "section" as const,
        title: "6. User Conduct & Prohibited Activities",
        points: [
            "Harass, abuse, or harm other users",
            "Post offensive, discriminatory, or inappropriate content",
            "Impersonate others or create fake accounts",
            "Engage in spam, phishing, or fraudulent activities",
            "Use automated bots or scrapers",
        ],
    },
    {
        type: "section" as const,
        title: "7. Changes to Terms",
        points: [
            "We reserve the right to update these Terms periodically",
            "Material changes will be notified via email or in-app notification",
            "Continued use constitutes acceptance of new terms",
        ],
    },
    {
        type: "section" as const,
        title: "8. Termination",
        points: [
            "You may delete your account at any time through Profile Settings",
            "TAPPD may suspend or terminate accounts that violate these terms",
            "Certain provisions survive termination",
        ],
    },
    {
        type: "governing" as const,
        title: "",
        points: [] as string[],
    },
    {
        type: "contact" as const,
        title: "",
        points: [] as string[],
    },
    {
        type: "footer" as const,
        title: "",
        points: [] as string[],
    },
];

export function TermsOfServiceModal({
    visible,
    onClose,
}: TermsOfServiceModalProps) {
    if (!visible) return null;

    const renderItem = ({ item }: { item: typeof SECTIONS[0] }) => {
        if (item.type === "intro") {
            return (
                <LinearGradient
                    colors={["rgba(160,32,160,0.25)", "rgba(116,1,130,0.15)"]}
                    style={styles.card}
                >
                    <Text style={styles.text}>
                        Welcome to <Text style={styles.bold}>TAPPD Private Limited</Text>.
                        By accessing or using our platform, you agree to be bound by
                        these Terms of Service. Please read them carefully.
                    </Text>
                </LinearGradient>
            );
        }
        if (item.type === "section") {
            return (
                <View>
                    <Text style={styles.sectionTitle}>{item.title}</Text>
                    <View style={styles.card}>
                        {item.points.map((p, i) => (
                            <View key={i} style={styles.bulletRow}>
                                <View style={styles.bullet} />
                                <Text style={styles.text}>{p}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            );
        }
        if (item.type === "governing") {
            return (
                <View>
                    <Text style={styles.sectionTitle}>9. Governing Law</Text>
                    <Text style={styles.text}>
                        These Terms are governed by the laws of{" "}
                        <Text style={styles.bold}>India</Text>. Any disputes shall be
                        subject to the exclusive jurisdiction of courts in{" "}
                        <Text style={styles.bold}>New Delhi, India</Text>.
                    </Text>
                </View>
            );
        }
        if (item.type === "contact") {
            return (
                <LinearGradient
                    colors={["rgba(160,32,160,0.25)", "rgba(116,1,130,0.15)"]}
                    style={[styles.card, { marginTop: 16 }]}
                >
                    <Text style={styles.sectionTitle}>Contact & Support</Text>
                    <Text style={styles.text}>
                        For questions or support regarding these Terms:
                    </Text>
                    <Text style={styles.link}>support@tappd.co.in</Text>
                </LinearGradient>
            );
        }
        if (item.type === "footer") {
            return (
                <Text style={styles.footerText}>
                    Effective Date: January 1, 2025{"\n"}
                    Last Updated: October 19, 2025
                </Text>
            );
        }
        return null;
    };

    return (
        <View style={styles.fullScreen}>
            <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
            <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.headerIcon}>
                        <ChevronLeft size={22} color={Theme.colors.foreground} />
                    </TouchableOpacity>

                    <View style={styles.headerTitle}>
                        <FileText size={18} color={Theme.colors.primary} />
                        <Text style={styles.title}>Terms of Service</Text>
                    </View>

                    <TouchableOpacity onPress={onClose} style={styles.headerIcon}>
                        <X size={20} color={Theme.colors.foreground} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={SECTIONS}
                    renderItem={renderItem}
                    keyExtractor={(_, index) => String(index)}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator
                />
            </SafeAreaView>
        </View>
    );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
    fullScreen: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        elevation: 9999,
        backgroundColor: Theme.colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    headerIcon: { width: 32 },
    headerTitle: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: Theme.colors.foreground,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: Theme.radius.lg,
        padding: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Theme.colors.foreground,
        marginBottom: 10,
    },
    text: {
        color: Theme.colors.mutedForeground,
        lineHeight: 22,
        flex: 1,
    },
    bold: {
        color: Theme.colors.foreground,
        fontWeight: "600",
    },
    bulletRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 10,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Theme.colors.primary,
        marginTop: 8,
    },
    link: {
        marginTop: 8,
        color: Theme.colors.primary,
        fontWeight: "600",
    },
    footerText: {
        textAlign: "center",
        color: Theme.colors.mutedForeground,
        fontSize: 12,
        marginTop: 20,
    },
});
