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
}

export function ExploreTabContent({
  onCategorySelect,
  onEventSelect,
  onExploreAllClick,
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
      />

      <TrendingEvents
        onEventSelect={onEventSelect}        
        onExploreAllClick={onExploreAllClick}
      />

      <WishlistedEvents
        onEventSelect={onEventSelect}        
        onExploreAllClick={onExploreAllClick}
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
