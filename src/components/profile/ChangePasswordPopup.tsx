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
  onRequestOtp: (email: string) => void;
  onSubmit: (payload: {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
}

export const ChangePasswordPopup: React.FC<ChangePasswordPopupProps> = ({
  visible,
  onClose,
  onRequestOtp,
  onSubmit,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

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
      setLoading(false);
    }
  }, [visible]);

  const handleRequestOtp = () => {
    if (!email.trim()) return;

    setLoading(true);
    onRequestOtp(email.trim());

    // simulate backend delay
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleSubmit = () => {
    if (!otp || !newPassword || !confirmPassword) return;

    onSubmit({
      email,
      otp,
      newPassword,
      confirmPassword,
    });
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
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? "Enter your email to receive an OTP"
              : "Enter OTP and your new password"}
          </Text>

          {/* STEP 1 – EMAIL */}
          {step === 1 && (
            <>
              <TextInput
                placeholder="Email address"
                placeholderTextColor={Theme.colors.mutedForeground}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  !email && styles.disabled,
                ]}
                disabled={!email || loading}
                onPress={handleRequestOtp}
              >
                {loading ? (
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
                onChangeText={setOtp}
                keyboardType="number-pad"
              />

              <TextInput
                placeholder="New Password"
                placeholderTextColor={Theme.colors.mutedForeground}
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor={Theme.colors.mutedForeground}
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!otp || !newPassword || !confirmPassword) &&
                    styles.disabled,
                ]}
                disabled={!otp || !newPassword || !confirmPassword}
                onPress={handleSubmit}
              >
                <Text style={styles.primaryText}>Update Password</Text>
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
});
