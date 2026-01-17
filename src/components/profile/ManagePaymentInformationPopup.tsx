import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Edit } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";

interface PaymentInfo {
  id: string;
  bankName: string;
  last4: string;
  email: string;
  phone: string;
  type: "Individual" | "Business";
  addedOn: string;
  verified?: boolean;
}

interface ManagePaymentInformationPopupProps {
  visible: boolean;
  onClose: () => void;
  payments: PaymentInfo[];
  onAddNew: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ManagePaymentInformationPopup: React.FC<
  ManagePaymentInformationPopupProps
> = ({ visible, onClose, payments, onAddNew, onEdit, onDelete }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close */}
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Ionicons
              name="close"
              size={22}
              color={Theme.colors.mutedForeground}
            />
          </TouchableOpacity>

          <Text style={styles.title}>Manage Payment Information</Text>
          <Text style={styles.subtitle}>
            View, edit, or add payment details for secure transactions.
          </Text>

          <ScrollView showsVerticalScrollIndicator style={styles.scroll}>
            {payments.map((item) => (
              <View key={item.id} style={styles.card}>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.bankRow}>
                    <View style={styles.bankIcon}>
                      <Ionicons name="business" size={18} color="#fff" />
                    </View>

                    <View>
                      <View style={styles.bankNameRow}>
                        <Text style={styles.bankName}>
                          {item.bankName}
                        </Text>
                        {item.verified && (
                          <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedText}>
                              Verified
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.masked}>
                        •••• {item.last4}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionIcons}>
                    <TouchableOpacity
                      onPress={() => onEdit(item.id)}
                      style={styles.iconBtn}
                    >
                      <Edit
                        size={18}
                        color={Theme.colors.mutedForeground}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => onDelete(item.id)}
                      style={styles.iconBtn}
                    >
                      <Ionicons
                        name="trash"
                        size={18}
                        color={Theme.colors.destructive}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Details */}
                <Text style={styles.detail}>{item.email}</Text>
                <Text style={styles.detail}>{item.phone}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.type}</Text>
                  </View>
                  <Text style={styles.metaText}>
                    Added {item.addedOn}
                  </Text>
                </View>
              </View>
            ))}

            {/* Add Payment Integration */}
            <TouchableOpacity activeOpacity={0.9} onPress={onAddNew}>
              <LinearGradient
                colors={GRADIENT_COLORS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addButton}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>
                  Add Payment Integration
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Compliance */}
            <View style={styles.complianceBox}>
              <Text style={styles.complianceTitle}>
                Secure & Compliant
              </Text>
              <Text style={styles.complianceText}>
                This information is stored and processed under strict
                confidentiality and regulatory compliance including RBI,
                NPCI, PCI DSS, GDPR, and IT Act 2000 standards.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "92%",
    maxHeight: "85%",
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.l,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },

  closeIcon: {
    position: "absolute",
    top: Theme.spacing.m,
    right: Theme.spacing.m,
  },

  title: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },

  subtitle: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    marginBottom: Theme.spacing.l,
  },

  scroll: {
    marginTop: 8,
  },

  card: {
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  bankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  bankIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  bankNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  bankName: {
    color: Theme.colors.foreground,
    fontSize: 15,
    fontWeight: "600",
  },

  verifiedBadge: {
    backgroundColor: "rgba(34,197,94,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },

  verifiedText: {
    color: "#22C55E",
    fontSize: 11,
    fontWeight: "600",
  },

  masked: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
    marginTop: 2,
  },

  actionIcons: {
    alignItems: "center",
    gap: 14,
  },

  iconBtn: {
    padding: 4,
  },

  detail: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
    marginTop: 4,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },

  typeBadge: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },

  typeText: {
    color: Theme.colors.foreground,
    fontSize: 12,
  },

  metaText: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: Theme.radius.lg,
    marginTop: Theme.spacing.l,
    gap: 8,
  },

  addButtonText: {
    color: Theme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: "600",
  },

  complianceBox: {
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.m,
    marginTop: Theme.spacing.l,
  },

  complianceTitle: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },

  complianceText: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
    lineHeight: 18,
  },
});
