import React from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { Theme } from "../../styles/Theme";
import { X, ChevronLeft, FileText } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

interface TermsOfServiceModalProps {
    visible: boolean;
    onClose: () => void;
}

export function TermsOfServiceModal({
    visible,
    onClose,
}: TermsOfServiceModalProps) {

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
        >
            <View style={styles.overlay}>
                <SafeAreaView style={styles.container}>
                    {/* Header */}
                    <View style={[styles.header]}>


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

                    <ScrollView
                        showsVerticalScrollIndicator
                        contentContainerStyle={styles.content}
                    >
                        {/* Intro */}
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

                        {/* Section Helper */}
                        {section(
                            "1. Use of Platform",
                            [
                                "You agree to use TAPPD only for lawful purposes and in accordance with applicable regulations",
                                "You must be at least 18 years of age to use the platform",
                                "You will not use the platform for any illegal, fraudulent, or unauthorized purpose",
                                "You will not attempt to interfere with, disrupt, or hack the platform",
                                "You will respect other users and maintain appropriate conduct",
                            ],
                        )}

                        {section(
                            "2. Account Responsibility",
                            [
                                "You are responsible for maintaining the confidentiality of your account credentials",
                                "You must provide accurate, current, and complete information during registration",
                                "You are responsible for all activities that occur under your account",
                                "You must notify us immediately of any unauthorized access or security breach",
                                "TAPPD reserves the right to suspend or terminate accounts that violate these terms",
                            ],
                        )}

                        {section(
                            "3. Payments & Fees",
                            [
                                "All payments processed through TAPPD are governed by RBI and NPCI guidelines",
                                "TAPPD charges a 20% service fee on ticket sales and event transactions",
                                "All prices and fees are displayed in Indian Rupees (INR) unless otherwise stated",
                                "You agree to pay all applicable fees and charges",
                                "TAPPD is not responsible for bank charges or payment gateway fees",
                            ],
                        )}

                        {section(
                            "4. Content & Intellectual Property",
                            [
                                "All platform content, branding, logos, and trademarks are property of TAPPD Private Limited",
                                "Unauthorized reproduction or distribution of TAPPD content is prohibited",
                                "You retain ownership of content you upload, but grant TAPPD a license to use it",
                                "You must not upload content that violates intellectual property rights of others",
                                "TAPPD may remove any content that violates these terms",
                            ],
                        )}

                        {section(
                            "5. Liability & Disclaimers",
                            [
                                "TAPPD is not liable for damages arising from third-party payment failures or service interruptions",
                                "We do not guarantee uninterrupted or error-free service",
                                "TAPPD is not responsible for event cancellations or changes made by organizers",
                                "Maximum liability is limited to the amount paid for the specific service",
                            ],
                        )}

                        {section(
                            "6. User Conduct & Prohibited Activities",
                            [
                                "Harass, abuse, or harm other users",
                                "Post offensive, discriminatory, or inappropriate content",
                                "Impersonate others or create fake accounts",
                                "Engage in spam, phishing, or fraudulent activities",
                                "Use automated bots or scrapers",
                            ],
                        )}

                        {section(
                            "7. Changes to Terms",
                            [
                                "We reserve the right to update these Terms periodically",
                                "Material changes will be notified via email or in-app notification",
                                "Continued use constitutes acceptance of new terms",
                            ],
                        )}

                        {section(
                            "8. Termination",
                            [
                                "You may delete your account at any time through Profile Settings",
                                "TAPPD may suspend or terminate accounts that violate these terms",
                                "Certain provisions survive termination",
                            ],
                        )}

                        {/* Governing Law */}
                        <Text style={styles.sectionTitle}>9. Governing Law</Text>
                        <Text style={styles.text}>
                            These Terms are governed by the laws of{" "}
                            <Text style={styles.bold}>India</Text>. Any disputes shall be
                            subject to the exclusive jurisdiction of courts in{" "}
                            <Text style={styles.bold}>New Delhi, India</Text>.
                        </Text>

                        {/* Contact */}
                        <LinearGradient
                            colors={["rgba(160,32,160,0.25)", "rgba(116,1,130,0.15)"]}
                            style={styles.card}
                        >
                            <Text style={styles.sectionTitle}>Contact & Support</Text>
                            <Text style={styles.text}>
                                For questions or support regarding these Terms:
                            </Text>
                            <Text style={styles.link}>support@tappd.co.in</Text>
                        </LinearGradient>

                        <Text style={styles.footer}>
                            Effective Date: January 1, 2025{"\n"}
                            Last Updated: October 19, 2025
                        </Text>
                    </ScrollView>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

/* ---------- Helpers ---------- */

function section(title: string, points: string[]) {
    return (
        <View>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.card}>
                {points.map((p, i) => (
                    <View key={i} style={styles.bulletRow}>
                        <View style={styles.bullet} />
                        <Text style={styles.text}>{p}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
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

    footer: {
        textAlign: "center",
        color: Theme.colors.mutedForeground,
        fontSize: 12,
        marginTop: 20,
    },
});
