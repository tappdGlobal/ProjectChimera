// src/components/ui/Accordion.tsx

import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./Collapsible"; // Reuse logic
import { ChevronDown } from "lucide-react-native";

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface AccordionTriggerProps {
  children: React.ReactNode; // Title content
  className?: string;
  isOpen?: boolean;
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

// Context for managing the currently open item (Single open item mode)
const AccordionContext = React.createContext<{
  activeItem: string | null;
  setActiveItem: (value: string) => void;
} | null>(null);

// --- 1. Accordion Root (Only supports single open item mode for simplicity) ---
export function Accordion({ children, type = "single", ...props }: any) {
  const [activeItem, setActiveItem] = React.useState<string | null>(null);

  const handleToggle = (value: string) => {
    setActiveItem((prev) => (prev === value ? null : value));
  };

  return (
    <AccordionContext.Provider
      value={{ activeItem, setActiveItem: handleToggle }}
    >
      <View {...props}>{children}</View>
    </AccordionContext.Provider>
  );
}

// --- 2. Accordion Item ---
export function AccordionItem({ value, children }: AccordionItemProps) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error("AccordionItem must be used within Accordion");

  const isOpen = context.activeItem === value;

  // Find the Trigger and Content children
  const trigger = React.Children.toArray(children).find(
    (child: any) => child.type === AccordionTrigger
  ) as React.ReactElement<AccordionTriggerProps>;

  const content = React.Children.toArray(children).find(
    (child: any) => child.type === AccordionContent
  ) as React.ReactElement<AccordionContentProps>;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={() => context.setActiveItem(value)}
    >
      {trigger && React.cloneElement(trigger, { isOpen })}
      {content}
    </Collapsible>
  );
}

// --- 3. Accordion Trigger ---
export function AccordionTrigger({
  children,
  isOpen = false,
}: AccordionTriggerProps & { isOpen?: boolean }) {
  // Uses CollapsibleTrigger internally
  return (
    <CollapsibleTrigger>
      <View style={styles.triggerWrapper}>
        {children}
        <ChevronDown
          size={16}
          color="#FFF"
          style={[styles.chevron, isOpen && styles.chevronOpen]}
        />
      </View>
    </CollapsibleTrigger>
  );
}

// --- 4. Accordion Content ---
export function AccordionContent({ children }: AccordionContentProps) {
  // Uses CollapsibleContent internally
  return (
    <CollapsibleContent>
      <View style={styles.contentPadding}>{children}</View>
    </CollapsibleContent>
  );
}

const styles = StyleSheet.create({
  triggerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16, // py-4
  },
  chevron: {
    // transitionDuration: "200ms", // RN doesn't use this, but for notes
  },
  chevronOpen: {
    transform: [{ rotate: "180deg" }], // [&[data-state=open]>svg]:rotate-180
  },
  contentPadding: {
    paddingBottom: 16, // pb-4
  },
});
