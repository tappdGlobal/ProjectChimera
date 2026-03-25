import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { SCREEN_NAMES } from "../navigation/Routes";
import { useAnalytics } from "../hooks/useAnalytics";
import { ChangePasswordPopup } from "../components/profile/ChangePasswordPopup";
import Toast from "react-native-toast-message";


export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");

  const { signin, forgotPassword, resetPassword, loading, error, clearError } = useAuthStore();
  const { trackEvent, trackButtonClick, trackFormSubmit, identifyUser } =
    useAnalytics("LoginScreen");

  // Clear errors when user types
  useEffect(() => {
    if (email) setEmailError("");
  }, [email]);

  useEffect(() => {
    if (password) setPasswordError("");
  }, [password]);

  useEffect(() => {
    if (error) {
      // Show inline errors based on error type
      if (error === "Wrong password") {
        setPasswordError("The password you entered is incorrect. Please try again.");
      } else if (error === "Email not found") {
        setEmailError("We couldn't find an account with this email address.");
      } else {
        // For other errors, show as email error
        setEmailError(error);
      }
      // Clear the store error after displaying
      clearError?.();
    }
  }, [error]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      trackFormSubmit("email_password_login", false, "Missing fields");
      return;
    }

    try {
      await signin({ email, password });

      // Identify user in PostHog
      const { userId } = useAuthStore.getState();

      if (userId) {
        identifyUser(userId);
      }


      trackFormSubmit("email_password_login", true);
      trackEvent("user_login", { method: "email" });

      navigation.reset({
        index: 0,
        routes: [
          {
            name: SCREEN_NAMES.MAIN_TABS,
            params: { screen: SCREEN_NAMES.ENGAGE },
          },
        ],
      });
    } catch (err: any) {
      // Error is already handled by useEffect via authStore error state
      trackFormSubmit("email_password_login", false, err?.message || "Login failed");
    }
  };

  return (
    <LinearGradient colors={["#0A0A1F", "#1A1A3F"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              trackButtonClick("Back");
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign In</Text>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Welcome back!</Text>
              <Text style={styles.subtitle}>
                Sign in to continue your journey
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff color="rgba(255,255,255,0.4)" size={20} />
                    ) : (
                      <Eye color="rgba(255,255,255,0.4)" size={20} />
                    )}
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              <TouchableOpacity 
                style={styles.forgotPasswordButton}
                onPress={() => {
                  trackButtonClick("Forgot Password");
                  setShowForgotPassword(true);
                }}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#C026D3", "#DB2777"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signInGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.signInButtonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Forgot Password Popup */}
      <ChangePasswordPopup
        visible={showForgotPassword}
        onClose={() => {
          setShowForgotPassword(false);
          setForgotPasswordError("");
        }}
        externalError={forgotPasswordError}
        onSignUp={() => {
          setShowForgotPassword(false);
          setForgotPasswordError("");
          navigation.navigate(SCREEN_NAMES.WELCOME);
        }}
        onRequestOtp={async (email) => {
          try {
            setForgotPasswordError("");
            await forgotPassword(email);
            Toast.show({
              type: "success",
              text1: "OTP Sent",
              text2: "Please check your email for the OTP",
            });
          } catch (err: any) {
            const { error: storeError } = useAuthStore.getState();
            
            // Replace raw HTTP error with user-friendly message
            if (storeError && storeError.includes("status code 404")) {
              setForgotPasswordError("Email not found");
            } else {
              setForgotPasswordError(storeError || "Failed to send OTP. Please try again.");
            }
            throw err;
          }
        }}
        onSubmit={async (payload) => {
          try {
            await resetPassword(payload);
            Toast.show({
              type: "success",
              text1: "Password Reset Complete",
              text2: "You can now login with your new password",
            });
            setShowForgotPassword(false);
          } catch (err: any) {
            Toast.show({
              type: "error",
              text1: "Failed to Reset Password",
              text2: err.message || "An error occurred",
            });
            throw err;
          }
        }}
        loading={loading}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    padding: 24,
    flexGrow: 1,
    paddingTop: 40,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#FFFFFF",
  },
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 1,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#FFFFFF",
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: "#DB2777",
    fontSize: 14,
  },
  signInButton: {
    marginTop: 20,
    borderRadius: 28,
    overflow: "hidden",
  },
  signInGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
