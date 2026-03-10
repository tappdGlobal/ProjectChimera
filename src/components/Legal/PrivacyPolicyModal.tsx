import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { Shield, ChevronLeft, X } from "lucide-react-native";
import { Theme } from "../../styles/Theme";
import { SafeAreaView } from "react-native-safe-area-context";

interface PrivacyPolicyModalProps {
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
    title: "Our Commitment",
    points: [
      "We protect your privacy in accordance with the Information Technology Act, 2000 (India)",
      "We comply with GDPR (EU) and other applicable global data protection laws",
    ],
  },
  {
    type: "section" as const,
    title: "Data We Collect",
    points: [
      "Personal information (name, date of birth, email, phone number)",
      "Payment details (bank information, UPI ID, PAN, GSTIN)",
      "Device and app usage data for security and analytics",
      "Location data when you attend events",
      "Connection and interaction data within the platform",
    ],
  },
  {
    type: "section" as const,
    title: "How We Use Your Data",
    points: [
      "To verify identity and enable secure transactions",
      "To comply with RBI/NPCI KYC and regulatory requirements",
      "For fraud detection and compliance monitoring",
      "To personalize user experience and improve services",
      "To facilitate event bookings and connections",
      "To send important updates and communications",
    ],
  },
  {
    type: "section" as const,
    title: "Data Sharing",
    points: [
      "RBI-regulated financial partners for payment processing",
      "Payment gateways and banks for transaction processing",
      "Government authorities when legally required",
      "Third-party service providers under strict confidentiality agreements",
    ],
  },
  {
    type: "section" as const,
    title: "Data Security",
    points: [
      "AES-256 encryption for stored data",
      "PCI-DSS compliance for payment data",
      "Regular vulnerability scans and security audits",
      "Secure data centers with 24/7 monitoring",
      "Multi-factor authentication for sensitive operations",
    ],
  },
  {
    type: "section" as const,
    title: "Your Rights",
    points: [
      "Right to access your personal data",
      "Right to modify or correct your information",
      "Right to delete your account and data",
      "Right to withdraw consent for data processing",
      "Right to data portability",
      "Right to opt-out of marketing communications",
    ],
  },
  {
    type: "retention" as const,
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

export const PrivacyPolicyModal = ({
  visible,
  onClose,
}: PrivacyPolicyModalProps) => {
  if (!visible) return null;

  const renderItem = ({ item }: { item: typeof SECTIONS[0] }) => {
    if (item.type === "intro") {
      return (
        <LinearGradient
          colors={["rgba(160,32,160,0.25)", "rgba(116,1,130,0.15)"]}
          style={styles.card}
        >
          <Text style={styles.text}>
            This Privacy Policy explains how{" "}
            <Text style={styles.bold}>TAPPD Private Limited</Text> collects,
            uses, and protects your personal and financial data.
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
    if (item.type === "retention") {
      return (
        <View>
          <Text style={styles.sectionTitle}>Data Retention</Text>
          <Text style={styles.text}>
            We retain your data only as long as necessary. KYC documents and
            transaction records are retained for a minimum of{" "}
            <Text style={styles.bold}>5 years</Text> as per RBI guidelines.
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
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.text}>
            For privacy-related queries or to exercise your rights:
          </Text>
          <Text style={styles.link}>privacy@tappd.co.in</Text>
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
          <TouchableOpacity onPress={onClose} style={styles.icon}>
            <ChevronLeft size={22} color={Theme.colors.foreground} />
          </TouchableOpacity>

          <View style={styles.headerTitle}>
            <Shield size={18} color={Theme.colors.primary} />
            <Text style={styles.title}>Privacy Policy</Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.icon}>
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
};

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
  icon: { width: 32 },
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
