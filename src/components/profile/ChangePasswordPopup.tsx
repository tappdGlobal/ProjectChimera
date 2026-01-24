import React, { useEffect, useState } from "react";
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

interface ChangePasswordPopupProps {
  visible: boolean;
  onClose: () => void;
  onRequestOtp: (email: string) => Promise<void>;
  onSubmit: (payload: {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
  loading?: boolean;
}

export const ChangePasswordPopup: React.FC<ChangePasswordPopupProps> = ({
  visible,
  onClose,
  onRequestOtp,
  onSubmit,
  loading = false,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Reset when popup opens
  useEffect(() => {
    if (visible) {
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setLocalLoading(false);
      setError("");
    }
  }, [visible]);

  const handleRequestOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
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
      await onRequestOtp(email.trim());
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setLocalLoading(true);

    try {
      await onSubmit({
        email,
        otp,
        newPassword,
        confirmPassword,
      });
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setLocalLoading(false);
    setError("");
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
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? "Enter your email to receive an OTP"
              : "Enter OTP and your new password"}
          </Text>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* STEP 1 – EMAIL */}
          {step === 1 && (
            <>
              <TextInput
                placeholder="Email address"
                placeholderTextColor={Theme.colors.mutedForeground}
                style={styles.input}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!email || isLoading) && styles.disabled,
                ]}
                disabled={!email || isLoading}
                onPress={handleRequestOtp}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* STEP 2 – OTP + PASSWORD */}
          {step === 2 && (
            <>
              <TextInput
                placeholder="OTP"
                placeholderTextColor={Theme.colors.mutedForeground}
                style={styles.input}
                value={otp}
                onChangeText={(text) => {
                  setOtp(text);
                  setError("");
                }}
                keyboardType="number-pad"
                editable={!isLoading}
              />

              <TextInput
                placeholder="New Password"
                placeholderTextColor={Theme.colors.mutedForeground}
                style={styles.input}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setError("");
                }}
                secureTextEntry
                editable={!isLoading}
              />

              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor={Theme.colors.mutedForeground}
                style={styles.input}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError("");
                }}
                secureTextEntry
                editable={!isLoading}
              />

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!otp || !newPassword || !confirmPassword || isLoading) &&
                    styles.disabled,
                ]}
                disabled={
                  !otp || !newPassword || !confirmPassword || isLoading
                }
                onPress={handleSubmit}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </>
          )}
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

  input: {
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.lg,
    padding: 12,
    color: Theme.colors.foreground,
    marginBottom: 12,
    fontSize: 15,
  },

  primaryButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 14,
    borderRadius: Theme.radius.lg,
    alignItems: "center",
    marginTop: Theme.spacing.s,
  },

  primaryText: {
    color: Theme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: Theme.fontWeights.medium,
  },

  disabled: {
    opacity: 0.5,
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
