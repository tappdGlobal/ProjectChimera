import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../styles/Theme";

interface ChangeEmailPopupProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

export const ChangeEmailPopup: React.FC<ChangeEmailPopupProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!email.trim()) return;
    onSubmit(email.trim());
  };

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

          {/* Header */}
          <Text style={styles.title}>Change Email</Text>
          <Text style={styles.subtitle}>
            Enter your new email address
          </Text>

          {/* Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="New email address"
              placeholderTextColor={Theme.colors.mutedForeground}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                !email && styles.submitDisabled,
              ]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={!email}
            >
              <Text style={styles.submitText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};



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
    top: Theme.spacing.m,
    right: Theme.spacing.m,
    zIndex: 10,
  },

  title: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: Theme.fontWeights.medium,
    marginBottom: 6,
  },

  subtitle: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    marginBottom: Theme.spacing.l,
  },

  inputWrapper: {
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: Theme.spacing.l,
  },

  input: {
    color: Theme.colors.foreground,
    fontSize: 15,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },

  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  cancelText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },

  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.primary,
  },

  submitDisabled: {
    opacity: 0.5,
  },

  submitText: {
    color: Theme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: Theme.fontWeights.medium,
  },
});
