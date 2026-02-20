import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RecommendedEvents } from "../common/RecommendedEvents";
import { TrendingEvents } from "../common/TrendingEvents";
import { WishlistedEvents } from "../common/WishlistedEvents";
import { EventCategories } from "./EventCategories";

import { getPopularWishlistApi } from "../../api/wishlistApi";
import { Theme } from "../../styles/Theme";
import {
  getRecommendedFeedApi,
  getTrendingFeedApi,
} from "../../api/feedApi";

import { FeedEvent } from "../../types/feedTypes";

import {
  ExploreStackParamList,
  SCREEN_NAMES,
} from "../../navigation/Routes";

type NavigationProp = NativeStackNavigationProp<
  ExploreStackParamList,
  typeof SCREEN_NAMES.EXPLORE_HOME
>;

interface ExploreTabContentProps {
  onEventSelect?: (event: FeedEvent) => void;
  onExploreAllClick?: () => void;
  searchQuery?: string;
}

export function ExploreTabContent({
  onEventSelect,
  onExploreAllClick,
  searchQuery = "",
}: ExploreTabContentProps) {
  const navigation = useNavigation<NavigationProp>();

  const [recommendedData, setRecommendedData] = useState<FeedEvent[]>([]);
  const [trendingData, setTrendingData] = useState<FeedEvent[]>([]);
  const [wishlistData, setWishlistData] = useState<FeedEvent[]>([]);

  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  /* ================= INITIAL FEED LOAD ================= */
const fetchAllFeeds = async () => {
  try {
    setRecommendedLoading(true);
    setTrendingLoading(true);
    setWishlistLoading(true);

    const [
      recommendedResponse,
      trendingResponse,
      wishlistResponse,
    ] = await Promise.all([
      getRecommendedFeedApi(),
      getTrendingFeedApi(),
      getPopularWishlistApi(),
    ]);

    setRecommendedData(recommendedResponse);
    setTrendingData(trendingResponse);
    setWishlistData(wishlistResponse);

  } catch (error) {
    console.error("Error fetching feeds:", error);
  } finally {
    setRecommendedLoading(false);
    setTrendingLoading(false);
    setWishlistLoading(false);
  }
};


useEffect(() => {
  fetchAllFeeds();
}, []);

  /* ================= NORMAL EXPLORE VIEW ================= */

  return (
    <View style={styles.container}>
      <EventCategories
        onCategorySelect={(category) => {
          navigation.navigate(SCREEN_NAMES.CATEGORY_EVENTS, {
            category,
          });
        }}
      />

      <RecommendedEvents
        events={recommendedData}
        loading={recommendedLoading}
        onEventSelect={onEventSelect}
        searchQuery={searchQuery}
      />

      <TrendingEvents
        events={trendingData}
        loading={trendingLoading}
        onEventSelect={onEventSelect}
        searchQuery={searchQuery}
      />

      <WishlistedEvents
        events={wishlistData}
        loading={wishlistLoading}
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