import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Pressable,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../../styles/Theme";
import {
  ChevronLeft,
  Video,
  Phone,
  Search,
  MoreVertical,
  Send,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList, SCREEN_NAMES } from "../../navigation/Routes";

/* ✅ IMPORT COMING SOON */
import ComingSoon from "../common/ComingSoon";

/* ---------------- TYPES ---------------- */

type NavigationProp = StackNavigationProp<AppStackParamList>;
type ChatDetailRouteProp = RouteProp<
  AppStackParamList,
  typeof SCREEN_NAMES.CHAT_DETAIL
>;

/* ---------------- MOCK DATA ---------------- */

const INITIAL_MESSAGES = [
  {
    id: "1",
    text: "Hey! Are you going to the jazz event tonight?",
    time: "7:30 PM",
    isMe: false,
  },
  {
    id: "2",
    text: "Yes! I'm really excited. Are you performing?",
    time: "7:32 PM",
    isMe: true,
  },
  {
    id: "3",
    text: "Actually yes! I'll be playing saxophone in the second set",
    time: "7:33 PM",
    isMe: false,
  },
];

/* ---------------- COMPONENT ---------------- */

export function ChatDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChatDetailRouteProp>();
  const { name, avatar } = route.params;

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  /* ✅ NEW STATE FOR POPUP */
  const [showComingSoon, setShowComingSoon] = useState(false);

  const goToChatSettings = () => {
    setMenuOpen(false);
    navigation.navigate(SCREEN_NAMES.CHAT_SETTINGS);
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: input,
        time: "Now",
        isMe: true,
      },
    ]);

    setInput("");
  };

  // Parse message text to extract post ID if present
  const parseMessageText = (text: string) => {
    const postIdMatch = text.match(/\[POST_ID:([^\]]+)\]/);
    if (postIdMatch) {
      const postId = postIdMatch[1];
      const cleanText = text.replace(/\[POST_ID:[^\]]+\]/, "").trim();
      return { cleanText, postId };
    }
    return { cleanText: text, postId: null };
  };

  const handlePostLinkPress = (postId: string) => {
    // Navigate to post detail screen
    navigation.navigate(SCREEN_NAMES.EVENT_DETAILS_SCREEN);
  };

  const renderMessageContent = (text: string, isMe: boolean) => {
    const { cleanText, postId } = parseMessageText(text);
    
    return (
      <View>
        <Text style={isMe ? styles.textMe : styles.textOther}>{cleanText}</Text>
        {postId && (
          <TouchableOpacity 
            onPress={() => handlePostLinkPress(postId)}
            style={styles.postLinkContainer}
          >
            <Text style={styles.postLinkText}>👆 View Post</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderItem = ({ item }: any) => (
    <View
      style={[
        styles.messageRow,
        item.isMe ? styles.rowMe : styles.rowOther,
      ]}
    >
      {item.isMe ? (
        <LinearGradient
          colors={["#D946EF", "#A855F7"]}
          style={styles.bubbleMe}
        >
          {renderMessageContent(item.text, true)}
          <Text style={styles.timeMe}>{item.time}</Text>
        </LinearGradient>
      ) : (
        <View style={styles.bubbleOther}>
          {renderMessageContent(item.text, false)}
          <Text style={styles.timeOther}>{item.time}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* ---------------- HEADER ---------------- */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>

          <Image source={{ uri: avatar }} style={styles.avatar} />

          <View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.status}>Online</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* ✅ VIDEO CLICK → COMING SOON */}
          <TouchableOpacity
            onPress={() => {
              setShowComingSoon(true);

              /* ❌ OLD ALERT (COMMENTED, NOT DELETED)
              Alert.alert("Video Call", "Backend integration required");
              */
            }}
          >
            <Video size={20} color="#fff" />
          </TouchableOpacity>

          {/* ✅ PHONE CLICK → COMING SOON */}
          <TouchableOpacity
            onPress={() => {
              setShowComingSoon(true);

              /* ❌ OLD ALERT (COMMENTED, NOT DELETED)
              Alert.alert("Voice Call", "Backend integration required");
              */
            }}
          >
            <Phone size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity>
            <Search size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMenuOpen(true)}>
            <MoreVertical size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------------- DROPDOWN ---------------- */}
      {menuOpen && (
        <Pressable
          style={styles.fullScreenOverlay}
          onPress={() => setMenuOpen(false)}
        >
          <Pressable style={styles.dropdownWrapper} onPress={() => {}}>
            <View style={styles.dropdown}>
              <TouchableOpacity onPress={goToChatSettings}>
                <Text style={styles.dropdownItem}>Chat Settings</Text>
              </TouchableOpacity>
              <Text style={styles.dropdownItem}>When We Matched</Text>
              <Text style={styles.dropdownItem}>Media Shared</Text>
            </View>
          </Pressable>
        </Pressable>
      )}

      {/* ---------------- MESSAGES ---------------- */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* ---------------- INPUT ---------------- */}
      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Add a message..."
          placeholderTextColor="#aaa"
          style={styles.input}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity onPress={sendMessage}>
          <LinearGradient
            colors={["#D946EF", "#A855F7"]}
            style={styles.sendBtn}
          >
            <Send size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ✅ COMING SOON POPUP */}
     <ComingSoon
  visible={showComingSoon}
  onClose={() => setShowComingSoon(false)}
/>

    </SafeAreaView>
  );
}

/* ---------------- STYLES (UNCHANGED) ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  name: {
    color: "#fff",
    fontWeight: "600",
  },
  status: {
    color: "#aaa",
    fontSize: 12,
  },
  fullScreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdownWrapper: {
    position: "absolute",
    top: 64,
    right: 12,
  },
  dropdown: {
    width: 200,
    backgroundColor: "#120E1C",
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    elevation: 12,
  },
  dropdownItem: {
    color: "#fff",
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  list: {
    padding: 16,
  },
  messageRow: {
    marginBottom: 14,
  },
  rowMe: {
    alignItems: "flex-end",
  },
  rowOther: {
    alignItems: "flex-start",
  },
  bubbleMe: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
  },
  bubbleOther: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#2A2344",
  },
  textMe: {
    color: "#fff",
  },
  textOther: {
    color: "#fff",
  },
  timeMe: {
    fontSize: 10,
    color: "#eee",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  timeOther: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 4,
  },
  inputBar: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#1F1B2E",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 3,
    minHeight: 42,
    maxHeight: 80,
    color: "#fff",
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  postLinkContainer: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  postLinkText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
