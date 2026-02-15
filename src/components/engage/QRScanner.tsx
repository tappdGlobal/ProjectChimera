import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { X, Image as ImageIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import BarcodeScanner from "@react-native-ml-kit/barcode-scanning";

const { width } = Dimensions.get("window");
const scanSize = width * 0.75;

interface QRScannerProps {
  onClose: () => void;
}

export function QRScanner({ onClose }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  // ✅ LIVE CAMERA SCAN
  const handleScan = ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);

    console.log("Scanned QR (Camera):", data);

    Alert.alert("QR Scanned", String(data));

    setTimeout(() => {
      setScanned(false);
    }, 2000);
  };

  // ✅ GALLERY SCAN USING ML KIT
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;

      console.log("Scanning image:", uri);

      const barcodes = await BarcodeScanner.scan(uri);

      console.log("MLKit result:", barcodes);

      if (barcodes && barcodes.length > 0) {
        const value = barcodes[0].value; // ✅ FIXED

        Alert.alert("QR Scanned", value || "No Data");
      } else {
        Alert.alert("No QR found in image");
      }
    } catch (error: any) {
      console.log("Gallery Scan Error FULL:", error);
      Alert.alert("Error scanning image", error?.message ?? "Unknown error");
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
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
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
  topOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
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
    borderRadius: 16,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
  },
  galleryButton: {
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
    backgroundColor: "rgba(217,70,239,0.8)",
    padding: 14,
    borderRadius: 30,
  },
});
