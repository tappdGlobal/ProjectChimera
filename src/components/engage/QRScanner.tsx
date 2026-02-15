import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { X, Image as ImageIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import BarcodeScanner from "@react-native-ml-kit/barcode-scanning";
import Toast from "react-native-toast-message";
import { useQRStore } from "../../store/qrStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConnectionIntent } from "../../types/qrTypes";
const { width } = Dimensions.get("window");
const scanSize = width * 0.75;

interface QRScannerProps {
  onClose: () => void;
  intent: ConnectionIntent[];
}


export function QRScanner({ onClose,intent  }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const { scanQRAction } = useQRStore();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  // ===============================
  // SEND TOKEN TO BACKEND
  // ===============================
  const processToken = async (token: string) => {
    try {
      setLoading(true);

      await scanQRAction(token, intent);


      Toast.show({
        type: "success",
        text1: "Connection Request Sent",
      });

      onClose(); // close scanner after success
    } catch (error: any) {
      console.log("Scan Error FULL:", error?.response?.data);

      const message =
        error?.response?.data?.error?.message || // 🔥 correct path
        error?.response?.data?.message ||
        error?.message ||
        "Invalid or expired QR";

      Toast.show({
        type: "error",
        text1: message,
      });

      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // CAMERA SCAN
  // ===============================
  const handleScan = ({ data }: { data: string }) => {
    if (scanned || loading) return;

    setScanned(true);

    console.log("Scanned QR:", data);

    processToken(data);
  };

  // ===============================
  // GALLERY SCAN
  // ===============================
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;

      const barcodes = await BarcodeScanner.scan(uri);

      if (barcodes && barcodes.length > 0) {
        const value = barcodes[0].value;

        if (value) {
          processToken(value);
        } else {
          Toast.show({
            type: "error",
            text1: "No QR data found",
          });
        }
      } else {
        Toast.show({
          type: "error",
          text1: "No QR found in image",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error scanning image",
      });
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>
          Camera permission required
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={handleScan}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.topOverlay} />
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanBox} />
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay} />
      </View>

      {/* Loader Overlay */}
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#D946EF" />
        </View>
      )}

      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
      >
        <X size={28} color="#fff" />
      </TouchableOpacity>

      {/* Gallery Button */}
      <TouchableOpacity
        style={styles.galleryButton}
        onPress={pickImage}
      >
        <ImageIcon size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  center: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  topOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  middleRow: { flexDirection: "row", alignItems: "center" },
  sideOverlay: {
    flex: 1,
    height: scanSize,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  scanBox: {
    width: scanSize,
    height: scanSize,
    borderWidth: 2,
    borderColor: "#D946EF",
    borderRadius: 0,
  },

  bottomOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  closeButton: { position: "absolute", top: 50, right: 20 },
  galleryButton: {
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
    backgroundColor: "rgba(217,70,239,0.8)",
    padding: 14,
    borderRadius: 30,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});
