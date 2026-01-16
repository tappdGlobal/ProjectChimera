import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Theme } from "../../styles/Theme";
import {
  Search,
  ArrowLeft,
  Video,
  Phone,
  MoreVertical,
  Send,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { SCREEN_NAMES } from "../../navigation/Routes";

// Mock Messages for Emma Johnson
const EMMA_MESSAGES = [
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
  {
    id: "4",
    text: "That's awesome! I can't wait to hear you play",
    time: "7:35 PM",
    isMe: true,
  },
  {
    id: "5",
    text: "Looking forward to the jazz night!",
    time: "7:40 PM",
    isMe: false,
  },
];

export function ChatSection() {
  const navigation = useNavigation<any>();
  const [inputText, setInputText] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const renderMessage = (msg: (typeof EMMA_MESSAGES)[0]) => {
    if (msg.isMe) {
      return (
        <View key={msg.id} style={styles.myMessageContainer}>
          <LinearGradient
            colors={["#D946EF", "#A855F7"]} // Pink/Purple gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.myMessageBubble}
          >
            <Text style={styles.myMessageText}>{msg.text}</Text>
          </LinearGradient>
          <Text style={styles.myMessageTime}>{msg.time}</Text>
        </View>
      );
    } else {
      return (
        <View key={msg.id} style={styles.theirMessageContainer}>
          <View style={styles.theirMessageBubble}>
            <Text style={styles.theirMessageText}>{msg.text}</Text>
          </View>
          <Text style={styles.theirMessageTime}>{msg.time}</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Chat Header (Emma Johnson) */}
      <View style={[styles.chatHeader, { zIndex: 10 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.iconButton}>
            <ArrowLeft size={22} color={Theme.colors.foreground} />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?u=emma" }}
              style={styles.avatar}
            />
            <View style={styles.onlineIndicator} />
          </View>
          <View>
            <Text style={styles.headerName}>Emma</Text>
            <Text style={styles.headerName}>Johnson</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Video size={22} color={Theme.colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Phone size={22} color={Theme.colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={22} color={Theme.colors.foreground} />
          </TouchableOpacity>
          <View>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              <MoreVertical size={22} color={Theme.colors.foreground} />
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {isSettingsOpen && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setIsSettingsOpen(false);
                    navigation.navigate(SCREEN_NAMES.CHAT_SETTINGS);
                  }}
                >
                  <Text style={styles.dropdownText}>Chat Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem}>
                  <Text style={styles.dropdownText}>When We Matched</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem}>
                  <Text style={styles.dropdownText}>Media Shared</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Messages Area */}
      {/* Close dropdown when tapping outside */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.messagesList}
        onPress={() => isSettingsOpen && setIsSettingsOpen(false)}
      >
        <ScrollView
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isSettingsOpen} // Optional: disable scroll when menu is open? Maybe better not to.
          // Actually, using TouchableOpacity wrapper might block ScrollView touches.
          // Better approach might be a transparent overlay if needed, or just let it stay open until clicked elsewhere.
          // For simplicity, let's keep the scrollview interactive.
        >
          {EMMA_MESSAGES.map(renderMessage)}
        </ScrollView>
      </TouchableOpacity>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a message..."
          placeholderTextColor={Theme.colors.mutedForeground}
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendButton}>
          <LinearGradient
            colors={["#D946EF", "#A855F7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendButtonGradient}
          >
            <Send size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  // Header
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981", // Green
    borderWidth: 1.5,
    borderColor: Theme.colors.background,
  },
  headerName: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 16,
  },
  headerStatus: {
    color: Theme.colors.mutedForeground,
    fontSize: 11,
    marginTop: 2,
  },

  // Messages
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  myMessageContainer: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
    maxWidth: "80%",
  },
  myMessageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 2, // Slight sharp corner for sender
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 4,
  },
  myMessageText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageTime: {
    color: Theme.colors.mutedForeground,
    fontSize: 11,
  },

  theirMessageContainer: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
    maxWidth: "80%",
  },
  theirMessageBubble: {
    backgroundColor: "#2A2344", // Detailed dark purple/gray as in screenshot
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 2, // Sharp corner for receiver
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 4,
  },
  theirMessageText: {
    color: "#e5e5e5",
    fontSize: 15,
    lineHeight: 20,
  },
  theirMessageTime: {
    color: Theme.colors.mutedForeground,
    fontSize: 11,
  },

  // Input
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5, // space from bottom
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Theme.colors.foreground,
    fontSize: 15,
    height: 44, // Fixed height for alignment
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  sendButtonGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 4, // centering visual fix for send icon
  },
  // Dropdown
  dropdownMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    width: 200,
    backgroundColor: "#110e1b", // Very dark background matching screenshot
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
