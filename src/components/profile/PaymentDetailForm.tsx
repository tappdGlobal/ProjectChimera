import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";

/* -------------------- TYPES -------------------- */

interface PaymentDetailFormProps {
  visible: boolean;
  onClose: () => void;
  onBack: () => void;
  onSave: (data: any) => void;
}

/* -------------------- COMPONENT -------------------- */

export const PaymentDetailForm: React.FC<PaymentDetailFormProps> = ({
  visible,
  onClose,
  onBack,
  onSave,
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDob(selectedDate);
  };

  const formattedDOB = dob
    ? dob.toLocaleDateString("en-GB")
    : "dd-mm-yyyy";

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
          <Text style={styles.title}>Enter Payment Details</Text>
          <Text style={styles.subtitle}>
            Fill in your individual payment information
          </Text>

          {/* Form */}
          <ScrollView showsVerticalScrollIndicator style={styles.scroll}>
            <FormField
              label="Full Name (as per PAN) *"
              placeholder="Enter your full name"
            />

            {/* Date of Birth */}
            <View style={styles.field}>
              <Text style={styles.label}>Date of Birth *</Text>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.input,
                    !dob && { color: Theme.colors.mutedForeground },
                  ]}
                >
                  {formattedDOB}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={Theme.colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={dob || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                onChange={onDateChange}
                maximumDate={new Date()}
                themeVariant="dark"
                textColor={Theme.colors.foreground}
              />
            )}

            <FormField label="PAN Number *" placeholder="ABCDE1234F" />
            <FormField
              label="Bank Account Number *"
              placeholder="Enter account number"
              keyboardType="numeric"
            />
            <FormField label="IFSC Code *" placeholder="SBIN0001234" />
            <FormField label="UPI ID (Optional)" placeholder="yourname@upi" />
            <FormField
              label="Billing Address *"
              placeholder="Enter your address"
            />

            {/* State + City */}
            <View style={styles.row}>
              <View style={styles.flex}>
                <FormField label="State *" placeholder="State" />
              </View>
              <View style={styles.flex}>
                <FormField label="City *" placeholder="City" />
              </View>
            </View>

            <FormField
              label="Pincode *"
              placeholder="110001"
              keyboardType="numeric"
            />

            {/* Read-only */}
            <ReadOnlyField label="Mobile Number" value="+91 98765 43210" />
            <ReadOnlyField label="Email Address" value="harsh@tappd.co.in" />

            {/* Confirmation */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setConfirmed(!confirmed)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  confirmed && styles.checkboxActive,
                ]}
              >
                {confirmed && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxText}>
                I confirm that all details provided are accurate and valid.
              </Text>
            </TouchableOpacity>

            {/* Compliance */}
            <View style={styles.complianceBox}>
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={Theme.colors.primary}
              />
              <Text style={styles.complianceText}>
                This information is stored and processed under strict
                confidentiality and regulatory compliance.
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1 }}
              disabled={!confirmed}
              onPress={() => onSave({})}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={GRADIENT_COLORS.primary as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.saveButton,
                  !confirmed && styles.saveButtonDisabled,
                ]}
              >
                <Text style={styles.saveText}>
                  Save Payment Information
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* -------------------- SUB COMPONENTS -------------------- */

const FormField = ({ label, placeholder, ...props }: any) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={Theme.colors.mutedForeground}
        style={styles.input}
        {...props}
      />
    </View>
  </View>
);

const ReadOnlyField = ({ label, value }: any) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputWrapper, styles.readOnly]}>
      <Text style={styles.readOnlyText}>{value}</Text>
    </View>
    <Text style={styles.fetchedText}>Fetched from your account</Text>
  </View>
);

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
    maxHeight: "90%",
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.l,
  },
  closeIcon: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  title: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: Theme.colors.mutedForeground,
    marginBottom: 16,
  },
  scroll: { marginTop: 8 },
  field: { marginBottom: 14 },
  label: {
    color: Theme.colors.foreground,
    fontWeight: "600",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.lg,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    color: Theme.colors.foreground,
    fontSize: 14,
  },
  readOnly: { opacity: 0.6 },
  readOnlyText: { color: Theme.colors.foreground },
  fetchedText: {
    fontSize: 11,
    color: Theme.colors.mutedForeground,
    marginTop: 4,
  },
  row: { flexDirection: "row", gap: 12 },
  flex: { flex: 1 },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  checkboxText: {
    color: Theme.colors.mutedForeground,
    flex: 1,
    fontSize: 13,
  },

  complianceBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Theme.colors.muted,
    padding: 12,
    borderRadius: Theme.radius.lg,
    marginBottom: 16,
  },
  complianceText: {
    color: Theme.colors.mutedForeground,
    flex: 1,
    fontSize: 13,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },

  backButton: {
    height: 48,
    paddingHorizontal: 22,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    color: Theme.colors.foreground,
    fontSize: 15,
    fontWeight: "600",
  },

  saveButton: {
    height: 48,
    borderRadius: Theme.radius.lg,
    justifyContent: "center",
    alignItems: "center",
  },

  saveButtonDisabled: {
    opacity: 0.45,
  },

  saveText: {
    color: Theme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
