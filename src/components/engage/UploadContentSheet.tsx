import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
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

  // ---------- GALLERY ----------
  const openGallery = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // ---------- CAMERA ----------
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // ---------- RESET ----------
  const handleClose = () => {
    setSelectedImage(null);
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
            {selectedImage ? (
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
});
