import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../styles/Theme";

interface AddPaymentAccountTypePopupProps {
  visible: boolean;
  onClose: () => void;
  onSelectIndividual: () => void;
  onSelectBusiness: () => void;
}

export const AddPaymentAccountTypePopup: React.FC<
  AddPaymentAccountTypePopupProps
> = ({
  visible,
  onClose,
  onSelectIndividual,
  onSelectBusiness,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close */}
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Ionicons
              name="close"
              size={20}
              color={Theme.colors.mutedForeground}
            />
          </TouchableOpacity>

          {/* Header */}
          <Text style={styles.title}>Add New Payment Information</Text>
          <Text style={styles.subtitle}>
            Choose your account type to get started
          </Text>

          {/* Individual */}
          <TouchableOpacity
            style={styles.optionCard}
            activeOpacity={0.85}
            onPress={onSelectIndividual}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="person" size={22} color="#fff" />
            </View>

            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Individual (B2C)</Text>
              <Text style={styles.optionDesc}>
                For personal use and individual transactions
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={Theme.colors.mutedForeground}
            />
          </TouchableOpacity>

          {/* Business */}
          <TouchableOpacity
            style={styles.optionCard}
            activeOpacity={0.85}
            onPress={onSelectBusiness}
          >
            <View style={[styles.iconCircle, styles.businessIcon]}>
              <Ionicons name="business" size={22} color="#fff" />
            </View>

            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Business (B2B)</Text>
              <Text style={styles.optionDesc}>
                For registered businesses and enterprises
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={Theme.colors.mutedForeground}
            />
          </TouchableOpacity>
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
    width: "90%",
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.l,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },

  closeIcon: {
    position: "absolute",
    top: 14,
    right: 14,
    padding: 4,
  },

  title: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  subtitle: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    marginBottom: 20,
  },

  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.lg,
    padding: 14,
    marginBottom: 14,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  businessIcon: {
    backgroundColor: Theme.colors.secondary ?? Theme.colors.primary,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    color: Theme.colors.foreground,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },

  optionDesc: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
    lineHeight: 18,
  },
});
