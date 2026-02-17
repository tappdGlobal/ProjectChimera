import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Shield, ChevronLeft, X } from "lucide-react-native";
import { Theme } from "../../styles/Theme";
import { SafeAreaView} from "react-native-safe-area-context";
interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal = ({
  visible,
  onClose,
}: PrivacyPolicyModalProps) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
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

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            {/* Intro */}
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

            {section(
              "Our Commitment",
              [
                "We protect your privacy in accordance with the Information Technology Act, 2000 (India)",
                "We comply with GDPR (EU) and other applicable global data protection laws",
              ],
            )}

            {section(
              "Data We Collect",
              [
                "Personal information (name, date of birth, email, phone number)",
                "Payment details (bank information, UPI ID, PAN, GSTIN)",
                "Device and app usage data for security and analytics",
                "Location data when you attend events",
                "Connection and interaction data within the platform",
              ],
            )}

            {section(
              "How We Use Your Data",
              [
                "To verify identity and enable secure transactions",
                "To comply with RBI/NPCI KYC and regulatory requirements",
                "For fraud detection and compliance monitoring",
                "To personalize user experience and improve services",
                "To facilitate event bookings and connections",
                "To send important updates and communications",
              ],
            )}

            {section(
              "Data Sharing",
              [
                "RBI-regulated financial partners for payment processing",
                "Payment gateways and banks for transaction processing",
                "Government authorities when legally required",
                "Third-party service providers under strict confidentiality agreements",
              ],
            )}

            {section(
              "Data Security",
              [
                "AES-256 encryption for stored data",
                "PCI-DSS compliance for payment data",
                "Regular vulnerability scans and security audits",
                "Secure data centers with 24/7 monitoring",
                "Multi-factor authentication for sensitive operations",
              ],
            )}

            {section(
              "Your Rights",
              [
                "Right to access your personal data",
                "Right to modify or correct your information",
                "Right to delete your account and data",
                "Right to withdraw consent for data processing",
                "Right to data portability",
                "Right to opt-out of marketing communications",
              ],
            )}

            {/* Data Retention */}
            <Text style={styles.sectionTitle}>Data Retention</Text>
            <Text style={styles.text}>
              We retain your data only as long as necessary. KYC documents and
              transaction records are retained for a minimum of{" "}
              <Text style={styles.bold}>5 years</Text> as per RBI guidelines.
            </Text>

            {/* Contact */}
            <LinearGradient
              colors={["rgba(160,32,160,0.25)", "rgba(116,1,130,0.15)"]}
              style={styles.card}
            >
              <Text style={styles.sectionTitle}>Contact Us</Text>
              <Text style={styles.text}>
                For privacy-related queries or to exercise your rights:
              </Text>
              <Text style={styles.link}>privacy@tappd.co.in</Text>
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
};

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

  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
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
