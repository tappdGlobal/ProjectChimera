// src/components/ui/Sheet.tsx (Side Drawer/Modal Implementation)

import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from "react-native";
import Modal from "react-native-modal";
import { X } from "lucide-react-native"; // XIcon equivalent
import { Theme } from "../../styles/Theme";

const { width, height } = Dimensions.get("window");

// --- 1. Component Props Mapping ---

interface SheetRootProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SheetContentProps {
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string; // Ignore className
  style?: ViewStyle;
}

interface SheetHeaderProps {
  children: React.ReactNode;
  className?: string; // Ignore className
}

// --- 2. Custom Sheet Context ---
const SheetContext = React.createContext<{
  isOpen: boolean;
  onClose: () => void;
} | null>(null);

// --- 3. Sheet Root Component ---
function Sheet({ open, onOpenChange, children }: SheetRootProps) {
  const onClose = useCallback(() => onOpenChange(false), [onOpenChange]);
  const contextValue = useMemo(
    () => ({ isOpen: open, onClose }),
    [open, onClose]
  );

  // Sheet component only manages open state and provides context
  return (
    <SheetContext.Provider value={contextValue}>
      {children}
    </SheetContext.Provider>
  );
}

// --- 4. Sheet Content Component (The core Modal logic) ---
function SheetContent({ children, side = "right", style }: SheetContentProps) {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error("SheetContent must be used within a Sheet component");
  }

  const { isOpen, onClose } = context;

  // --- Animation and Position Mapping (Web CSS to RN Modal) ---
  const modalProps = useMemo(() => {
    let positionStyle: ViewStyle = {};
    let animationIn: any;
    let animationOut: any;
    let contentSize: ViewStyle = {};
    let justifyContent:
      | "center"
      | "flex-start"
      | "flex-end"
      | "space-between"
      | "space-around"
      | "space-evenly" = "center";

    // Standard width for side sheets is w-3/4 (75% of screen width)
    const sideWidth = width * 0.75;

    switch (side) {
      case "right":
        justifyContent = "flex-end"; // Pushes content to the right
        animationIn = "slideInRight";
        animationOut = "slideOutRight";
        contentSize = { width: sideWidth, height: "100%" };
        positionStyle = { margin: 0 };
        break;
      case "left":
        justifyContent = "flex-start"; // Pushes content to the left
        animationIn = "slideInLeft";
        animationOut = "slideOutLeft";
        contentSize = { width: sideWidth, height: "100%" };
        positionStyle = { margin: 0 };
        break;
      case "top":
      case "bottom":
        // For top/bottom, justifyContent is 'flex-start'/'flex-end'
        animationIn = side === "top" ? "slideInDown" : "slideInUp";
        animationOut = side === "top" ? "slideOutUp" : "slideOutDown";
        contentSize = { width: "100%", height: "auto" };
        positionStyle = {
          margin: 0,
          justifyContent: side === "top" ? "flex-start" : "flex-end",
        };
        break;
    }

    return {
      justifyContent,
      animationIn,
      animationOut,
      contentSize,
      positionStyle,
    };
  }, [side]);

  return (
    <Modal
      isVisible={isOpen}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={
        side === "right" ? ["right"] : side === "left" ? ["left"] : undefined
      }
      style={[
        modalProps.positionStyle,
        { justifyContent: modalProps.justifyContent },
      ]}
      backdropOpacity={0.5} // bg-black/50
      animationIn={modalProps.animationIn}
      animationOut={modalProps.animationOut}
      animationInTiming={500} // duration-500
      animationOutTiming={300} // duration-300
    >
      <View
        style={[
          styles.contentBase,
          modalProps.contentSize,
          side === "right" && styles.contentRight,
          side === "left" && styles.contentLeft,
          side === "top" && styles.contentTop,
          side === "bottom" && styles.contentBottom,
          style,
        ]}
      >
        {children}

        {/* Close Button (XIcon equivalent) */}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={20} color={Theme.colors.foreground} />
          {/* <Text style={styles.srOnly}>Close</Text> */}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// --- 5. Supporting Components ---

// SheetTrigger is just a button in the parent that calls onOpenChange(true)
const SheetTrigger: React.FC<React.ComponentProps<typeof TouchableOpacity>> = ({
  children,
  onPress,
  ...props
}) => {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error("SheetTrigger must be used within a Sheet component");
  }

  const handlePress = (e: GestureResponderEvent) => {
    context.onClose(); // Close the sheet
    if (onPress) {
      onPress(e);
    }
  };

  // We need to use the actual button element in ExploreAll.tsx, so we cannot wrap it here.
  // Instead, the parent component must manually handle the open state change on press.
  // This component acts as a conceptual wrapper only.
  return <>{children}</>;
};

// SheetHeader
function SheetHeader({ children }: SheetHeaderProps) {
  return <View style={styles.header}>{children}</View>;
}

// SheetTitle (Text component)
function SheetTitle({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle;
}) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

// SheetDescription (Text component)
function SheetDescription({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle;
}) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

// --- 6. Stylesheet ---

const styles = StyleSheet.create({
  contentBase: {
    backgroundColor: Theme.colors.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    padding: 16, // Default padding for content
  },
  contentRight: {
    borderLeftWidth: 1,
    borderColor: Theme.colors.border,
  },
  contentLeft: {
    borderRightWidth: 1,
    borderColor: Theme.colors.border,
  },
  contentTop: {
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  contentBottom: {
    borderTopWidth: 1,
    borderColor: Theme.colors.border,
  },
  closeButton: {
    position: "absolute",
    top: 16, // top-4
    right: 16, // right-4
    width: 32, // size-8 approx
    height: 32,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
  },
  header: {
    flexDirection: "column",
    gap: 6, // gap-1.5
    padding: 16, // p-4
  },
  title: {
    fontSize: 18,
    fontWeight: "600", // font-semibold
    color: Theme.colors.foreground,
  },
  description: {
    fontSize: 14, // text-sm
    color: Theme.colors.mutedForeground, // text-muted-foreground
  },
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: "hidden",
  },
});

export {
  Sheet,
  SheetTrigger, // Used conceptually, but press handled by parent
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  // SheetClose, SheetPortal, SheetOverlay, SheetFooter are often omitted or simplified in RN
};
