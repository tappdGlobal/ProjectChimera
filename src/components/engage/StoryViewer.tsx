import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
} from "react-native";
import { X, MoreHorizontal, Pause, Play } from "lucide-react-native";

const { width } = Dimensions.get("window");
const STORY_DURATION = 5000;

interface Story {
  id: string;
  username: string;
  profileImage: string;
  image: string;
  caption?: string;
  time: string;
}

interface Props {
  visible: boolean;
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
}

export default function StoryViewer({
  visible,
  stories,
  initialIndex = 0,
  onClose,
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);

  const progress = useRef<Animated.Value[]>([]);
  const animation = useRef<Animated.CompositeAnimation | null>(null);
  const remainingTime = useRef(STORY_DURATION);

  /* INIT progress bars */
  useEffect(() => {
    progress.current = stories.map(() => new Animated.Value(0));
  }, [stories]);

  /* RESET when opened or user clicked another story */
  useEffect(() => {
    if (!visible) return;

    animation.current?.stop();
    remainingTime.current = STORY_DURATION;

    progress.current.forEach(p => p.setValue(0));
    setIndex(initialIndex);
    setPaused(false);
  }, [visible, initialIndex]);

  /* START animation on index change */
  useEffect(() => {
    if (!visible || paused) return;
    start();
    return () => animation.current?.stop();
  }, [index, paused, visible]);

  const start = () => {
    animation.current?.stop();

    animation.current = Animated.timing(progress.current[index], {
      toValue: 1,
      duration: remainingTime.current,
      useNativeDriver: false,
    });

    animation.current.start(({ finished }) => {
      if (finished) goNext();
    });
  };

  const pause = () => {
    animation.current?.stop();
    progress.current[index].stopAnimation(v => {
      remainingTime.current = STORY_DURATION * (1 - v);
    });
    setPaused(true);
  };

  const resume = () => {
    setPaused(false);
  };

  const goNext = () => {
    remainingTime.current = STORY_DURATION;

    if (index < stories.length - 1) {
      setIndex(prev => prev + 1);
    } else {
      onClose(); // end of THIS USER stories
    }
  };

  const goPrev = () => {
    if (index === 0) return;

    remainingTime.current = STORY_DURATION;
    progress.current[index].setValue(0);
    setIndex(prev => prev - 1);
  };

  const handleTap = (e: any) => {
    e.nativeEvent.locationX < width / 2 ? goPrev() : goNext();
  };

  if (!stories.length) return null;
  const story = stories[index];

  return (
    <Modal visible={visible} animationType="fade">
      <SafeAreaView style={styles.container}>
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
                <Play size={22} color="white" />
              ) : (
                <Pause size={22} color="white" />
              )}
            </TouchableOpacity>

            <TouchableOpacity>
              <MoreHorizontal size={22} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose}>
              <X size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Story */}
        <Pressable style={{ flex: 1 }} onPress={handleTap}>
          <Image source={{ uri: story.image }} style={styles.image} />
        </Pressable>

        {/* Caption */}
        {story.caption && (
          <View style={styles.captionWrap}>
            <Text style={styles.caption}>{story.caption}</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },

  progress: {
    flexDirection: "row",
    position: "absolute",
    top: 8,
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
    top: 24,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  user: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  username: { color: "white", fontWeight: "600" },
  time: { color: "rgba(255,255,255,0.7)", fontSize: 12 },

  actions: { flexDirection: "row", gap: 16 },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  captionWrap: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
  },
  caption: { color: "white", fontSize: 16 },
});
