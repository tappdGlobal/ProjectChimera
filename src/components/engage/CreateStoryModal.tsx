import React, { useState, useEffect } from "react";
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
  mediaUri: string | null;
  mediaType?: 'image' | 'video';
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateStoryModal({
  visible,
  mediaUri,
  mediaType = 'image',
  onClose,
  onSuccess,
}: CreateStoryModalProps) {
  const [caption, setCaption] = useState("");
  const { createStory, loading } = useStoryStore();

  // Reset caption when modal opens
  useEffect(() => {
    if (visible) {
      setCaption("");
    }
  }, [visible]);

  if (!mediaUri) return null;

  const handlePublish = async () => {
    try {
      console.log("Publishing story with media:", mediaUri, "type:", mediaType);
      
      if (!mediaUri) {
        throw new Error("No media selected");
      }
      
      // Extract filename from URI
      const filename = mediaUri.split('/').pop() || (mediaType === 'video' ? 'story.mp4' : 'story.jpg');
      const match = /\.([\w]+)$/.exec(filename);
      const extension = match ? match[1].toLowerCase() : (mediaType === 'video' ? 'mp4' : 'jpg');
      
      // Determine MIME type based on media type and extension
      let mimeType: string;
      if (mediaType === 'video') {
        const videoMimeTypes: Record<string, string> = {
          mp4: 'video/mp4',
          mov: 'video/quicktime',
          avi: 'video/x-msvideo',
          mkv: 'video/x-matroska',
          webm: 'video/webm',
          m4v: 'video/x-m4v',
          '3gp': 'video/3gpp',
        };
        mimeType = videoMimeTypes[extension] || 'video/mp4';
      } else {
        const imageMimeTypes: Record<string, string> = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif',
          webp: 'image/webp',
        };
        mimeType = imageMimeTypes[extension] || 'image/jpeg';
      }
      
      console.log("Story payload:", {
        caption: caption || undefined,
        mediaType,
        media: {
          uri: mediaUri,
          name: filename,
          type: mimeType,
        },
      });

      await createStory({
        caption: caption || undefined,
        media: {
          uri: mediaUri,
          name: filename,
          type: mimeType,
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
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
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
            {/* Media Preview */}
            <View style={styles.imageWrapper}>
              <Image source={{ uri: mediaUri }} style={styles.image} />
              {mediaType === 'video' && (
                <View style={styles.videoOverlay}>
                  <Text style={styles.videoText}>VIDEO</Text>
                </View>
              )}
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

  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  videoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
