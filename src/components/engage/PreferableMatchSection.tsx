import React from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from "react-native";
import { Theme } from "../../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { Filter } from "lucide-react-native";

// Mock Data
const PROFILES = [
  {
    id: "1",
    name: "Aarav Mehta",
    age: 27,
    role: "Tech Entrepreneur",
    category: "Business",
    categoryColor: "#c451c9", // Magenta/Purple
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    name: "Sophia Kapoor",
    age: 24,
    role: "Fashion Stylist",
    category: "Date",
    categoryColor: "#c451c9",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    name: "Kabir Singh",
    age: 30,
    role: "Investment Banker",
    category: "Casual",
    categoryColor: "#c451c9",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    name: "Meera Rathi",
    age: 26,
    role: "Travel Blogger",
    category: "Travel Buddy",
    categoryColor: "#c451c9",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "5",
    name: "Rohan Malhotra",
    age: 28,
    role: "DJ & Music Producer",
    category: "Friend",
    categoryColor: "#c451c9",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "6",
    name: "Alisha Verma",
    age: 23,
    role: "Marketing Analyst",
    category: "Date",
    categoryColor: "#c451c9", // Purple
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
];

const { width } = Dimensions.get("window");
const CARD_MARGIN = 8;
const ITEM_WIDTH = (width - 32 - CARD_MARGIN * 2) / 2; // (Screen width - padding - gap) / 2

const ProfileCard = ({ item }: { item: typeof PROFILES[0] }) => {
  return (
    <TouchableOpacity style={styles.cardContainer}>
      <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
      <LinearGradient
        colors={["transparent", "rgba(10, 3, 34, 0.95)"]}
        style={styles.gradientOverlay}
      >
        <Text style={styles.nameText}>
          {item.name}, {item.age}
        </Text>
        <Text style={styles.roleText}>{item.role}</Text>
        <Text style={[styles.categoryText, { color: item.categoryColor }]}>
          {item.category}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export function PreferableMatchSection() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Preferable Match</Text>
        <TouchableOpacity>
          <Filter size={20} color={Theme.colors.foreground || 'white'} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={PROFILES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProfileCard item={item} />}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
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
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Theme.colors.foreground || 'white',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  cardContainer: {
    width: ITEM_WIDTH,
    height: 240,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: Theme.colors.muted,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: "flex-end",
    padding: 12,
  },
  nameText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  roleText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
