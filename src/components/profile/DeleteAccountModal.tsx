import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  AlertTriangle,
  Trash2,
  Lock,
  Mail,
  Check,
  Clock,
  ShieldAlert,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useUserStore } from "../../store/userStore";
import { useAuthStore } from "../../store/authStore";
import {
  requestDeleteAccountOtpApi,
  verifyDeleteAccountOtpApi,
} from "../../api/authApi";

// Steps in the deletion flow
type DeleteStep =
  | "WARNING"
  | "CONFIRM_PHRASE"
  | "OTP_VERIFICATION"
  | "DELETING"
  | "SOFT_DELETED"
  | "ERROR";

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onAccountDeleted: () => void;
}

const CONFIRMATION_PHRASE = "delete my account permanently";
const RESTORATION_PERIOD_DAYS = 15;

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
  onAccountDeleted,
}) => {
  const [currentStep, setCurrentStep] = useState<DeleteStep>("WARNING");
  const [confirmationText, setConfirmationText] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [deletionDate, setDeletionDate] = useState<Date | null>(null);

  const { profile } = useUserStore();

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentStep("WARNING");
      setConfirmationText("");
      setOtpCode("");
      setError(null);
      setIsLoading(false);
      setCountdown(0);
      setDeletionDate(null);
    }
  }, [visible]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleAcknowledgeWarning = () => {
    setCurrentStep("CONFIRM_PHRASE");
  };

  const handlePhraseConfirmation = () => {
    if (confirmationText.toLowerCase().trim() !== CONFIRMATION_PHRASE) {
      setError("Please type the confirmation phrase exactly as shown");
      return;
    }
    setError(null);
    setCurrentStep("OTP_VERIFICATION");
    // Trigger OTP send
    handleSendOtp();
  };

  const handleSendOtp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await requestDeleteAccountOtpApi();
      
      Toast.show({
        type: "success",
        text1: "Code Sent",
        text2: `A 6-digit code has been sent to ${profile?.email || "your email"}`,
      });
      setCountdown(60);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || "Failed to send verification code";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await verifyDeleteAccountOtpApi({ otp: otpCode });
      
      // Calculate permanent deletion date from response or fallback
      const permanentDeleteDate = res.data?.restorationDeadline 
        ? new Date(res.data.restorationDeadline)
        : new Date(Date.now() + RESTORATION_PERIOD_DAYS * 24 * 60 * 60 * 1000);
      setDeletionDate(permanentDeleteDate);
      
      setCurrentStep("SOFT_DELETED");
      
      Toast.show({
        type: "success",
        text1: "Account Scheduled for Deletion",
        text2: `You have ${RESTORATION_PERIOD_DAYS} days to restore your account`,
      });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || "Failed to verify code";
      setError(errorMessage);
      setCurrentStep("ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (currentStep === "SOFT_DELETED") {
      onAccountDeleted();
    } else {
      onClose();
    }
  };

  const renderWarningStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.warningIconContainer}>
        <ShieldAlert color="#F59E0B" size={48} />
      </View>

      <Text style={styles.stepTitle}>Delete Account</Text>
      <Text style={styles.stepSubtitle}>
        Unexpected bad things will happen if you don't read this!
      </Text>

      <View style={styles.warningBox}>
        <View style={styles.warningHeader}>
          <AlertTriangle color="#F59E0B" size={20} />
          <Text style={styles.warningHeaderText}>This action is irreversible</Text>
        </View>

        <ScrollView style={styles.warningContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.warningText}>
            This will permanently delete your TAPPD account and all associated data including:
          </Text>
          
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Your profile and personal information</Text>
            <Text style={styles.bulletItem}>• All your event bookings and tickets</Text>
            <Text style={styles.bulletItem}>• Your connections and chat history</Text>
            <Text style={styles.bulletItem}>• Your stories and posts</Text>
            <Text style={styles.bulletItem}>• Your payment methods and transaction history</Text>
            <Text style={styles.bulletItem}>• Your wishlist and preferences</Text>
          </View>

          <View style={styles.restorationInfo}>
            <Clock color="#DB2777" size={16} />
            <Text style={styles.restorationText}>
              After deletion, you have {RESTORATION_PERIOD_DAYS} days to restore your account. 
              After that, all data will be permanently removed and cannot be recovered.
            </Text>
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.acknowledgeButton}
        onPress={handleAcknowledgeWarning}
      >
        <Text style={styles.acknowledgeButtonText}>
          I have read and understand these effects
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConfirmPhraseStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.dangerIconContainer}>
        <Trash2 color="#EF4444" size={48} />
      </View>

      <Text style={styles.stepTitle}>Final Confirmation</Text>
      <Text style={styles.stepSubtitle}>
        To confirm, type "{CONFIRMATION_PHRASE}" in the box below
      </Text>

      <View style={styles.userInfoCard}>
        <Text style={styles.userInfoLabel}>Account to delete:</Text>
        <Text style={styles.userInfoValue}>{profile?.username || profile?.name || "Your Account"}</Text>
        <Text style={styles.userInfoEmail}>{profile?.email || ""}</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.confirmationInput,
            error && styles.inputError,
          ]}
          placeholder={`Type "${CONFIRMATION_PHRASE}"`}
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={confirmationText}
          onChangeText={(text) => {
            setConfirmationText(text);
            setError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <TouchableOpacity
        style={[
          styles.dangerButton,
          confirmationText.trim().toLowerCase() !== CONFIRMATION_PHRASE && styles.dangerButtonDisabled,
        ]}
        onPress={handlePhraseConfirmation}
        disabled={confirmationText.trim().toLowerCase() !== CONFIRMATION_PHRASE}
      >
        <Text style={styles.dangerButtonText}>I want to delete this account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => setCurrentStep("WARNING")}>
        <Text style={styles.cancelButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOtpVerificationStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.securityIconContainer}>
        <Lock color="#DB2777" size={48} />
      </View>

      <Text style={styles.stepTitle}>Verify Your Identity</Text>
      <Text style={styles.stepSubtitle}>
        We've sent a 6-digit verification code to{"\n"}
        <Text style={styles.highlightText}>{profile?.email || "your email"}</Text>
      </Text>

      <View style={styles.otpContainer}>
        <TextInput
          style={[styles.otpInput, error && styles.inputError]}
          placeholder="000000"
          placeholderTextColor="rgba(255,255,255,0.2)"
          value={otpCode}
          onChangeText={(text) => {
            setOtpCode(text.replace(/[^0-9]/g, "").slice(0, 6));
            setError(null);
          }}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.dangerButton, otpCode.length !== 6 && styles.dangerButtonDisabled]}
        onPress={handleVerifyOtp}
        disabled={otpCode.length !== 6 || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.dangerButtonText}>Verify and Delete Account</Text>
        )}
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn't receive the code?</Text>
        <TouchableOpacity
          onPress={handleSendOtp}
          disabled={countdown > 0 || isLoading}
        >
          <Text style={[styles.resendLink, countdown > 0 && styles.resendLinkDisabled]}>
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.cancelButton} onPress={() => setCurrentStep("CONFIRM_PHRASE")}>
        <Text style={styles.cancelButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSoftDeletedStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successIconContainer}>
        <Clock color="#10B981" size={64} />
      </View>

      <Text style={styles.stepTitle}>Account Scheduled for Deletion</Text>
      <Text style={styles.stepSubtitle}>
        Your account has been scheduled for permanent deletion
      </Text>

      <View style={styles.restorationCard}>
        <Text style={styles.restorationTitle}>Restoration Period Active</Text>
        <Text style={styles.restorationDescription}>
          Your account will be permanently deleted on:
        </Text>
        <Text style={styles.deletionDate}>
          {deletionDate?.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>

        <View style={styles.restorationNotice}>
          <AlertTriangle color="#F59E0B" size={16} />
          <Text style={styles.restorationNoticeText}>
            You can restore your account anytime before this date by logging in.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
        <Text style={styles.doneButtonText}>I Understand</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.errorIconContainer}>
        <ShieldAlert color="#EF4444" size={64} />
      </View>

      <Text style={styles.stepTitle}>Deletion Failed</Text>
      <Text style={styles.stepSubtitle}>
        We couldn't delete your account at this time
      </Text>

      <View style={styles.errorCard}>
        <Text style={styles.errorCardText}>
          {error || "An unexpected error occurred. Please try again later."}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => setCurrentStep("OTP_VERIFICATION")}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
        <Text style={styles.cancelButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "WARNING":
        return renderWarningStep();
      case "CONFIRM_PHRASE":
        return renderConfirmPhraseStep();
      case "OTP_VERIFICATION":
        return renderOtpVerificationStep();
      case "SOFT_DELETED":
        return renderSoftDeletedStep();
      case "ERROR":
        return renderErrorStep();
      default:
        return renderWarningStep();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={["#0A0A1F", "#1A1A3F"]}
          style={styles.modalContainer}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {currentStep === "SOFT_DELETED"
                ? "Account Status"
                : "Delete Account"}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </View>

          {currentStep !== "SOFT_DELETED" && currentStep !== "ERROR" && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width:
                        currentStep === "WARNING"
                          ? "33%"
                          : currentStep === "CONFIRM_PHRASE"
                          ? "66%"
                          : "100%",
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                Step{" "}
                {currentStep === "WARNING"
                  ? "1"
                  : currentStep === "CONFIRM_PHRASE"
                  ? "2"
                  : "3"}{" "}
                of 3
              </Text>
            </View>
          )}

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {renderCurrentStep()}
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 4,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#DB2777",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginTop: 8,
    textAlign: "center",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  stepContainer: {
    padding: 24,
    alignItems: "center",
  },
  warningIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  dangerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  securityIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(219, 39, 119, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  highlightText: {
    color: "#DB2777",
    fontWeight: "600",
  },
  warningBox: {
    width: "100%",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    overflow: "hidden",
    marginBottom: 20,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    gap: 8,
  },
  warningHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F59E0B",
  },
  warningContent: {
    padding: 16,
    maxHeight: 200,
  },
  warningText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 20,
    marginBottom: 12,
  },
  bulletList: {
    marginBottom: 16,
  },
  bulletItem: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 22,
  },
  restorationInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(219, 39, 119, 0.1)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(219, 39, 119, 0.2)",
  },
  restorationText: {
    flex: 1,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 18,
  },
  acknowledgeButton: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  acknowledgeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  userInfoCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  userInfoLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 4,
  },
  userInfoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userInfoEmail: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  confirmationInput: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#FFFFFF",
  },
  otpContainer: {
    width: "100%",
    marginBottom: 20,
  },
  otpInput: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    color: "#FFFFFF",
    letterSpacing: 8,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 8,
  },
  dangerButton: {
    width: "100%",
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  dangerButtonDisabled: {
    backgroundColor: "rgba(239, 68, 68, 0.5)",
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cancelButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  resendText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 4,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DB2777",
  },
  resendLinkDisabled: {
    color: "rgba(255,255,255,0.3)",
  },
  restorationCard: {
    width: "100%",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  restorationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
    marginBottom: 12,
    textAlign: "center",
  },
  restorationDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 8,
  },
  deletionDate: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  restorationNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  restorationNoticeText: {
    flex: 1,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 18,
  },
  doneButton: {
    width: "100%",
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  errorCard: {
    width: "100%",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  errorCardText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    width: "100%",
    backgroundColor: "#DB2777",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

