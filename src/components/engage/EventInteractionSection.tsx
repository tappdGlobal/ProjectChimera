import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Theme } from "../../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import {
  Plus,
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Music,
} from "lucide-react-native";
import { CreateStoryModal } from "./CreateStoryModal";

import { UploadContentSheet } from "./UploadContentSheet";

// ---------------- MOCK DATA ----------------

const STORIES = [
  { id: "new", name: "Add Story", isUser: true, image: "" },
  { id: "1", name: "Emma", image: "https://i.pravatar.cc/150?u=emma" },
  { id: "2", name: "Michael", image: "https://i.pravatar.cc/150?u=michael" },
  { id: "3", name: "Sarah", image: "https://i.pravatar.cc/150?u=sarah" },
  { id: "4", name: "David", image: "https://i.pravatar.cc/150?u=david" },
  { id: "5", name: "Olivia", image: "https://i.pravatar.cc/150?u=olivia" },
];

const POSTS = [
  {
    id: "1",
    user: {
      name: "Emma Johnson",
      avatar: "https://i.pravatar.cc/150?u=emma",
    },
    time: "2h ago",
    media: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
    likes: 127,
    caption: "Amazing jazz performance tonight!",
    comments: 23,
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
    caption: "Great vibes at the rooftop party!",
    comments: 12,
    music: "Summer - Calvin Harris",
  },
];

// ---------------- STORY ITEM ----------------

const StoryItem = ({
  item,
  onAddStory,
}: {
  item: typeof STORIES[0];
  onAddStory: () => void;
}) => {
  return (
    <View style={styles.storyItem}>
      {item.isUser ? (
        <TouchableOpacity onPress={onAddStory} style={styles.addStoryWrapper}>
          <View style={styles.addStoryDashedCircle}>
            <Plus size={26} color={Theme.colors.foreground} />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity>
          <LinearGradient
            colors={[
              Theme.colors.primary || "#c451c9",
              "#740182",
            ]}
            style={styles.storyGradient}
          >
            <Image source={{ uri: item.image }} style={styles.storyImage} />
          </LinearGradient>
        </TouchableOpacity>
      )}
      <Text style={styles.storyName}>{item.name}</Text>
    </View>
  );
};

// ---------------- FEED POST ----------------

const FeedPost = ({ item }: { item: typeof POSTS[0] }) => {
  return (
    <View style={styles.postContainer}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        <View style={styles.postHeaderText}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
        <TouchableOpacity>
          <MoreHorizontal size={20} color={Theme.colors.mutedForeground} />
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.actionButton}>
          <Heart size={24} color={Theme.colors.destructive} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={24} color={Theme.colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Send size={24} color={Theme.colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.postFooter}>
        <Text style={styles.likesText}>{item.likes} likes</Text>
        <Text style={styles.caption}>
          <Text style={styles.captionUser}>{item.user.name} </Text>
          {item.caption}
        </Text>
        <Text style={styles.viewComments}>
          View all {item.comments} comments
        </Text>
      </View>
    </View>
  );
};

// ---------------- MAIN SECTION ----------------

export function EventInteractionSection() {
  const [stories, setStories] = useState(STORIES);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [storyImage, setStoryImage] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <FlatList
        data={POSTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedPost item={item} />}
        ListHeaderComponent={
          <View style={styles.storiesContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesContent}
            >
              {stories.map((story) => (
                <StoryItem
                  key={story.id}
                  item={story}
                  onAddStory={() => setShowUpload(true)}
                />
              ))}
            </ScrollView>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  listContent: {
    paddingBottom: 80,
  },

  storiesContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.muted,
  },
  storiesContent: {
    paddingHorizontal: 16,
  },
  storyItem: {
    alignItems: "center",
    marginRight: 16,
    width: 72,
  },
  addStoryWrapper: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  addStoryDashedCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Theme.colors.mutedForeground,
    alignItems: "center",
    justifyContent: "center",
  },
  storyGradient: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Theme.colors.background,
  },
  storyName: {
    color: Theme.colors.foreground,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },

  postContainer: {
    marginBottom: 24,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  postHeaderText: {
    flex: 1,
  },
  userName: {
    color: Theme.colors.foreground,
    fontWeight: "600",
    fontSize: 14,
  },
  postTime: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },

  postMediaContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 4 / 5,
  },
  postMedia: {
    width: "100%",
    height: "100%",
  },
  musicPill: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(20,10,30,0.8)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  musicText: {
    color: "#c451c9",
    fontSize: 12,
    marginLeft: 6,
    fontWeight: "500",
  },

  actionRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButton: {
    marginRight: 16,
  },

  postFooter: {
    paddingHorizontal: 16,
  },
  likesText: {
    color: Theme.colors.foreground,
    fontWeight: "700",
    marginBottom: 6,
  },
  caption: {
    color: Theme.colors.foreground,
    fontSize: 14,
    marginBottom: 6,
  },
  captionUser: {
    fontWeight: "600",
  },
  viewComments: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },
});
