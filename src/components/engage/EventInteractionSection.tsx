import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Share,
  Modal,
  SafeAreaView,
} from "react-native";
import { Theme } from "../../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import {
  Plus,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Music,
  ChevronLeft,
  Upload,
} from "lucide-react-native";
import StoryViewer from "./StoryViewer";
import { UploadContentSheet } from "./UploadContentSheet";
import { CreateStoryModal } from "./CreateStoryModal";

/* ---------------- MOCK DATA ---------------- */

const DEFAULT_AVATAR =
  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

const STORIES = [
  { id: "new", name: "Add Story", isUser: true, image: DEFAULT_AVATAR },
  { id: "1", name: "Emma", image: "https://i.pravatar.cc/150?u=emma" },
  { id: "2", name: "Michael", image: "https://i.pravatar.cc/150?u=michael" },
  { id: "3", name: "Sarah", image: "https://i.pravatar.cc/150?u=sarah" },
];

const POSTS = [
  {
    id: "1",
    user: { name: "Emma Johnson", avatar: "https://i.pravatar.cc/150?u=emma" },
    time: "2h ago",
    media: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
    likes: 127,
    caption: "Amazing jazz performance tonight! 🎷✨",
    comments: [
      { username: "Michael", text: "Wow, looks amazing!", time: "1h" },
      { username: "Sarah", text: "I wish I was there 🎷", time: "45m" },
    ],
    music: "Smooth Operator - Sade",
  },
  {
    id: "2",
    user: {
      name: "Michael Smith",
      avatar: "https://i.pravatar.cc/150?u=michael",
    },
    time: "4h ago",
    media: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec",
    likes: 89,
    caption: "Great vibes at the rooftop party! 🍹🌇",
    comments: [{ username: "Emma", text: "Looks fun!", time: "30m" }],
    music: "Summer - Calvin Harris",
  },
];

/* ---------------- STORY ITEM ---------------- */

const StoryItem = ({ item, onPress }) => (
  <View style={styles.storyItem}>
    {item.isUser ? (
      <TouchableOpacity style={styles.addStoryContainer} onPress={onPress}>
        <Plus size={24} color={Theme.colors.foreground} />
      </TouchableOpacity>
    ) : (
      <TouchableOpacity onPress={onPress}>
        <LinearGradient
          colors={["#c451c9", "#740182"]}
          style={styles.storyGradient}
        >
          <Image source={{ uri: item.image }} style={styles.storyImage} />
        </LinearGradient>
      </TouchableOpacity>
    )}
    <Text style={styles.storyName}>{item.name}</Text>
  </View>
);

/* ---------------- FEED POST ---------------- */

const FeedPost = ({ item }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(item.likes);

  const [comments, setComments] = useState(
    item.comments.map((c, i) => ({
      ...c,
      id: i.toString(),
      liked: false,
      likeCount: 0,
    })),
  );
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${item.user.name}: ${item.caption}`,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const [commentText, setCommentText] = useState("");
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showInlineComments, setShowInlineComments] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikes((p) => (liked ? p - 1 : p + 1));
  };

  const toggleCommentLike = (id) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              liked: !c.liked,
              likeCount: c.liked ? c.likeCount - 1 : c.likeCount + 1,
            }
          : c,
      ),
    );
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    setComments((p) => [
      ...p,
      {
        id: Date.now().toString(),
        username: "You",
        text: commentText,
        time: "now",
        liked: false,
        likeCount: 0,
      },
    ]);
    setCommentText("");
  };

  return (
    <View style={styles.postContainer}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
        <MoreHorizontal size={20} color={Theme.colors.mutedForeground} />
      </View>

      {/* Media */}
      <View style={styles.postMediaContainer}>
        <Image source={{ uri: item.media }} style={styles.postMedia} />
        <View style={styles.musicPill}>
          <Music size={12} color="#c451c9" />
          <Text style={styles.musicText}>{item.music}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <Heart
            size={24}
            color={liked ? "red" : Theme.colors.foreground}
            fill={liked ? "red" : "transparent"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowCommentsModal(true)}
          style={styles.actionButton}
        >
          <MessageCircle size={24} color={Theme.colors.foreground} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Upload size={24} color={Theme.colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.postFooter}>
        <Text style={styles.likesText}>{likes} likes</Text>

        <Text style={styles.caption}>
          <Text style={styles.captionUser}>{item.user.name} </Text>
          {item.caption}
        </Text>

        <TouchableOpacity onPress={() => setShowInlineComments(true)}>
          <Text style={styles.viewAllComments}>
            View all {comments.length} comments
          </Text>
        </TouchableOpacity>

        {/* INLINE COMMENTS */}
        {showInlineComments && (
          <View style={{ marginTop: 12 }}>
            <View style={styles.commentBox}>
              <TextInput
                placeholder="Add a comment..."
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
                style={styles.commentInput}
              />
              <TouchableOpacity onPress={addComment}>
                <Text style={styles.postButton}>Post</Text>
              </TouchableOpacity>
            </View>

            {comments.map((c) => (
              <View key={c.id} style={styles.commentRow}>
                <Image
                  source={{ uri: DEFAULT_AVATAR }}
                  style={styles.commentAvatar}
                />
                <View style={{ flex: 1 }}>
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentText}>
                      <Text style={styles.captionUser}>{c.username} </Text>
                      {c.text}
                    </Text>
                  </View>

                  <View style={styles.commentActions}>
                    <Text style={styles.commentTime}>{c.time}</Text>

                    <TouchableOpacity
                      style={{ flexDirection: "row", gap: 4 }}
                      onPress={() => toggleCommentLike(c.id)}
                    >
                      <Heart
                        size={14}
                        color={c.liked ? "red" : Theme.colors.mutedForeground}
                        fill={c.liked ? "red" : "transparent"}
                      />
                      <Text style={styles.commentTime}>{c.likeCount}</Text>
                    </TouchableOpacity>

                    <Text style={styles.replyText}>Reply</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* MODAL COMMENTS */}
      <Modal visible={showCommentsModal} animationType="slide">
        <SafeAreaView
          style={{ flex: 1, backgroundColor: Theme.colors.background }}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
              <ChevronLeft size={28} color={Theme.colors.foreground} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Comments</Text>
          </View>

          <FlatList
            data={comments}
            keyExtractor={(c) => c.id}
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <Image
                  source={{ uri: DEFAULT_AVATAR }}
                  style={styles.commentAvatar}
                />
                <View style={{ flex: 1 }}>
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentText}>
                      <Text style={styles.captionUser}>{item.username} </Text>
                      {item.text}
                    </Text>
                  </View>

                  <View style={styles.commentActions}>
                    <Text style={styles.commentTime}>{item.time}</Text>

                    <TouchableOpacity
                      style={{ flexDirection: "row", gap: 4 }}
                      onPress={() => toggleCommentLike(item.id)}
                    >
                      <Heart
                        size={14}
                        color={
                          item.liked ? "red" : Theme.colors.mutedForeground
                        }
                        fill={item.liked ? "red" : "transparent"}
                      />
                      <Text style={styles.commentTime}>{item.likeCount}</Text>
                    </TouchableOpacity>

                    <Text style={styles.replyText}>Reply</Text>
                  </View>
                </View>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

/* ---------------- MAIN SECTION ---------------- */

export function EventInteractionSection() {
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);

  // Missing State Variables
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [storyImage, setStoryImage] = useState<string | null>(null);
  const [stories, setStories] = useState(STORIES);

  return (
    <View style={styles.container}>
      <FlatList
        data={POSTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedPost item={item} />}
        ListHeaderComponent={
          <ScrollView horizontal style={{ padding: 16 }}>
            {stories.map((story, index) => (
              <StoryItem
                key={story.id}
                item={story}
                onPress={() => {
                  if (story.isUser) {
                    setShowUpload(true);
                  } else {
                    // Calculate index ignoring the "Add Story" button
                    const filteredIndex = stories
                      .filter((s) => !s.isUser)
                      .findIndex((s) => s.id === story.id);
                    setStoryIndex(filteredIndex >= 0 ? filteredIndex : 0);
                    setShowStoryModal(true);
                  }
                }}
              />
            ))}
          </ScrollView>
        }
      />

      <StoryViewer
        visible={showStoryModal}
        stories={stories
          .filter((s) => !s.isUser)
          .map((s) => ({
            id: s.id,
            username: s.name,
            profileImage: s.image,
            image: s.image,
            time: "Just now",
          }))}
        initialIndex={storyIndex}
        onClose={() => setShowStoryModal(false)}
      />

      <UploadContentSheet
        visible={showUpload}
        onClose={() => setShowUpload(false)}
        onCreateStory={(uri) => {
          setStoryImage(uri);
          setShowUpload(false);
          setShowCreateStory(true);
        }}
      />
      <CreateStoryModal
        visible={showCreateStory}
        imageUri={storyImage}
        onClose={() => setShowCreateStory(false)}
        onPublish={(newStory) => {
          setStories((prev) => [newStory, ...prev]);
        }}
      />
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },

  storyItem: { alignItems: "center", marginRight: 16 },
  addStoryContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.muted,
  },
  storyGradient: { width: 68, height: 68, borderRadius: 34, padding: 2 },
  storyImage: { width: 60, height: 60, borderRadius: 30 },
  storyName: { color: Theme.colors.foreground, fontSize: 12 },

  postContainer: { marginBottom: 24 },
  postHeader: { flexDirection: "row", padding: 16 },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  userName: { color: Theme.colors.foreground, fontWeight: "600" },
  postTime: { color: Theme.colors.mutedForeground, fontSize: 12 },

  postMediaContainer: { aspectRatio: 4 / 5 },
  postMedia: { width: "100%", height: "100%" },
  musicPill: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
  },
  musicText: { color: "#c451c9", marginLeft: 6 },

  actionRow: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 14 },
  actionButton: { marginRight: 16 },

  postFooter: { paddingHorizontal: 16 },
  likesText: { fontWeight: "700", color: Theme.colors.foreground },
  caption: { color: Theme.colors.foreground },
  captionUser: { fontWeight: "600" },

  viewAllComments: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
    marginTop: 2,
  },

  commentRow: { flexDirection: "row", marginBottom: 16 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  commentBubble: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 10,
    borderRadius: 12,
  },
  commentText: { color: Theme.colors.foreground },
  commentActions: { flexDirection: "row", gap: 12, marginTop: 4 },
  commentTime: { fontSize: 12, color: Theme.colors.mutedForeground },
  replyText: { fontSize: 12, color: Theme.colors.mutedForeground },

  commentBox: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  commentInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    color: Theme.colors.foreground,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  postButton: { marginLeft: 8, color: Theme.colors.primary },

  modalHeader: { flexDirection: "row", padding: 16 },
  modalTitle: { color: Theme.colors.foreground, fontSize: 16 },
});
