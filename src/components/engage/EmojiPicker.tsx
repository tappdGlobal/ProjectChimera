// src/components/engage/EmojiPicker.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Button } from "../ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { Smile } from "lucide-react-native";
import { Theme } from "../../styles/Theme";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  trigger?: React.ReactNode;
}

const emojiCategories = {
  Smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
  ],
  Hearts: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
  ],
  Gestures: [
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👏",
    "🙌",
    "🤲",
  ],
  Objects: [
    "🎵",
    "🎶",
    "🎤",
    "🎧",
    "📱",
    "💻",
    "⌚",
    "📷",
    "🎬",
    "📺",
    "🎮",
    "🕹️",
    "🎲",
    "♠️",
    "♥️",
    "♦️",
    "♣️",
    "🃏",
    "🀄",
    "🎯",
  ],
  Food: [
    "🍕",
    "🍔",
    "🍟",
    "🌭",
    "🥪",
    "🌮",
    "🌯",
    "🥙",
    "🥚",
    "🍳",
    "🥘",
    "🍲",
    "🥗",
    "🍿",
    "🧈",
    "🍞",
    "🥖",
    "🥨",
    "🧀",
    "🥞",
  ],
  Activities: [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🥎",
    "🎾",
    "🏐",
    "🏉",
    "🥏",
    "🎱",
    "🪀",
    "🏓",
    "🏸",
    "🏒",
    "🏑",
    "🥍",
    "🏏",
    "🪃",
    "🥅",
    "⛳",
  ],
  Nature: [
    "🌺",
    "🌸",
    "🌼",
    "🌻",
    "🌷",
    "⚘",
    "💐",
    "🌹",
    "🥀",
    "🌊",
    "💧",
    "🌀",
    "🌈",
    "☀️",
    "🌤️",
    "⛅",
    "🌦️",
    "🌧️",
    "⛈️",
    "🌩️",
  ],
  Symbols: [
    "💯",
    "💫",
    "⭐",
    "🌟",
    "✨",
    "⚡",
    "💥",
    "💢",
    "💨",
    "💦",
    "💤",
    "🕳️",
    "💣",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
  ],
};

export function EmojiPicker({ onEmojiSelect, trigger }: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState("Smileys");

  const defaultTrigger = (
    <Button variant="ghost" size="icon" style={styles.defaultTrigger}>
      <Smile size={20} color={Theme.colors.mutedForeground} />
    </Button>
  );

  const PopoverContentWrapper = (
    <View style={styles.contentWrapper}>
      {/* Category Tabs */}
      <View style={styles.categoryTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {Object.keys(emojiCategories).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              style={
                [
                  styles.categoryButtonBase,
                  selectedCategory === category
                    ? styles.categoryButtonActive
                    : styles.categoryButtonInactive,
                ] as const
              }
            >
              {category}
            </Button>
          ))}
        </ScrollView>
      </View>

      {/* Emoji Grid */}
      <ScrollView style={styles.emojiGridScroll}>
        <View style={styles.emojiGrid}>
          {emojiCategories[
            selectedCategory as keyof typeof emojiCategories
          ].map((emoji, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onEmojiSelect(emoji)}
              style={styles.emojiButton}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger || defaultTrigger}</PopoverTrigger>
      <PopoverContent>{PopoverContentWrapper}</PopoverContent>
    </Popover>
  );
}

const styles = StyleSheet.create({
  defaultTrigger: { padding: 4, height: 32, width: 32 },
  contentWrapper: { maxHeight: 300, width: "100%", overflow: "hidden" },
  categoryTabsContainer: {
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
    paddingVertical: 8,
  },
  categoryScroll: { flexDirection: "row", gap: 8, paddingHorizontal: 8 },
  categoryButtonBase: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  categoryButtonActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  categoryButtonInactive: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  emojiGridScroll: { padding: 8 },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // Aligns emojis into a grid
    gap: 8,
  },
  emojiButton: {
    width: "10%", // Allows 8 emojis per row (8 * 10% = 80%, leaving 20% for gaps)
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    marginVertical: 4,
  },
  emojiText: {
    fontSize: 24,
  },
});
