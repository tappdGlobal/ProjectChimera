import React, { useState } from "react";
import { useRoute } from "@react-navigation/native";
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
  Plus,
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
  X,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { AboutTab } from "../components/profile/AboutTab";
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
import { useAppNavigation } from "../hooks/useAppNavigation";
import Toast from "react-native-toast-message";
import { TappdBandPopup } from "../components/profile/TappdBandPopup";
import { ManageBandPopup } from "../components/profile/ManageBandPopup";
import { ChangeEmailPopup } from "../components/profile/ChangeEmailPopup";
import { PaymentDetailForm } from "../components/profile/PaymentDetailForm";
import { ChangePasswordPopup } from "../components/profile/ChangePasswordPopup";
import { ManagePaymentInformationPopup } from "../components/profile/ManagePaymentInformationPopup";
import { AddPaymentAccountTypePopup } from "../components/profile/AddPaymentAccountTypePopup";
import ComingSoon from "../components/common/ComingSoon";
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
import { useAnalytics } from "../hooks/useAnalytics";
import {
  getUserByIdApi,
  updateUserApi,
  uploadPhotosApi,
  UpdateUserPayload,
} from "../api/userApi";
import {
  getConnectionRequestsApi,
  getAcceptedConnectionsApi,
  respondConnectionApi,
} from "../api/connectionApi";

export function ProfileScreen() {
  const navigation = useAppNavigation();
  const { userId, token } = useAuthStore();

  // console.log("ProfileScreen userId:", userId);
  // console.log("ProfileScreen token:", token);


  const { logout, changeEmail, changePassword, deleteAccount, loading: authLoading } = useAuthStore();
  const { profile, fetchUser, updateUser, uploadPhotos, deletePhoto, loading, setProfile } =
    useUserStore();
  const { user: authUser } = useAuthStore();
  const user = profile || authUser; // Use profile if available, otherwise auth user
  const { trackEvent, trackButtonClick, resetUser } = useAnalytics(
    "ProfileScreen",
    {
      user_id: user?.id,
      user_name: user?.name,
    },
  );

  // Sync auth user to profile store
  React.useEffect(() => {
    if (authUser && !profile) {
      setProfile(authUser);
    }
  }, [authUser, profile]);
  const [activeTab, setActiveTab] = useState("about");
  const route = useRoute<any>();

  React.useEffect(() => {
    // TEST MODE disabled - let Settings stay as is
    if (route.params?.initialTab === "settings") {
      setActiveTab("settings");
    } else {
      setActiveTab("about");
    }
  }, [route.params?.initialTab]);

  const [showSettings, setShowSettings] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(false);
  const [connectionFilter, setConnectionFilter] = useState<
    "all" | "friends" | "matches" | "business"
  >("all");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [tempProfileImage, setTempProfileImage] = useState<string | null>(null);
  const [showProfileImageConfirm, setShowProfileImageConfirm] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [deletingPhotoUrl, setDeletingPhotoUrl] = useState<string | null>(null);

  // Use user avatar or profilePicUrl, fallback to a default placeholder instead of mock photos
  const defaultAvatar = "https://via.placeholder.com/400x400?text=No+Photo";
  const [profileImage, setProfileImage] = useState(
    user?.profilePicUrl || defaultAvatar,
  );
  const [connections, setConnections] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [showTappdBandPopup, setShowTappdBandPopup] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showManageBandPopup, setShowManageBandPopup] = useState(false);
  const [showChangeEmailPopup, setShowChangeEmailPopup] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);

  type PaymentFlow = "NONE" | "MANAGE" | "ACCOUNT_TYPE" | "DETAIL_FORM";

  const [paymentFlow, setPaymentFlow] = useState<PaymentFlow>("NONE");
  const [paymentType, setPaymentType] = useState<
    "Individual" | "Business" | null
  >(null);

  // Fetch user data on mount
  React.useEffect(() => {
    if (user?.id) {
      fetchUser(user.id);
    }
  }, [user?.id]);

  const handleToggleSettings = async (key: string) => {
    if (!user?.id) return;

    if (key === "notifications") {
      // Note: eventNotifications may not exist on User type
      // This is a placeholder - implement as needed
      await updateUser(user.id, {
        locationVisibility: user.locationVisibility,
      });
    } else if (key === "privacy") {
      await updateUser(user.id, {
        locationVisibility: !user.locationVisibility,
      });
    }
  };
  //   console.log("ProfileScreen activeTab =", activeTab);
  // console.log("ProfileScreen userId =", userId);
  // Update profile image if user avatar changes
  React.useEffect(() => {
    const newAvatar = user?.profilePicUrl || defaultAvatar;
    setProfileImage(newAvatar);
  }, [user?.profilePicUrl]);

  // Fetch connections on mount
  React.useEffect(() => {
    const fetchConnections = async () => {
      if (!user?.id) return;
      setIsLoadingConnections(true);
      try {
        const [connectionsData, requestsData] = await Promise.all([
          getAcceptedConnectionsApi(),
          getConnectionRequestsApi(),
        ]);
        setConnections(connectionsData.data ?? []);
        const pending = (requestsData.data ?? []).filter(
          (r) => r.status === "PENDING",
        );
        setPendingRequests(pending);
      } catch (error) {
        console.error("Failed to fetch connections:", error);
        // Fallback to mock data if API fails
        setConnections(mockConnections);
      } finally {
        setIsLoadingConnections(false);
      }
    };

    fetchConnections();
  }, [user?.id]);

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
  const name = user?.name;
  const bio = user?.bio;
  const profilePicUrl = user?.profilePicUrl;
  const photos = user?.photos;
  // const uploadPhotos = useUserStore((state) => state.uploadPhotos); // Already destructured

  console.log(profilePicUrl);
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
          setTempProfileImage(uri);
          setShowProfileImageConfirm(true);
        } else {
          if (user?.id) {
            setUploadingPhotos(true);
            try {
              await uploadPhotos(user.id, [
                {
                  uri,
                  name: `photo_${Date.now()}.jpg`,
                  type: "image/jpeg",
                },
              ]);
              Toast.show({
                type: "success",
                text1: "Photo uploaded successfully",
              });
              // Refresh user data to get updated photos
              await fetchUser(user.id);
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: "Failed to upload photo",
                text2: error.message || "Please try again",
              });
            } finally {
              setUploadingPhotos(false);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("ImagePicker Error:", error);
      Toast.show({
        type: "error",
        text1: "Failed to pick image",
        text2: error.message || "Please try again",
      });
    }
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    if (!user?.id) return;

    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingPhotoUrl(photoUrl);
              await deletePhoto(user.id, photoUrl);
              Toast.show({
                type: "success",
                text1: "Photo deleted successfully",
              });
              // Refresh user data to get updated photos
              await fetchUser(user.id);
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: "Failed to delete photo",
                text2: error.message || "Please try again",
              });
            } finally {
              setDeletingPhotoUrl(null);
            }
          },
        },
      ],
    );
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
              onPress={() => {
                // setShowTappdBandPopup(true);
                setShowComingSoon(true);
              }}
            >
              <Smartphone
                size={18}
                color={Theme.colors.mutedForeground}
                style={styles.settingsRowIcon}
              />
              <Text style={styles.settingsRowText}>Register TAPPD Band </Text>
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
              onPress={() => setPaymentFlow("MANAGE")}
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
                  "Are you sure you want to delete your account? This action cannot be undone.",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await deleteAccount();
                          Toast.show({
                            type: "success",
                            text1: "Account Deleted",
                            text2: "Your account has been permanently deleted",
                          });
                          // Navigation will happen automatically due to auth state change
                        } catch (err: any) {
                          Toast.show({
                            type: "error",
                            text1: "Failed to Delete Account",
                            text2: err.message || "An error occurred",
                          });
                        }
                      },
                    },
                  ]
                )
              }
            >
              <Trash2
                size={18}
                color={"#F87171"}
                style={styles.settingsRowIcon}
              />
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
                value={true}
                onValueChange={() => handleToggleSettings("notifications")}
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
                value={!user?.locationVisibility} // Private means NOT visible
                onValueChange={() => handleToggleSettings("privacy")}
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
                try {
                  await logout();
                  Toast.show({
                    type: "success",
                    text1: "Logged Out",
                    text2: "You have been successfully logged out",
                  });
                } catch (err: any) {
                  Toast.show({
                    type: "error",
                    text1: "Logout Failed",
                    text2: err.message || "An error occurred",
                  });
                }
              }}
            >
              <LogOut
                size={16}
                color={Theme.colors.foreground}
                style={styles.mr2}
              />
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

  const ProfilePhotoConfirmDialog = () => (
    <Dialog
      open={showProfileImageConfirm}
      onOpenChange={setShowProfileImageConfirm}
    >
      <DialogContent style={{ width: "90%" }}>
        <DialogHeader>
          <DialogTitle>Set Profile Photo</DialogTitle>
          <DialogDescription>
            Do you want to use this photo as your profile picture?
          </DialogDescription>
        </DialogHeader>

        {tempProfileImage && (
          <Image
            source={{ uri: tempProfileImage }}
            style={{
              width: "100%",
              height: 300,
              borderRadius: 12,
              marginVertical: 16,
            }}
          />
        )}

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Button
            variant="outline"
            style={{ flex: 1 }}
            onClick={() => {
              setTempProfileImage(null);
              setShowProfileImageConfirm(false);
            }}
          >
            Cancel
          </Button>

          <Button
            style={{ flex: 1 }}
            onClick={() => {
              setProfileImage(tempProfileImage!);
              setTempProfileImage(null);
              setShowProfileImageConfirm(false);
            }}
          >
            Set Photo
          </Button>
        </View>
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
            {/* Profile Header (Profile Photo, Name, Age, Bio, Info) */}
            <View style={styles.profileHeader}>
              {/* Profile Photo */}
              <View style={styles.photoWrapper}>
                <View style={styles.avatarBorder}>
                  <Avatar style={styles.avatarStyle}>
                    {profilePicUrl?.trim() || profileImage?.trim() ? (
                      <AvatarImage
                        src={profilePicUrl?.trim() || profileImage?.trim()}
                        alt={name ?? "User Profile"}
                      />
                    ) : (
                      <AvatarFallback>
                        <Text style={{ color: Theme.colors.foreground }}>
                          {name?.trim()
                            ? name
                              .trim()
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()
                            : "HA"}
                        </Text>
                      </AvatarFallback>
                    )}
                  </Avatar>
                </View>

                <Button
                  size="icon"
                  style={styles.cameraButton}
                  onClick={() => pickImage(true)}
                >
                  <Camera size={18} color={Theme.colors.foreground} />
                </Button>
              </View>

              {/* Name & Age */}
              <Text style={styles.userName}>
                {name ?? "Guest"}
                {user?.age ? `, ${user.age}` : ""}
              </Text>

              {/* Bio/Tagline */}
              {user?.bio && (
                <Text style={styles.tagline} numberOfLines={2}>
                  {user.bio} ✨
                </Text>
              )}

              {/* Info Pills Row */}
              <View style={styles.infoRow}>
                {[
                  user?.gender &&
                  `${user.gender.charAt(0).toUpperCase()}${user.gender.slice(1).toLowerCase()}`,
                  user?.location,
                  user?.occupation,
                ]
                  .filter(Boolean)
                  .map((item, index) => (
                    <View key={index} style={styles.infoPill}>
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

              {/* Edit Details Button - Full Width Below Tabs */}
              {activeTab === "about" && <AboutTab userId={userId} />}


              {activeTab === "connections" && (
                <View style={styles.tabContent}>
                  {/* Filter Buttons */}
                  <View style={styles.filterBar}>
                    {[
                      { label: "All", value: "all" },
                      { label: "Friends", value: "friends" },
                      { label: "Matches", value: "matches" },
                      { label: "Business", value: "business" },
                    ].map((filter) => (
                      <TouchableOpacity
                        key={filter.value}
                        onPress={() => setConnectionFilter(filter.value as any)}
                        style={[
                          styles.filterButton,
                          connectionFilter === filter.value &&
                          styles.filterButtonActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterButtonText,
                            connectionFilter === filter.value &&
                            styles.filterButtonTextActive,
                          ]}
                        >
                          {filter.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Pending Requests Section */}
                  {pendingRequests.length > 0 && (
                    <View style={{ marginBottom: 24 }}>
                      <Text
                        style={[
                          styles.sectionTitle,
                          { fontSize: 16, marginBottom: 12 },
                        ]}
                      >
                        Pending Requests ({pendingRequests.length})
                      </Text>
                      {pendingRequests.map((req) => (
                        <View key={req.id} style={styles.connectionCard}>
                          <View style={styles.connectionAvatarWrapper}>
                            <Image
                              source={{
                                uri:
                                  req.fromUser.profilePicUrl || defaultAvatar,
                              }}
                              style={styles.connectionAvatar}
                            />
                          </View>
                          <View style={{ flex: 1, paddingLeft: 10 }}>
                            <Text style={styles.connectionName}>
                              {req.fromUser.name}
                            </Text>
                            <Text style={styles.connectionAge}>
                              {req.fromUser.occupation}
                            </Text>
                            <View
                              style={{
                                flexDirection: "row",
                                gap: 8,
                                marginTop: 8,
                              }}
                            >
                              <Button
                                size="sm"
                                style={{
                                  backgroundColor: Theme.colors.primary,
                                  flex: 1,
                                }}
                                onClick={async () => {
                                  try {
                                    await respondConnectionApi({
                                      requestId: req.id,
                                      action: "ACCEPT",
                                    });
                                    Toast.show({
                                      type: "success",
                                      text1: "Request Accepted",
                                    });
                                    const requests =
                                      await getConnectionRequestsApi();
                                    const newConns =
                                      await getAcceptedConnectionsApi();
                                    setPendingRequests(
                                      (requests.data ?? []).filter(
                                        (r) => r.status === "PENDING",
                                      ),
                                    );
                                    setConnections(newConns.data ?? []);
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                style={{ flex: 1 }}
                                onClick={async () => {
                                  try {
                                    await respondConnectionApi({
                                      requestId: req.id,
                                      action: "REJECT",
                                    });
                                    Toast.show({
                                      type: "info",
                                      text1: "Request Rejected",
                                    });
                                    setPendingRequests((prev) =>
                                      prev.filter((p) => p.id !== req.id),
                                    );
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }}
                              >
                                Decline
                              </Button>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Connections Grid */}
                  {isLoadingConnections ? (
                    <View style={{ padding: 20 }}>
                      <ActivityIndicator
                        size="large"
                        color={Theme.colors.primary}
                      />
                    </View>
                  ) : (
                    <View style={styles.connectionsGrid}>
                      {connections
                        .filter((c) => {
                          if (connectionFilter === "all") return true;
                          return c.type === connectionFilter;
                        })
                        .map((connection, index) => (
                          <View
                            key={connection.id || index}
                            style={styles.connectionCardGrid}
                          >
                            <View style={styles.connectionAvatarWrapperGrid}>
                              <Image
                                source={{
                                  uri:
                                    connection.photo ||
                                    connection.profilePicUrl ||
                                    defaultAvatar,
                                }}
                                style={styles.connectionAvatar}
                              />
                            </View>
                            <Text style={styles.connectionName}>
                              {connection.name}
                            </Text>
                            <Text style={styles.connectionAge}>
                              {connection.age
                                ? `${connection.age} years old`
                                : "Friend"}
                            </Text>
                            <View
                              style={[
                                styles.connectionTypeBadge,
                                connection.type === "friend" &&
                                styles.connectionTypeBadgeFriend,
                                connection.type === "match" &&
                                styles.connectionTypeBadgeMatch,
                                connection.type === "business" &&
                                styles.connectionTypeBadgeBusiness,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.connectionTypeBadgeText,
                                  connection.type === "friend" &&
                                  styles.connectionTypeBadgeTextFriend,
                                  connection.type === "match" &&
                                  styles.connectionTypeBadgeTextMatch,
                                  connection.type === "business" &&
                                  styles.connectionTypeBadgeTextBusiness,
                                ]}
                              >
                                {connection.type || "friend"}
                              </Text>
                            </View>
                          </View>
                        ))}
                    </View>
                  )}
                </View>
              )}

              {activeTab === "photos" && (
                <View style={styles.tabContent}>
                  <View style={styles.photoGrid}>
                    {/* Add Photo Button */}
                    <TouchableOpacity
                      style={[
                        styles.addPhotoButton,
                        uploadingPhotos && styles.addPhotoButtonDisabled,
                      ]}
                      onPress={() => pickImage(false)}
                      disabled={uploadingPhotos}
                    >
                      {uploadingPhotos ? (
                        <ActivityIndicator
                          size="large"
                          color={Theme.colors.primary}
                        />
                      ) : (
                        <Plus size={48} color={Theme.colors.mutedForeground} />
                      )}
                    </TouchableOpacity>

                    {/* Existing Photos */}
                    {(user?.photos ?? []).map((photo, index) => (
                      <View key={photo || `photo-${index}`} style={styles.photoItemWrapper}>
                        <TouchableOpacity
                          style={styles.photoItem}
                          onPress={() => setSelectedPhoto(photo)}
                          disabled={deletingPhotoUrl === photo}
                        >
                          <Image
                            source={{ uri: photo }}
                            style={styles.photoGridImage}
                          />
                          {deletingPhotoUrl === photo && (
                            <View style={styles.photoOverlay}>
                              <ActivityIndicator
                                size="large"
                                color={Theme.colors.foreground}
                              />
                            </View>
                          )}
                        </TouchableOpacity>
                        {/* Delete Button */}
                        <TouchableOpacity
                          style={styles.deletePhotoButton}
                          onPress={() => handleDeletePhoto(photo)}
                          disabled={deletingPhotoUrl === photo}
                        >
                          <X
                            size={18}
                            color={Theme.colors.foreground}
                            strokeWidth={3}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  {user?.photos && user.photos.length === 0 && (
                    <View style={styles.emptyPhotosContainer}>
                      <Text style={styles.emptyPhotosText}>
                        No photos yet. Add your first photo!
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {activeTab === "settings" && (
                <View style={styles.tabContent}>
                  <Text style={styles.settingsSectionTitle}>Devices</Text>
                  <View style={styles.settingsList}>
                    <TouchableOpacity
                      style={styles.settingsRow}
                      onPress={() => {
                        // setShowTappdBandPopup(true);
                        setShowComingSoon(true);
                      }}
                    >
                      <Smartphone
                        size={18}
                        color={Theme.colors.mutedForeground}
                        style={styles.settingsRowIcon}
                      />
                      <Text style={styles.settingsRowText}>
                        Register TAPPD Band 
                      </Text>
                      <ChevronRight
                        size={18}
                        color={Theme.colors.mutedForeground}
                      />
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
                      <ChevronRight
                        size={18}
                        color={Theme.colors.mutedForeground}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.settingsSectionTitle}>
                    Account Settings
                  </Text>
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
                      <ChevronRight
                        size={18}
                        color={Theme.colors.mutedForeground}
                      />
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
                      <Text style={styles.settingsRowText}>
                        Change Password
                      </Text>
                      <ChevronRight
                        size={18}
                        color={Theme.colors.mutedForeground}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.settingsRow}
                      onPress={() => setShowComingSoon(true)}
                    >
                      <CreditCard
                        size={18}
                        color={Theme.colors.mutedForeground}
                        style={styles.settingsRowIcon}
                      />
                      <Text style={styles.settingsRowText}>
                        Manage Payment Information
                      </Text>
                      <ChevronRight
                        size={18}
                        color={Theme.colors.mutedForeground}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.settingsRow}
                      onPress={async () => {
                        console.log("Delete Account button clicked");
                        
                        const handleDelete = async () => {
                          console.log("Starting account deletion...");
                          try {
                            console.log("Calling deleteAccount API...");
                            await deleteAccount();
                            console.log("Account deleted successfully");
                            Toast.show({
                              type: "success",
                              text1: "Account Deleted",
                              text2: "Your account has been permanently deleted",
                            });
                          } catch (err: any) {
                            console.error("Delete account error:", err);
                            Toast.show({
                              type: "error",
                              text1: "Failed to Delete Account",
                              text2: err.message || "An error occurred",
                            });
                          }
                        };
                        
                        if (Platform.OS === 'web') {
                          console.log("Using window.confirm for web");
                          const confirmed = window.confirm(
                            "Delete Account\n\nAre you sure you want to delete your account? This action cannot be undone."
                          );
                          console.log("User confirmation:", confirmed);
                          
                          if (confirmed) {
                            await handleDelete();
                          } else {
                            console.log("User cancelled account deletion");
                          }
                        } else {
                          Alert.alert(
                            "Delete Account",
                            "Are you sure you want to delete your account? This action cannot be undone.",
                            [
                              {
                                text: "Cancel",
                                style: "cancel",
                                onPress: () => console.log("User cancelled"),
                              },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: handleDelete,
                              },
                            ]
                          );
                        }
                      }}
                    >
                      <Trash2
                        size={18}
                        color={"#F87171"}
                        style={styles.settingsRowIcon}
                      />
                      <Text
                        style={[styles.settingsRowText, { color: "#F87171" }]}
                      >
                        Delete Account
                      </Text>
                      <ChevronRight
                        size={18}
                        color={Theme.colors.mutedForeground}
                      />
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
                        <Text style={styles.settingsRowText}>
                          Push Notifications
                        </Text>
                      </View>
                      <Switch
                        value={true}
                        onValueChange={() =>
                          handleToggleSettings("notifications")
                        }
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
                        <Text style={styles.settingsRowText}>
                          Show Online Status
                        </Text>
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
                        <Text style={styles.settingsRowText}>
                          Private Profile
                        </Text>
                      </View>
                      <Switch
                        value={!user?.locationVisibility}
                        onValueChange={() => handleToggleSettings("privacy")}
                        trackColor={{ true: Theme.colors.primary }}
                        thumbColor={Theme.colors.foreground}
                      />
                    </View>
                  </View>

                  <Text style={styles.settingsSectionTitle}>
                    Help & Support
                  </Text>
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
                      <Text style={styles.settingsRowText}>
                        Contact Support
                      </Text>
                      <ChevronRight
                        size={18}
                        color={Theme.colors.mutedForeground}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingsLogoutWrapper}>
                    <Button
                      style={styles.logoutButton}
                      onClick={async () => {
                        try {
                          await logout();
                          Toast.show({
                            type: "success",
                            text1: "Logged Out",
                            text2: "You have been successfully logged out",
                          });
                        } catch (err: any) {
                          Toast.show({
                            type: "error",
                            text1: "Logout Failed",
                            text2: err.message || "An error occurred",
                          });
                        }
                      }}
                    >
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
      <ProfilePhotoConfirmDialog />
      <ComingSoon visible={showComingSoon} onClose={() => setShowComingSoon(false)} />
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
        onSubmit={async (email) => {
          try {
            await changeEmail({ newEmail: email });
            Toast.show({
              type: "success",
              text1: "Email Updated",
              text2: "Your email has been changed successfully",
            });
            setShowChangeEmailPopup(false);
            // Refresh user data
            if (user?.id) {
              await fetchUser(user.id);
            }
          } catch (err: any) {
            Toast.show({
              type: "error",
              text1: "Failed to Change Email",
              text2: err.message || "An error occurred",
            });
          }
        }}
        loading={authLoading}
      />
      <ChangePasswordPopup
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onRequestOtp={async (email) => {
          try {
            const { forgotPassword } = useAuthStore.getState();
            await forgotPassword(email);
            Toast.show({
              type: "success",
              text1: "OTP Sent",
              text2: "Please check your email for the OTP",
            });
          } catch (err: any) {
            Toast.show({
              type: "error",
              text1: "Failed to Send OTP",
              text2: err.message || "An error occurred",
            });
            throw err;
          }
        }}
        onSubmit={async (payload) => {
          try {
            await changePassword(payload);
            Toast.show({
              type: "success",
              text1: "Password Changed",
              text2: "Your password has been updated successfully",
            });
            setShowChangePassword(false);
          } catch (err: any) {
            Toast.show({
              type: "error",
              text1: "Failed to Change Password",
              text2: err.message || "An error occurred",
            });
            throw err;
          }
        }}
        loading={authLoading}
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
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  photoWrapper: { position: "relative", marginBottom: 20 },
  avatarBorder: {
    width: 140,
    height: 140,
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
    bottom: 4,
    right: 4,
    width: 40,
    height: 40,
    borderRadius: 9999,
    padding: 0,
    backgroundColor: Theme.colors.primary,
  },
  userName: {
    color: Theme.colors.foreground,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  tagline: {
    color: Theme.colors.mutedForeground,
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 24,
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
  tabsContainer: {
    position: "relative",
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  tabsList: {
    flexDirection: "row",
    height: 48,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
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
  tabContent: { padding: 24 },
  // Edit Button






  sectionTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 0,
  },
  bioText: {
    color: Theme.colors.mutedForeground,
    lineHeight: 24,
    marginBottom: 24,
    fontSize: 15,
  },
  detailsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  twoColumnGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  // Looking For Section
  lookingForSection: {
    marginBottom: 24,
  },
  lookingForButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  lookingForButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  lookingForButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  // Personal Details Section
  personalDetailsSection: {
    marginBottom: 24,
  },
  // Interests Section
  interestsSection: {
    marginBottom: 24,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  interestTag: {
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  interestTagText: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "500",
  },
  // Habits Section
  habitsSection: {
    marginBottom: 24,
  },
  // Photos Tab
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    justifyContent: "flex-start",
  },
  addPhotoButton: {
    width: (width - 68) / 2,
    height: ((width - 68) / 2) * 1.5,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoButtonDisabled: {
    opacity: 0.5,
  },
  photoItemWrapper: {
    width: (width - 68) / 2,
    height: ((width - 68) / 2) * 1.5,
    position: "relative",
  },
  photoItem: {
    width: "100%",
    height: "100%",
    borderRadius: Theme.radius.lg,
    overflow: "hidden",
  },
  photoGridImage: { width: "100%", height: "100%" },
  photoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.radius.lg,
  },
  deletePhotoButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  emptyPhotosContainer: {
    marginTop: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  emptyPhotosText: {
    color: Theme.colors.mutedForeground,
    fontSize: 16,
    textAlign: "center",
  },
  // Connections Tab
  filterBar: { flexDirection: "row", gap: 12, marginBottom: 24 },
  connectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    justifyContent: "flex-start",
  },
  connectionCard: {
    width: (width - 68) / 2,
    padding: 16,
    alignItems: "center",
    backgroundColor: "rgba(20, 15, 50, 0.4)",
    borderColor: Theme.colors.border,
    borderWidth: 1,
    borderRadius: Theme.radius.lg,
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
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "center",
  },
  connectionAge: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
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
    flex: 1,
    minWidth: (width - 64) / 2,
    backgroundColor: Theme.colors.muted,
    padding: 12,
    borderRadius: Theme.radius.md,
  },
  detailLabel: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
    textTransform: "capitalize",
  },
  detailValue: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "600",
  },
  // Utilities
  safeBottom: { paddingBottom: 100 },
  mr3: { marginRight: 12 },
  mr2: { marginRight: 8 },
  flexRowCenter: { flexDirection: "row", alignItems: "center" },
  // Filter Buttons
  filterButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
  filterButtonActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  filterButtonText: {
    color: Theme.colors.mutedForeground,
    fontSize: 15,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: Theme.colors.foreground,
  },
  // Two Column Layout
  twoColumnRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  columnHalf: {
    flex: 1,
  },
  // Connection Cards Grid
  connectionCardGrid: {
    width: (width - 68) / 2,
    padding: 20,
    alignItems: "center",
    backgroundColor: "rgba(20, 15, 50, 0.4)",
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  connectionAvatarWrapperGrid: {
    width: 96,
    height: 96,
    borderRadius: 9999,
    marginBottom: 12,
    overflow: "hidden",
  },
  connectionTypeBadge: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
  },
  connectionTypeBadgeFriend: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
  },
  connectionTypeBadgeMatch: {
    backgroundColor: "rgba(219, 39, 119, 0.2)",
  },
  connectionTypeBadgeBusiness: {
    backgroundColor: "rgba(251, 191, 36, 0.2)",
  },
  connectionTypeBadgeText: {
    fontSize: 13,
    fontWeight: "500",
  },
  connectionTypeBadgeTextFriend: {
    color: "#60A5FA",
  },
  connectionTypeBadgeTextMatch: {
    color: "#F472B6",
  },
  connectionTypeBadgeTextBusiness: {
    color: "#FCD34D",
  },
});
