// src/components/ui/Select.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ChevronDown } from "lucide-react-native";
import { Theme } from "../../styles/Theme";

// --- 1. Select Component (Root) ---
interface SelectProps {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  style?: ViewStyle;
}

export function Select({ children, value, onValueChange, style }: SelectProps) {
  // The trigger component logic is largely ignored in favor of the native picker UI.
  // We use Picker for the main functionality.
  return (
    <View style={[styles.selectContainer, style]}>
      {/* Picker Component */}
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        mode="dropdown"
        style={styles.picker}
        itemStyle={styles.itemText} // iOS only style
        dropdownIconColor={Theme.colors.mutedForeground}
      >
        {children}
      </Picker>

      {/* Custom Chevron Down Ircon (to match ShadCN style, visible only on Android) */}
      {/* iOS uses a default arrow, Android's is often weak, so we overlay/replace */}
      {Platform.OS === "android" && (
        <View style={styles.dropdownIcon}>
          <ChevronDown size={20} color={Theme.colors.mutedForeground} />
        </View>
      )}
    </View>
  );
}

// --- 2. SelectValue (Placeholder) ---
interface SelectValueProps {
  placeholder?: string;
}
export function SelectValue({ placeholder }: SelectValueProps) {
  // For the Picker, the first Item is often used as the placeholder/default.
  return (
    <Picker.Item
      label={placeholder || "Select"}
      value=""
      enabled={false}
      style={styles.itemText}
    />
  );
}

// --- 3. SelectItem (The Options) ---
interface SelectItemProps {
  children: string;
  value: string;
  className?: string; // Ignore
}

export function SelectItem({ children, value }: SelectItemProps) {
  // Translate to Picker.Item
  return <Picker.Item label={children} value={value} style={styles.itemText} />;
}

// SelectTrigger, SelectContent are declarative wrappers and not necessary for RN Picker functionality.
// We only export the necessary components.

const styles = StyleSheet.create({
  selectContainer: {
    backgroundColor: Theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    justifyContent: "center",
    overflow: "hidden",
    height: 40, // h-10 equivalent
  },
  picker: {
    height: 40,
    width: "100%",
    color: Theme.colors.foreground, // Text color
  },
  dropdownIcon: {
    position: "absolute",
    right: 8,
    pointerEvents: "none",
  },
  itemText: {
    color: Theme.colors.foreground,
    backgroundColor: Theme.colors.background,
  },
});

export {
  // Exporting a placeholder for trigger/content to avoid breaking imports in Host.tsx
  View as SelectTrigger,
  View as SelectContent,
};
