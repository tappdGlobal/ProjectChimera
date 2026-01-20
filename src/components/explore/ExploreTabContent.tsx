import React from "react";
import { View, StyleSheet } from "react-native";
import { EventCategories } from "../common/EventCategories";
import { RecommendedEvents } from "../common/RecommendedEvents";
import { TrendingEvents } from "../common/TrendingEvents";
import { WishlistedEvents } from "../common/WishlistedEvents";
import { Theme } from "../../styles/Theme";

interface ExploreTabContentProps {
  onCategorySelect?: (category: string) => void;
  onEventSelect?: (event: any) => void;
  onExploreAllClick?: () => void;
  searchQuery?: string;
}

export function ExploreTabContent({
  onCategorySelect,
  onEventSelect,
  onExploreAllClick,
  searchQuery = "",
}: ExploreTabContentProps) {
  return (
    <View style={styles.container}>
      <EventCategories
        onCategorySelect={onCategorySelect}
        onExploreAllClick={onExploreAllClick}
      />

      <RecommendedEvents
        onEventSelect={onEventSelect}        
        onExploreAllClick={onExploreAllClick}
        searchQuery={searchQuery}
      />

      <TrendingEvents
        onEventSelect={onEventSelect}        
        onExploreAllClick={onExploreAllClick}
        searchQuery={searchQuery}
      />

      <WishlistedEvents
        onEventSelect={onEventSelect}        
        onExploreAllClick={onExploreAllClick}
        searchQuery={searchQuery}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
});
