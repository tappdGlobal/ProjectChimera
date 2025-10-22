// src/components/common/Header.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ImageSourcePropType,
} from "react-native";
import { Search, Settings, User, Bell } from "lucide-react-native";
import { Input } from "../ui/Input";
import { Theme } from "../../styles/Theme";
// The Input component will be imported here once migrated:
// import { Input } from "../ui/Input";

// Assume the logo is loaded from the assets folder.
const tappdLogo = require("../../../assets/tappdLogo.png");

interface HeaderProps {
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onNotificationClick: () => void;
}

export function Header({
  onProfileClick,
  onSettingsClick,
  onNotificationClick,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      {/* Welcome message */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>Harsh Arora</Text>
      </View>

      {/* Top bar with logo, search, and icons */}
      <View style={styles.topBar}>
        {/* Logo space */}
        <View style={styles.logoContainer}>
          <Image
            source={tappdLogo as ImageSourcePropType} // Cast for TS compatibility
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Search bar (Placeholder for now) */}
        <View style={styles.searchContainer}>
          {/* Search Icon (absolute positioning in web is tricky in RN; using View for alignment) */}
          <Search
            size={16}
            color={Theme.colors.mutedForeground}
            style={styles.searchIcon}
          />
          {/* Replaced Input with a standard RN TextInput for temporary fix */}
          <Input
            placeholder="Search events..."
            // The text color will be handled by the Input's base styles
            style={styles.headerSearchInput}
          />
        </View>

        {/* Action icons */}
        <View style={styles.iconBar}>
          <TouchableOpacity style={styles.iconButton} onPress={onSettingsClick}>
            <Settings size={20} color={Theme.colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onProfileClick}>
            <User size={20} color={Theme.colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onNotificationClick}
          >
            <Bell size={20} color={Theme.colors.mutedForeground} />
            {/* Notification Badge */}
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.background,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: 16, // px-4
    paddingVertical: 12, // py-3
  },
  welcomeContainer: {
    alignItems: "center", // text-center
    marginBottom: 12, // mb-3
  },
  welcomeText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14, // Assuming text-sm
  },
  userName: {
    color: Theme.colors.primary,
    fontSize: 18, // Assuming h2 equivalent
    fontWeight: "bold",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12, // gap-3
  },
  logoContainer: {
    // flex-shrink-0
  },
  // The logo width/height needs to be determined by the actual image size
  logo: {
    height: 36, // Adjust based on visual needs (Figma's 96px is likely a full canvas size)
    width: 60,
  },
  searchContainer: {
    flex: 1, // flex-1
    position: "relative",
    flexDirection: "row", // To align search icon and input
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12, // left-3
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 40, // Consistent input height
    paddingLeft: 40, // pl-10 (10*4=40px)
    paddingRight: 16,
    backgroundColor: Theme.colors.inputBackground, // bg-input-background
    borderColor: Theme.colors.border, // border border-white/10
    borderWidth: 1,
    borderRadius: 9999, // rounded-full
    color: Theme.colors.foreground, // text-white
    fontSize: 16,
  },
  iconBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // gap-2
  },
  iconButton: {
    padding: 8, // p-2
    borderRadius: 9999,
    position: "relative",
    // hover:bg-accent simulation is omitted for brevity
  },
  notificationBadge: {
    position: "absolute",
    top: 0, // -top-1
    right: 0, // -right-1
    width: 8, // w-3
    height: 8, // h-3
    backgroundColor: Theme.colors.primary,
    borderRadius: 9999,
  },
  headerSearchInput: {
    // Override default Input styles to match the Header's design (pl-10, rounded-full)
    paddingLeft: 40, // pl-10 (40px)
    borderRadius: 9999, // rounded-full
    backgroundColor: Theme.colors.inputBackground, // bg-input-background
    borderColor: Theme.colors.border, // border border-white/10
    color: Theme.colors.foreground,
    fontSize: 16,
    height: 40, // Ensure height is appropriate
  },
});
