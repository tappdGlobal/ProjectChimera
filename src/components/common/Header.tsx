import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from "react-native";
import { Search, Settings, User as UserIcon, Bell } from "lucide-react-native";
import { Input } from "../ui/Input";
import { Theme } from "../../styles/Theme";
import { useUserStore } from "../../store/userStore";

// Logo from assets
const tappdLogo = require("../../../assets/tappdLogo.png");

interface HeaderProps {
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onNotificationClick: () => void;
  onSearchChange?: (query: string) => void;
}

export function Header({
  onProfileClick,
  onSettingsClick,
  onNotificationClick,
  onSearchChange,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const name = useUserStore((state) => state.profile?.name);
  const isUserLoading = useUserStore((state) => state.loading);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (onSearchChange) {
      onSearchChange(text);
    }
  };

  return (
    <View style={styles.container}>
      {/* Welcome message */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome back,</Text>

        {isUserLoading ? (
          <Text style={styles.userName}>Loading...</Text>
        ) : (
          <Text style={styles.userName}>{name ?? "Guest"}</Text>
        )}
      </View>

      {/* Top bar */}
      <View style={styles.topBar}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={tappdLogo as ImageSourcePropType}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search
            size={16}
            color={Theme.colors.mutedForeground}
            style={styles.searchIcon}
          />
          <Input
            placeholder="Search events..."
            style={styles.headerSearchInput}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>

        {/* Action icons */}
        <View style={styles.iconBar}>
          <TouchableOpacity style={styles.iconButton} onPress={onSettingsClick}>
            <Settings size={20} color={Theme.colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={onProfileClick}>
            <UserIcon size={20} color={Theme.colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onNotificationClick}
          >
            <Bell size={20} color={Theme.colors.mutedForeground} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.background,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  welcomeText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },
  userName: {
    color: Theme.colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoContainer: {},
  logo: {
    height: 36,
    width: 60,
  },
  searchContainer: {
    flex: 1,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  iconBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 9999,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    backgroundColor: Theme.colors.primary,
    borderRadius: 9999,
  },
  headerSearchInput: {
    paddingLeft: 40,
    borderRadius: 9999,
    backgroundColor: Theme.colors.inputBackground,
    borderColor: Theme.colors.border,
    color: Theme.colors.foreground,
    fontSize: 16,
    height: 40,
  },
});
