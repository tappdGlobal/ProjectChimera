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
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";

// Configure Google Sign-In (only on native)
if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId:
      "931740229699-3m651s5etkhke6bh3i7kba0ij1irq48g.apps.googleusercontent.com",
    offlineAccess: false,
  });
}

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { signin, googleSignin, forgotPassword, resetPassword, loading, error } = useAuthStore();
  const { trackEvent, trackButtonClick, trackFormSubmit, identifyUser } =
    useAnalytics("LoginScreen");

  useEffect(() => {
    if (error) {
      Alert.alert("Login Failed", error);
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
      trackFormSubmit("email_password_login", false, err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    trackButtonClick("Continue with Google");

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (response.type === "success") {
        const { data } = response;

        // Send idToken to backend
        await googleSignin({ idToken: data.idToken || "" });

        // Identify user in PostHog
        const { userId } = useAuthStore.getState();

        if (userId) {
          identifyUser(userId);
        }


        trackEvent("user_login", { method: "google" });

        // Navigate to main screen on success
        navigation.reset({
          index: 0,
          routes: [
            {
              name: SCREEN_NAMES.MAIN_TABS,
              params: { screen: SCREEN_NAMES.ENGAGE },
            },
          ],
        });
      } else {
        // User cancelled the sign-in
        trackEvent("google_signin_cancelled");
        console.log("Google Sign-In cancelled");
      }
    } catch (error: any) {
      trackEvent("google_signin_error", {
        error_code: error.code,
        error_message: error.message,
      });

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the login flow
        console.log("User cancelled Google Sign-In");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Operation already in progress
        Alert.alert("Error", "Sign-in already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Error", "Google Play Services not available");
      } else {
        Alert.alert("Google Sign-In Failed", error.message || "Unknown error");
      }
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
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordContainer}>
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

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              {/* Google Sign-In Button */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                disabled={loading}
              >
                <Text style={styles.googleButtonText}>
                  Continue with Google
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Forgot Password Popup */}
      <ChangePasswordPopup
        visible={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onRequestOtp={async (email) => {
          try {
            await forgotPassword(email);
            Toast.show({
              type: "success",
              text1: "OTP Sent",
              text2: "Please check your email for the OTP",
            });
          } catch (err: any) {
            Toast.show({
              type: "error",
              text1: "Failed to Send OTP",
              text2: err.message || "An error occurred",
            });
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    marginHorizontal: 16,
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  googleButtonText: {
    color: "#1A1A3F",
    fontSize: 16,
    fontWeight: "600",
  },
});
