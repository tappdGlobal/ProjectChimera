import React, { useState } from "react";
import { View, StyleSheet, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { Theme } from "../styles/Theme";

// Engage Sections
import { ChatSection } from "../components/engage/ChatSection";
import { PreferableMatchSection } from "../components/engage/PreferableMatchSection";
import { EventInteractionSection } from "../components/engage/EventInteractionSection";
import { TapToConnectSection } from "../components/engage/TapToConnectSection";
import { useAnalytics } from "../hooks/useAnalytics";

type SectionType = "chat" | "match" | "interaction" | "connect";

export function EngageScreen() {
  const [activeSection, setActiveSection] =
    useState<SectionType>("interaction");
  const { trackEvent } = useAnalytics("EngageScreen", {
    active_section: activeSection,
  });

  const menuItems: { id: SectionType; label: string }[] = [
    { id: "chat", label: "Chat" },
    { id: "match", label: "Preferable Match" },
    { id: "interaction", label: "Event Interaction" },
    { id: "connect", label: "Tap to Connect" },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "chat":
        return <ChatSection />;
      case "match":
        return <PreferableMatchSection />;
      case "interaction":
        return <EventInteractionSection />;
      case "connect":
        return <TapToConnectSection />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Status bar background fix */}
      <StatusBar
        backgroundColor={Theme.colors.background}
        barStyle="light-content"
      />

      <View style={styles.mainContainer}>
        {/* Top Menu Bar */}
        <View style={styles.menuBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.menuScrollContent}
          >
            <View style={styles.menuButtonContainer}>
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveSection(item.id)}
                  style={
                    activeSection === item.id
                      ? [styles.menuButton, styles.menuButtonActive]
                      : styles.menuButton
                  }
                  textStyle={
                    activeSection === item.id
                      ? styles.menuButtonTextActive
                      : styles.menuButtonTextInactive
                  }
                >
                  {item.label}
                </Button>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Active Section */}
        <View style={styles.contentContainer}>{renderSection()}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background, // ✅ removes white strip
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  menuBar: {
    backgroundColor: Theme.colors.background,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
    paddingVertical: 8,
  },
  menuScrollContent: {
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  menuButtonContainer: {
    flexDirection: "row",
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.md,
    padding: 4,
  },
  menuButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radius.sm,
    marginHorizontal: 2,
  },
  menuButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  menuButtonTextActive: {
    color: Theme.colors.primaryForeground,
    fontSize: 12,
  },
  menuButtonTextInactive: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },
  contentContainer: {
    flex: 1,
  },
});
