import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAnalytics } from "../hooks/useAnalytics";

export const SplashScreen = () => {
  useAnalytics("SplashScreen");
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createPulseAnimation = (
      animatedValue: Animated.Value,
      delay: number,
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    const animation = Animated.parallel([
      createPulseAnimation(dot1Opacity, 0),
      createPulseAnimation(dot2Opacity, 200),
      createPulseAnimation(dot3Opacity, 400),
    ]);

    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <LinearGradient colors={["#0A0A1F", "#1A1A3F"]} style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoWhite}>T</Text>
            <Text style={styles.logoPink}>APP</Text>
            <Text style={styles.logoWhite}>D</Text>
          </View>
          <Text style={styles.tagline}>Your door to endless opportunities</Text>

          {/* Loading Dots */}
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
            <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
            <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
          </View>
        </View>

        {/* Bottom Text */}
        <View style={styles.bottomSection}>
          <Text style={styles.welcomeText}>WELCOME TO TAPPD</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 80,
  },
  logoSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logoWhite: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  logoPink: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#DB2777",
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 0.5,
    marginBottom: 32,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#DB2777",
  },
  bottomSection: {
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
    letterSpacing: 2,
  },
});
