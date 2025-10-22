// src/screens/ProfileScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import {
  ArrowLeft,
  Settings,
  Edit,
  Plus,
  Filter,
  LogOut,
  User as UserIcon,
  Shield,
  Bell,
  HelpCircle,
  Eye,
  Camera,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card"; // Assuming Card is the general container
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/Dialog";
import { Switch } from "react-native";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/Avatar";
import { Theme } from "../styles/Theme";

const { width } = Dimensions.get("window");

// --- MOCK DATA ---
interface Connection {
  id: string;
  name: string;
  age: number;
  photo: string;
  type: "friend" | "match" | "business";
}
const mockConnections: Connection[] = [
  {
    id: "1",
    name: "Alex Chen",
    age: 28,
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=face&fit=crop&w=400&h=400",
    type: "friend",
  },
  {
    id: "2",
    name: "Sarah Kim",
    age: 25,
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=face&fit=crop&w=400&h=400",
    type: "match",
  },
  {
    id: "3",
    name: "Marcus Johnson",
    age: 32,
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=face&fit=crop&w=400&h=400",
    type: "business",
  },
  {
    id: "4",
    name: "Emily Davis",
    age: 29,
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=face&fit=crop&w=400&h=400",
    type: "friend",
  },
];

const harshPhotos = [
  "https://images.unsplash.com/photo-1506794778202-dfa52e185842?crop=face&fit=crop&w=400&h=600",
  "https://images.unsplash.com/photo-1542103749-8ef597ac45be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwZ3V5fGVufDF8fHx8MTc1ODMyMTMxNHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1518002170354-949e25be36f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5YWNodCUyMG1hbnxlbnwxfHx8fDE3NTgzMjEzMTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
];

export function ProfileScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("about");
  const [showSettings, setShowSettings] = useState(false);
  const [connectionFilter, setConnectionFilter] = useState<
    "all" | "friends" | "matches" | "business"
  >("all");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState(harshPhotos[0]);

  // Permissions check for Image Picker (required for newer Expo SDKs)
  React.useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

  const filteredConnections =
    connectionFilter === "all"
      ? mockConnections
      : mockConnections.filter((conn) => {
          if (connectionFilter === "friends") return conn.type === "friend";
          if (connectionFilter === "matches") return conn.type === "match";
          if (connectionFilter === "business") return conn.type === "business";
          return true;
        });

  const pickImage = async (isProfile: boolean = false) => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: isProfile ? [1, 1] : [9, 16],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        if (isProfile) {
          setProfileImage(uri);
        } else {
          // For gallery photos, in a real app, you would add to state array
          console.log("Photo added to gallery:", uri);
        }
      }
    } catch (error) {
      console.error("ImagePicker Error:", error);
    }
  };

  // --- SUB COMPONENTS ---

  const SettingsDialog = () => (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent style={styles.settingsModal}>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your profile and account settings
          </DialogDescription>
        </DialogHeader>
        <ScrollView style={{ paddingHorizontal: 16, maxHeight: 400 }}>
          <View style={{ gap: 16 }}>
            {/* Using Card for better tap area/visual grouping in RN */}
            <Card style={styles.settingsCard}>
              {/* FIX: Ensure button text is rendered correctly */}
              <Button
                variant="ghost"
                style={styles.settingsButton}
                onClick={() => console.log("Edit Profile")}
              >
                <Edit
                  size={20}
                  color={Theme.colors.foreground}
                  style={styles.mr3}
                />
                <Text style={styles.settingsButtonText}>Edit Profile</Text>
              </Button>
              {/* ... (Other settings buttons omitted) ... */}
            </Card>
          </View>
        </ScrollView>
      </DialogContent>
    </Dialog>
  );

  const PhotoDialog = () => (
    <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
      <DialogContent style={styles.photoModal}>
        {selectedPhoto && (
          <Image
            source={{ uri: selectedPhoto }}
            style={styles.fullSizePhoto}
            resizeMode="contain"
          />
        )}
      </DialogContent>
    </Dialog>
  );

  // --- MAIN RENDER ---
  return (
    <SafeAreaView style={styles.flex1} edges={["top"]}>
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={Theme.colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            style={styles.settingsButtonHeader}
          >
            <Settings size={20} color={Theme.colors.foreground} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.flex1}>
          <View style={styles.safeBottom}>
            {/* Profile Header (Bio, Info) */}
            <View style={styles.profileHeader}>
              {/* Profile Photo */}
              <View style={styles.photoWrapper}>
                <View style={styles.avatarBorder}>
                  <Avatar style={styles.avatarStyle}>
                    {/* FIX: AvatarImage uses profileImage state */}
                    <AvatarImage src={profileImage} alt="Harsh Arora Profile" />
                    {/* FIX: AvatarFallback children should be simple text */}
                    <AvatarFallback>
                      <Text style={{ color: Theme.colors.foreground }}>HA</Text>
                    </AvatarFallback>
                  </Avatar>
                </View>
                <Button
                  size="icon"
                  style={styles.cameraButton}
                  onClick={() => pickImage(true)}
                >
                  <Camera size={16} color={Theme.colors.foreground} />
                </Button>
              </View>

              {/* Name & Info */}
              <Text style={styles.userName}>Harsh Arora, 22</Text>
              <Text style={styles.tagline}>
                Exploring every day like its theist ✨
              </Text>
              <View style={styles.infoRow}>
                {["Male", "New Delhi", "Founder"].map((item) => (
                  <View key={item} style={styles.infoPill}>
                    <View style={styles.infoDot} />
                    <Text style={styles.infoText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Menu Tabs */}
            <View>
              <View style={styles.tabsList}>
                {["about", "photos", "connections", "settings"].map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={[
                      styles.tabTrigger,
                      activeTab === tab && styles.tabTriggerActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabTriggerText,
                        activeTab === tab && styles.tabTriggerTextActive,
                      ]}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tab Contents */}
              {activeTab === "about" && (
                <View style={styles.tabContent}>
                  <Text style={styles.sectionTitle}>About Me</Text>
                  <Text style={styles.bioText}>
                    Entrepreneurial growth strategist with 5+ years of
                    experience scaling ventures across consumer tech,
                    hospitality, and consulting. Proven expertise in performance
                    marketing, organic growth, and 0-to-1 GTM execution... (Full
                    bio text omitted)
                  </Text>
                  <View style={styles.detailsGrid}>
                    {/* Occupation / Education */}
                  </View>
                </View>
              )}

              {activeTab === "photos" && (
                <View style={styles.tabContent}>
                  <View style={styles.photoGrid}>
                    <TouchableOpacity
                      style={styles.addPhotoButton}
                      onPress={() => pickImage(false)}
                    >
                      <Plus size={24} color={Theme.colors.mutedForeground} />
                    </TouchableOpacity>
                    {harshPhotos.map((photo, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.photoItem}
                        onPress={() => setSelectedPhoto(photo)}
                      >
                        <Image
                          source={{ uri: photo }}
                          style={styles.photoGridImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {activeTab === "connections" && (
                <View style={styles.tabContent}>
                  <View style={styles.filterBar}>
                    {["all", "friends", "matches", "business"].map((key) => (
                      <Button
                        key={key}
                        size="sm"
                        variant={
                          connectionFilter === key ? "default" : "outline"
                        }
                        onClick={() => setConnectionFilter(key as any)}
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Button>
                    ))}
                  </View>
                  <View style={styles.connectionsGrid}>
                    {filteredConnections.map((connection) => (
                      <Card key={connection.id} style={styles.connectionCard}>
                        {/* FIX: Use Avatar components here */}
                        <Avatar style={styles.connectionAvatarWrapper}>
                          <AvatarImage
                            src={connection.photo}
                            alt={connection.name}
                          />
                          <AvatarFallback>
                            <Text>{connection.name.charAt(0)}</Text>
                          </AvatarFallback>
                        </Avatar>
                        <Text style={styles.connectionName}>
                          {connection.name}
                        </Text>
                        <Text style={styles.connectionAge}>
                          {connection.age} years old
                        </Text>
                      </Card>
                    ))}
                  </View>
                </View>
              )}

              {activeTab === "settings" && (
                <View style={styles.tabContent}>
                  <Text style={styles.sectionTitle}>App Settings</Text>
                  <View style={styles.settingsGroup}>
                    <View style={styles.settingRow}>
                      <View style={styles.flexRowCenter}>
                        <Bell
                          size={16}
                          color={Theme.colors.mutedForeground}
                          style={styles.mr3}
                        />
                        <Text style={styles.settingLabel}>
                          Push Notifications
                        </Text>
                      </View>
                      <Switch
                        value={true}
                        trackColor={{ true: Theme.colors.primary }}
                        thumbColor={Theme.colors.foreground}
                      />
                    </View>
                    {/* ... (Other settings rows omitted) ... */}
                  </View>
                  <View style={styles.logoutWrapper}>
                    <Button style={styles.logoutButton}>
                      <LogOut
                        size={16}
                        color={Theme.colors.foreground}
                        style={styles.mr2}
                      />
                      Logout
                    </Button>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
      <SettingsDialog />
      <PhotoDialog />
    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  flex1: { flex: 1 },
  mainContainer: { flex: 1, backgroundColor: Theme.colors.background },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  backButton: { padding: 4 },
  headerTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "bold",
  },
  settingsButtonHeader: { padding: 4 },
  // Profile Header
  profileHeader: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  photoWrapper: { position: "relative", marginBottom: 16 },
  avatarBorder: {
    width: 128,
    height: 128,
    borderRadius: 9999,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: Theme.colors.primary,
    marginHorizontal: "auto",
  },
  avatarStyle: { width: "100%", height: "100%", borderRadius: 9999 },
  profileImage: { width: "100%", height: "100%" }, // Used by AvatarImage internally
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 9999,
    padding: 0,
    backgroundColor: Theme.colors.primary,
  },
  userName: {
    color: Theme.colors.foreground,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tagline: {
    color: Theme.colors.mutedForeground,
    marginBottom: 16,
    textAlign: "center",
  },
  infoRow: { flexDirection: "row", justifyContent: "center", gap: 16 },
  infoPill: { flexDirection: "row", alignItems: "center", gap: 4 },
  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
  },
  infoText: { color: Theme.colors.mutedForeground, fontSize: 14 },
  // Tabs
  tabsList: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
    height: 48,
  },
  tabTrigger: { flex: 1, alignItems: "center", justifyContent: "center" },
  tabTriggerActive: {
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.primary,
  },
  tabTriggerText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    fontWeight: "500",
  },
  tabTriggerTextActive: { color: Theme.colors.foreground },
  tabContent: { padding: 16 },
  sectionTitle: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  bioText: {
    color: Theme.colors.mutedForeground,
    lineHeight: 22,
    marginBottom: 16,
  },
  detailsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  // Photos Tab
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  addPhotoButton: {
    width: (width - 48) / 2,
    height: ((width - 48) / 2) * 1.77,
    backgroundColor: Theme.colors.muted,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  photoItem: {
    width: (width - 48) / 2,
    height: ((width - 48) / 2) * 1.77,
    borderRadius: Theme.radius.lg,
    overflow: "hidden",
  },
  photoGridImage: { width: "100%", height: "100%" },
  // Connections Tab
  filterBar: { flexDirection: "row", gap: 8, marginBottom: 16 },
  connectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  connectionCard: {
    width: (width - 48) / 2,
    padding: 16,
    alignItems: "center",
    backgroundColor: Theme.colors.muted,
    borderColor: Theme.colors.border,
  },
  connectionAvatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    marginBottom: 8,
    overflow: "hidden",
  }, // Wrapper for Avatar in grid
  connectionAvatar: { width: "100%", height: "100%" }, // Used by AvatarImage internally
  connectionName: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "bold",
  },
  connectionAge: { color: Theme.colors.mutedForeground, fontSize: 12 },
  // Settings Tab
  settingsGroup: { gap: 12 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  settingLabel: { color: Theme.colors.foreground, fontSize: 16 },
  logoutWrapper: { marginTop: 24 },
  logoutButton: { backgroundColor: "#DC2626" },
  // Dialogs
  settingsModal: { width: "90%", maxHeight: "80%" },
  settingsCard: {
    backgroundColor: "transparent",
    borderWidth: 0,
    shadowOpacity: 0,
  },
  settingsButton: {
    justifyContent: "flex-start",
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  settingsButtonText: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "normal",
  },
  photoModal: { padding: 0, backgroundColor: "black", width: "95%" },
  fullSizePhoto: { width: "100%", height: "100%", borderRadius: 8 },
  // Utilities
  safeBottom: { paddingBottom: 100 },
  mr3: { marginRight: 12 },
  mr2: { marginRight: 8 },
  flexRowCenter: { flexDirection: "row", alignItems: "center" },
});
