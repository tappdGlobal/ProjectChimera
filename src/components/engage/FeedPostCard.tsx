import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Share,
  TextInput,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Video, ResizeMode } from "expo-av";

import { Theme } from "../../styles/Theme";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  MapPin,
  Music,
  Send,
  Users,
  X,
} from "lucide-react-native";
import { Post, PostMedia, Comment } from "../../api/postApi";
import { AppStackParamList } from "../../navigation/Routes";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DEFAULT_AVATAR =
  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
const BASE_URL = "https://tappd-backend-main.onrender.com";

interface FeedPostCardProps {
  post: Post;
  comments?: Comment[];
  currentUserAvatar?: string;
  currentUserId?: string;
  onLike?: (postId: string, isLiked: boolean) => void;
  onComment?: (postId: string) => void;
  onShare?: (post: Post) => void;
  onUserPress?: (userId: string) => void;
  onSubmitComment?: (postId: string, text: string) => void;
  onLoadMoreComments?: (postId: string) => void;
  showCommentsInline?: boolean;
  onShareWithFriends?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({
  post,
  comments = [],
  currentUserAvatar,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onUserPress,
  onSubmitComment,
  onLoadMoreComments,
  showCommentsInline = false,
  onShareWithFriends,
  onDelete,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if current user is the post owner
  const isOwner = currentUserId && post.userId === currentUserId;

  const handleDeletePress = () => {
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.(post.id);
  };

  // Reset showAllComments when comments are closed
  useEffect(() => {
    if (!showCommentsInline) {
      setShowAllComments(false);
      setCommentText("");
    }
  }, [showCommentsInline]);

  // Use isLiked from API response, fallback to false
  const isLiked = post.isLiked ?? false;
  const likesCount = post.likesCount ?? 0;

  const handleLike = useCallback(() => {
    // Call the parent handler with the current like state
    onLike?.(post.id, isLiked);
  }, [post.id, isLiked, onLike]);

  const handleShare = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const handleGeneralShare = useCallback(async () => {
    setShowShareModal(false);
    try {
      await Share.share({
        message: `${post.user?.username || "User"}: ${post.caption || ""}`,
      });
      onShare?.(post);
    } catch (error) {
      console.log("Share error:", error);
    }
  }, [post, onShare]);

  const handleShareWithFriends = useCallback(() => {
    setShowShareModal(false);
    onShareWithFriends?.(post.id);
  }, [post.id, onShareWithFriends]);

  const handleComment = useCallback(() => {
    // Always call parent handler - parent decides to open/close
    onComment?.(post.id);
  }, [post.id, onComment]);

  const handleSubmitComment = useCallback(() => {
    if (commentText.trim()) {
      onSubmitComment?.(post.id, commentText.trim());
      setCommentText("");
    }
  }, [post.id, commentText, onSubmitComment]);

  const handleViewAllComments = useCallback(() => {
    if (showAllComments) {
      // If already showing all, close comments
      onComment?.(post.id);
    } else {
      setShowAllComments(true);
      onLoadMoreComments?.(post.id);
    }
  }, [post.id, showAllComments, onComment, onLoadMoreComments]);

  const formatCommentTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Image
        source={{
          uri: item.user?.profilePicUrl
            ? getMediaUrl(item.user.profilePicUrl)
            : DEFAULT_AVATAR,
        }}
        style={styles.commentAvatar}
        contentFit="cover"
      />
      <View style={styles.commentBubble}>
        <Text style={styles.commentUsername}>{item.user?.username || "Unknown"}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
    </View>
  );

  const displayComments = showAllComments ? comments : comments.slice(0, 2);

  const handleUserPress = useCallback(() => {
    if (post.userId) {
      onUserPress?.(post.userId);
    }
  }, [post.userId, onUserPress]);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getMediaUrl = (url: string): string => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${BASE_URL}/${url}`;
  };

  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const [fullscreenVideoUri, setFullscreenVideoUri] = useState<string | null>(null);

  const handleExpandVideo = (uri: string) => {
    setFullscreenVideoUri(uri);
    setIsVideoFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsVideoFullscreen(false);
    setFullscreenVideoUri(null);
  };

  const renderMedia = (media: PostMedia, index: number) => {
    const mediaUrl = getMediaUrl(media.url);
    const isVideo = media.type === "VIDEO";

    if (isVideo) {
      return (
        <View key={media.id} style={styles.mediaItem}>
          <Video
            source={{ uri: mediaUrl }}
            style={styles.videoPlayer}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay={index === currentMediaIndex}
            useNativeControls={false}
          />
          {/* Expand/Fullscreen Button */}
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => handleExpandVideo(mediaUrl)}
          >
            <View style={styles.expandButtonInner}>
              <Text style={styles.expandButtonText}>⛶</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <Image
        key={media.id}
        source={{ uri: mediaUrl }}
        style={styles.mediaItem}
        contentFit="cover"
        transition={200}
      />
    );
  };

  const hasMultipleMedia = post.media && post.media.length > 1;
  const currentMedia = post.media?.[currentMediaIndex];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleUserPress} style={styles.userInfo}>
          <Image
            source={{
              uri: post.user?.profilePicUrl
                ? getMediaUrl(post.user.profilePicUrl)
                : DEFAULT_AVATAR,
            }}
            style={styles.avatar}
            contentFit="cover"
          />
          <View style={styles.userMeta}>
            <Text style={styles.username}>
              {post.user?.username || post.user?.name || "Unknown"}
            </Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => setShowMenu(true)}
        >
          <MoreHorizontal size={20} color={Theme.colors.mutedForeground} />
        </TouchableOpacity>

        {/* Menu Modal */}
        <Modal
          visible={showMenu}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableOpacity
            style={menuStyles.overlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          >
            <View style={menuStyles.menuContainer}>
              {isOwner && (
                <TouchableOpacity
                  style={menuStyles.menuItem}
                  onPress={handleDeletePress}
                >
                  <Text style={[menuStyles.menuText, menuStyles.deleteText]}>
                    Delete Post
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={menuStyles.menuItem}
                onPress={() => setShowMenu(false)}
              >
                <Text style={menuStyles.menuText}>Report</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[menuStyles.menuItem, menuStyles.menuItemLast]}
                onPress={() => setShowMenu(false)}
              >
                <Text style={menuStyles.menuText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteConfirm}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowDeleteConfirm(false)}
        >
          <View style={confirmStyles.overlay}>
            <View style={confirmStyles.container}>
              <Text style={confirmStyles.title}>Delete Post</Text>
              <Text style={confirmStyles.message}>
                Are you sure you want to delete this post?
              </Text>
              <View style={confirmStyles.buttonContainer}>
                <TouchableOpacity
                  style={confirmStyles.cancelButton}
                  onPress={() => setShowDeleteConfirm(false)}
                >
                  <Text style={confirmStyles.cancelText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={confirmStyles.deleteButton}
                  onPress={handleConfirmDelete}
                >
                  <Text style={confirmStyles.deleteText}>DELETE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {/* Media Carousel */}
      {post.media && post.media.length > 0 && (
        <View style={styles.mediaContainer}>
          {renderMedia(currentMedia, currentMediaIndex)}

          {/* Media Indicators */}
          {hasMultipleMedia && (
            <View style={styles.indicatorsContainer}>
              {post.media.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentMediaIndex && styles.indicatorActive,
                  ]}
                  onPress={() => setCurrentMediaIndex(index)}
                />
              ))}
            </View>
          )}

          {/* Location Badge */}
          {post.locationName && (
            <View style={styles.locationBadge}>
              <MapPin size={12} color={Theme.colors.primary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {post.locationName}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            <Heart
              size={26}
              color={isLiked ? "#e91e63" : Theme.colors.foreground}
              fill={isLiked ? "#e91e63" : "transparent"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleComment} style={styles.actionButton}>
            <MessageCircle size={26} color={Theme.colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Share2 size={26} color={Theme.colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Likes Count */}
      {likesCount > 0 && (
        <View style={styles.likesContainer}>
          <Text style={styles.likesText}>
            {likesCount.toLocaleString()} {likesCount === 1 ? "like" : "likes"}
          </Text>
        </View>
      )}

      {/* Caption */}
      {post.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>
            <Text style={styles.captionUsername}>
              {post.user?.username || post.user?.name || "Unknown"}{" "}
            </Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </Text>
        </View>
      )}

      {/* Comments Preview */}
      {post.commentsCount > 0 && !showCommentsInline && (
        <TouchableOpacity style={styles.commentsPreview} onPress={handleComment}>
          <Text style={styles.commentsText}>
            View all {post.commentsCount}{" "}
            {post.commentsCount === 1 ? "comment" : "comments"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Inline Comments Section */}
      {showCommentsInline && (
        <View style={styles.commentsSection}>
          {/* View all comments link */}
          {post.commentsCount > 2 && !showAllComments && (
            <TouchableOpacity onPress={handleViewAllComments}>
              <Text style={styles.viewAllCommentsText}>
                View all {post.commentsCount} comments
              </Text>
            </TouchableOpacity>
          )}

          {/* Comments List */}
          {displayComments.length > 0 && (
            <View style={styles.commentsList}>
              {displayComments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Image
                    source={{
                      uri: comment.user?.profilePicUrl
                        ? getMediaUrl(comment.user.profilePicUrl)
                        : DEFAULT_AVATAR,
                    }}
                    style={styles.commentAvatar}
                    contentFit="cover"
                  />
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentUsername}>
                      {comment.user?.username || "Unknown"}
                    </Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Comment Input */}
          <View style={styles.commentInputContainer}>
            <Image
              source={{
                uri: currentUserAvatar
                  ? getMediaUrl(currentUserAvatar)
                  : DEFAULT_AVATAR,
              }}
              style={styles.commentInputAvatar}
              contentFit="cover"
            />
            <View style={styles.commentInputWrapper}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor={Theme.colors.mutedForeground}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={2200}
              />
              {commentText.trim().length > 0 && (
                <TouchableOpacity
                  onPress={handleSubmitComment}
                  style={styles.commentSendButton}
                >
                  <Send size={18} color={Theme.colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Views Count */}
      {post.viewsCount > 0 && (
        <View style={styles.viewsContainer}>
          <Text style={styles.viewsText}>
            {post.viewsCount.toLocaleString()} views
          </Text>
        </View>
      )}

      {/* Fullscreen Video Modal */}
      <Modal
        visible={isVideoFullscreen}
        animationType="fade"
        transparent={false}
        onRequestClose={handleCloseFullscreen}
      >
        <View style={fullscreenStyles.container}>
          <TouchableOpacity
            style={fullscreenStyles.closeButton}
            onPress={handleCloseFullscreen}
          >
            <X size={28} color="#fff" />
          </TouchableOpacity>
          {fullscreenVideoUri && (
            <Video
              source={{ uri: fullscreenVideoUri }}
              style={fullscreenStyles.video}
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              shouldPlay
              useNativeControls
            />
          )}
        </View>
      </Modal>

      {/* Share Options Modal */}
      <Modal
        visible={showShareModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowShareModal(false)}
      >
        <TouchableOpacity
          style={shareStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowShareModal(false)}
        >
          <View style={shareStyles.modalContent}>
            <View style={shareStyles.modalHeader}>
              <Text style={shareStyles.modalTitle}>Share</Text>
              <TouchableOpacity
                onPress={() => setShowShareModal(false)}
                style={shareStyles.closeButton}
              >
                <X size={24} color={Theme.colors.foreground} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={shareStyles.shareOption}
              onPress={handleShareWithFriends}
            >
              <View style={shareStyles.shareIconContainer}>
                <Users size={24} color={Theme.colors.primary} />
              </View>
              <View style={shareStyles.shareTextContainer}>
                <Text style={shareStyles.shareOptionTitle}>Share with Friends</Text>
                <Text style={shareStyles.shareOptionSubtitle}>
                  Send to your friends on Tappd
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={shareStyles.shareOption}
              onPress={handleGeneralShare}
            >
              <View style={shareStyles.shareIconContainer}>
                <Share2 size={24} color={Theme.colors.primary} />
              </View>
              <View style={shareStyles.shareTextContainer}>
                <Text style={shareStyles.shareOptionTitle}>Share</Text>
                <Text style={shareStyles.shareOptionSubtitle}>
                  Share via other apps
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.background,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.muted,
  },
  userMeta: {
    marginLeft: 12,
  },
  username: {
    color: Theme.colors.foreground,
    fontWeight: "600",
    fontSize: 14,
  },
  timeAgo: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  mediaContainer: {
    width: SCREEN_WIDTH,
    aspectRatio: 1,
    backgroundColor: Theme.colors.muted,
    position: "relative",
  },
  mediaItem: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
  },
  expandButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    zIndex: 10,
  },
  expandButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  expandButtonText: {
    color: "#fff",
    fontSize: 20,
  },
  indicatorsContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  indicatorActive: {
    backgroundColor: "#fff",
    width: 18,
  },
  locationBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  locationText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
    maxWidth: 150,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  actionsLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
  },
  likesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  likesText: {
    color: Theme.colors.foreground,
    fontWeight: "600",
    fontSize: 14,
  },
  captionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  caption: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  captionUsername: {
    color: Theme.colors.foreground,
    fontWeight: "600",
    fontSize: 14,
  },
  captionText: {
    color: Theme.colors.foreground,
    fontSize: 14,
    lineHeight: 20,
  },
  commentsPreview: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  commentsText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },
  viewsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  viewsText: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },
  // Inline Comments Styles
  commentsSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  viewAllCommentsText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    marginBottom: 12,
  },
  commentsList: {
    marginBottom: 12,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.muted,
    marginRight: 10,
  },
  commentBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  commentUsername: {
    color: Theme.colors.foreground,
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 2,
  },
  commentText: {
    color: Theme.colors.foreground,
    fontSize: 14,
    lineHeight: 18,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  commentInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.muted,
    marginRight: 10,
  },
  commentInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  commentInput: {
    flex: 1,
    color: Theme.colors.foreground,
    fontSize: 14,
    maxHeight: 80,
    paddingVertical: 4,
  },
  commentSendButton: {
    padding: 4,
    marginLeft: 4,
  },
});

// Share Modal Styles
const shareStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  shareOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  shareIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  shareTextContainer: {
    flex: 1,
  },
  shareOptionTitle: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  shareOptionSubtitle: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
  },
});

// Menu Styles
const menuStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: Theme.colors.background,
    borderRadius: 12,
    width: 200,
    overflow: "hidden",
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuText: {
    color: Theme.colors.foreground,
    fontSize: 16,
    textAlign: "center",
  },
  deleteText: {
    color: "#ff4444",
  },
});

// Delete Confirmation Styles
const confirmStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 320,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  message: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: "#D946EF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  deleteText: {
    color: "#ff4444",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

// Fullscreen Video Styles
const fullscreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
});

export default FeedPostCard;
