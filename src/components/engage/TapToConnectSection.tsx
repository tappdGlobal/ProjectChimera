import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
} from "react-native";
import { Theme } from "../../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { QrCode, Smartphone, Watch, Camera, X } from "lucide-react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ConnectionCard = ({
  icon: Icon,
  title,
  description,
  onPress,
  gradientIcon = false,
}: {
  icon: any;
  title: string;
  description: string;
  onPress?: () => void;
  gradientIcon?: boolean;
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.iconContainer}>
      {gradientIcon ? (
        <LinearGradient
          colors={["#D946EF", "#A855F7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientIcon}
        >
          <Icon size={32} color="#fff" />
        </LinearGradient>
      ) : (
        <View style={styles.defaultIcon}>
          <Icon size={32} color="#D946EF" />
        </View>
      )}
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDescription}>{description}</Text>
  </TouchableOpacity>
);

export function TapToConnectSection() {
  const [view, setView] = useState<"menu" | "qr" | "tap">("menu");
  const [tapMode, setTapMode] = useState<"p2p" | "p2b">("p2p"); // Phone to Phone vs Phone to Band
  const [showBandModal, setShowBandModal] = useState(false);
  const [pairingStep, setPairingStep] = useState<
    "initial" | "searching" | "found"
  >("initial");

  const changeView = (newView: "menu" | "qr" | "tap") => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setView(newView);
  };

  // Animation values
  const floatAnim1 = React.useRef(new Animated.Value(0)).current;
  const floatAnim2 = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const beepAnim = React.useRef(new Animated.Value(0.3)).current;

  const startPairingString = () => {
    setPairingStep("searching");
    // Simulate finding a band after 3 seconds
    setTimeout(() => {
      setPairingStep("found");
    }, 3000);
  };

  React.useEffect(() => {
    if (pairingStep === "searching") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(beepAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(beepAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ).start();
    } else {
      beepAnim.setValue(0.3);
    }
  }, [pairingStep]);

  React.useEffect(() => {
    if (!showBandModal) {
      setPairingStep("initial");
    }
  }, [showBandModal]);

  React.useEffect(() => {
    if (view === "tap") {
      // Extended floating animation
      const createFloatAnim = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: -15,
              duration: 2000,
              delay: delay,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
          ]),
        );
      };

      // Pulsing effect for the "connection"
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      );

      // Start animations
      const anim1 = createFloatAnim(floatAnim1, 0);
      const anim2 = createFloatAnim(floatAnim2, 1000); // Offset for natural feel

      anim1.start();
      anim2.start();
      pulseAnimation.start();

      return () => {
        anim1.stop();
        anim2.stop();
        pulseAnimation.stop();
        floatAnim1.setValue(0);
        floatAnim2.setValue(0);
        pulseAnim.setValue(1);
      };
    }
  }, [view]);

  if (view === "qr") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Show QR to Connect</Text>
          <Text style={styles.headerSubtitle}>
            Let others scan your QR code to connect instantly
          </Text>
        </View>

        <View style={[styles.content, { alignItems: "center" }]}>
          <View style={styles.qrContainer}>
            <Image
              source={{
                uri: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://tapped.app/u/amitverma",
              }}
              style={styles.qrImage}
            />
          </View>

          <View style={{ marginTop: 40, alignItems: "center", gap: 16 }}>
            <TouchableOpacity style={styles.scanButton}>
              <View style={styles.scanIconContainer}>
                <Camera size={24} color="#fff" />
              </View>
              <Text style={styles.scanButtonText}>Scan to Connect</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => changeView("menu")}
            >
              <Text style={styles.backButtonText}>Back to Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (view === "tap") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tap to Connect</Text>
          <Text style={styles.headerSubtitle}>
            Tap other person's phone or TAPPD band with your phone for 3 seconds
            to connect
          </Text>
        </View>

        <View
          style={[
            styles.content,
            {
              alignItems: "center",
              justifyContent: "space-between",
              flex: 1,
              paddingBottom: 40,
            },
          ]}
        >
          {/* Visual Animation Area */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            {/* Connection Line */}
            <View
              style={{
                position: "absolute",
                width: 150,
                height: 4,
                backgroundColor: "#D946EF",
                opacity: 0.3,
                borderRadius: 2,
              }}
            />

            {/* Connection Pulse Effect */}
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.2],
                    outputRange: [0.1, 0],
                  }),
                },
              ]}
            />

            <Animated.View
              style={[
                styles.deviceContainer,
                {
                  transform: [{ translateY: floatAnim1 }],
                  marginRight: 5,
                  zIndex: 1,
                },
              ]}
            >
              <View
                style={[
                  styles.deviceFrame,
                  { transform: [{ rotate: "-15deg" }] },
                ]}
              >
                <Smartphone size={40} color="#fff" />
              </View>
              <Text style={styles.deviceLabel}>Your Phone</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.deviceContainer,
                {
                  transform: [{ translateY: floatAnim2 }],
                  marginLeft: 5,
                  opacity: 0.9,
                },
              ]}
            >
              <View
                style={
                  tapMode === "p2p"
                    ? [
                        styles.deviceFrame,
                        {
                          backgroundColor: "#2D2B3B",
                          transform: [{ rotate: "15deg" }],
                        },
                      ]
                    : [
                        styles.deviceFrameCircular,
                        {
                          backgroundColor: "#A855F7",
                          width: 100,
                          height: 100,
                          borderRadius: 50,
                          transform: [{ rotate: "15deg" }],
                        },
                      ]
                }
              >
                {tapMode === "p2p" ? (
                  <Smartphone size={40} color="#fff" />
                ) : (
                  <Watch size={40} color="#fff" />
                )}
              </View>
              <Text style={styles.deviceLabel}>
                {tapMode === "p2p" ? "Other Phone" : "TAPPD Band"}
              </Text>
            </Animated.View>
          </View>

          {/* Controls */}
          <View style={{ width: "100%", gap: 30, alignItems: "center" }}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  tapMode === "p2p" && styles.toggleButtonActive,
                ]}
                onPress={() => setTapMode("p2p")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    tapMode === "p2p" && styles.toggleTextActive,
                  ]}
                >
                  Phone to Phone
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  tapMode === "p2b" && styles.toggleButtonActive,
                ]}
                onPress={() => setTapMode("p2b")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    tapMode === "p2b" && styles.toggleTextActive,
                  ]}
                >
                  Phone to Band
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => changeView("menu")}
            >
              <Text style={styles.backButtonText}>Back to Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connect Instantly</Text>
        <Text style={styles.headerSubtitle}>
          Choose your preferred connection method
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <ConnectionCard
          icon={QrCode}
          title="Show QR Code"
          description="Display your QR code for others to scan"
          gradientIcon
          onPress={() => changeView("qr")}
        />

        <ConnectionCard
          icon={Smartphone} // Using Smartphone as proxy for "Tap" icon (Phone + Watch not std lucide)
          title="Tap to Connect"
          description="Tap phones or TAPPD bands together"
          gradientIcon
          onPress={() => changeView("tap")}
        />

        <ConnectionCard
          icon={Watch}
          title="Register TAPPD Band"
          description="Connect and manage your TAPPD bands"
          gradientIcon
          onPress={() => setShowBandModal(true)}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Hold devices together for 3 seconds
          </Text>
          <Text style={styles.footerSubtext}>
            Works with NFC-enabled devices
          </Text>
        </View>
      </ScrollView>

      {/* Band Registration Modal */}
      <Modal
        visible={showBandModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBandModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                {pairingStep === "initial" ? (
                  <>
                    <Text style={styles.modalTitle}>
                      TAPPD Band Registration
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      Connect your TAPPD band with your phone
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.modalTitle}>Connecting to Band...</Text>
                    <Text style={styles.modalSubtitle}>
                      Keep holding until connection is established
                    </Text>
                  </>
                )}
              </View>
              <TouchableOpacity onPress={() => setShowBandModal(false)}>
                <X size={20} color={Theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {pairingStep === "initial" ? (
                <>
                  <Text style={styles.bodyTitle}>Register TAPPD Band</Text>
                  <Text style={styles.bodySubtitle}>
                    Tap and hold band until it shows up
                  </Text>

                  <View style={styles.pairingVisuals}>
                    <View
                      style={[
                        styles.deviceFrame,
                        { transform: [{ rotate: "-10deg" }], marginRight: -10 },
                      ]}
                    >
                      <Smartphone size={32} color="#fff" />
                      <Text style={styles.smallDeviceLabel}>Your Phone</Text>
                    </View>
                    <View
                      style={[
                        styles.deviceFrameCircular,
                        {
                          transform: [{ rotate: "10deg" }],
                          marginLeft: -10,
                          backgroundColor: "#A855F7",
                        },
                      ]}
                    >
                      <Watch size={32} color="#fff" />
                      <Text style={styles.smallDeviceLabel}>TAPPD Band</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={startPairingString}
                  >
                    <LinearGradient
                      colors={["#be185d", "#831843"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientButton}
                    >
                      <Text style={styles.primaryButtonText}>
                        Start Pairing
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.pairingVisuals}>
                    {/* Connection Line */}
                    <View
                      style={{
                        position: "absolute",
                        width: 120,
                        height: 4,
                        backgroundColor: "rgba(217, 70, 239, 0.3)",
                        borderRadius: 2,
                      }}
                    >
                      {/* Beeping Dot */}
                      <Animated.View
                        style={{
                          position: "absolute",
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: "#D946EF",
                          top: -4,
                          left: "50%",
                          marginLeft: -6,
                          opacity: beepAnim,
                          shadowColor: "#D946EF",
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 10,
                          transform: [
                            {
                              scale: beepAnim.interpolate({
                                inputRange: [0.3, 1],
                                outputRange: [0.8, 1.4],
                              }),
                            },
                          ],
                        }}
                      />
                    </View>
                    <View
                      style={[
                        styles.deviceFrame,
                        { transform: [{ rotate: "-10deg" }], marginRight: 10 },
                      ]}
                    >
                      <Smartphone size={32} color="#fff" />
                      <Text style={styles.smallDeviceLabel}>Your Phone</Text>
                    </View>
                    <View
                      style={[
                        styles.deviceFrameCircular,
                        {
                          transform: [{ rotate: "10deg" }],
                          marginLeft: 10,
                          backgroundColor: "#A855F7",
                        },
                      ]}
                    >
                      <Watch size={32} color="#fff" />
                      <Text style={styles.smallDeviceLabel}>TAPPD Band</Text>
                    </View>
                  </View>
                  <View style={{ marginTop: 20, marginBottom: 20 }}>
                    <Text style={{ color: Theme.colors.mutedForeground }}>
                      Searching for band...
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0A1F", // Deep dark purple consistent with other screens
    paddingTop: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: "#1A1625",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  iconContainer: {
    marginBottom: 16,
  },
  gradientIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  defaultIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(217, 70, 239, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  footerSubtext: {
    fontSize: 12,
    color: "#6B7280",
  },

  // QR View Styles
  qrContainer: {
    width: 280,
    height: 280,
    backgroundColor: "#fff",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  qrImage: {
    width: "100%",
    height: "100%",
  },
  scanButton: {
    alignItems: "center",
    gap: 8,
  },
  scanIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanButtonText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginTop: 16,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },

  // Device Visuals
  deviceContainer: {
    alignItems: "center",
    gap: 8,
  },
  deviceFrame: {
    width: 100,
    height: 160,
    backgroundColor: "#3B384A",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.1)",
  },
  deviceLabel: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },

  // Toggles
  toggleContainer: {
    flexDirection: "row",
    gap: 16,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "transparent",
  },
  toggleButtonActive: {
    backgroundColor: "#D946EF",
    borderColor: "#D946EF",
  },
  toggleText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  toggleTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#0F0A1F",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  modalSubtitle: {
    fontSize: 13,
    color: Theme.colors.mutedForeground,
    marginTop: 2,
  },
  modalBody: {
    padding: 32,
    alignItems: "center",
  },
  bodyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  bodySubtitle: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    textAlign: "center",
    marginBottom: 32,
  },
  pairingVisuals: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    height: 120,
  },
  deviceFrameCircular: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.1)",
  },
  smallDeviceLabel: {
    position: "absolute",
    bottom: -24,
    width: 100,
    textAlign: "center",
    color: Theme.colors.mutedForeground,
    fontSize: 11,
  },
  primaryButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  pulseRing: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: "#D946EF",
    top: "50%",
    left: "50%",
    marginTop: -150,
    marginLeft: -150,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(16, 185, 129, 0.1)", // Green tint
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
    gap: 8,
  },
  inputLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1F1B2E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    height: 56,
  },
  inputText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontWeight: "600",
  },
  inputIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#A855F7",
    alignItems: "center",
    justifyContent: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    width: "100%",
  },
  outlineButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
