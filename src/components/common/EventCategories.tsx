// src/components/common/EventCategories.tsx

import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
// Note: Badge is not actually used in this Figma code, but imported. We will keep the import for structure.
// import { Badge } from '../ui/Badge'; // Keeping import structure ready
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";

const categories = [
  "Date Night",
  "Pool Party",
  "House Party",
  "Music Events",
  "Lowkey Sufi Events",
  "Clubbing",
  "Movie Night",
];

interface EventCategoriesProps {
  onCategorySelect?: (category: string) => void;
  onExploreAllClick?: () => void;
}

export function EventCategories({
  onCategorySelect,
  onExploreAllClick,
}: EventCategoriesProps) {
  // This array will hold the actual button components
  const categoryButtons = categories.map((category, index) => {
    // Mimic the conditional CSS classes from the Figma code:
    // index === 2 ? 'gradient-primary shadow-lg' : 'bg-white/10 hover:gradient-primary-hover border border-white/20'
    const isPrimary = index === 2;

    return (
      <TouchableOpacity
        key={index}
        onPress={() => onCategorySelect?.(category)}
        style={[
          styles.categoryButton,
          isPrimary ? styles.primaryCategory : styles.secondaryCategory,
        ]}
        activeOpacity={0.7}
      >
        <Text style={styles.categoryText}>{category}</Text>
      </TouchableOpacity>
    );
  });

  // Explore All Button
  const exploreAllButton = (
    <TouchableOpacity
      onPress={() => onExploreAllClick?.()}
      style={[styles.categoryButton, styles.exploreAllButton]}
      activeOpacity={0.7}
    >
      <Text style={styles.exploreAllText}>Explore All</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Event Categories</Text>

      {/* ScrollView for Horizontal List (replacing overflow-x-auto scrollbar-hide) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {categoryButtons}
        {exploreAllButton}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16, // px-4
    paddingVertical: 24, // py-6
  },
  headerText: {
    marginBottom: 16, // mb-4
    fontSize: 18,
    color: Theme.colors.foreground, // text-white
    fontWeight: "bold",
  },
  scrollView: {
    // No specific style needed here, all done in contentContainerStyle
  },
  scrollContent: {
    flexDirection: "row",
    gap: 12, // gap-3
    paddingBottom: 8, // pb-2
  },
  categoryButton: {
    paddingHorizontal: 16, // px-4
    paddingVertical: 8, // py-2
    borderRadius: 9999, // rounded-full
    alignSelf: "flex-start", // flex-shrink-0
  },
  categoryText: {
    color: Theme.colors.foreground, // text-white
    fontSize: 14, // text-sm
    // whitespace-nowrap is handled by flex-shrink-0 and having one <Text> element
  },
  // index === 2: gradient-primary shadow-lg
  primaryCategory: {
    // TEMPORARY: using solid primary color for gradient placeholder
    backgroundColor: GRADIENT_COLORS.primary[1],
    // RN doesn't have built-in shadow-lg like CSS, using a simple shadow
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  // else: bg-white/10 hover:gradient-primary-hover border border-white/20
  secondaryCategory: {
    backgroundColor: Theme.colors.muted, // bg-white/10
    borderWidth: 1,
    borderColor: Theme.colors.border, // border-white/20
  },
  // Explore All button styles
  exploreAllButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Theme.colors.primary, // border border-primary
  },
  exploreAllText: {
    color: Theme.colors.primary, // text-primary
    fontSize: 14,
  },
});
