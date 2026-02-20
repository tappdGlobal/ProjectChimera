// src/screens/ExploreScreen.tsx

import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ExploreAllScreen } from "./ExploreAllScreen";
import { Header } from "../components/common/Header";
import { Theme } from "../styles/Theme";

import { ExploreTab } from "../components/explore/ExploreTabs";
import { ExploreTabContent } from "../components/explore/ExploreTabContent";
import { MapTabContent } from "../components/explore/MapTabContent";
import { BookingTabContent } from "../components/explore/BookingTabContent";
import ComingSoon from "../components/common/ComingSoon";

import {
  ExploreStackParamList,
  SCREEN_NAMES,
} from "../navigation/Routes";

import { useAnalytics } from "../hooks/useAnalytics";
import { FeedEvent } from "../types/feedTypes";

/* ================= NAVIGATION TYPE ================= */

type ExploreNavigationProp = NativeStackNavigationProp<
  ExploreStackParamList,
  typeof SCREEN_NAMES.EXPLORE_HOME
>;

export function ExploreScreen() {
  const navigation = useNavigation<ExploreNavigationProp>();

  const { trackEvent, trackSearch } =
    useAnalytics("ExploreScreen");

  const [showExploreAll, setShowExploreAll] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  type ExploreTabKey = "explore" | "map" | "bookings";

  const [activeTab, setActiveTab] =
    useState<ExploreTabKey>("explore");

  const [showComingSoon, setShowComingSoon] =
    useState(false);

  /* ================= HANDLERS ================= */

  const handleExploreAllClick = () => {
    setShowExploreAll(true);
  };

  const handleBack = () => {
    setShowExploreAll(false);
  };

  const handleCategorySelect = (category: string) => {
    trackEvent("category_selected", { category });

    navigation.navigate(
      SCREEN_NAMES.EVENT_DISCOVERY,
      { category }
    );
  };

  const handleEventSelect = (event: FeedEvent) => {
    trackEvent("event_selected", {
      event_id: event?.id,
      event_name: event?.eventName,
    });

    navigation.navigate(
      SCREEN_NAMES.EVENT_DETAIL,
      { event }
    );
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    if (query.length > 2) {
      trackSearch(query);
    }
  };

  /* ================= CONDITIONAL SCREEN ================= */

  if (showExploreAll) {
    return (
      <ExploreAllScreen
        onBack={handleBack}
        onCategorySelect={handleCategorySelect}
      />
    );
  }

  /* ================= MAIN SCREEN ================= */

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* HEADER */}
        <Header
          onProfileClick={() =>
            navigation
              .getParent()
              ?.navigate(SCREEN_NAMES.PROFILE)
          }
          onSettingsClick={() =>
            navigation
              .getParent()
              ?.navigate(SCREEN_NAMES.PROFILE)
          }
          onNotificationClick={() =>
            navigation
              .getParent()
              ?.navigate(
                SCREEN_NAMES.NOTIFICATIONS
              )
          }
          onSearchChange={handleSearchChange}
        />

        <View
          style={{
            paddingHorizontal: Theme.spacing.m,
          }}
        >
          <ExploreTab
            activeTab={activeTab}
            onChange={(tab) => {
              if (
                tab === "map" ||
                tab === "bookings"
              ) {
                setShowComingSoon(true);
              } else {
                setActiveTab(tab);
              }
            }}
          />
        </View>

        <View style={{ flex: 1 }}>
          {activeTab === "explore" && (
            <ExploreTabContent
              onEventSelect={handleEventSelect}
              onExploreAllClick={
                handleExploreAllClick
              }
              searchQuery={searchQuery}
            />
          )}

          {activeTab === "map" && (
            <MapTabContent />
          )}

          {activeTab === "bookings" && (
            <BookingTabContent />
          )}
        </View>
      </ScrollView>

      <ComingSoon
        visible={showComingSoon}
        onClose={() =>
          setShowComingSoon(false)
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
});