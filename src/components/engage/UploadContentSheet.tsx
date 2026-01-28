import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Upload, Image as ImageIcon, Camera, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";

interface UploadContentSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreateStory?: (uri: string) => void;
  onCreatePost?: (uri: string) => void;
}

export function UploadContentSheet({
  visible,
  onClose,
  onCreateStory,
  onCreatePost,
}: UploadContentSheetProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showWebCamera, setShowWebCamera] = useState(false);

  // ---------- GALLERY ----------
  const openGallery = async () => {
    try {
      console.log("Opening gallery...");
      
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("Media library permission:", permission);
      
      if (!permission.granted) {
        if (Platform.OS === 'web') {
          alert("Please allow access to your media library to upload photos.");
        } else {
          Alert.alert(
            "Permission Required",
            "Please allow access to your media library to upload photos.",
            [{ text: "OK" }]
          );
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false,
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error opening gallery:", error);
      if (Platform.OS === 'web') {
        alert("Failed to open gallery. Please try again.");
      }
    }
  };

  // ---------- CAMERA ----------
  const openCamera = async () => {
    // On web, open webcam capture interface
    if (Platform.OS === 'web') {
      setShowWebCamera(true);
      return;
    }

    // Native camera handling
    try {
      console.log("Opening camera...");
      
      // Check if camera is available
      const cameraAvailable = await ImagePicker.getCameraPermissionsAsync();
      console.log("Camera availability:", cameraAvailable);
      
      // Request camera permission
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      console.log("Camera permission:", permission);
      
      if (!permission.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access in your device settings to take photos.",
          [{ text: "OK" }]
        );
        return;
      }

      console.log("Launching camera...");
      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: false,
      });

      console.log("Camera result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error opening camera:", error);
      Alert.alert(
        "Camera Error",
        "Failed to open camera. Please try again or use Gallery.",
        [{ text: "OK" }]
      );
    }
  };

  // ---------- WEB CAMERA CAPTURE ----------
  const captureWebPhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });
      
      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      // Stop camera stream
      stream.getTracks().forEach(track => track.stop());
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setSelectedImage(dataUrl);
      setShowWebCamera(false);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Failed to access webcam. Please check your browser permissions or use Gallery instead.');
      setShowWebCamera(false);
    }
  };

  // ---------- RESET ----------
  const handleClose = () => {
    setSelectedImage(null);
    setShowWebCamera(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={["#0b0620", "#12082d"]}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {selectedImage ? "Choose Type" : "Upload Content"}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={20} color={Theme.colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* CONTENT */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {showWebCamera ? (
              // Web Camera Capture UI
              <View style={styles.webCameraContainer}>
                <Text style={styles.webCameraTitle}>Camera Access</Text>
                <Text style={styles.webCameraText}>
                  Click "Take Photo" to capture a photo using your webcam.
                  Your browser will ask for camera permission.
                </Text>
                <View style={styles.webCameraButtons}>
                  <TouchableOpacity
                    style={styles.webCameraButton}
                    onPress={captureWebPhoto}
                  >
                    <Camera size={18} color={Theme.colors.foreground} />
                    <Text style={styles.webCameraButtonText}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.webCameraButton, styles.webCameraCancel]}
                    onPress={() => setShowWebCamera(false)}
                  >
                    <Text style={styles.webCameraButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : selectedImage ? (
              <>
                {/* Image Preview */}
                <View style={styles.previewContainer}>
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.previewImage}
                  />
                </View>

                {/* Buttons */}
                <View style={styles.typeRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => onCreateStory?.(selectedImage)}
                    style={styles.typeButtonWrapper}
                  >
                    <LinearGradient
                      colors={GRADIENT_COLORS.primary as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.typeButtonGradient}
                    >
                      <Text style={styles.typeText}>Create Story</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => onCreatePost?.(selectedImage)}
                    style={styles.typeButtonWrapper}
                  >
                    <LinearGradient
                      colors={GRADIENT_COLORS.primary as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.typeButtonGradient}
                    >
                      <Text style={styles.typeText}>Create Post</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* Upload Box */}
                <View style={styles.uploadBox}>
                  <Upload size={36} color={Theme.colors.mutedForeground} />
                  <Text style={styles.uploadText}>
                    Click to upload a photo
                  </Text>
                  <Text style={styles.uploadSubText}>
                    or use camera
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={openGallery}
                  >
                    <ImageIcon
                      size={18}
                      color={Theme.colors.foreground}
                    />
                    <Text style={styles.actionText}>Gallery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={openCamera}
                  >
                    <Camera size={18} color={Theme.colors.foreground} />
                    <Text style={styles.actionText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    width: "90%",
    maxHeight: "85%", // ✅ IMPORTANT
    borderRadius: 16,
    padding: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  title: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "600",
  },

  scrollContent: {
    paddingBottom: 16,
  },

  previewContainer: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Theme.colors.muted,
  },

  previewImage: {
    width: "100%",
    height: 260,
    resizeMode: "cover", // ✅ FIX
  },

  typeRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },

  typeButtonWrapper: {
    flex: 1,
    borderRadius: Theme.radius.lg,
    overflow: "hidden",
  },

  typeButtonGradient: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.radius.lg,
  },

  typeText: {
    color: Theme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: "600",
  },

  uploadBox: {
    marginTop: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 12,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },

  uploadText: {
    color: Theme.colors.foreground,
    fontSize: 14,
    marginTop: 10,
    fontWeight: "500",
  },

  uploadSubText: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
    marginTop: 4,
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },

  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  actionText: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "500",
  },

  webCameraContainer: {
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: Theme.colors.muted,
    alignItems: "center",
  },

  webCameraTitle: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },

  webCameraText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },

  webCameraButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  webCameraButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  webCameraCancel: {
    borderColor: "rgba(255,100,100,0.3)",
    backgroundColor: "rgba(255,100,100,0.1)",
  },

  webCameraButtonText: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "500",
  },
});
