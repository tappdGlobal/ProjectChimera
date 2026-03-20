import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useRef } from "react";
import ComingSoon from "../common/ComingSoon";
import { Image } from "react-native";
import { useState } from "react";
interface Props {
  booking: any;
  onClose: () => void;
}

export function TicketDetailModal({ booking, onClose }: Props) {
  const { event, ticket } = booking;
  console.log(ticket)
  const ticketRef = useRef<any>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const downloadTicket = async () => {
    try {
      if (!ticketRef.current) return;

      const uri = await ticketRef.current.capture();

      if (Platform.OS === "ios") {
        // iOS: Use share sheet to allow user to save to photos or share
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Save Ticket",
            UTI: "public.png",
          });
        } else {
          Alert.alert("Error", "Sharing is not available on this device");
        }
      } else {
        // Android: Use StorageAccessFramework to save to Downloads
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!permissions.granted) {
          Alert.alert("Permission Required", "Permission required to save file");
          return;
        }

        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const fileName = `ticket_${booking.id}.png`;

        const newFileUri =
          await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            "image/png"
          );

        await FileSystem.writeAsStringAsync(newFileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert("Success", "Ticket downloaded successfully!");
      }
    } catch (error) {
      console.log("Ticket download failed:", error);
      Alert.alert("Error", "Failed to download ticket. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.overlay} edges={["bottom"]}>
      <View style={styles.sheet}>
        {/* ❌ CLOSE BUTTON (ALWAYS VISIBLE) */}
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
          <Ionicons name="close" size={26} color={Theme.colors.foreground} />
        </Pressable>

        {/* ✅ SCROLLABLE CONTENT */}
        <View style={styles.content}>
          <ViewShot ref={ticketRef} options={{ format: "png", quality: 1 }}>

            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Your Ticket</Text>

              <Image
                source={require("../../../assets/tappdLogo.png")}
                style={styles.logo}
              />
            </View>

            <Text style={styles.subtitle}>
              Show this QR code at the venue entrance
            </Text>

            {/* QR */}
            <View style={{ alignItems: "center", marginTop: Theme.spacing.l }}>
              {booking?.qrCode ? (
                <LinearGradient
                  colors={GRADIENT_COLORS.primary as [string, string]}
                  style={styles.qrGradientBorder}
                >
                  <View style={styles.qrInner}>
                    <QRCode
                      value={booking.qrCode}
                      size={240}
                      backgroundColor="#ffffff"
                      color="#000000"
                      ecl="H"
                      quietZone={0}
                    />
                  </View>
                </LinearGradient>
              ) : (
                <Text style={{ color: "#000" }}>QR not available</Text>
              )}
            </View>

            {/* INFO CARD */}
            <View style={styles.infoCard}>
              <Text style={styles.eventTitle}>{event.eventName}</Text>

              <InfoRow
                label="Date:"
                value={new Date(event.eventDate).toLocaleDateString()}
              />
              <InfoRow label="Time:" value={event.eventTime} />
              <InfoRow label="Ticket Description:" value={ticket.ticketType} />
              <InfoRow label="Ticket Type:" value={ticket.ticketLabel} />
            </View>

          </ViewShot>



          {/* DOWNLOAD */}
          <Pressable onPress={downloadTicket}>
            <LinearGradient
              colors={GRADIENT_COLORS.primary as [string, string]}
              style={styles.downloadBtn}
            >
              <Text style={styles.downloadText}>Download Ticket</Text>
            </LinearGradient>
          </Pressable>

          {/* UBER */}
          <View style={styles.rideCard}>
            <View style={styles.rideHeader}>
              <View style={styles.rideIcon}>
                <Ionicons name="car-outline" size={20} color="#000" />
              </View>

              <View>
                <Text style={styles.rideTitle}>Need a ride?</Text>
                <Text style={styles.rideSubtitle}>
                  Book an Uber to the venue
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.uberButton}
              onPress={() => setShowComingSoon(true)}
            >
              <Ionicons name="car-outline" size={18} color="#000" />
              <Text style={styles.uberText}>Book Uber</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <ComingSoon
        visible={showComingSoon}
        onClose={() => setShowComingSoon(false)}
      />
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}



const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  sheet: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    position: "relative",
  },

  closeBtn: {
    position: "absolute",
    top: 40,
    right: 16,
    zIndex: 100,
    elevation: 10,   // 🔥 important for Android touch
    padding: 8,
  },
  content: {
    padding: Theme.spacing.l,
    paddingTop: 80,   // increase space from X button
    flexGrow: 1,
  },

  headerTitle: {
    color: Theme.colors.foreground,
    fontSize: 20,
    fontWeight: "600",
  },

  subtitle: {
    marginTop: 6,
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },

  qrCard: {
    marginTop: Theme.spacing.l,
    backgroundColor: "#fff",
    borderRadius: Theme.radius.lg,
    padding: 12, // small padding only
    alignItems: "center",
  },

  qrBox: {
    borderRadius: 12,
    borderWidth: 3,
    borderColor: Theme.colors.primary,
    padding: 4,          // very small padding
    alignSelf: "center",
    marginTop: Theme.spacing.l,
  },

  code: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  infoCard: {
    marginTop: Theme.spacing.l,
    padding: Theme.spacing.l,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  eventTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Theme.spacing.m,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: {
    color: Theme.colors.mutedForeground,
    fontSize: 15,
  },

  value: {
    color: Theme.colors.foreground,
    fontSize: 15,
  },

  downloadBtn: {
    marginTop: Theme.spacing.l,
    paddingVertical: 16,
    borderRadius: Theme.radius.lg,
    alignItems: "center",
  },

  downloadText: {
    color: Theme.colors.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },

  rideCard: {
    marginTop: Theme.spacing.l,
    marginBottom: Theme.spacing.xl,
    padding: Theme.spacing.l,
    backgroundColor: "#0b0b0b",
    borderRadius: Theme.radius.lg,
  },

  rideHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.m,
  },

  rideIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.m,
  },

  rideTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  rideSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 2,
  },

  uberButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: Theme.radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  uberText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  qrBorder: {
    borderWidth: 3,
    borderColor: Theme.colors.primary,
    padding: 2, // very small so border hugs QR
    borderRadius: 6,
  },
  qrGradientBorder: {
    padding: 4,        // thickness of gradient border
    borderRadius: 14,
  },

  qrInner: {
    backgroundColor: "#ffffff",
    padding: 2,
    borderRadius: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    width: 80,
    height: 28,
    resizeMode: "contain",
  },
});
