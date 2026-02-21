import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Theme } from "../../styles/Theme";

interface EventCategoriesProps {
  onCategorySelect?: (category: string) => void;
}

const categories = [
  "Music",
  "Sports",
  "Comedy",
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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
        {categories.map((category) => {
          const isActive = activeCategory === category;

          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.chip,
                isActive && styles.activeChip,
              ]}
              onPress={() => handlePress(category)}
              activeOpacity={0.85}
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

  activeChipText: {
    color: "#ffffff",
  },
});