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
  ActivityIndicator,
  Alert,
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
  Smartphone,
  CreditCard,
  Trash2,
  ChevronRight,
  KeyRound,
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
import { SCREEN_NAMES } from "../navigation/Routes";
import { StatusBar } from "react-native";
import { useUserStore } from "../store/userStore";
import { TappdBandPopup } from "../components/profile/TappdBandPopup";
import { ManageBandPopup } from "../components/profile/ManageBandPopup";
import { ChangeEmailPopup } from "../components/profile/ChangeEmailPopup";
import { PaymentDetailForm } from "../components/profile/PaymentDetailForm";
import { ChangePasswordPopup } from "../components/profile/ChangePasswordPopup";
import { ManagePaymentInformationPopup } from "../components/profile/ManagePaymentInformationPopup";
import { AddPaymentAccountTypePopup } from "../components/profile/AddPaymentAccountTypePopup";
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

import { useAuthStore } from "../store/authStore";
import { userApi } from "../api/userApi";

export function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout, toggleSettings } = useAuthStore();
  const [activeTab, setActiveTab] = useState("about");
  const [showSettings, setShowSettings] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(false);
  const [connectionFilter, setConnectionFilter] = useState<
    "all" | "friends" | "matches" | "business"
  >("all");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState(user?.avatar || harshPhotos[0]);
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [showTappdBandPopup, setShowTappdBandPopup] = useState(false);
  const [showManageBandPopup, setShowManageBandPopup] = useState(false);
  const [showChangeEmailPopup, setShowChangeEmailPopup] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);


  type PaymentFlow =
    | "NONE"
    | "MANAGE"
    | "ACCOUNT_TYPE"
    | "DETAIL_FORM";

  const [paymentFlow, setPaymentFlow] = useState<PaymentFlow>("NONE");
  const [paymentType, setPaymentType] = useState<
    "Individual" | "Business" | null
  >(null);

  // Update profile image if user avatar changes
  React.useEffect(() => {
    if (user?.avatar) {
      setProfileImage(user.avatar);
    }
  }, [user?.avatar]);

  // Fetch connections on mount
  React.useEffect(() => {
    const fetchConnections = async () => {
      setIsLoadingConnections(true);
      try {
        const data = await userApi.getConnections();
        setConnections(data);
      } catch (error) {
        console.error('Failed to fetch connections:', error);
        // Fallback to mock data if API fails
        setConnections(mockConnections);
      } finally {
        setIsLoadingConnections(false);
      }
    };

    fetchConnections();
  }, []);

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
  const name = useUserStore((state) => state.user?.data?.name);
  const bio = useUserStore((state) => state.user?.data?.bio);
  const profilePicUrl = useUserStore((state) => state.user?.profilePicUrl);
  const photos = useUserStore((state) => state.user?.photos);
  const uploadPhotos = useUserStore((state) => state.uploadPhotos);

  console.log(profilePicUrl)
  const filteredConnections = connections;

  const pickImage = async (isProfile: boolean = false) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
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
          await uploadPhotos([uri]); // ✅ ACTUAL UPLOAD
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
        <ScrollView
          style={styles.settingsModalScroll}
          contentContainerStyle={styles.settingsModalScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Devices */}
          <Text style={styles.settingsSectionTitle}>Devices</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingsRow}
              onPress={() => setShowTappdBandPopup(true)}
            >
              <Smartphone
                size={18}
                color={Theme.colors.mutedForeground}
                style={styles.settingsRowIcon}
              />
              <Text style={styles.settingsRowText}>Register TAPPD Band</Text>
              <ChevronRight size={18} color={Theme.colors.mutedForeground} />
            </TouchableOpacity>


            <TouchableOpacity
              style={styles.settingsRow}
              onPress={() => setShowManageBandPopup(true)}

            >
              <Smartphone
                size={18}
                color={Theme.colors.mutedForeground}
                style={styles.settingsRowIcon}
              />
              <Text style={styles.settingsRowText}>Manage Bands</Text>
              <ChevronRight size={18} color={Theme.colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Account Settings */}
          <Text style={styles.settingsSectionTitle}>Account Settings</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingsRow}
              onPress={() => setShowChangeEmailPopup(true)}
            >
              <UserIcon
                size={18}
                color={Theme.colors.mutedForeground}
                style={styles.settingsRowIcon}
              />
              <Text style={styles.settingsRowText}>Change Email</Text>
              <ChevronRight size={18} color={Theme.colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsRow}
              onPress={() => setShowChangePassword(true)}
            >
              <KeyRound
                size={18}
                color={Theme.colors.mutedForeground}
                style={styles.settingsRowIcon}
              />
              <Text style={styles.settingsRowText}>Change Password</Text>
              <ChevronRight size={18} color={Theme.colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsRow}
              onPress={() =>
                setPaymentFlow("MANAGE")
              }
            >
              <CreditCard
                size={18}
                color={Theme.colors.mutedForeground}
                style={styles.settingsRowIcon}
              />
              <Text style={styles.settingsRowText}>
                Manage Payment Information
              </Text>
              <ChevronRight size={18} color={Theme.colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsRow}
              onPress={() =>
                Alert.alert(
                  "Delete Account",
                  "This is a destructive action. Hook it up to backend before enabling."
                )
              }
            >
              <Trash2 size={18} color={"#F87171"} style={styles.settingsRowIcon} />
              <Text style={[styles.settingsRowText, { color: "#F87171" }]}>
                Delete Account
              </Text>
              <ChevronRight size={18} color={Theme.colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* App Settings */}
          <Text style={styles.settingsSectionTitle}>App Settings</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingsToggleRow}>
              <View style={styles.settingsToggleLeft}>
                <Bell
                  size={18}
                  color={Theme.colors.mutedForeground}
                  style={styles.settingsRowIcon}
                />
                <Text style={styles.settingsRowText}>Push Notifications</Text>
              </View>
              <Switch
                value={user?.settings?.notifications ?? true}
                onValueChange={() => toggleSettings("notifications")}
                trackColor={{ true: Theme.colors.primary }}
                thumbColor={Theme.colors.foreground}
              />
            </View>

            <View style={styles.settingsToggleRow}>
              <View style={styles.settingsToggleLeft}>
                <Eye
                  size={18}
                  color={Theme.colors.mutedForeground}
                  style={styles.settingsRowIcon}
                />
                <Text style={styles.settingsRowText}>Show Online Status</Text>
              </View>
              <Switch
                value={showOnlineStatus}
                onValueChange={setShowOnlineStatus}
                trackColor={{ true: Theme.colors.primary }}
                thumbColor={Theme.colors.foreground}
              />
            </View>

            <View style={styles.settingsToggleRow}>
              <View style={styles.settingsToggleLeft}>
                <Shield
                  size={18}
                  color={Theme.colors.mutedForeground}
                  style={styles.settingsRowIcon}
                />
                <Text style={styles.settingsRowText}>Private Profile</Text>
              </View>
              <Switch
                value={user?.settings?.privacy ?? false}
                onValueChange={() => toggleSettings("privacy")}
                trackColor={{ true: Theme.colors.primary }}
                thumbColor={Theme.colors.foreground}
              />
            </View>
          </View>

          {/* Help & Support */}
          <Text style={styles.settingsSectionTitle}>Help & Support</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingsRow}
              onPress={() =>
                Alert.alert("Contact Support", "support@tappd.co.in")
              }
            >
              <HelpCircle
                size={18}
                color={Theme.colors.mutedForeground}
                style={styles.settingsRowIcon}
              />
              <Text style={styles.settingsRowText}>Contact Support</Text>
              <ChevronRight size={18} color={Theme.colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <View style={styles.settingsLogoutWrapper}>
            <Button
              style={styles.logoutButton}
              onClick={async () => {
                setShowSettings(false);
                await logout();
              }}
            >
              <LogOut size={16} color={Theme.colors.foreground} style={styles.mr2} />
              Logout
            </Button>
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
    <SafeAreaView style={styles.flex1} edges={["left", "right"]}>
      <StatusBar
    barStyle="light-content"
    backgroundColor={Theme.colors.background}
    translucent={false}
  />

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
                    <AvatarImage
                      src={profilePicUrl ?? profileImage}
                      alt={name ?? "User Profile"}
                    />

                    <AvatarFallback>
                      <Text style={{ color: Theme.colors.foreground }}>
                        {name
                          ? name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()
                          : "HA"}
                      </Text>
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
              <Text style={styles.userName}>{name ?? "Guest"}</Text>
              {user?.bio && (
                <Text style={styles.tagline} numberOfLines={2}>
                  {user.bio}
                </Text>
              )}
              <View style={styles.infoRow}>
                {[
                  user?.gender && `${user.gender.charAt(0).toUpperCase()}${user.gender.slice(1).toLowerCase()}`,
                  user?.location,
                  user?.occupation,
                ].filter(Boolean).map((item) => (
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
                    {bio ?? "No bio available."}
                  </Text>
                  <View style={styles.detailsGrid}>
                    {user?.education && (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Education</Text>
                        <Text style={styles.detailValue}>{user.education}</Text>
                      </View>
                    )}
                    {user?.occupation && (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Occupation</Text>
                        <Text style={styles.detailValue}>{user.occupation}</Text>
                      </View>
                    )}
                    {user?.lookingFor && (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Looking For</Text>
                        <Text style={styles.detailValue}>{user.lookingFor}</Text>
                      </View>
                    )}
                    {user?.age && (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Age</Text>
                        <Text style={styles.detailValue}>{user.age} years old</Text>
                      </View>
                    )}
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

                    {(photos ?? []).map((photo, index) => (
                      <TouchableOpacity key={index}>
                        <Image source={{ uri: photo }} />
                      </TouchableOpacity>
                    ))}

                  </View>
                </View>

              )}

              {activeTab === "connections" && (
                <View style={styles.tabContent}>
                  {isLoadingConnections ? (
                    <ActivityIndicator size="large" color={Theme.colors.primary} />
                  ) : (
                    <>
                      <View style={styles.filterBar}>
                        {["all"].map((key) => (
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
                                src={connection.profilePicUrl || connection.photo}
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
                              {connection.age ? `${connection.age} years old` : ""}
                            </Text>
                          </Card>
                        ))}
                      </View>
                    </>
                  )}
                </View>
              )}

              {activeTab === "settings" && (
                <View style={styles.tabContent}>
                  <Text style={styles.settingsSectionTitle}>Devices</Text>
                  <View style={styles.settingsList}>
                    <TouchableOpacity
                      style={styles.settingsRow}
                      onPress={
                        () => setShowTappdBandPopup(true)
                      }
                    >
                      <Smartphone
                        size={18}
                        color={Theme.colors.mutedForeground}
                        style={styles.settingsRowIcon}
                      />
                      <Text style={styles.settingsRowText}>Register TAPPD Band</Text>
                      <ChevronRight size={18} color={Theme.colors.mutedForeground} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.settingsRow}
                      onPress={() => setShowManageBandPopup(true)}
                    >
                      <Smartphone
                        size={18}
                        color={Theme.colors.mutedForeground}
                        style={styles.settingsRowIcon}
                      />
                      <Text style={styles.settingsRowText}>Manage Bands</Text>
                      <ChevronRight size={18} color={Theme.colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.settingsSectionTitle}>Account Settings</Text>
                  <View style={styles.settingsList}>
                    <TouchableOpacity
                      style={styles.settingsRow}
                      onPress={() => setShowChangeEmailPopup(true)}
                    >
                      <UserIcon
                        size={18}
                        color={Theme.colors.mutedForeground}
                        style={styles.settingsRowIcon}
                      />
                      <Text style={styles.settingsRowText}>Change Email</Text>
                      <ChevronRight size={18} color={Theme.colors.mutedForeground} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.settingsRow}
                      onPress={() => setShowChangePassword(true)}
                    >
                      <KeyRound
                        size={18}
                        color={Theme.colors.mutedForeground}
                        style={styles.settingsRowIcon}
                      />
                      <Text style={styles.settingsRowText}>Change Password</Text>
                      <ChevronRight size={18} color={Theme.colors.mutedForeground} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.settingsRow}
                      onPress={() =>
                        setPaymentFlow("MANAGE")
                      }
                    >
                      <CreditCard
                        size={18}
                        color={Theme.colors.mutedForeground}
                        style={styles.settingsRowIcon}
                      />
                      <Text style={styles.settingsRowText}>
                        Manage Payment Information
                      </Text>
                      <ChevronRight size={18} color={Theme.colors.mutedForeground} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.settingsRow}
                      onPress={() =>
                        Alert.alert(
                          "Delete Account",
                          "This is a destructive action. Hook it up to backend before enabling."
                        )
                      }
                    >
                      <Trash2 size={18} color={"#F87171"} style={styles.settingsRowIcon} />
                      <Text style={[styles.settingsRowText, { color: "#F87171" }]}>
                        Delete Account
                      </Text>
                      <ChevronRight size={18} color={Theme.colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.settingsSectionTitle}>App Settings</Text>
                  <View style={styles.settingsList}>
                    <View style={styles.settingsToggleRow}>
                      <View style={styles.settingsToggleLeft}>
                        <Bell
                          size={18}
                          color={Theme.colors.mutedForeground}
                          style={styles.settingsRowIcon}
                        />
                        <Text style={styles.settingsRowText}>Push Notifications</Text>
                      </View>
                      <Switch
                        value={user?.settings?.notifications ?? true}
                        onValueChange={() => toggleSettings("notifications")}
                        trackColor={{ true: Theme.colors.primary }}
                        thumbColor={Theme.colors.foreground}
                      />
                    </View>
                    <View style={styles.settingsToggleRow}>
                      <View style={styles.settingsToggleLeft}>
                        <Eye
                          size={18}
                          color={Theme.colors.mutedForeground}
                          style={styles.settingsRowIcon}
                        />
                        <Text style={styles.settingsRowText}>Show Online Status</Text>
                      </View>
                      <Switch
                        value={showOnlineStatus}
                        onValueChange={setShowOnlineStatus}
                        trackColor={{ true: Theme.colors.primary }}
                        thumbColor={Theme.colors.foreground}
                      />
                    </View>
                    <View style={styles.settingsToggleRow}>
                      <View style={styles.settingsToggleLeft}>
                        <Shield
                          size={18}
                          color={Theme.colors.mutedForeground}
                          style={styles.settingsRowIcon}
                        />
                        <Text style={styles.settingsRowText}>Private Profile</Text>
                      </View>
                      <Switch
                        value={user?.settings?.privacy ?? false}
                        onValueChange={() => toggleSettings("privacy")}
                        trackColor={{ true: Theme.colors.primary }}
                        thumbColor={Theme.colors.foreground}
                      />
                    </View>
                  </View>

                  <Text style={styles.settingsSectionTitle}>Help & Support</Text>
                  <View style={styles.settingsList}>
                    <TouchableOpacity
                      style={styles.settingsRow}
                      onPress={() => Alert.alert("Contact Support", "support@tappd.co.in")}
                    >
                      <HelpCircle
                        size={18}
                        color={Theme.colors.mutedForeground}
                        style={styles.settingsRowIcon}
                      />
                      <Text style={styles.settingsRowText}>Contact Support</Text>
                      <ChevronRight size={18} color={Theme.colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingsLogoutWrapper}>
                    <Button style={styles.logoutButton} onClick={logout}>
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
      <TappdBandPopup
        visible={showTappdBandPopup}
        onClose={() => setShowTappdBandPopup(false)}
        onStartPairing={() => {
          setShowTappdBandPopup(false);
          // TODO: Start BLE / NFC pairing here
        }}
      />
      <ManageBandPopup
        visible={showManageBandPopup}
        onClose={() => setShowManageBandPopup(false)}
      />
      <ChangeEmailPopup
        visible={showChangeEmailPopup}
        onClose={() => setShowChangeEmailPopup(false)}
        onSubmit={(email) => {
          console.log("New email:", email);
          setShowChangeEmailPopup(false);
          // TODO: call API here
        }}
      />
      <ChangePasswordPopup
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onRequestOtp={(email) => {
          console.log("Request OTP for", email);
        }}
        onSubmit={(payload) => {
          console.log("Reset password payload", payload);
          setShowChangePassword(false);
        }}
      />
      {paymentFlow === "MANAGE" && (
        <ManagePaymentInformationPopup
          visible
          onClose={() => setPaymentFlow("NONE")}
          payments={[
            {
              id: "1",
              bankName: "HDFC Bank",
              last4: "4567",
              email: "harsh@tappd.co.in",
              phone: "+91 98765 43210",
              type: "Individual",
              addedOn: "15 Dec 2024",
              verified: true,
            },
            {
              id: "2",
              bankName: "ICICI Bank",
              last4: "8901",
              email: "business@tappd.co.in",
              phone: "+91 98765 43210",
              type: "Business",
              addedOn: "10 Jan 2025",
              verified: true,
            },
          ]}
          onAddNew={() => setPaymentFlow("ACCOUNT_TYPE")}
          onEdit={(id) => {
            setEditingPaymentId(id);
            setPaymentFlow("DETAIL_FORM");
          }}

          onDelete={(id) => console.log("Delete", id)}
        />
      )}

      {paymentFlow === "ACCOUNT_TYPE" && (
        <AddPaymentAccountTypePopup
          visible
          onClose={() => setPaymentFlow("MANAGE")}
          onSelectIndividual={() => {
            setPaymentType("Individual");
            setPaymentFlow("DETAIL_FORM");
          }}
          onSelectBusiness={() => {
            setPaymentType("Business");
            setPaymentFlow("DETAIL_FORM");
          }}
        />
      )}

      {paymentFlow === "DETAIL_FORM" && (
        <PaymentDetailForm
          visible
          onClose={() => {
            setEditingPaymentId(null);
            setPaymentType(null);
            setPaymentFlow("NONE");
          }}
          onBack={() => {
            setEditingPaymentId(null);
            setPaymentFlow("MANAGE");
          }}
          onSave={(data) => {
            if (editingPaymentId) {
              console.log("Updating payment:", editingPaymentId, data);
            } else {
              console.log("Creating new payment:", data, paymentType);
            }

            setEditingPaymentId(null);
            setPaymentType(null);
            setPaymentFlow("MANAGE");
          }}
        />
      )}

    </SafeAreaView>
  );
}


// --- STYLESHEET ---
const styles = StyleSheet.create({
  flex1: { flex: 1 },
  mainContainer: { flex: 1, backgroundColor: Theme.colors.background },
  // Header
 header: {
  paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  backgroundColor: Theme.colors.background,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 16,
  paddingBottom: 16,
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
  logoutButton: { backgroundColor: "#DC2626" },
  // Dialogs
  settingsModal: { width: "90%", maxHeight: "80%" },
  settingsModalScroll: { maxHeight: 520 },
  settingsModalScrollContent: { paddingBottom: 12 },
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
  settingsSectionTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 10,
  },
  settingsList: {
    backgroundColor: "transparent",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  settingsRowIcon: {
    marginRight: 12,
  },
  settingsRowText: {
    flex: 1,
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "600",
  },
  settingsToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  settingsToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  settingsLogoutWrapper: {
    marginTop: 24,
    paddingBottom: 8,
  },
  photoModal: { padding: 0, backgroundColor: "black", width: "95%" },
  fullSizePhoto: { width: "100%", height: "100%", borderRadius: 8 },
  // Details
  detailItem: {
    width: (width - 48) / 2 - 8,
    backgroundColor: Theme.colors.muted,
    padding: 12,
    borderRadius: Theme.radius.md,
  },
  detailLabel: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  detailValue: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "600",
  },
  // Utilities
  safeBottom: { paddingBottom: 100 },
  mr3: { marginRight: 12 },
  mr2: { marginRight: 8 },
  flexRowCenter: { flexDirection: "row", alignItems: "center" },
});
