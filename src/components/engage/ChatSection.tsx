import React from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import { Theme } from "../../styles/Theme";
import { Search, Music } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList, SCREEN_NAMES } from "../../navigation/Routes";

// Mock Data
const CHATS = [
  {
    id: "1",
    name: "Emma Johnson",
    avatar: "https://i.pravatar.cc/150?u=emma",
    message: "Looking forward to the jazz night!",
    time: "2m ago",
    unread: 3,
    online: true,
  },
  {
    id: "2",
    name: "Michael Chen",
    avatar: "https://i.pravatar.cc/150?u=michael",
    message: "Great meeting you at the pool party",
    time: "15m ago",
    unread: 1,
    online: false,
  },
  {
    id: "3",
    name: "Sarah Williams",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    message: "The concert was amazing! 🎵",
    time: "1h ago",
    unread: 7,
    online: true,
  },
  {
    id: "4",
    name: "David Rodriguez",
    avatar: "https://i.pravatar.cc/150?u=david",
    message: "Thanks for the recommendation",
    time: "3h ago",
    unread: 2,
    online: false,
  },
  {
    id: "5",
    name: "Jessica Park",
    avatar: "https://i.pravatar.cc/150?u=jessica",
    message: "See you at the art gallery opening!",
    time: "5h ago",
    unread: 0,
    online: true,
  },
  {
    id: "6",
    name: "Alex Thompson",
    avatar: "https://i.pravatar.cc/150?u=alex",
    message: "The hiking trip was incredible",
    time: "1d ago",
    unread: 0,
    online: false,
  },
];

type NavigationProp = StackNavigationProp<AppStackParamList>;

const ChatItem = ({ item }: { item: typeof CHATS[0] }) => {
  const navigation = useNavigation<NavigationProp>();
  
  const handlePress = () => {
    navigation.navigate(SCREEN_NAMES.CHAT_DETAIL, {
      chatId: item.id,
      name: item.name,
      avatar: item.avatar,
    });
  };

  return (
    <TouchableOpacity style={styles.chatItem} onPress={handlePress}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.online && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <View style={styles.chatFooter}>
            <Text style={styles.messageText} numberOfLines={1}>
                {item.message}
            </Text>
            {item.unread > 0 && (
                <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
            )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export function ChatSection() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Chats</Text>
            <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>4 new</Text>
            </View>
        </View>
        <TouchableOpacity>
          <Search size={22} color={Theme.colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={CHATS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatItem item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Theme.colors.foreground || 'white',
    marginRight: 12,
  },
  newBadge: {
      backgroundColor: '#581c87', // Dark purple
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
  },
  newBadgeText: {
      color: '#d8b4fe', // Light purple
      fontSize: 12,
      fontWeight: '600',
  },
  listContent: {
    paddingBottom: 80,
  },
  chatItem: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.02)',
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981", // Green
    borderWidth: 2,
    borderColor: Theme.colors.background,
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.foreground || 'white',
  },
  timeText: {
    fontSize: 12,
    color: Theme.colors.mutedForeground,
  },
  chatFooter: {
      flexDirection: 'row',
      justifyContent: "space-between",
  },
  messageText: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#c451c9', // Magenta
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
});
