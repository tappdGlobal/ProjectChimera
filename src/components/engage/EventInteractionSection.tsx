import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Share,
  Alert,
} from "react-native";
import { Image } from "expo-image";

import { Theme } from "../../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import {
  Plus,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Music,
  Upload,
} from "lucide-react-native";
import StoryViewer from "./StoryViewer";
import { UploadContentSheet } from "./UploadContentSheet";
import { CreateStoryModal } from "./CreateStoryModal";
import { useStoryStore } from "../../store/storyStore";
import { useAuthStore } from "../../store/authStore";

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

interface StoryItemProps {
  item: {
    id: string;
    name: string;
    isUser?: boolean;
    image?: string;
    thumbnailImage?: string;
    viewed?: boolean;
    storyCount?: number;
  };
  onPress: () => void;
}

const StoryItem = ({ item, onPress }: StoryItemProps) => (
  <View style={styles.storyItem}>
    {item.id === "add-story" ? (
      <TouchableOpacity style={styles.addStoryContainer} onPress={onPress}>
        <Plus size={24} color={Theme.colors.foreground} />
      </TouchableOpacity>
    ) : (
      <TouchableOpacity onPress={onPress}>
        <LinearGradient
          colors={
            item.viewed 
              ? ["#9E9E9E", "#757575", "#616161"] // Gray gradient for viewed stories
              : ["#e91e63", "#9c27b0", "#673ab7"] // Colorful gradient for unviewed stories
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.storyGradient}
        >
          <View style={styles.storyImageContainer}>
            <Image source={{ uri: item.thumbnailImage || item.image }} style={styles.storyImage} />
          </View>
        </LinearGradient>
        {/* Play icon for video stories */}
        <View style={styles.playIcon}>
          <View style={styles.playButton}>
            <Text style={styles.playText}>▶</Text>
          </View>
        </View>
      </TouchableOpacity>
    )}
    <Text style={styles.storyName}>{item.name}</Text>
  </View>
);

/* ---------------- FEED POST ---------------- */

interface Comment {
  id: string;
  username: string;
  text: string;
  time: string;
  liked: boolean;
  likeCount: number;
}

interface FeedPostItem {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  time: string;
  media: string;
  likes: number;
  caption: string;
  comments: {
    username: string;
    text: string;
    time: string;
  }[];
  music: string;
}

const FeedPost = ({ item }: { item: FeedPostItem }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(item.likes);
  const [commentText, setCommentText] = useState("");
  const [showInlineComments, setShowInlineComments] = useState(false);

  const toggleComments = () => {
    setShowInlineComments((prev) => !prev);
  };

  const [comments, setComments] = useState<Comment[]>(
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

  const handleLike = () => {
    setLiked(!liked);
    setLikes((p: number) => (liked ? p - 1 : p + 1));
  };

  const toggleCommentLike = (id: string) => {
    setComments((prev: Comment[]) =>
      prev.map((c: Comment) =>
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
    setComments((p: Comment[]) => [
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
  onPress={toggleComments}
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

       <TouchableOpacity onPress={toggleComments}>
  <Text style={styles.viewAllComments}>
    {showInlineComments
      ? "Hide comments"
      : `View all ${comments.length} comments`}
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

            {comments.map((c: any) => (
              <View key={c.id} style={styles.commentRow}>
                <Image
  source={{ uri: DEFAULT_AVATAR }}
  style={styles.commentAvatar}
  onError={(e) => console.log("Image error:", e)}
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

      

    </View>
  );
};

/* ---------------- MAIN SECTION ---------------- */

export function EventInteractionSection() {
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [storyImage, setStoryImage] = useState<string | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  
  const { stories, getAllStories, deleteStory, viewStory, loading } = useStoryStore();
  const { userId } = useAuthStore();

  // Fetch stories on mount
  useEffect(() => {
    getAllStories();
  }, []);

  // Format stories for display - group by user
  const groupedStories = stories
    .filter((story: any) => story && story.userId && story.mediaUrl)
    .reduce((acc: any, story: any) => {
      const existingUser = acc.find((group: any) => group.userId === story.userId);
      
      if (existingUser) {
        // Add story to existing user's stories
        existingUser.stories.push({
          id: story.id,
          mediaUrl: story.mediaUrl 
            ? `https://tappd-backend-main.onrender.com/${story.mediaUrl}`
            : DEFAULT_AVATAR,
          caption: story.caption,
          createdAt: story.createdAt,
        });
      } else {
        // Create new user group
        acc.push({
          userId: story.userId,
          name: story.user?.username || story.user?.name || 'Unknown',
          profileImage: story.user?.profilePicUrl || DEFAULT_AVATAR,
          isUser: story.userId === userId,
          stories: [{
            id: story.id,
            mediaUrl: story.mediaUrl 
              ? `https://tappd-backend-main.onrender.com/${story.mediaUrl}`
              : DEFAULT_AVATAR,
            caption: story.caption,
            createdAt: story.createdAt,
          }],
        });
      }
      return acc;
    }, []);

  const displayStories = [
    // Add "Add Story" button first
    { 
      id: "add-story", 
      name: "Add Story", 
      isUser: true, 
      image: DEFAULT_AVATAR,
      viewed: false,
      storyCount: 0,
    },
    // Then add grouped user stories
    ...groupedStories.map((group: any) => ({
      id: group.userId,
      name: group.name,
      isUser: group.isUser,
      userId: group.userId,
      thumbnailImage: group.stories[0].mediaUrl, // Use first story as thumbnail
      profileImage: group.profileImage,
      viewed: group.stories.every((s: any) => viewedStories.has(s.id)), // All stories viewed
      storyCount: group.stories.length,
      stories: group.stories,
    })),
  ];

  const handleStoryCreated = () => {
    getAllStories();
  };

  const handleStoryView = async (storyId: string) => {
    // Mark as viewed locally
    setViewedStories(prev => new Set(prev).add(storyId));
    // Call API to record view
    try {
      await viewStory(storyId);
    } catch (error) {
      console.error("Failed to record story view:", error);
    }
  };

  const handleStoryDelete = async (storyId: string) => {
    try {
      await deleteStory(storyId);
      setShowStoryModal(false);
      // Refresh stories list
      getAllStories();
    } catch (error: any) {
      console.error("Failed to delete story:", error);
      Alert.alert(
        "Delete Failed",
        error?.message || "Failed to delete story. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={POSTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedPost item={item} />}
        ListHeaderComponent={
          <ScrollView horizontal style={{ padding: 16 }}>
            {displayStories.map((story, index) => (
              <StoryItem
                key={story.id}
                item={story}
                onPress={() => {
                  // Check if it's the "Add Story" button specifically
                  if (story.id === "add-story") {
                    setShowUpload(true);
                  } else {
                    // Calculate index ignoring the "Add Story" button
                    const filteredIndex = displayStories
                      .filter((s) => s.id !== "add-story")
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
        stories={displayStories
          .filter((s) => s.id !== "add-story")
          .flatMap((userGroup: any) => 
            userGroup.stories.map((story: any) => ({
              id: story.id,
              username: userGroup.name,
              profileImage: userGroup.profileImage,
              image: story.mediaUrl,
              caption: story.caption,
              time: "Just now",
              userId: userGroup.userId,
            }))
          )}
        initialIndex={storyIndex}
        onClose={() => setShowStoryModal(false)}
        currentUserId={userId || undefined}
        onDelete={handleStoryDelete}
        onView={handleStoryView}
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
        onClose={() => {
          setShowCreateStory(false);
          setStoryImage(null);
        }}
        onSuccess={handleStoryCreated}
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
  storyGradient: { 
    width: 72, 
    height: 72, 
    borderRadius: 36, 
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  storyImageContainer: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  storyImage: { 
    width: 64, 
    height: 64, 
    borderRadius: 32,
  },
  storyName: { 
    color: Theme.colors.foreground, 
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
  playIcon: {
    position: "absolute",
    bottom: 20,
    right: -2,
  },
  storyCountBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#e91e63",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  storyCountText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  playButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e91e63",
    justifyContent: "center",
    alignItems: "center",
  },
  playText: {
    color: "white",
    fontSize: 8,
    marginLeft: 1,
  },

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

  commentRow: { flexDirection: "row", marginBottom: 16 , flex: 1},
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

  modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "flex-end",
},

bottomSheet: {
  height: "65%",
  backgroundColor: Theme.colors.background,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  overflow: "hidden",
},

bottomSheetHeader: {
  alignItems: "center",
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: Theme.colors.muted,
},

dragHandle: {
  width: 40,
  height: 4,
  borderRadius: 2,
  backgroundColor: Theme.colors.mutedForeground,
  marginBottom: 6,
},

});
