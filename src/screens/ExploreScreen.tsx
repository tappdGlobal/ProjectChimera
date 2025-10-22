// src/screens/ExploreScreen.tsx

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExploreAllScreen } from "./ExploreAllScreen"; // The detailed list view
import { EventCategories } from "../components/common/EventCategories"; // The initial category list
import { Header } from "../components/common/Header";
import { Theme } from "../styles/Theme";
import { RecommendedEvents } from "../components/common/RecommendedEvents"; // <<< NEW IMPORT
import { TrendingEvents } from "../components/common/TrendingEvents"; // <<< NEW IMPORT
import { WishlistedEvents } from "../components/common/WishlistedEvents"; // <<< NEW IMPORT

// This component acts as the root for the 'Explore' tab in the Bottom Navigator.
export function ExploreScreen() {
  // State to manage which nested view is currently visible.
  const [showExploreAll, setShowExploreAll] = useState(false);
  // State to hold the currently selected category from EventCategories or ExploreAll.
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Function to transition from the main view to the detailed ExploreAll view.
  const handleExploreAllClick = () => {
    setShowExploreAll(true);
    setSelectedCategory(null); // Clear category selection on view change
  };

  // Function to handle back action from ExploreAll, returning to the main view.
  const handleBack = () => {
    setShowExploreAll(false);
    setSelectedCategory(null);
  };

  // Function to handle a category selection (used in both views).
  const handleCategorySelect = (category: string) => {
    // In a real app, this would navigate to a third screen (Event Details/List)
    setSelectedCategory(category);
    // For now, we'll just log it or potentially navigate to a placeholder screen.
    console.log(`Selected Category: ${category}`);
  };

  // If we are in the detailed "Explore All" view
  if (showExploreAll) {
    return (
      <ExploreAllScreen
        onBack={handleBack}
        onCategorySelect={handleCategorySelect}
      />
    );
  }

  // If we are in the initial main view (placeholder for other content)
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Use a single ScrollView to contain all primary elements (Header, Categories, etc.) */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* 1. HEADER (The Welcome Message, Logo, Search Bar) */}
        <Header
          onProfileClick={() => console.log("Navigate to Profile")}
          onSettingsClick={() => console.log("Navigate to Settings")}
          onNotificationClick={() => console.log("Navigate to Notifications")}
        />

        {/* 2. EVENT CATEGORIES (Horizontal scroll list) */}
        <EventCategories
          onCategorySelect={handleCategorySelect} // Will need to handle actual navigation later
          onExploreAllClick={handleExploreAllClick}
        />

        {/* 3. RECOMMENDED EVENTS (Horizontal scroll list) */}
        <RecommendedEvents
          onEventSelect={handleCategorySelect} // Use generic select handler for now
          onExploreAllClick={handleExploreAllClick}
        />

        {/* 4. TRENDING EVENTS (Horizontal scroll list) */}
        <TrendingEvents
          onEventSelect={handleCategorySelect}
          onExploreAllClick={handleExploreAllClick}
        />

        {/* 5. WISHLISTED EVENTS (Horizontal scroll list) */}
        <WishlistedEvents
          onEventSelect={handleCategorySelect}
          onExploreAllClick={handleExploreAllClick}
        />

        {/* Removed generic contentPlaceholder */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  contentPlaceholder: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: Theme.colors.mutedForeground,
    fontSize: 16,
    marginBottom: 8,
  },
  subPlaceholderText: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
    textAlign: "center",
  },
});
