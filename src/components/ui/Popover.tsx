// src/components/ui/Popover.tsx (Simplified for EmojiPicker)

import React, { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Modal from "react-native-modal";
import { Theme } from "../../styles/Theme";

const { height } = Dimensions.get("window");

// Context to manage popover state
const PopoverContext = React.createContext<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

// --- Popover Root ---
interface PopoverProps {
  children: React.ReactNode;
}

export function Popover({ children }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <PopoverContext.Provider value={{ isOpen, onOpenChange: setIsOpen }}>
      {children}
    </PopoverContext.Provider>
  );
}

// --- PopoverTrigger ---
interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean; // Ignore asChild
}

export function PopoverTrigger({ children }: PopoverTriggerProps) {
  const context = React.useContext(PopoverContext);
  if (!context) return null;

  const child = React.Children.only(children) as React.ReactElement<any>;

  return React.cloneElement(child, {
    onPress: () => context.onOpenChange(true),
  });
}

// --- PopoverContent ---
interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PopoverContent({ children }: PopoverContentProps) {
  const context = React.useContext(PopoverContext);
  if (!context) return null;

  // Render content in a Modal, typically positioned relative to the trigger
  return (
    <Modal
      isVisible={context.isOpen}
      onBackdropPress={() => context.onOpenChange(false)}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.1}
      style={styles.modal}
      useNativeDriverForBackdrop
    >
      <View style={styles.contentBase}>{children}</View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end", // Position content at the bottom
    alignItems: "center",
    paddingBottom: height * 0.1, // Offset from the bottom edge
    margin: 0,
  },
  contentBase: {
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.lg,
    width: "90%",
    maxHeight: "50%",
    overflow: "hidden",
  },
});
