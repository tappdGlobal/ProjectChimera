// src/screens/EngageScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { Theme } from "../styles/Theme";

// Engage Sub-Sections (Importing the new stubs)
import { ChatSection } from "../components/engage/ChatSection";
import { PreferableMatchSection } from "../components/engage/PreferableMatchSection";
import { EventInteractionSection } from "../components/engage/EventInteractionSection";
import { TapToConnectSection } from "../components/engage/TapToConnectSection";

export function EngageScreen() {
  const [activeSection, setActiveSection] = useState<
    "chat" | "match" | "interaction" | "connect"
  >("interaction");

  const menuItems = [
    { id: "chat" as const, label: "Chat", component: ChatSection },
    {
      id: "match" as const,
      label: "Preferable Match",
      component: PreferableMatchSection,
    },
    {
      id: "interaction" as const,
      label: "Event Interaction",
      component: EventInteractionSection,
    },
    {
      id: "connect" as const,
      label: "Tap to Connect",
      component: TapToConnectSection,
    },
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
        return <EventInteractionSection />;
    }
  };

  return (
    <SafeAreaView style={styles.flex1} edges={["top"]}>
      <View style={styles.mainContainer}>
        {/* Fixed Top Menu Bar */}
        <View style={styles.menuBar}>
          {/* ScrollView for Horizontal Menu */}
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
                  style={[
                    styles.menuButton,
                    activeSection === item.id && styles.menuButtonActive,
                  ]}
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

        {/* Section Content */}
        <View style={styles.contentContainer}>{renderSection()}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  mainContainer: { flex: 1, backgroundColor: Theme.colors.background },
  menuBar: {
    backgroundColor: Theme.colors.background,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
    paddingVertical: 8,
  },
  menuScrollContent: { justifyContent: "center", paddingHorizontal: 16 },
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
    minHeight: 0,
    height: "auto",
  },
  menuButtonActive: { backgroundColor: Theme.colors.primary },
  menuButtonTextActive: { color: Theme.colors.primaryForeground, fontSize: 12 },
  menuButtonTextInactive: { color: Theme.colors.mutedForeground, fontSize: 12 },
  contentContainer: { flex: 1, overflow: "hidden" },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { color: Theme.colors.mutedForeground, fontSize: 20 },
});
