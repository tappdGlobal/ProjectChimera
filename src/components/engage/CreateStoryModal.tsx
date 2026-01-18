import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X, Send } from "lucide-react-native";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";

interface CreateStoryModalProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
  onPublish: (story: {
    id: string;
    name: string;
    image: string;
    isUser: boolean;
    caption?: string;
  }) => void;
}

export function CreateStoryModal({
  visible,
  imageUri,
  onClose,
  onPublish,
}: CreateStoryModalProps) {
  const [caption, setCaption] = useState("");

  if (!imageUri) return null;

  const handlePublish = () => {
    onPublish({
      id: Date.now().toString(),
      name: "Your Story",
      image: imageUri,
      isUser: true,
      caption,
    });
    setCaption("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <LinearGradient
          colors={["#0b0620", "#12082d"]}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Story</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={Theme.colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Image Preview */}
            <View style={styles.imageWrapper}>
              <Image source={{ uri: imageUri }} style={styles.image} />
            </View>

            {/* Caption Input */}
            <View style={styles.captionWrapper}>
              <TextInput
                placeholder="Add a caption (optional)..."
                placeholderTextColor={Theme.colors.mutedForeground}
                value={caption}
                onChangeText={setCaption}
                style={styles.input}
                multiline
              />
            </View>

            {/* Publish Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handlePublish}
              style={styles.publishWrapper}
            >
              <LinearGradient
                colors={GRADIENT_COLORS.primary as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.publishButton}
              >
                <Send size={16} color={Theme.colors.primaryForeground} />
                <Text style={styles.publishText}>Publish Story</Text>
              </LinearGradient>
            </TouchableOpacity>
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
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "90%",
    maxHeight: "85%",
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.m,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: Theme.spacing.s,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },

  title: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "600",
  },

  scrollContent: {
    paddingTop: Theme.spacing.m,
    paddingBottom: Theme.spacing.l,
  },

  imageWrapper: {
    borderRadius: Theme.radius.lg,
    overflow: "hidden",
    marginBottom: Theme.spacing.m,
    backgroundColor: Theme.colors.muted,
  },

  image: {
    width: "100%",
    height: 320,
    resizeMode: "cover",
  },

  captionWrapper: {
    marginBottom: Theme.spacing.m,
  },

  input: {
    minHeight: 48,
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.s,
    color: Theme.colors.foreground,
    backgroundColor: Theme.colors.inputBackground,
    fontSize: 14,
  },

  publishWrapper: {
    borderRadius: Theme.radius.lg,
    overflow: "hidden",
  },

  publishButton: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: Theme.radius.lg,
  },

  publishText: {
    color: Theme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: "600",
  },
});
