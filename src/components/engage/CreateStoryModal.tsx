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
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X, Send } from "lucide-react-native";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";
import { useStoryStore } from "../../store/storyStore";
import Toast from "react-native-toast-message";

interface CreateStoryModalProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateStoryModal({
  visible,
  imageUri,
  onClose,
  onSuccess,
}: CreateStoryModalProps) {
  const [caption, setCaption] = useState("");
  const { createStory, loading } = useStoryStore();

  if (!imageUri) return null;

  const handlePublish = async () => {
    try {
      console.log("Publishing story with image:", imageUri);
      
      // Extract filename from URI
      const filename = imageUri.split('/').pop() || 'story.jpg';
      const match = /\.([\w]+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      await createStory({
        caption: caption || undefined,
        media: {
          uri: imageUri,
          name: filename,
          type: type,
        },
      });

      console.log("Story created successfully");
      
      Toast.show({
        type: "success",
        text1: "Story Published",
        text2: "Your story is now live!",
      });
      
      setCaption("");
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to create story:", error);
      
      Toast.show({
        type: "error",
        text1: "Failed to Publish Story",
        text2: error.message || "Please try again",
      });
    }
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
              disabled={loading}
            >
              <LinearGradient
                colors={GRADIENT_COLORS.primary as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.publishButton}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Theme.colors.primaryForeground} />
                ) : (
                  <>
                    <Send size={16} color={Theme.colors.primaryForeground} />
                    <Text style={styles.publishText}>Publish Story</Text>
                  </>
                )}
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
