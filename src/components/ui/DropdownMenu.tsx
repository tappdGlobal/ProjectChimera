// src/components/ui/DropdownMenu.tsx (Simple Modal/State Implementation)

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ViewStyle,
  Dimensions,
} from "react-native";
import Modal from "react-native-modal";
import { Theme } from "../../styles/Theme";

const { height } = Dimensions.get("window");

// Context to manage dropdown open state
const DropdownContext = React.createContext<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

// --- DropdownMenu Root ---
interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DropdownContext.Provider value={{ isOpen, onOpenChange: setIsOpen }}>
      {children}
    </DropdownContext.Provider>
  );
}

// --- DropdownMenuTrigger (The Button that opens the menu) ---
interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean; // Ignore asChild
}

export function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  const context = React.useContext(DropdownContext);
  if (!context) return null;

  // We use the first child (the actual button/icon) to handle the press
  const child = React.Children.only(children) as React.ReactElement<any>;

  return React.cloneElement(child, {
    onPress: () => context.onOpenChange(true),
  });
}

// --- DropdownMenuContent (The list of items rendered in a Modal) ---
interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export function DropdownMenuContent({
  children,
  style,
}: DropdownMenuContentProps) {
  const context = React.useContext(DropdownContext);
  if (!context) return null;

  // Render content in a modal positioned near the top right
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
      <View style={[styles.contentBase, style]}>{children}</View>
    </Modal>
  );
}

// --- DropdownMenuItem (Individual list item) ---
interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function DropdownMenuItem({ children, onClick }: DropdownMenuItemProps) {
  const context = React.useContext(DropdownContext);
  if (!context) return null;

  const handlePress = () => {
    context.onOpenChange(false); // Close menu on item click
    onClick?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.itemBase}
      activeOpacity={0.8}
    >
      <Text style={styles.itemText}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-start",
    alignItems: "flex-end", // Position to the top right
    paddingTop: height * 0.1, // Offset from the top edge
    paddingRight: 16,
    margin: 0,
  },
  contentBase: {
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    minWidth: 180,
    overflow: "hidden",
    paddingVertical: 4,
  },
  itemBase: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itemText: {
    color: Theme.colors.foreground,
    fontSize: 14,
  },
});
