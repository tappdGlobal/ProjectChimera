import React from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, SafeAreaView } from "react-native";
import { Theme } from "../../styles/Theme";
import { ChevronLeft, Video, Phone, Search, MoreVertical } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

// Mock Data
const MESSAGES = [
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

const MessageBubble = ({ item }: { item: typeof MESSAGES[0] }) => {
  return (
    <View style={[styles.messageRow, item.isMe ? styles.messageRowMe : styles.messageRowOther]}>
       {item.isMe ? (
           <LinearGradient
            colors={['#c451c9', '#a22Ac9']} // Purple gradient for sent messages
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.bubbleMe]}
           >
             <Text style={styles.messageTextMe}>{item.text}</Text>
             <Text style={styles.timeTextMe}>{item.time}</Text>
           </LinearGradient>
       ) : (
           <View style={[styles.bubble, styles.bubbleOther]}>
             <Text style={styles.messageTextOther}>{item.text}</Text>
             <Text style={styles.timeTextOther}>{item.time}</Text>
           </View>
       )}
    </View>
  );
};

import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList, SCREEN_NAMES } from "../../navigation/Routes";

type NavigationProp = StackNavigationProp<AppStackParamList>;
type ChatDetailRouteProp = RouteProp<AppStackParamList, typeof SCREEN_NAMES.CHAT_DETAIL>;

export function ChatDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChatDetailRouteProp>();
  const { name, avatar } = route.params || { name: "Chat", avatar: "https://i.pravatar.cc/150" };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <ChevronLeft size={28} color={Theme.colors.foreground || 'white'} />
            </TouchableOpacity>
            <View style={styles.avatarContainer}>
                <Image 
                    source={{ uri: avatar }} 
                    style={styles.avatar} 
                />
                <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.headerInfo}>
                <Text style={styles.headerName}>{name}</Text>
                <Text style={styles.headerStatus}>Online</Text>
            </View>
        </View>
        
        <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon}>
                <Video size={24} color={Theme.colors.foreground || 'white'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
                <Phone size={24} color={Theme.colors.foreground || 'white'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
                <Search size={24} color={Theme.colors.foreground || 'white'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
                <MoreVertical size={24} color={Theme.colors.foreground || 'white'} />
            </TouchableOpacity>
        </View>
      </View>

      {/* Message List */}
      <FlatList
        data={MESSAGES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
  },
  backButton: {
      padding: 8,
  },
  avatarContainer: {
      position: 'relative',
      marginRight: 10,
  },
  avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
  },
  onlineIndicator: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#10B981', // Green
      borderWidth: 1.5,
      borderColor: Theme.colors.background,
  },
  headerInfo: {
      justifyContent: 'center',
  },
  headerName: {
      fontSize: 16,
      fontWeight: '600',
      color: Theme.colors.foreground || 'white',
  },
  headerStatus: {
      fontSize: 12,
      color: Theme.colors.mutedForeground || '#aaa',
  },
  headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  headerIcon: {
      padding: 8,
      marginLeft: 4,
  },
  
  listContent: {
      padding: 16,
      paddingBottom: 40,
  },
  messageRow: {
      marginBottom: 16,
      flexDirection: 'row',
  },
  messageRowMe: {
      justifyContent: 'flex-end',
  },
  messageRowOther: {
      justifyContent: 'flex-start',
  },
  bubble: {
      maxWidth: '80%',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
  },
  bubbleMe: {
      borderBottomRightRadius: 2,
  },
  bubbleOther: {
      backgroundColor: '#2A2A3C', // Dark gray/navy
      borderTopLeftRadius: 2, // Optional style choice
  },
  messageTextMe: {
      color: 'white',
      fontSize: 15,
      marginBottom: 4,
  },
  messageTextOther: {
      color: 'white', // or Theme.colors.foreground
      fontSize: 15,
      marginBottom: 4,
  },
  timeTextMe: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 10,
      alignSelf: 'flex-end',
  },
  timeTextOther: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 10,
      alignSelf: 'flex-start',
  },
});
