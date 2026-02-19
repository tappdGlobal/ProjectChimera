import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Video, ResizeMode } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { X, MoreHorizontal, Pause, Play, Heart, Send, Smile, Trash2 } from "lucide-react-native";
import { Theme } from "../../styles/Theme";

const { width } = Dimensions.get("window");
const IMAGE_DURATION = 5000;

interface Story {
  id: string;
  username: string;
  profileImage: string;
  image: string;
  mediaType?: 'image' | 'video';
  caption?: string;
  time: string;
  userId?: string;
}

interface Props {
  visible: boolean;
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
  currentUserId?: string;
  onDelete?: (storyId: string) => void;
  onView?: (storyId: string) => void;
}

export default function StoryViewer({
  visible,
  stories,
  initialIndex = 0,
  onClose,
  currentUserId,
  onDelete,
  onView,
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [liked, setLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const progress = useRef<Animated.Value[]>([]);
  const animation = useRef<Animated.CompositeAnimation | null>(null);
  const remainingTime = useRef(IMAGE_DURATION);
  const videoRef = useRef<Video>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  useEffect(() => {
    progress.current = stories.map(() => new Animated.Value(0));
  }, [stories]);

  useEffect(() => {
    if (!visible) return;

    animation.current?.stop();
    remainingTime.current = IMAGE_DURATION;

    progress.current.forEach(p => p.setValue(0));
    setIndex(initialIndex);
    setPaused(false);
    setShowMenu(false);
    setLoading(true);
    setError(false);
    setIsVideo(false);
    setVideoDuration(0);
    
    if (stories[initialIndex] && onView) {
      onView(stories[initialIndex].id);
    }
  }, [visible, initialIndex]);

  // Detect media type when story changes
  useEffect(() => {
    if (!stories[index]) return;
    
    const story = stories[index];
    // Check if mediaType is explicitly set
    if (story.mediaType) {
      setIsVideo(story.mediaType === 'video');
    } else {
      // Detect based on file extension
      const url = story.image.toLowerCase();
      const isVideoFile = /\.(mp4|mov|avi|mkv|webm|m4v|3gp)$/i.test(url);
      setIsVideo(isVideoFile);
    }
  }, [index, stories]);

  useEffect(() => {
    if (!visible || paused) return;
    if (!progress.current[index]) return;
    // Only auto-start for images - videos start themselves via onLoad
    if (!isVideo) {
      start();
    }
    return () => animation.current?.stop();
  }, [index, paused, visible, isVideo]);

  const start = (duration?: number) => {
    animation.current?.stop();

    if (!progress.current[index]) return;

    // Use provided duration (for videos) or default image duration
    const animDuration = duration || IMAGE_DURATION;
    remainingTime.current = animDuration;

    // Reset progress for current story to 0 before starting
    progress.current[index].setValue(0);

    const currentIndex = index; // Capture current index for the callback

    animation.current = Animated.timing(progress.current[index], {
      toValue: 1,
      duration: animDuration,
      useNativeDriver: false,
    });

    animation.current.start(({ finished }) => {
      if (finished) {
        // Use setTimeout to ensure we're not in the animation callback context
        setTimeout(() => goNextFromIndex(currentIndex), 0);
      }
    });
  };

  const pause = () => {
    animation.current?.stop();
    if (progress.current[index]) {
      progress.current[index].stopAnimation(v => {
        const currentDuration = isVideo && videoDuration > 0 ? videoDuration : IMAGE_DURATION;
        remainingTime.current = currentDuration * (1 - v);
      });
    }
    // Pause video if playing
    if (isVideo && videoRef.current) {
      videoRef.current.pauseAsync();
    }
    setPaused(true);
  };

  const resume = () => {
    // Resume video if paused
    if (isVideo && videoRef.current) {
      videoRef.current.playAsync();
    }
    setPaused(false);
  };

  const goNextFromIndex = (currentIdx: number) => {
    // Mark current story as complete
    if (progress.current[currentIdx]) {
      progress.current[currentIdx].setValue(1);
    }
    
    setLoading(true);
    setError(false);

    if (currentIdx < stories.length - 1) {
      const nextIndex = currentIdx + 1;
      setIndex(nextIndex);
      // Mark next story as viewed
      if (stories[nextIndex] && onView) {
        onView(stories[nextIndex].id);
      }
    } else {
      onClose();
    }
  };

  const goNext = () => {
    goNextFromIndex(index);
  };

  const goPrev = () => {
    if (index === 0) return;

    setLoading(true);
    setError(false);
    // Reset current story progress
    if (progress.current[index]) {
      progress.current[index].setValue(0);
    }
    setIndex(prev => prev - 1);
  };

  const handleTap = (e: any) => {
    e.nativeEvent.locationX < width / 2 ? goPrev() : goNext();
  };

  const handleDelete = () => {
    const story = stories[index];
    Alert.alert(
      "Delete Story",
      "Are you sure you want to delete this story?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setShowMenu(false),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (onDelete) {
              onDelete(story.id);
            }
            setShowMenu(false);
            onClose();
          },
        },
      ]
    );
  };

  if (!stories.length || index >= stories.length) return null;
  const story = stories[index];
  if (!story) return null;
  const isOwner = currentUserId && story.userId === currentUserId;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.container}>
        {/* Progress */}
        <View style={styles.progress}>
          {stories.map((_, i) => (
            <View key={i} style={styles.progressBg}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    flex:
                      i < index
                        ? 1
                        : i === index
                        ? progress.current[i]
                        : 0,
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.user}>
            <Image source={{ uri: story.profileImage }} style={styles.avatar} />
            <View>
              <Text style={styles.username}>{story.username}</Text>
              <Text style={styles.time}>{story.time}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={paused ? resume : pause}>
              {paused ? (
                <Play size={20} color="white" />
              ) : (
                <Pause size={20} color="white" />
              )}
            </TouchableOpacity>

            <View>
              <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
                <MoreHorizontal size={20} color="white" />
              </TouchableOpacity>
              
              {showMenu && isOwner && (
                <View style={styles.menuDropdown}>
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={handleDelete}
                  >
                    <Trash2 size={18} color="#ff3040" />
                    <Text style={styles.menuItemText}>Delete Story</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={onClose}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Story Content */}
        <View style={styles.storyContent}>
          <Pressable style={styles.leftTapArea} onPress={goPrev} />
          
          <View style={styles.imageContainer}>
            {isVideo ? (
              <Video
                ref={videoRef}
                source={{ uri: story.image }}
                style={styles.image}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={!paused}
                isLooping={false}
                onLoadStart={() => setLoading(true)}
                onLoad={(status) => {
                  setLoading(false);
                  if (status.isLoaded && status.durationMillis) {
                    setVideoDuration(status.durationMillis);
                    // Start progress animation with video duration
                    start(status.durationMillis);
                  }
                }}
                onPlaybackStatusUpdate={(status) => {
                  if (status.isLoaded && status.didJustFinish) {
                    goNext();
                  }
                }}
                onError={() => {
                  setLoading(false);
                  setError(true);
                }}
              />
            ) : (
              <Image
                source={{ uri: story.image }}
                style={styles.image}
                contentFit="contain"
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError(true);
                }}
              />
            )}
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="white" />
              </View>
            )}
            {error && (
              <View style={styles.errorOverlay}>
                <Text style={styles.errorText}>Failed to load media</Text>
              </View>
            )}
          </View>
          
          <Pressable style={styles.rightTapArea} onPress={goNext} />
        </View>

        {/* Caption */}
        {story.caption && (
          <View style={styles.captionWrap}>
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.6)"]}
              style={styles.captionGradient}
            >
              <Text style={styles.caption}>{story.caption}</Text>
            </LinearGradient>
          </View>
        )}

        {/* Reply Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.replyContainer}
        >
          <View style={styles.replyWrapper}>
            <TextInput
              style={styles.replyInput}
              placeholder={`Reply to ${story.username}...`}
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={replyText}
              onChangeText={setReplyText}
              onFocus={pause}
              onBlur={resume}
            />
            <TouchableOpacity style={styles.replyIcon}>
              <Smile size={22} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton}>
              <Send size={18} color="white" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.likeButton} 
            onPress={() => setLiked(!liked)}
          >
            <Heart 
              size={26} 
              color={liked ? "#ff3040" : "white"} 
              fill={liked ? "#ff3040" : "transparent"}
            />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "black",
  },

  progress: {
    flexDirection: "row",
    position: "absolute",
    top: 44,
    left: 8,
    right: 8,
    height: 3,
    zIndex: 10,
  },
  progressBg: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 2,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: "white",
    height: "100%",
  },

  header: {
    position: "absolute",
    top: 56,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  user: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  username: { color: "white", fontWeight: "600", fontSize: 14 },
  time: { color: "rgba(255,255,255,0.7)", fontSize: 12 },

  actions: { flexDirection: "row", gap: 16, alignItems: "center" },

  storyContent: {
    flex: 1,
    position: "relative",
  },

  leftTapArea: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "30%",
    zIndex: 5,
  },

  rightTapArea: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "30%",
    zIndex: 5,
  },

  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  errorText: {
    color: "white",
    fontSize: 16,
  },

  captionWrap: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
  },

  captionGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
  },

  caption: { 
    color: "white", 
    fontSize: 16,
    fontWeight: "500",
  },

  replyContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    paddingTop: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  replyWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 44,
  },

  replyInput: {
    flex: 1,
    color: "white",
    fontSize: 14,
    paddingVertical: 8,
  },

  replyIcon: {
    padding: 4,
    marginRight: 4,
  },

  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  likeButton: {
    marginLeft: 12,
    padding: 4,
  },

  menuDropdown: {
    position: "absolute",
    top: 35,
    right: 0,
    backgroundColor: "rgba(28, 28, 30, 0.95)",
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },

  menuItemText: {
    color: "#ff3040",
    fontSize: 15,
    fontWeight: "600",
  },
});
