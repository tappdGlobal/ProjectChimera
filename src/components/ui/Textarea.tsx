// src/components/ui/Textarea.tsx

import React from "react";
import {
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from "react-native";
import { Theme } from "../../styles/Theme";

interface TextareaProps extends TextInputProps {
  rows?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// Default line height (assuming 16px font size, 20px line height)
const LINE_HEIGHT = 20;
// Default min height based on 4 rows * line height
const DEFAULT_MIN_HEIGHT = 4 * LINE_HEIGHT;

export function Textarea({
  rows = 4,
  style,
  textStyle,
  ...props
}: TextareaProps) {
  // Calculate minimum height based on the `rows` prop
  const minHeight = DEFAULT_MIN_HEIGHT * (rows / 4);

  return (
    <TextInput
      style={[
        styles.base,
        { minHeight: minHeight },
        style,
        styles.text,
        textStyle,
      ]}
      multiline={true} // Essential for Textarea functionality
      textAlignVertical="top" // Ensures text starts from the top
      placeholderTextColor={Theme.colors.mutedForeground}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  // Based on Input.tsx and added multiline attributes
  base: {
    width: "100%",
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: 12, // px-3
    paddingVertical: 8, // Increased padding for multiline input
    backgroundColor: Theme.colors.inputBackground,
    color: Theme.colors.foreground,
  },
  text: {
    fontSize: 16,
    lineHeight: LINE_HEIGHT, // Ensure line spacing is correct
  },
});
