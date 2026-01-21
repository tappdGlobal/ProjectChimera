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

import { ExploreStackParamList, SCREEN_NAMES } from "../navigation/Routes";

type ExploreNavigationProp = NativeStackNavigationProp<
  ExploreStackParamList,
  "ExploreScreen"
>;

export function ExploreScreen() {
  const navigation = useNavigation<ExploreNavigationProp>();

  const [showExploreAll, setShowExploreAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  type ExploreTabKey = "explore" | "map" | "bookings";
  const [activeTab, setActiveTab] = useState<ExploreTabKey>("explore");

  const handleExploreAllClick = () => {
    setShowExploreAll(true);
  };

  const handleBack = () => {
    setShowExploreAll(false);
  };

  const handleCategorySelect = (category: string) => {
    navigation.navigate("EventDiscovery", { category });
  };

  const handleEventSelect = (event: any) => {
    navigation.navigate("EventDetail", { event });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  if (showExploreAll) {
    return (
      <ExploreAllScreen
        onBack={handleBack}
        onCategorySelect={handleCategorySelect}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* HEADER */}
        <Header
          onProfileClick={() => navigation.getParent()?.navigate(SCREEN_NAMES.PROFILE)}
          onSettingsClick={() =>
          navigation.getParent()?.navigate(SCREEN_NAMES.PROFILE, {
            initialTab: "settings",
          })
          }
          onNotificationClick={() => navigation.getParent()?.navigate(SCREEN_NAMES.NOTIFICATIONS)}
          onSearchChange={handleSearchChange}
        />

        <View style={{ paddingHorizontal: Theme.spacing.m }}>
          <ExploreTab activeTab={activeTab} onChange={setActiveTab} />
        </View>

        <View style={{ flex: 1 }}>
          {activeTab === "explore" && (
            <ExploreTabContent
              onCategorySelect={handleCategorySelect}
              onEventSelect={handleEventSelect}
              onExploreAllClick={handleExploreAllClick}
              searchQuery={searchQuery}
            />
          )}
          

          {activeTab === "map" && <MapTabContent />}

          {activeTab === "bookings" && <BookingTabContent />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
});
