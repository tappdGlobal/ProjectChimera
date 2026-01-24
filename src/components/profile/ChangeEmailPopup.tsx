import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../styles/Theme";

interface ChangeEmailPopupProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  loading?: boolean;
}

export const ChangeEmailPopup: React.FC<ChangeEmailPopupProps> = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [email, setEmail] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Please enter a valid email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLocalLoading(true);

    try {
      await onSubmit(email.trim());
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to change email");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setLocalLoading(false);
    onClose();
  };

  const isLoading = loading || localLoading;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close */}
          <TouchableOpacity
            style={styles.closeIcon}
            onPress={handleClose}
            disabled={isLoading}
          >
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

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="New email address"
              placeholderTextColor={Theme.colors.mutedForeground}
              style={styles.input}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!email || isLoading) && styles.submitDisabled,
              ]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={!email || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Theme.colors.primaryForeground} />
              ) : (
                <Text style={styles.submitText}>Update</Text>
              )}
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

  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: Theme.radius.md,
    padding: 10,
    marginBottom: Theme.spacing.m,
  },

  errorText: {
    color: "#DC2626",
    fontSize: 13,
  },
});
