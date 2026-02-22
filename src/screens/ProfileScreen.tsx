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
  Modal,
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
  ChevronLeft,
  KeyRound,
  X,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
// import { ChangeEmailPopup } from "../components/profile/ChangeEmailPopup";
import { PaymentDetailForm } from "../components/profile/PaymentDetailForm";
import { ChangePasswordPopup } from "../components/profile/ChangePasswordPopup";
import { ManagePaymentInformationPopup } from "../components/profile/ManagePaymentInformationPopup";
import { AddPaymentAccountTypePopup } from "../components/profile/AddPaymentAccountTypePopup";
import { DeleteAccountModal } from "../components/profile/DeleteAccountModal";
import ComingSoon from "../components/common/ComingSoon";
import { Connections } from "../components/profile/Connections";

const { width } = Dimensions.get("window");



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
export function ProfileScreen() {
  const navigation = useAppNavigation();
  const { userId, token } = useAuthStore();

  // console.log("ProfileScreen userId:", userId);
  // console.log("ProfileScreen token:", token);


  const { logout, changeEmail, resetPassword, loading: authLoading } = useAuthStore();
  const { profile, fetchUser, updateUser, uploadPhotos, uploadProfilePicture, deletePhoto, loading, setProfile } =
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

  // Open settings dialog when showSettings param is passed
  React.useEffect(() => {
    if (route.params?.showSettings) {
      setShowSettings(true);
    }
  }, [route.params?.showSettings]);
  const [showOnlineStatus, setShowOnlineStatus] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [tempProfileImage, setTempProfileImage] = useState<string | null>(null);
  const [showProfileImageConfirm, setShowProfileImageConfirm] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  const [deletingPhotoUrl, setDeletingPhotoUrl] = useState<string | null>(null);

  // Use user avatar or profilePicUrl, fallback to a default placeholder instead of mock photos
  const defaultAvatar = "https://via.placeholder.com/400x400?text=No+Photo";
  const [profileImage, setProfileImage] = useState(
    user?.profilePicUrl || defaultAvatar,
  );
  const [showTappdBandPopup, setShowTappdBandPopup] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showManageBandPopup, setShowManageBandPopup] = useState(false);
  // const [showChangeEmailPopup, setShowChangeEmailPopup] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);

  type PaymentFlow = "NONE" | "MANAGE" | "ACCOUNT_TYPE" | "DETAIL_FORM";

  const [paymentFlow, setPaymentFlow] = useState<PaymentFlow>("NONE");
  const [paymentType, setPaymentType] = useState<
    "Individual" | "Business" | null
  >(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  // Fetch user data on mount
React.useEffect(() => {
  if (user?.id && !profile) {
    fetchUser(user.id);
  }
}, [user?.id, profile]);

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
            {/* <TouchableOpacity
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
            </TouchableOpacity> */}

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
              onPress={() => setShowDeleteAccountModal(true)}
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

  const insets = useSafeAreaInsets();

  const PhotoDialog = () => {
    const photos = user?.photos ?? [];

    const handleNextPhoto = () => {
      if (selectedPhotoIndex < photos.length - 1) {
        const nextIndex = selectedPhotoIndex + 1;
        setSelectedPhotoIndex(nextIndex);
        setSelectedPhoto(photos[nextIndex]);
      }
    };

    const handlePrevPhoto = () => {
      if (selectedPhotoIndex > 0) {
        const prevIndex = selectedPhotoIndex - 1;
        setSelectedPhotoIndex(prevIndex);
        setSelectedPhoto(photos[prevIndex]);
      }
    };

    return (
      <Modal
        visible={!!selectedPhoto}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.photoModalOverlay}>
          <View style={styles.photoModalContent}>
            <View style={styles.photoModalContainer}>
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedPhoto(null)}
                activeOpacity={0.7}
              >
                <X size={24} color="white" />
              </TouchableOpacity>

              {/* Image Container with Navigation */}
              <View style={styles.photoImageContainer}>
                {selectedPhoto && (
                  <>
                    {/* Previous Button */}
                    {selectedPhotoIndex > 0 && (
                      <TouchableOpacity
                        style={[styles.navButton, styles.navButtonLeft]}
                        onPress={handlePrevPhoto}
                        activeOpacity={0.7}
                      >
                        <ChevronLeft size={32} color="white" />
                      </TouchableOpacity>
                    )}

                    {/* Photo */}
                    <Image
                      source={{ uri: selectedPhoto }}
                      style={styles.fullSizePhoto}
                      resizeMode="contain"
                    />

                    {/* Next Button */}
                    {selectedPhotoIndex < photos.length - 1 && (
                      <TouchableOpacity
                        style={[styles.navButton, styles.navButtonRight]}
                        onPress={handleNextPhoto}
                        activeOpacity={0.7}
                      >
                        <ChevronRight size={32} color="white" />
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const handleConfirmProfilePicture = async () => {
    if (!user?.id || !tempProfileImage) return;

    setUploadingProfilePicture(true);
    try {
      // Extract filename from uri
      const filename = tempProfileImage.split('/').pop() || `profile_${Date.now()}.jpg`;

      await uploadProfilePicture(user.id, {
        uri: tempProfileImage,
        name: filename,
        type: "image/jpeg",
      });

      // Update local state
      setProfileImage(tempProfileImage);
      setTempProfileImage(null);
      setShowProfileImageConfirm(false);

      Toast.show({
        type: "success",
        text1: "Profile picture updated successfully",
      });

      // Refresh user data to get updated profile
      await fetchUser(user.id);
    } catch (error: any) {
      console.error("Profile picture upload error:", error);
      Toast.show({
        type: "error",
        text1: "Failed to upload profile picture",
        text2: error.message || "Please try again",
      });
    } finally {
      setUploadingProfilePicture(false);
    }
  };

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
            disabled={uploadingProfilePicture}
          >
            Cancel
          </Button>

          <Button
            style={{ flex: 1 }}
            onClick={handleConfirmProfilePicture}
            disabled={uploadingProfilePicture}
          >
            {uploadingProfilePicture ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              "Set Photo"
            )}
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );

  // --- MAIN RENDER ---
  return (
    <SafeAreaView style={[styles.flex1, { backgroundColor: Theme.colors.background }]} edges={["top", "left", "right"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Theme.colors.background}
        translucent={false}
      />

      {/* Full-screen loader while fetching */}
      {loading && (
        <View style={styles.fullScreenLoader}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loaderText}>Loading profile...</Text>
        </View>
      )}

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

              <Text style={styles.tagline} numberOfLines={2}>
                {user?.bio?.trim()
                  ? `${user.bio} ✨`
                  : "Exploring every day like it’s the first ✨"}
              </Text>


              {/* Info Pills Row */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaText}>
                    {user?.gender
                      ? user.gender.charAt(0).toUpperCase() +
                      user.gender.slice(1).toLowerCase()
                      : "gender"}
                  </Text>
                </View>

                <View style={styles.metaItem}>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaText}>
                    {user?.location || "location"}
                  </Text>
                </View>

                <View style={styles.metaItem}>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaText}>
                    {user?.occupation || "occupation"}
                  </Text>
                </View>
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
                <Connections
                  userId={user?.id}
                  defaultAvatar={defaultAvatar}
                />
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
                        {/* Delete Button - positioned outside the photo touch area */}
                        <TouchableOpacity
                          style={styles.deletePhotoButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeletePhoto(photo);
                          }}
                          disabled={deletingPhotoUrl === photo}
                        >
                          <X
                            size={18}
                            color={Theme.colors.foreground}
                            strokeWidth={3}
                          />
                        </TouchableOpacity>
                        {/* Photo - clickable to view full screen */}
                        <TouchableOpacity
                          style={styles.photoItem}
                          onPress={() => {
                            setSelectedPhotoIndex(index);
                            setSelectedPhoto(photo);
                          }}
                          disabled={deletingPhotoUrl === photo}
                          activeOpacity={0.9}
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
                    {/* <TouchableOpacity
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
                    </TouchableOpacity> */}
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
                      onPress={() => setShowDeleteAccountModal(true)}
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
                      <View style={styles.logoutInner}>
                        <LogOut size={16} color={Theme.colors.foreground} />
                        <Text style={styles.logoutText}>Logout</Text>
                      </View>
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
      {/* <ChangeEmailPopup
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
      /> */}
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
            await resetPassword(payload);
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

      <DeleteAccountModal
        visible={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onAccountDeleted={async () => {
          try {
            setShowDeleteAccountModal(false);
            // Clear auth state and logout
            await logout();
            // Navigate to Welcome screen after logout
            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: SCREEN_NAMES.WELCOME as any }],
              });
            }, 100);
          } catch (error) {
            console.error("Error during account deletion cleanup:", error);
            // Force navigation even if logout fails
            navigation.reset({
              index: 0,
              routes: [{ name: SCREEN_NAMES.WELCOME as any }],
            });
          }
        }}
      />
    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  flex1: { flex: 1 },
  mainContainer: { flex: 1, backgroundColor: Theme.colors.background },
  
  fullScreenLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  
  loaderText: {
    color: Theme.colors.foreground,
    fontSize: 14,
    marginTop: 16,
    textAlign: "center",
  },

  header: {
    paddingTop: 0,
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

  profileHeader: {
    paddingTop: 28,
    paddingBottom: 18,
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

  profileImage: { width: "100%", height: "100%" },

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
    marginBottom: 4,
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

  lookingForSection: { marginBottom: 24 },

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

  personalDetailsSection: { marginBottom: 24 },

  interestsSection: { marginBottom: 24 },

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

  habitsSection: { marginBottom: 24 },

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

  addPhotoButtonDisabled: { opacity: 0.5 },

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

  logoutButton: {
    backgroundColor: "#bc1313",
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  settingsModal: { width: "90%", maxHeight: "80%" },
  settingsModalScroll: { maxHeight: 520 },
  settingsModalScrollContent: { paddingBottom: 12 },

  settingsSectionTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 10,
  },

  settingsList: { backgroundColor: "transparent" },

  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  settingsRowIcon: { marginRight: 12 },

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

  safeBottom: { paddingBottom: 100 },

  mr2: { marginRight: 8 },

  logoutInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    lineHeight: 16,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    marginTop: 6,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.primary,
  },

  metaText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    fontWeight: "500",
  },

  // Photo Modal Styles
  photoModalContent: {
    width: "95%",
    height: "85%",
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
    borderRadius: 20,
    overflow: "hidden",
  },

  photoModalContainer: {
    flex: 1,
    backgroundColor: "rgba(20, 20, 30, 0.98)",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    position: "relative",
  },

  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },

  photoCounter: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 15,
  },

  photoCounterText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  photoImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    position: "relative",
  },

  fullSizePhoto: {
    width: "100%",
    height: "100%",
  },

  photoModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },

  navButton: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },

  navButtonLeft: {
    left: 10,
  },

  navButtonRight: {
    right: 10,
  },
});

