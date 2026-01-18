import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Theme } from "../../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import MatchProfile from "./MatchProfile";

/* ---------------- MOCK DATA ---------------- */
const PROFILES = [
  {
    id: "1",
    name: "Aarav Mehta",
    age: 27,
    role: "Tech Entrepreneur",
    category: "Business",
    categoryColor: "#c451c9",
    images: [
      { uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800" },
      { uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800" },
      { uri: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800" },
    ],
  },
  {
    id: "2",
    name: "Sophia Kapoor",
    age: 24,
    role: "Fashion Stylist",
    category: "Date",
    categoryColor: "#c451c9",
    images: [
      { uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800" },
      { uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800" },
      { uri: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800" },
    ],
  },
  {
    id: "3",
    name: "Kabir Singh",
    age: 30,
    role: "Investment Banker",
    category: "Casual",
    categoryColor: "#c451c9",
    images: [
      { uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800" },
      { uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800" },
      { uri: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800" },
    ],
  },
  {
    id: "4",
    name: "Meera Rathi",
    age: 26,
    role: "Travel Blogger",
    category: "Travel Buddy",
    categoryColor: "#c451c9",
    images: [
      { uri: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800" },
      { uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800" },
      { uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800" },
    ],
  },
  {
    id: "5",
    name: "Rohan Malhotra",
    age: 28,
    role: "DJ & Music Producer",
    category: "Friend",
    categoryColor: "#c451c9",
    images: [
      { uri: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800" },
      { uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800" },
      { uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800" },
    ],
  },
  {
    id: "6",
    name: "Alisha Verma",
    age: 23,
    role: "Marketing Analyst",
    category: "Date",
    categoryColor: "#c451c9",
    images: [
      { uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800" },
      { uri: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800" },
      { uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800" },
    ],
  },
];

/* ---------------- LAYOUT CALC ---------------- */
const { width } = Dimensions.get("window");
const CARD_GAP = 16;
const ITEM_WIDTH = (width - 16 * 2 - CARD_GAP) / 2;

/* ---------------- CARD ---------------- */
const ProfileCard = ({ item, onPress }: any) => (
  <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
    <Image source={item.images[0]} style={styles.cardImage} />

    <LinearGradient
      colors={["transparent", "rgba(10,3,34,0.95)"]}
      style={styles.gradientOverlay}
    >
      <Text style={styles.nameText}>{item.name}, {item.age}</Text>
      <Text style={styles.roleText}>{item.role}</Text>
      <Text style={[styles.categoryText, { color: item.categoryColor }]}>
        {item.category}
      </Text>
    </LinearGradient>
  </TouchableOpacity>
);

/* ---------------- MAIN ---------------- */
export function PreferableMatchSection() {
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  if (selectedProfile) {
    return (
      <MatchProfile
        images={selectedProfile.images}
        name={selectedProfile.name}
        age={selectedProfile.age}
        title={selectedProfile.role}
        tag={selectedProfile.category}
        about="Explorer at heart."
        height="5'6"
        fitness="Active"
        diet="Vegetarian"
        smoking="No"
        drinking="Occasionally"
        onReject={() => setSelectedProfile(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Preferable Match</Text>
      </View>

      {/* Full-width divider */}
      <View style={styles.headerDivider} />

      {/* Grid */}
      <FlatList
        data={PROFILES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ProfileCard
            item={item}
            onPress={() => setSelectedProfile(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "Theme.colors.background",
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Theme.colors.foreground,
  },

  headerDivider: {
    height: 1,
    width: "100%",
    backgroundColor: Theme.colors.border,
    marginBottom: Theme.spacing.m,
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
    overflow: "hidden",
    backgroundColor: Theme.colors.muted,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
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
    padding: 12,
    justifyContent: "flex-end",
  },

  nameText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  roleText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
