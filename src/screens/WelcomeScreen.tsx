import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAnalytics } from "../hooks/useAnalytics";

export const WelcomeScreen = ({ navigation }: any) => {
  const { trackButtonClick } = useAnalytics("WelcomeScreen");
  return (
    <LinearGradient colors={["#0A0A1F", "#1A1A3F"]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Text style={styles.logo}>TAPPD</Text>
            <Text style={styles.tagline}>Tap into your world</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome!</Text>
            <Text style={styles.welcomeDescription}>
              Discover amazing events, connect with like-minded people, and
              create unforgettable experiences.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                trackButtonClick("Get Started");
                navigation.navigate("ProfileCreation");
              }}
            >
              <LinearGradient
                colors={["#C026D3", "#DB2777"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                trackButtonClick("I already have an account");
                navigation.navigate("Login");
              }}
            >
              <Text style={styles.secondaryButtonText}>
                I already have an account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{" "}
              <Text style={styles.footerLink}>Terms of Service</Text> and{" "}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoSection: {
    alignItems: "center",
    marginTop: 60,
  },
  logo: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 0.5,
  },
  welcomeSection: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  welcomeDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    borderRadius: 28,
    overflow: "hidden",
  },
  primaryButtonGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 20,
  },
  footerLink: {
    color: "#DB2777",
    fontWeight: "600",
  },
});
