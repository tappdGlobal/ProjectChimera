import React, { useMemo, useState } from "react";
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
import ComingSoon from "../common/ComingSoon";
import { MaterialCommunityIcons } from '@expo/vector-icons';


/* ---------------- MOCK DATA ---------------- */
const PROFILES = [
  {
    id: "1",
    name: "Aarav Mehta",
    age: 27,
    gender: "Male",
    lookingFor: "Business",
    distance: 5,
    interests: ["Startup", "Tech"],
    role: "Tech Entrepreneur",
    category: "Business",
    categoryColor: "#c451c9",
    images: [
      {
        uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800",
      },
    ],
  },
  {
    id: "2",
    name: "Sophia Kapoor",
    age: 24,
    gender: "Female",
    lookingFor: "Date",
    distance: 12,
    interests: ["Fashion", "Design"],
    role: "Fashion Stylist",
    category: "Date",
    categoryColor: "#c451c9",
    images: [
      {
        uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800",
      },
    ],
  },
  {
    id: "3",
    name: "Kabir Singh",
    age: 30,
    gender: "Male",
    lookingFor: "Casual",
    distance: 18,
    interests: ["Finance", "Fitness"],
    role: "Investment Banker",
    category: "Casual",
    categoryColor: "#c451c9",
    images: [
      {
        uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800",
      },
    ],
  },
  {
    id: "4",
    name: "Meera Rathi",
    age: 26,
    gender: "Female",
    lookingFor: "Travel Buddy",
    distance: 8,
    interests: ["Travel", "Photography"],
    role: "Travel Blogger",
    category: "Travel Buddy",
    categoryColor: "#c451c9",
    images: [
      {
        uri: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800",
      },
    ],
  },
];

/* ---------------- LAYOUT ---------------- */
const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 16 * 2 - 16) / 2;

/* ---------------- CARD ---------------- */
const ProfileCard = ({ item, onPress }: any) => (
  <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
    <Image source={item.images[0]} style={styles.cardImage} />
    <LinearGradient
      colors={["transparent", "rgba(10,3,34,0.95)"]}
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

/* ---------------- MAIN ---------------- */
export function PreferableMatchSection() {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  /* Toggle-style filters */
  const [filters, setFilters] = useState({
    age: false,
    gender: false,
    lookingFor: false,
    distance: false,
    interests: false,
  });

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /* Apply Filters */
  const filteredProfiles = useMemo(() => {
    return PROFILES.filter((p) => {
      if (filters.age && p.age > 26) return false;
      if (filters.gender && p.gender !== "Female") return false;
      if (filters.lookingFor && p.lookingFor !== "Date") return false;
      if (filters.distance && p.distance > 10) return false;
      if (filters.interests && !p.interests.includes("Fashion")) return false;
      return true;
    });
  }, [filters]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Preferable Match</Text>

        <TouchableOpacity onPress={() => setShowFilter((v) => !v)}>
         <MaterialCommunityIcons name="filter-outline" size={22} color={Theme.colors.foreground} />

        </TouchableOpacity>
      </View>

      {/* Filter Dropdown (Figma style) */}
      {showFilter && (
        <View style={styles.filterDropdown}>
          {[
            { key: "age", label: "Age Range" },
            { key: "gender", label: "Gender" },
            { key: "lookingFor", label: "Looking For" },
            { key: "distance", label: "Distance" },
            { key: "interests", label: "Interests" },
          ].map((item) => {
            const active = filters[item.key as keyof typeof filters];
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() =>
                  toggleFilter(item.key as keyof typeof filters)
                }
                style={styles.filterItem}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.headerDivider} />

      {/* Grid */}
      <FlatList
        data={filteredProfiles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ProfileCard
            item={item}
            onPress={() => setShowComingSoon(true)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      <ComingSoon
        visible={showComingSoon}
        onClose={() => setShowComingSoon(false)}
      />
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },

  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Theme.colors.foreground,
  },

  headerDivider: {
    height: 1,
    backgroundColor: Theme.colors.border,
  },

  filterDropdown: {
    position: "absolute",
    top: 56,
    right: 16,
    backgroundColor: "#1b1536",
    borderRadius: 12,
    paddingVertical: 8,
    width: 160,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    zIndex: 20,
  },

  filterItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  filterText: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
  },

  filterTextActive: {
    color: Theme.colors.primary,
    fontWeight: "600",
  },

  listContent: {
    padding: 16,
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
    height: 120,
    width: "100%",
    padding: 12,
    justifyContent: "flex-end",
  },

  nameText: {
    color: "#fff",
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
