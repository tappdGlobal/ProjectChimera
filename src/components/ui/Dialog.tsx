// src/components/ui/Dialog.tsx (Centered Modal)

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
} from "react-native";
import Modal from "react-native-modal";
import { Theme } from "../../styles/Theme";

const { width } = Dimensions.get("window");

// --- 1. Dialog Root ---
interface DialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  style?: ViewStyle;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <Modal
      isVisible={open}
      onBackdropPress={() => onOpenChange(false)}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.7}
      style={styles.modal}
      useNativeDriverForBackdrop={true}
      // Note: We cannot wrap children in a View here, Modal requires children to be the content
    >
      {children}
    </Modal>
  );
}

// --- 2. Dialog Content (The Modal Box) ---
interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export function DialogContent({ children, style }: DialogContentProps) {
  return <View style={[styles.contentBase, style]}>{children}</View>;
}

// --- 3. Dialog Header ---
interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <View style={styles.headerBase}>{children}</View>;
}

// --- 4. Dialog Title ---
interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
  style?: TextStyle;
}

export function DialogTitle({ children, style }: DialogTitleProps) {
  return <Text style={[styles.titleBase, style]}>{children}</Text>;
}

// --- 5. Dialog Description ---
interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
  style?: TextStyle;
}

export function DialogDescription({ children, style }: DialogDescriptionProps) {
  return <Text style={[styles.descriptionBase, style]}>{children}</Text>;
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  // bg-background border-white/10 text-white max-w-sm mx-auto
  contentBase: {
    width: width * 0.85, // max-w-sm approximation
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.lg,
    padding: 24, // Consistent padding
  },
  headerBase: {
    marginBottom: 16,
  },
  titleBase: {
    fontSize: 20,
    fontWeight: "bold",
    color: Theme.colors.foreground,
    marginBottom: 4,
  },
  descriptionBase: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
  },
});
