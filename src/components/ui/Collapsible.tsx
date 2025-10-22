// src/components/ui/Collapsible.tsx

import React, { useCallback, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from "react-native";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CollapsibleProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string; // Ignore
}

// Context to manage state
const CollapsibleContext = React.createContext<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

// --- 1. Collapsible Root ---
export function Collapsible({
  children,
  open,
  onOpenChange,
}: CollapsibleProps) {
  const contextValue = useMemo(
    () => ({ isOpen: open, onOpenChange }),
    [open, onOpenChange]
  );

  return (
    <CollapsibleContext.Provider value={contextValue}>
      <View>{children}</View>
    </CollapsibleContext.Provider>
  );
}

// --- 2. Collapsible Trigger ---
interface CollapsibleTriggerProps {
  children: React.ReactNode;
  className?: string; // Ignore
}

export function CollapsibleTrigger({ children }: CollapsibleTriggerProps) {
  const context = React.useContext(CollapsibleContext);
  if (!context)
    throw new Error("CollapsibleTrigger must be used within a Collapsible");

  const handlePress = useCallback(() => {
    // Animate the content size change before updating state
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    context.onOpenChange(!context.isOpen);
  }, [context]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={styles.triggerBase}
    >
      {children}
    </TouchableOpacity>
  );
}

// --- 3. Collapsible Content ---
export function CollapsibleContent({ children }: CollapsibleContentProps) {
  const context = React.useContext(CollapsibleContext);
  if (!context)
    throw new Error("CollapsibleContent must be used within a Collapsible");

  if (!context.isOpen) {
    return null; // Don't render content when closed
  }

  // The animation logic is managed by LayoutAnimation in the Trigger
  return <View onLayout={() => {}}>{children}</View>;
}

const styles = StyleSheet.create({
  triggerBase: {
    width: "100%",
  },
});
