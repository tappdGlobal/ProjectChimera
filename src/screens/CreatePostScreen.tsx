import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X, Send, Music, Smile } from "lucide-react-native";
import { Theme, GRADIENT_COLORS } from "../styles/Theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/Routes";
import { usePostStore } from "../store/postStore";
import Toast from "react-native-toast-message";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface RouteParams {
  imageUri: string;
}

export default function CreatePostScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { imageUri } = route.params as RouteParams;
  const { createPost, loading } = usePostStore();

  const [caption, setCaption] = useState("");
  const [music, setMusic] = useState("");

  const handlePublish = async () => {
    try {
      console.log("Publishing post with:", { imageUri, caption, music });

      // Extract filename and type from URI
      const filename = imageUri.split('/').pop() || 'post.jpg';
      const match = /\.([\w]+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Create post payload
      const postData = {
        caption: caption || undefined,
        allowComments: true,
        isCarousel: false,
        media: [{
          uri: imageUri,
          name: filename,
          type: type,
        }],
      };

      await createPost(postData);

      Toast.show({
        type: "success",
        text1: "Post Published",
        text2: "Your post is now live!",
      });

      navigation.goBack();
    } catch (error: any) {
      console.error("Failed to create post:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Publish Post",
        text2: error.message || "Please try again",
      });
    }
  };

  const handleAddMusic = () => {
    // TODO: Open music picker when API is provided
    Toast.show({
      type: "info",
      text1: "Coming Soon",
      text2: "Music selection will be available soon!",
    });
  };

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.overlay}>
        <LinearGradient
          colors={["#0b0620", "#12082d"]}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Post</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <X size={24} color={Theme.colors.mutedForeground} />
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
                placeholder="Write a caption..."
                placeholderTextColor={Theme.colors.mutedForeground}
                value={caption}
                onChangeText={setCaption}
                style={styles.captionInput}
                multiline
                maxLength={500}
              />
              <TouchableOpacity style={styles.emojiButton}>
                <Smile size={24} color={Theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Add Music Button */}
            <TouchableOpacity
              style={styles.musicButton}
              onPress={handleAddMusic}
              activeOpacity={0.8}
            >
              <View style={styles.musicIconContainer}>
                <Music size={20} color={Theme.colors.foreground} />
              </View>
              <Text style={styles.musicButtonText}>
                {music ? music : "Add Music"}
              </Text>
            </TouchableOpacity>

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
                    <Send size={18} color={Theme.colors.primaryForeground} />
                    <Text style={styles.publishText}>Publish Post</Text>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#0b0620",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  title: {
    color: Theme.colors.foreground,
    fontSize: 20,
    fontWeight: "600",
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: Theme.colors.muted,
  },
  image: {
    width: "100%",
    height: 380,
    resizeMode: "cover",
  },
  captionWrapper: {
    marginBottom: 16,
    position: "relative",
  },
  captionInput: {
    minHeight: 80,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 50,
    color: Theme.colors.foreground,
    backgroundColor: "rgba(255,255,255,0.05)",
    fontSize: 16,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  emojiButton: {
    position: "absolute",
    right: 12,
    bottom: 12,
    padding: 4,
  },
  musicButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  musicIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  musicButtonText: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "500",
  },
  publishWrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
  publishButton: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 12,
  },
  publishText: {
    color: Theme.colors.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },
});
