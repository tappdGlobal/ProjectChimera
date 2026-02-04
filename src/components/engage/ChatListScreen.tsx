import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Theme } from "../../styles/Theme";
import { useNavigation } from "@react-navigation/native";
import { SCREEN_NAMES } from "../../navigation/Routes";
import { Search } from "lucide-react-native";

/* ---------------- MOCK DATA ---------------- */

const CHAT_LIST = [
  {
    id: "1",
    name: "Emma Johnson",
    lastMessage: "Looking forward to the jazz night!",
    time: "2m ago",
    unreadCount: 3,
    avatar: "https://i.pravatar.cc/150?u=emma",
    online: true,
  },
  {
    id: "2",
    name: "Michael Chen",
    lastMessage: "Great meeting you at the pool party",
    time: "15m ago",
    unreadCount: 1,
    avatar: "https://i.pravatar.cc/150?u=michael",
    online: false,
  },
  {
    id: "3",
    name: "Sarah Williams",
    lastMessage: "See you at the event!",
    time: "1h ago",
    unreadCount: 0,
    avatar: "https://i.pravatar.cc/150?u=sarah",
    online: true,
  },
];

/* ---------------- SCREEN ---------------- */

export function ChatListScreen() {
  const navigation = useNavigation<any>();

  const renderItem = ({ item }: { item: typeof CHAT_LIST[0] }) => {
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          navigation.navigate(SCREEN_NAMES.CHAT_DETAIL, {
            chatId: item.id,
            name: item.name,
            avatar: item.avatar,
          })
        }
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          {item.online && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.chatInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>

        <View style={styles.meta}>
          <Text style={styles.time}>{item.time}</Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* ---------- HEADER (ONLY ADDITION) ---------- */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Chats</Text>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>4 new</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.searchBtn}>
          <Search size={18} color={Theme.colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* ---------- CHAT LIST ---------- */}
      <FlatList
        data={CHAT_LIST}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    color: Theme.colors.foreground,
  },

  newBadge: {
    backgroundColor: "#D946EF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  newBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  searchBtn: {
    padding: 6,
    borderRadius: 16,
  },

  /* Chat Item */
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },

  avatarContainer: {
    position: "relative",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
    borderWidth: 1.5,
    borderColor: Theme.colors.background,
  },

  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
    color: Theme.colors.foreground,
  },

  lastMessage: {
    fontSize: 13,
    color: Theme.colors.mutedForeground,
    marginTop: 2,
  },

  meta: {
    alignItems: "flex-end",
    marginLeft: 8,
  },

  time: {
    fontSize: 11,
    color: Theme.colors.mutedForeground,
  },

  unreadBadge: {
    marginTop: 6,
    backgroundColor: "#D946EF",
    minWidth: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: "center",
  },

  unreadText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
});
