// src/components/ui/Input.tsx
import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from "react-native";
import { Theme } from "../../styles/Theme";

interface InputProps extends TextInputProps {
  // `className` is a web prop, so we'll use RN-specific `style` and `textStyle`.
  className?: string; // Add this line to fix the error
  style?: ViewStyle;
  textStyle?: TextStyle;
  // `type` prop from web will be handled by `keyboardType` in RN.
  type?: "email" | "tel" | "number" | string;
}

export function Input({
  className, // We'll ignore this web prop but keep it in the signature
  type, // We'll handle this using keyboardType
  style,
  textStyle,
  editable = true, // Defaulting to true, matching disabled:false
  ...props
}: InputProps) {
  // Handle focus state for styling
  const [isFocused, setIsFocused] = useState(false);

  // Convert web `type` to React Native `keyboardType`
  const keyboardType = React.useMemo(() => {
    switch (type) {
      case "email":
        return "email-address";
      case "tel":
        return "phone-pad";
      case "number":
        return "number-pad";
      default:
        return "default";
    }
  }, [type]);

  const combinedStyles = StyleSheet.compose(
    styles.base,
    isFocused ? styles.focused : {}
  );

  return (
    <TextInput
      style={[
        combinedStyles,
        !editable && styles.disabled,
        styles.text, // Apply text styles
        style,
        textStyle, // Apply custom text styles
      ]}
      editable={editable}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      keyboardType={keyboardType}
      placeholderTextColor={Theme.colors.mutedForeground}
      {...props}
    />
  );
}

// Stylesheet mapping from CSS utility classes to React Native styles
const styles = StyleSheet.create({
  base: {
    // flex h-9 w-full min-w-0 rounded-md border px-3 py-1
    height: 36, // h-9
    width: "100%", // w-full
    minWidth: 0,
    borderRadius: Theme.radius.md, // rounded-md
    borderWidth: 1, // border
    borderColor: Theme.colors.border, // border-input
    paddingHorizontal: 12, // px-3
    paddingVertical: 4, // py-1
    backgroundColor: Theme.colors.inputBackground,
    color: Theme.colors.foreground, // text-base
  },
  text: {
    fontSize: 16,
    // md:text-sm is a media query, we will use a base font size here.
  },
  // focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
  focused: {
    borderColor: Theme.colors.ring,
  },
  // disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
  disabled: {
    opacity: 0.5,
  },
});
