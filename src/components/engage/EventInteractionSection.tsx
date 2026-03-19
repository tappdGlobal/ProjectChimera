import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Share,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Theme } from "../../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, X, Send, Check, Camera, Image as ImageIcon, ChevronDown } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import StoryViewer from "./StoryViewer";
import { UploadContentSheet } from "./UploadContentSheet";
import { CreateStoryModal } from "./CreateStoryModal";
import { FeedPostCard } from "./FeedPostCard";

// Memoized version for better performance
const MemoizedFeedPostCard = React.memo(FeedPostCard);
import { useStoryStore } from "../../store/storyStore";
import { useAuthStore } from "../../store/authStore";
import { usePostStore } from "../../store/postStore";
import { useFriendStore } from "../../store/friendStore";
import { useChatStore } from "../../store/chatStore";
import { Post, Comment } from "../../api/postApi";
import { AppStackParamList, SCREEN_NAMES } from "../../navigation/Routes";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

/* ---------------- MOCK DATA ---------------- */

const DEFAULT_AVATAR =
  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

const VIEWED_STORIES_KEY = "viewedStories";

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

/* ---------------- MAIN SECTION ---------------- */

export function EventInteractionSection() {
  const navigation = useNavigation<NavigationProp>();
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [storyMedia, setStoryMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  
  // Feed type state: 'friends' or 'event'
  const [activeFeed, setActiveFeed] = useState<'friends' | 'event'>('friends');

  const { stories, getAllStories, deleteStory, viewStory } = useStoryStore();
  const { 
    friendsFeed,
    eventFeed,
    fetchFriendsFeed,
    refreshFriendsFeed,
    loadMoreFriendsFeed,
    fetchMyEventsFeed,
    refreshMyEventsFeed,
    loadMoreMyEventsFeed,
    friendsHasMore,
    eventHasMore,
    loading: postsLoading, 
    error: postsError,
    likePost, 
    unlikePost,
    comments,
    commentsPagination,
    fetchPostComments,
    addComment,
    clearComments,
    sharePost,
  } = usePostStore();
  const { userId } = useAuthStore();
  const { friends, getFriends } = useFriendStore();
  const [refreshing, setRefreshing] = useState(false);
  
  // Comments modal state
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  // Share with friends state
  const [showShareFriendsModal, setShowShareFriendsModal] = useState(false);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());

  // Screen focus state for video playback control
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  // Track visible post IDs for video playback control
  const [visiblePostIds, setVisiblePostIds] = useState<Set<string>>(new Set());

  // Event Post Creation Modal states
  const [showCreateEventPostModal, setShowCreateEventPostModal] = useState(false);
  const [showMediaPickerModal, setShowMediaPickerModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);
  const [eventPostCaption, setEventPostCaption] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);

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

  // Load both feeds on mount for instant switching
  useEffect(() => {
    getAllStories();
    // Pre-load both feeds so switching is instant
    fetchFriendsFeed();
    fetchMyEventsFeed();
    getFriends();
  }, []);

  // Refresh current feed when tab changes (but data is already there)
  useEffect(() => {
    if (activeFeed === 'friends') {
      refreshFriendsFeed();
    } else if (activeFeed === 'event') {
      refreshMyEventsFeed();
    }
  }, [activeFeed]);

  // Handle screen focus/blur for video playback control
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
      };
    }, [])
  );

  // Use the appropriate feed based on active tab - memoized for performance
  const currentFeed = useMemo(() => 
    activeFeed === 'friends' ? friendsFeed : eventFeed,
    [activeFeed, friendsFeed, eventFeed]
  );
  const currentHasMore = activeFeed === 'friends' ? friendsHasMore : eventHasMore;

  const onRefresh = async () => {
    setRefreshing(true);
    await getAllStories();
    if (activeFeed === 'friends') {
      await refreshFriendsFeed();
    } else if (activeFeed === 'event') {
      await refreshMyEventsFeed();
    }
    await getFriends();
    setRefreshing(false);
  };

  const onLoadMore = async () => {
    if (currentHasMore && !postsLoading) {
      if (activeFeed === 'friends') {
        await loadMoreFriendsFeed();
      } else if (activeFeed === 'event') {
        await loadMoreMyEventsFeed();
      }
    }
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

  // Handle post interactions
  const handlePostLike = (postId: string, isLiked: boolean) => {
    if (isLiked) {
      unlikePost(postId);
    } else {
      likePost(postId);
    }
  };

  const handlePostComment = async (postId: string) => {
    // Toggle inline comments for this post
    if (selectedPostId === postId) {
      setSelectedPostId(null);
      clearComments();
    } else {
      setSelectedPostId(postId);
      await fetchPostComments(postId, 1, 20);
    }
  };

  const handleInlineCommentSubmit = async (postId: string, text: string) => {
    try {
      await addComment(postId, { text });
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  const handleLoadMoreComments = async (postId: string) => {
    if (commentsPagination && commentsPagination.page < commentsPagination.totalPages) {
      await fetchPostComments(postId, commentsPagination.page + 1, 20);
    }
  };

  const handleCloseComments = () => {
    setShowCommentsModal(false);
    setSelectedPostId(null);
    setCommentText("");
    clearComments();
  };

  const handleSubmitComment = async () => {
    if (!selectedPostId || !commentText.trim()) return;
    
    setPostingComment(true);
    try {
      await addComment(selectedPostId, { text: commentText.trim() });
      setCommentText("");
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setPostingComment(false);
    }
  };

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <View style={commentStyles.commentItem}>
      <Image
        source={{
          uri: item.user?.profilePicUrl || DEFAULT_AVATAR,
        }}
        style={commentStyles.commentAvatar}
        contentFit="cover"
      />
      <View style={commentStyles.commentContent}>
        <Text style={commentStyles.commentUsername}>{item.user?.username || "Unknown"}</Text>
        <Text style={commentStyles.commentText}>{item.text}</Text>
        <Text style={commentStyles.commentTime}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const handlePostShare = (post: Post) => {
    console.log("General share post:", post.id);
    // General share is handled in FeedPostCard
  };

  const handleShareWithFriends = async (postId: string) => {
    setSharePostId(postId);
    setSelectedFriends(new Set());
    await getFriends();
    setShowShareFriendsModal(true);
  };

  const handleCloseShareFriends = () => {
    setShowShareFriendsModal(false);
    setSharePostId(null);
    setSelectedFriends(new Set());
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(friendId)) {
        newSet.delete(friendId);
      } else {
        newSet.add(friendId);
      }
      return newSet;
    });
  };

  const handleSendShare = async () => {
    if (!sharePostId || selectedFriends.size === 0) return;
    
    // Close modal immediately for better UX
    handleCloseShareFriends();
    
    const post = currentFeed.find((p: Post) => p.id === sharePostId);
    if (!post) return;
    
    // Create share message with post ID for clickable link
    const shareMessage = `📤 Shared a post by ${post.user?.username || "someone"}: "${post.caption || "Check out this post!"}" [POST_ID:${sharePostId}]`;
    
    // Run all operations in parallel for better performance
    const friendIds = Array.from(selectedFriends);
    
    // Share post via API
    sharePost(sharePostId, { friendIds }).catch(err => 
      console.error("Share API error:", err)
    );
    
    // Send messages to all friends in parallel
    const messagePromises = friendIds.map(async (friendId) => {
      try {
        await useChatStore.getState().sendMessage({
          receiverId: friendId,
          content: shareMessage,
          messageType: "text",
        });
      } catch (chatError) {
        console.error(`Failed to send message to ${friendId}:`, chatError);
      }
    });
    
    // Wait for all messages to be sent
    await Promise.all(messagePromises);
  };

  const renderFriendItem = ({ item }: { item: any }) => {
    const friendId = item.user?.id || item.userId;
    const isSelected = selectedFriends.has(friendId);
    return (
      <TouchableOpacity
        style={[shareFriendStyles.friendItem, isSelected && shareFriendStyles.friendItemSelected]}
        onPress={() => toggleFriendSelection(friendId)}
      >
        <Image
          source={{
            uri: item.user?.profilePicUrl || item.user?.avatar || DEFAULT_AVATAR,
          }}
          style={shareFriendStyles.friendAvatar}
          contentFit="cover"
        />
        <Text style={shareFriendStyles.friendName}>
          {item.user?.username || item.user?.name || "Unknown"}
        </Text>
        {isSelected && (
          <View style={shareFriendStyles.checkmark}>
            <Check size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handleUserPress = (userId: string) => {
    console.log("Navigate to user profile:", userId);
    // TODO: Navigate to user profile
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await usePostStore.getState().deletePost(postId);
      // Refresh feed after deletion based on active feed type
      if (activeFeed === 'friends') {
        await refreshFriendsFeed();
      } else if (activeFeed === 'event') {
        await refreshMyEventsFeed();
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      Alert.alert("Error", "Failed to delete post. Please try again.");
    }
  };

  // Handle viewable items change to control video playback
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: Array<{ item: Post }> }) => {
    const visibleIds = new Set(viewableItems.map(v => v.item.id));
    setVisiblePostIds(visibleIds);
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, // Item is considered visible when 50% is in viewport
  };

  // ================= EVENT POST CREATION FUNCTIONS =================

  // Load user's bookings for event selection
  const loadUserBookings = async () => {
    try {
      const { getMyBookingsApi } = await import("../../api/bookingApi");
      const response = await getMyBookingsApi();
      const bookings = Array.isArray(response) ? response : (response as any)?.data || [];
      setUserBookings(bookings);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setUserBookings([]);
    }
  };

  // Handle opening media picker
  const handleOpenMediaPicker = () => {
    setShowMediaPickerModal(true);
    loadUserBookings();
  };

  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedMedia({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
      });
      setShowMediaPickerModal(false);
      // Small delay to ensure smooth modal transition
      setTimeout(() => {
        setShowCreateEventPostModal(true);
      }, 50);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedMedia({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
      });
      setShowMediaPickerModal(false);
      // Small delay to ensure smooth modal transition
      setTimeout(() => {
        setShowCreateEventPostModal(true);
      }, 50);
    }
  };

  // Handle creating event post
  const handleCreateEventPost = async () => {
    if (!selectedMedia || !selectedEventId) {
      Alert.alert('Error', 'Please select media and an event');
      return;
    }

    setCreatingPost(true);
    try {
      const { createPost } = usePostStore.getState();
      
      const filename = selectedMedia.uri.split('/').pop() || 'post.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = selectedMedia.type === 'video' 
        ? (match ? `video/${match[1]}` : 'video/mp4')
        : (match ? `image/${match[1]}` : 'image/jpeg');

      await createPost({
        caption: eventPostCaption || undefined,
        allowComments: true,
        isCarousel: false,
        eventId: selectedEventId,
        media: [{
          uri: selectedMedia.uri,
          name: filename,
          type: type,
        }],
      });

      // Reset and close modal
      setShowCreateEventPostModal(false);
      setSelectedMedia(null);
      setEventPostCaption('');
      setSelectedEventId(null);
      
      // Refresh the feed
      refreshMyEventsFeed();
      
      Alert.alert('Success', 'Post created successfully!');
    } catch (error: any) {
      console.error('Failed to create post:', error);
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setCreatingPost(false);
    }
  };

  // Close modals and reset state
  const handleCloseCreateModal = () => {
    setShowCreateEventPostModal(false);
    setShowMediaPickerModal(false);
    setSelectedMedia(null);
    setEventPostCaption('');
    setSelectedEventId(null);
    setShowEventDropdown(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={currentFeed}
        keyExtractor={(item) => item.id}
        extraData={activeFeed}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={3}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({ length: 400, offset: 400 * index, index })}
        renderItem={({ item }) => (
          <MemoizedFeedPostCard
            post={item}
            comments={selectedPostId === item.id ? comments : []}
            currentUserAvatar={undefined}
            currentUserId={userId || undefined}
            onLike={handlePostLike}
            onComment={handlePostComment}
            onShare={handlePostShare}
            onUserPress={handleUserPress}
            onSubmitComment={handleInlineCommentSubmit}
            onLoadMoreComments={handleLoadMoreComments}
            showCommentsInline={selectedPostId === item.id}
            onShareWithFriends={handleShareWithFriends}
            onDelete={handleDeletePost}
            isVisible={isScreenFocused && visiblePostIds.has(item.id)}
          />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Theme.colors.primary}
          />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          postsLoading && currentFeed.length > 0 ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator size="small" color={Theme.colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !postsLoading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ color: Theme.colors.mutedForeground, fontSize: 16 }}>
                No posts yet
              </Text>
              <Text style={{ color: Theme.colors.mutedForeground, fontSize: 14, marginTop: 8 }}>
                Be the first to share something!
              </Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <>
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
                    // Use 1000 as offset to indicate "my story" (distinguishes from displayStories indices)
                    setStoryIndex(1000);
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
                    // Index + 1 because 0 is add-story
                    // Note: myStoriesData is rendered separately, not in displayStories
                    setStoryIndex(index + 1);
                    setShowStoryModal(true);
                  }}
                />
              ))}
            </ScrollView>

            {/* Feed Type Tabs */}
            <View style={styles.feedTabsContainer}>
              <TouchableOpacity
                style={[styles.feedTab, activeFeed === 'friends' && styles.feedTabActive]}
                onPress={() => setActiveFeed('friends')}
              >
                <Text style={[styles.feedTabText, activeFeed === 'friends' && styles.feedTabTextActive]}>
                  Friends
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.feedTab, activeFeed === 'event' && styles.feedTabActive]}
                onPress={() => setActiveFeed('event')}
              >
                <Text style={[styles.feedTabText, activeFeed === 'event' && styles.feedTabTextActive]}>
                  Event
                </Text>
              </TouchableOpacity>
            </View>

            {/* Event Feed Header with Create Post Button */}
            {activeFeed === 'event' && (
              <View style={styles.eventFeedHeader}>
                <Text style={styles.eventFeedInfoText}>
                  Posts from events you've booked
                </Text>
                <TouchableOpacity
                  style={styles.createEventPostButton}
                  onPress={handleOpenMediaPicker}
                >
                  <Plus size={20} color={Theme.colors.primaryForeground} />
                </TouchableOpacity>
              </View>
            )}
          </>
        }
      />

      <StoryViewer
        visible={showStoryModal}
        stories={(() => {
          // storyIndex >= 1000 means it's "my story" (offset by 1000 to distinguish from displayStories indices)
          if (storyIndex >= 1000 && myStoriesData) {
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
          navigation.navigate(SCREEN_NAMES.CREATE_POST, { imageUri: uri, mediaType: type });
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

      {/* Comments Modal */}
      <Modal
        visible={showCommentsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseComments}
      >
        <SafeAreaView style={commentStyles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={commentStyles.keyboardView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <View style={commentStyles.modalContent}>
              {/* Header */}
              <View style={commentStyles.modalHeader}>
                <Text style={commentStyles.modalTitle}>Comments</Text>
                <TouchableOpacity onPress={handleCloseComments} style={commentStyles.closeButton}>
                  <X size={24} color={Theme.colors.foreground} />
                </TouchableOpacity>
              </View>

              {/* Comments List */}
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={renderCommentItem}
                contentContainerStyle={commentStyles.commentsList}
                ListEmptyComponent={
                  <View style={commentStyles.emptyComments}>
                    <Text style={commentStyles.emptyText}>No comments yet</Text>
                    <Text style={commentStyles.emptySubtext}>Be the first to comment!</Text>
                  </View>
                }
              />

              {/* Comment Input */}
              <View style={commentStyles.inputContainer}>
                <TextInput
                  style={commentStyles.input}
                  placeholder="Add a comment..."
                  placeholderTextColor={Theme.colors.mutedForeground}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={2200}
                />
                <TouchableOpacity
                  onPress={handleSubmitComment}
                  disabled={!commentText.trim() || postingComment}
                  style={[
                    commentStyles.sendButton,
                    (!commentText.trim() || postingComment) && commentStyles.sendButtonDisabled,
                  ]}
                >
                  {postingComment ? (
                    <ActivityIndicator size="small" color={Theme.colors.primary} />
                  ) : (
                    <Send size={20} color={Theme.colors.primary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Share with Friends Modal */}
      <Modal
        visible={showShareFriendsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseShareFriends}
      >
        <View style={shareFriendStyles.modalContainer}>
          <SafeAreaView style={shareFriendStyles.modalContent} edges={["bottom"]}>
            {/* Header */}
            <View style={shareFriendStyles.modalHeader}>
              <Text style={shareFriendStyles.modalTitle}>Share with Friends</Text>
              <TouchableOpacity onPress={handleCloseShareFriends} style={shareFriendStyles.closeButton}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Friends List */}
            <FlatList
              data={friends}
              keyExtractor={(item: any) => item.user?.id || item.friendshipId || String(Math.random())}
              renderItem={renderFriendItem}
              contentContainerStyle={shareFriendStyles.friendsList}
              ListEmptyComponent={
                <View style={shareFriendStyles.emptyFriends}>
                  <Text style={shareFriendStyles.emptyText}>No friends yet</Text>
                  <Text style={shareFriendStyles.emptySubtext}>Add friends to share posts with them</Text>
                </View>
              }
            />

            {/* Send Button */}
            {selectedFriends.size > 0 && (
              <View style={shareFriendStyles.sendButtonContainer}>
                <TouchableOpacity
                  style={shareFriendStyles.sendButton}
                  onPress={handleSendShare}
                >
                  <Text style={shareFriendStyles.sendButtonText}>
                    Send to {selectedFriends.size} friend{selectedFriends.size > 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      {/* ================= MEDIA PICKER MODAL ================= */}
      <Modal
        visible={showMediaPickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMediaPickerModal(false)}
      >
        <View style={eventPostStyles.modalOverlayCentered}>
          <View style={eventPostStyles.mediaPickerContainerCentered}>
            <Text style={eventPostStyles.modalTitle}>Create Event Post</Text>
            <Text style={eventPostStyles.modalSubtitle}>Select media to upload</Text>
            
            <View style={eventPostStyles.mediaOptions}>
              <TouchableOpacity style={eventPostStyles.mediaOption} onPress={pickImage}>
                <View style={eventPostStyles.mediaOptionIcon}>
                  <ImageIcon size={32} color={Theme.colors.primary} />
                </View>
                <Text style={eventPostStyles.mediaOptionText}>Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={eventPostStyles.mediaOption} onPress={takePhoto}>
                <View style={eventPostStyles.mediaOptionIcon}>
                  <Camera size={32} color={Theme.colors.primary} />
                </View>
                <Text style={eventPostStyles.mediaOptionText}>Camera</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={eventPostStyles.cancelButton}
              onPress={() => setShowMediaPickerModal(false)}
            >
              <Text style={eventPostStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= CREATE EVENT POST MODAL ================= */}
      <Modal
        visible={showCreateEventPostModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseCreateModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={eventPostStyles.modalOverlayCentered}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={eventPostStyles.createPostContainerCentered}>
            {/* Header */}
            <View style={eventPostStyles.createPostHeader}>
              <TouchableOpacity onPress={handleCloseCreateModal}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={eventPostStyles.createPostTitle}>New Event Post</Text>
              <TouchableOpacity
                onPress={handleCreateEventPost}
                disabled={!selectedMedia || !selectedEventId || creatingPost}
              >
                {creatingPost ? (
                  <ActivityIndicator size="small" color={Theme.colors.primary} />
                ) : (
                  <Send size={24} color={selectedMedia && selectedEventId ? Theme.colors.primary : Theme.colors.mutedForeground} />
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={eventPostStyles.createPostContent}>
              {/* Selected Media Preview */}
              {selectedMedia && (
                <View style={eventPostStyles.mediaPreview}>
                  <Image
                    source={{ uri: selectedMedia.uri }}
                    style={eventPostStyles.mediaPreviewImage}
                    contentFit="cover"
                  />
                  {selectedMedia.type === 'video' && (
                    <View style={eventPostStyles.videoIndicator}>
                      <Text style={eventPostStyles.videoIndicatorText}>VIDEO</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Event Selection Dropdown */}
              <View style={eventPostStyles.eventSelectionContainer}>
                <Text style={eventPostStyles.eventSelectionLabel}>Select Event *</Text>
                <TouchableOpacity
                  style={eventPostStyles.eventDropdown}
                  onPress={() => setShowEventDropdown(!showEventDropdown)}
                >
                  <Text style={selectedEventId ? eventPostStyles.eventDropdownTextSelected : eventPostStyles.eventDropdownText}>
                    {selectedEventId
                      ? (() => {
                          const booking = userBookings.find((b: any) => (b.eventId || b.event?.id) === selectedEventId);
                          return booking?.event?.eventName || booking?.event?.name || booking?.eventName || 'Selected Event';
                        })()
                      : 'Choose an event'}
                  </Text>
                  <ChevronDown size={20} color={Theme.colors.mutedForeground} />
                </TouchableOpacity>

                {/* Dropdown Options */}
                {showEventDropdown && (
                  <View style={eventPostStyles.dropdownOptions}>
                    {userBookings.length === 0 ? (
                      <Text style={eventPostStyles.noEventsText}>No booked events found</Text>
                    ) : (
                      [...new Map(userBookings.map((b: any) => {
                        const eventId = b.eventId || b.event?.id;
                        return [eventId, b];
                      })).values()].map((booking: any, index: number) => {
                        const eventId = booking.eventId || booking.event?.id;
                        // Event name can be in different fields depending on API response
                        const eventName = booking.event?.eventName || booking.event?.name || booking.eventName || 'Unknown Event';
                        return (
                          <TouchableOpacity
                            key={`${eventId}-${index}`}
                            style={[
                              eventPostStyles.dropdownOption,
                              selectedEventId === eventId && eventPostStyles.dropdownOptionSelected,
                            ]}
                            onPress={() => {
                              setSelectedEventId(eventId);
                              setShowEventDropdown(false);
                            }}
                          >
                            <Text style={eventPostStyles.dropdownOptionText}>{eventName}</Text>
                            {selectedEventId === eventId && (
                              <Check size={16} color={Theme.colors.primary} />
                            )}
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </View>
                )}
              </View>

              {/* Caption Input */}
              <View style={eventPostStyles.captionContainer}>
                <Text style={eventPostStyles.captionLabel}>Caption</Text>
                <TextInput
                  style={eventPostStyles.captionInput}
                  placeholder="Write a caption..."
                  placeholderTextColor={Theme.colors.mutedForeground}
                  value={eventPostCaption}
                  onChangeText={setEventPostCaption}
                  multiline
                  maxLength={500}
                />
                <Text style={eventPostStyles.captionCounter}>
                  {eventPostCaption.length}/500
                </Text>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

  // Feed Tabs Styles
  feedTabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  feedTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
  },
  feedTabActive: {
    backgroundColor: Theme.colors.primary,
  },
  feedTabText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    fontWeight: "500",
  },
  feedTabTextActive: {
    color: Theme.colors.primaryForeground,
    fontWeight: "600",
  },

  // Event Feed Header Styles
  eventFeedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  eventFeedInfoText: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
    flex: 1,
  },
  createEventPostButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
});

/* ---------------- EVENT POST CREATION STYLES ---------------- */

const eventPostStyles = StyleSheet.create({
  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  modalOverlayCentered: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  // Media Picker Modal
  mediaPickerContainer: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  mediaPickerContainerFullScreen: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  mediaPickerContainerCentered: {
    backgroundColor: Theme.colors.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  modalTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  mediaOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  mediaOption: {
    alignItems: "center",
    padding: 20,
  },
  mediaOptionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  mediaOptionText: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "500",
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Theme.colors.mutedForeground,
    fontSize: 16,
  },

  // Create Post Modal
  createPostContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    height: '100%',
  },
  createPostContainerCentered: {
    backgroundColor: Theme.colors.background,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    height: '80%',
    overflow: 'hidden',
  },
  createPostHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  createPostTitle: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "600",
  },
  createPostContent: {
    flex: 1,
    padding: 16,
  },

  // Media Preview
  mediaPreview: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  mediaPreviewImage: {
    width: "100%",
    height: "100%",
  },
  videoIndicator: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoIndicatorText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Event Selection
  eventSelectionContainer: {
    marginBottom: 20,
  },
  eventSelectionLabel: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  eventDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  eventDropdownText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },
  eventDropdownTextSelected: {
    color: Theme.colors.foreground,
    fontSize: 14,
  },
  dropdownOptions: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    maxHeight: 200,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  dropdownOptionSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dropdownOptionText: {
    color: Theme.colors.foreground,
    fontSize: 14,
  },
  noEventsText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
    padding: 16,
  },

  // Caption
  captionContainer: {
    marginBottom: 20,
  },
  captionLabel: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  captionInput: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: Theme.colors.foreground,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    minHeight: 100,
    textAlignVertical: "top",
  },
  captionCounter: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
});

/* ---------------- COMMENT STYLES ---------------- */

const commentStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  modalTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  commentsList: {
    padding: 16,
    flexGrow: 1,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.muted,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentUsername: {
    color: Theme.colors.foreground,
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 2,
  },
  commentText: {
    color: Theme.colors.foreground,
    fontSize: 14,
    lineHeight: 20,
  },
  commentTime: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
    marginTop: 4,
  },
  emptyComments: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: Theme.colors.mutedForeground,
    fontSize: 16,
  },
  emptySubtext: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: Theme.colors.foreground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 12,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

/* ---------------- SHARE FRIENDS STYLES ---------------- */

const shareFriendStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    flexShrink: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  friendsList: {
    padding: 16,
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  friendItemSelected: {
    backgroundColor: "rgba(217, 70, 239, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(217, 70, 239, 0.5)",
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.muted,
  },
  friendName: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
    flex: 1,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D946EF",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyFriends: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: Theme.colors.mutedForeground,
    fontSize: 16,
  },
  emptySubtext: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    marginTop: 4,
  },
  sendButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Theme.colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: Platform.OS === "android" ? 16 : 0,
  },
  sendButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
