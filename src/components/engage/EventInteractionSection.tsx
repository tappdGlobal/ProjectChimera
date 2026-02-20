import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Share,
  Modal,
  SafeAreaView,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
import { usePostStore } from "../../store/postStore";
import { AppStackParamList } from "../../navigation/Routes";
import { SCREEN_NAMES } from "../../navigation/Routes";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

/* ---------------- MOCK DATA ---------------- */

const DEFAULT_AVATAR =
  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

const VIEWED_STORIES_KEY = "viewedStories";

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
];

/* ---------------- STORY ITEM ---------------- */

interface StoryItemProps {
  item: any;
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
              ? ["#9E9E9E", "#757575", "#616161"]
              : ["#e91e63", "#9c27b0", "#673ab7"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.storyGradient}
        >
          <View style={styles.storyImageContainer}>
            <Image
              source={{ uri: item.thumbnailImage || item.image }}
              style={styles.storyImage}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    )}
    <Text style={styles.storyName}>{item.name}</Text>
  </View>
);

/* ---------------- MY STORY BADGE ---------------- */

interface MyStoryBadgeProps {
  hasStories: boolean;
  thumbnailImage?: string;
  viewed: boolean;
  onPress: () => void;
}

const MyStoryBadge = ({ hasStories, thumbnailImage, viewed, onPress }: MyStoryBadgeProps) => {
  if (!hasStories) return null;
  
  return (
    <View style={styles.myStoryItem}>
      <TouchableOpacity onPress={onPress}>
        <LinearGradient
          colors={
            viewed
              ? ["#9E9E9E", "#757575", "#616161"]
              : ["#e91e63", "#9c27b0", "#673ab7"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.storyGradient}
        >
          <View style={styles.storyImageContainer}>
            <Image
              source={{ uri: thumbnailImage || DEFAULT_AVATAR }}
              style={styles.storyImage}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
      <Text style={styles.storyName}>My Story</Text>
    </View>
  );
};

/* ---------------- FEED POST ---------------- */

const FeedPost = ({ item }: any) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(item.likes);
  const [commentText, setCommentText] = useState("");
  const [showInlineComments, setShowInlineComments] = useState(false);

  const [comments, setComments] = useState(
    item.comments.map((c: any, i: number) => ({
      ...c,
      id: i.toString(),
      liked: false,
      likeCount: 0,
    }))
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

  const addComment = () => {
    if (!commentText.trim()) return;
    setComments((p: any[]) => [
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
      <View style={styles.postHeader}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
        <MoreHorizontal size={20} color={Theme.colors.mutedForeground} />
      </View>

      <View style={styles.postMediaContainer}>
        <Image source={{ uri: item.media }} style={styles.postMedia} />
        <View style={styles.musicPill}>
          <Music size={12} color="#c451c9" />
          <Text style={styles.musicText}>{item.music}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <Heart
            size={24}
            color={liked ? "red" : Theme.colors.foreground}
            fill={liked ? "red" : "transparent"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowInlineComments((p) => !p)}
          style={styles.actionButton}
        >
          <MessageCircle size={24} color={Theme.colors.foreground} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Upload size={24} color={Theme.colors.foreground} />
        </TouchableOpacity>
      </View>

      <View style={styles.postFooter}>
        <Text style={styles.likesText}>{likes} likes</Text>

        <Text style={styles.caption}>
          <Text style={styles.captionUser}>{item.user.name} </Text>
          {item.caption}
        </Text>

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
          </View>
        )}
      </View>
    </View>
  );
};

/* ---------------- MAIN SECTION ---------------- */

export function EventInteractionSection() {
  const navigation = useNavigation<NavigationProp>();
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [storyMedia, setStoryMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

  const { stories, getAllStories, deleteStory, viewStory } = useStoryStore();
  const { feed, fetchFeed } = usePostStore();
  const { userId } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  // Load viewed stories from AsyncStorage on mount
  useEffect(() => {
    const loadViewedStories = async () => {
      try {
        const stored = await AsyncStorage.getItem(VIEWED_STORIES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setViewedStories(new Set(parsed));
        }
      } catch (error) {
        console.error("Failed to load viewed stories:", error);
      }
    };
    loadViewedStories();
  }, []);

  // Persist viewed stories to AsyncStorage whenever they change
  useEffect(() => {
    const saveViewedStories = async () => {
      try {
        const storiesArray = Array.from(viewedStories);
        await AsyncStorage.setItem(VIEWED_STORIES_KEY, JSON.stringify(storiesArray));
      } catch (error) {
        console.error("Failed to save viewed stories:", error);
      }
    };
    
    // Only save if we have viewed stories (avoid saving on initial empty state)
    if (viewedStories.size > 0) {
      saveViewedStories();
    }
  }, [viewedStories]);

  useEffect(() => {
    getAllStories();
    fetchFeed();
  }, []);

  // Debug: Log feed data
  useEffect(() => {
    console.log("Feed posts:", feed.length, feed);
  }, [feed]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getAllStories();
    await fetchFeed();
    setRefreshing(false);
  };

  const groupedStories = stories
    .filter((story: any) => story && story.userId && story.mediaUrl)
    .reduce((acc: any[], story: any) => {
      const existingUser = acc.find((g: any) => g.userId === story.userId);

      if (existingUser) {
        existingUser.stories.push({
          id: story.id,
          mediaUrl: `https://tappd-backend-main.onrender.com/${story.mediaUrl}`,
          caption: story.caption,
          createdAt: story.createdAt,
        });
      } else {
        acc.push({
          userId: story.userId,
          name: story.user?.username || story.user?.name || "Unknown",
          profileImage: story.user?.profilePicUrl || DEFAULT_AVATAR,
          isUser: story.userId === userId,
          stories: [
            {
              id: story.id,
              mediaUrl: `https://tappd-backend-main.onrender.com/${story.mediaUrl}`,
              caption: story.caption,
              createdAt: story.createdAt,
            },
          ],
        });
      }
      return acc;
    }, []);

  // Separate current user's stories from other users' stories
  const myStoryGroup = groupedStories.find((group: any) => group.isUser);
  const otherStories = groupedStories.filter((group: any) => !group.isUser);

  const myStoriesData = myStoryGroup ? {
    id: myStoryGroup.userId,
    name: "My Story",
    isUser: true,
    userId: myStoryGroup.userId,
    thumbnailImage: myStoryGroup.stories[0].mediaUrl,
    profileImage: myStoryGroup.profileImage,
    viewed: myStoryGroup.stories.every((s: any) => viewedStories.has(s.id)),
    storyCount: myStoryGroup.stories.length,
    stories: myStoryGroup.stories,
  } : null;

  const displayStories = [
    {
      id: "add-story",
      name: "Add Story",
      isUser: true,
      image: DEFAULT_AVATAR,
      viewed: false,
      storyCount: 0,
    },

    ...otherStories.map((group: any) => ({
      id: group.userId,
      name: group.name,
      isUser: group.isUser,
      userId: group.userId,
      thumbnailImage: group.stories[0].mediaUrl,
      profileImage: group.profileImage,
      viewed: group.stories.every((s: any) => viewedStories.has(s.id)),
      storyCount: group.stories.length,
      stories: group.stories,
    })),
  ];

  // Transform API posts to match FeedPost expected format
  const displayPosts = feed.length > 0 
    ? feed.map((post: any) => ({
        id: post.id,
        user: { 
          name: post.user?.username || post.user?.name || "Unknown", 
          avatar: post.user?.profilePicUrl || DEFAULT_AVATAR 
        },
        time: new Date(post.createdAt).toLocaleDateString(),
        media: post.media?.[0]?.url 
          ? `https://tappd-backend-main.onrender.com/${post.media[0].url}`
          : "",
        likes: post.likesCount || 0,
        caption: post.caption || "",
        comments: [],
        music: "",
      }))
    : []; // Show empty feed if API fails, not mock data

  return (
    <View style={styles.container}>
      <FlatList
        data={displayPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedPost item={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: Theme.colors.mutedForeground, fontSize: 16 }}>
              No posts yet
            </Text>
            <Text style={{ color: Theme.colors.mutedForeground, fontSize: 14, marginTop: 8 }}>
              Be the first to share something!
            </Text>
          </View>
        }
        ListHeaderComponent={
          <ScrollView horizontal style={{ padding: 16 }}>
            {/* Add Story Button */}
            <StoryItem
              key={displayStories[0].id}
              item={displayStories[0]}
              onPress={() => setShowUpload(true)}
            />
            
            {/* My Story Badge - only shown if user has stories */}
            {myStoriesData && (
              <MyStoryBadge
                hasStories={true}
                thumbnailImage={myStoriesData.thumbnailImage}
                viewed={myStoriesData.viewed}
                onPress={() => {
                  // Find the index in displayStories for my story (it's always at index 1 now)
                  setStoryIndex(1);
                  setShowStoryModal(true);
                }}
              />
            )}
            
            {/* Other Users' Stories */}
            {displayStories.slice(1).map((story, index) => (
              <StoryItem
                key={story.id}
                item={story}
                onPress={() => {
                  // Index + 2 because 0 is add-story, 1 is my story (if exists)
                  setStoryIndex(myStoriesData ? index + 2 : index + 1);
                  setShowStoryModal(true);
                }}
              />
            ))}
          </ScrollView>
        }
      />

      <StoryViewer
        visible={showStoryModal}
        stories={(() => {
          // Handle My Story (index 1 when myStoriesData exists)
          if (myStoriesData && storyIndex === 1) {
            return myStoriesData.stories.map((s: any) => ({
              id: s.id,
              username: myStoriesData.name || "Unknown",
              profileImage: myStoriesData.profileImage || DEFAULT_AVATAR,
              image: s.mediaUrl,
              caption: s.caption || "",
              time: "",
              userId: myStoriesData.userId,
            }));
          }
          
          // Handle other stories
          const selectedUser: any = displayStories[storyIndex];
          if (!selectedUser || selectedUser.id === "add-story" || !selectedUser.stories) return [];
          return selectedUser.stories.map((s: any) => ({
            id: s.id,
            username: selectedUser.name || "Unknown",
            profileImage: selectedUser.profileImage || DEFAULT_AVATAR,
            image: s.mediaUrl,
            caption: s.caption || "",
            time: "",
            userId: selectedUser.userId,
          }));
        })()}
        initialIndex={0}
        onClose={() => setShowStoryModal(false)}
        currentUserId={userId || undefined}
        onDelete={(storyId) => {
          deleteStory(storyId);
          getAllStories();
        }}
        onView={(storyId) => {
          viewStory(storyId);
          setViewedStories((prev) => new Set([...prev, storyId]));
        }}
      />

      <UploadContentSheet
        visible={showUpload}
        onClose={() => setShowUpload(false)}
        onCreateStory={(uri, type) => {
          setStoryMedia({ uri, type });
          setShowUpload(false);
          setShowCreateStory(true);
        }}
        onCreatePost={(uri, type) => {
          setShowUpload(false);
          navigation.navigate(SCREEN_NAMES.CREATE_POST, { imageUri: uri });
        }}
      />

      <CreateStoryModal
        visible={showCreateStory}
        mediaUri={storyMedia?.uri || null}
        mediaType={storyMedia?.type || 'image'}
        onClose={() => {
          setShowCreateStory(false);
          setStoryMedia(null);
        }}
        onSuccess={getAllStories}
      />
    </View>
  );
}


/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },

  storyItem: { alignItems: "center", marginRight: 16 },
  myStoryItem: { alignItems: "center", marginRight: 16 },
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

  commentRow: { flexDirection: "row", marginBottom: 16, flex: 1 },
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
