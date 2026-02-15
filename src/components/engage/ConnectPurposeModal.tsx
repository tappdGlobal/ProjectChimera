import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { X, User, Heart, Users } from "lucide-react-native";
import { Theme } from "../../styles/Theme";
import { ConnectionIntent } from "../../types/qrTypes";

interface ConnectPurposeModalProps {
  visible: boolean;
  onClose: () => void;
  onScanNow: (selected: string[]) => void;
}



export function ConnectPurposeModal({
  visible,
  onClose,
  onScanNow,
}: ConnectPurposeModalProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (type: string) => {
    if (selected.includes(type)) {
      setSelected(selected.filter((item) => item !== type));
    } else {
      setSelected([...selected, type]);
    }
  };

  const isSelected = (type: string) => selected.includes(type);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                Choose Your Connection Purpose
              </Text>
              <Text style={styles.subtitle}>
                Select how you’d like to connect
              </Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <X size={22} color={Theme.colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Friend */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              isSelected("friend") && styles.selectedCard,
            ]}
            onPress={() => toggleSelect("friend")}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#3B82F6" }]}>
              <User size={22} color="#fff" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Friend</Text>
              <Text style={styles.optionSubtitle}>
                Build meaningful friendships
              </Text>
            </View>
          </TouchableOpacity>

          {/* Date */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              isSelected("date") && styles.selectedCard,
            ]}
            onPress={() => toggleSelect("date")}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#EC4899" }]}>
              <Heart size={22} color="#fff" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Date</Text>
              <Text style={styles.optionSubtitle}>
                Express romantic interest
              </Text>
            </View>
          </TouchableOpacity>

          {/* Networking */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              isSelected("networking") && styles.selectedCard,
            ]}
            onPress={() => toggleSelect("networking")}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#F97316" }]}>
              <Users size={22} color="#fff" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Networking</Text>
              <Text style={styles.optionSubtitle}>
                Grow professional connections
              </Text>
            </View>
          </TouchableOpacity>

          {/* Scan Now */}
          <TouchableOpacity
            style={[
              styles.scanButton,
              selected.length === 0 && { opacity: 0.6 },
            ]}
            disabled={selected.length === 0}
            onPress={() => onScanNow(selected)}
          >
            <Text style={styles.scanText}>Scan Now</Text>
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: Theme.spacing.l,
  },

  container: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.l,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.l,
  },

  title: {
    fontSize: 18,
    fontWeight: Theme.fontWeights.medium,
    color: Theme.colors.foreground,
  },

  subtitle: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    marginTop: 4,
  },

  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Theme.spacing.m,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.secondary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.m,
  },

  selectedCard: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.accent,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Theme.spacing.m,
  },

  textContainer: { flex: 1 },

  optionTitle: {
    fontSize: 16,
    fontWeight: Theme.fontWeights.medium,
    color: Theme.colors.foreground,
  },

  optionSubtitle: {
    fontSize: 13,
    color: Theme.colors.mutedForeground,
    marginTop: 2,
  },

  scanButton: {
    marginTop: Theme.spacing.m,
    paddingVertical: 14,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
  },

  scanText: {
    fontSize: 15,
    color: Theme.colors.primaryForeground,
    fontWeight: Theme.fontWeights.medium,
  },

  cancelButton: {
    marginTop: Theme.spacing.m,
    paddingVertical: 14,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: "center",
  },

  cancelText: {
    fontSize: 15,
    color: Theme.colors.foreground,
  },
});
