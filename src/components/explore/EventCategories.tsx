import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Theme } from "../../styles/Theme";
import { useNavigation } from "@react-navigation/native";

interface EventCategoriesProps {
  onCategorySelect?: (category: string) => void;
}

const categories = [
  "Date Night",
  "Pool Party",
  "House Party",
  "Rooftop Parties",
  "Corporate Conferences",
  "Startup Pitch Nights",
  "Yoga Retreats",
  "Sound Healing",
  "Football Matches",
  "Cricket Screenings",
  "Coding Bootcamps",
  "Tech Hackathons",
  "Charity Galas",
  "Fundraisers",
  "Kids Theatre",
  "Educational Fun Events",
  "New Year's Eve Parties",
  "Theatre Plays",
  "Stand-up Comedy",
  "Dance Performances",
  "Live Bands",
  "DJ & EDM Nights",
  "Cocktail Nights",
];

export function EventCategories({
  onCategorySelect,
}: EventCategoriesProps) {

  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const visibleCategories = categories.slice(0, 3);

  const handlePress = (category: string) => {
    setActiveCategory(category);
    onCategorySelect?.(category);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Categories</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {visibleCategories.map((category) => {
          const isActive = activeCategory === category;

          return (
            <TouchableOpacity
              key={category}
              style={[styles.chip, isActive && styles.activeChip]}
              onPress={() => handlePress(category)}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive && styles.activeChipText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Explore All Button */}

        <TouchableOpacity
          style={styles.exploreChip}
          onPress={() => navigation.navigate("AllCategories")}
        >
          <Text style={styles.exploreText}>Explore All →</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },

  title: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  scrollContent: {
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 12,
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  activeChip: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },

  chipText: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "500",
  },
  exploreChip: {
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 999,
  backgroundColor: Theme.colors.secondary,
},

exploreText: {
  color: Theme.colors.primary,
  fontWeight: "600",
},
  activeChipText: {
    color: "#ffffff",
  },
});