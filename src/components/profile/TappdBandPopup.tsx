import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ColorValue,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";

interface TappdBandPopupProps {
  visible: boolean;
  onClose: () => void;
  onStartPairing: () => void;
}

/**
 * Helper to satisfy expo-linear-gradient tuple typing
 * WITHOUT touching Theme.ts
 */
const asGradient = (
  colors: string[]
): readonly [ColorValue, ColorValue, ...ColorValue[]] => {
  return colors as unknown as readonly [
    ColorValue,
    ColorValue,
    ...ColorValue[]
  ];
};


export const TappdBandPopup: React.FC<TappdBandPopupProps> = ({
  visible,
  onClose,
  onStartPairing,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (visible && !isConnecting) {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, isConnecting]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "15deg"],
  });
  const prevVisible = useRef<boolean>(false);

  const handleStartPairing = () => {
    setIsConnecting(true);
  };
 useEffect(() => {
  // Reset ONLY when popup transitions from closed → open
  if (visible && !prevVisible.current) {
    setIsConnecting(false);
  }

  prevVisible.current = visible;
}, [visible]);


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
          <Text style={styles.title}>TAPPD Band Registration</Text>
          <Text style={styles.subtitle}>
            Connect your TAPPD band with your phone
          </Text>

          {/* Content */}
          <View style={styles.centerContent}>
            <Text style={styles.sectionTitle}>
              {isConnecting ? "Connecting to Band..." : "Register TAPPD Band"}
            </Text>

            <Text style={styles.helperText}>
              {isConnecting
                ? "Keep holding until connection is established"
                : "Tap and hold band until it shows up"}
            </Text>

            <View style={styles.iconRow}>
              {/* Phone */}
              <Animated.View
                style={[
                  styles.phoneIconBox,
                  { transform: [{ rotate }] },
                ]}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={36}
                  color="#fff"
                />
                <Text style={styles.iconLabel}>Your Phone</Text>
              </Animated.View>

              {/* Band */}
              <LinearGradient
                colors={asGradient(GRADIENT_COLORS.primary)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bandIconBox}
              >
                <Ionicons name="watch-outline" size={40} color="#fff" />
                <Text style={styles.iconLabel}>TAPPD Band</Text>
              </LinearGradient>
            </View>

            {/* Connecting dots */}
            {isConnecting && <ConnectingDots />}

            {/* Searching */}
            {isConnecting && (
              <View style={styles.searchingRow}>
                <ActivityIndicator
                  size="small"
                  color={Theme.colors.primary}
                />
                <Text style={styles.searchingText}>
                  Searching for band...
                </Text>
              </View>
            )}
          </View>

          {/* CTA */}
          {!isConnecting && (
            <TouchableOpacity activeOpacity={0.85} onPress={handleStartPairing}>
              <LinearGradient
                colors={asGradient(GRADIENT_COLORS.primaryHover)}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Start Pairing</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

/* ------------------ Connecting Dots ------------------ */

const ConnectingDots = () => {
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = dotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={styles.dotsRow}>
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={[styles.dot, { opacity }]}
        />
      ))}
    </View>
  );
};

/* ------------------ Styles ------------------ */

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

  centerContent: {
    alignItems: "center",
    marginVertical: Theme.spacing.l,
  },

  sectionTitle: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: Theme.fontWeights.medium,
    marginBottom: 6,
  },

  helperText: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
    marginBottom: Theme.spacing.l,
    textAlign: "center",
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  phoneIconBox: {
    alignItems: "center",
    padding: Theme.spacing.m,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.muted,
    marginRight: -12,
    zIndex: 2,
  },

  bandIconBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.m,
    borderRadius: 999,
    zIndex: 1,
  },

  iconLabel: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
    marginTop: 6,
  },

  primaryButton: {
    alignSelf: "center",
    marginTop: Theme.spacing.l,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: Theme.radius.lg,
  },

  primaryButtonText: {
    color: Theme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: Theme.fontWeights.medium,
  },

  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.primary,
    marginHorizontal: 4,
  },

  searchingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  searchingText: {
    marginLeft: 8,
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },
});
