import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeft,
  Bell,
  Eye,
  Shield,
  UserIcon,
  KeyRound,
  CreditCard,
  Trash2,
  ChevronRight,
  HelpCircle,
  LogOut,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { Theme } from "../styles/Theme";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/userStore";
import { useAppNavigation } from "../hooks/useAppNavigation";
import { useAnalytics } from "../hooks/useAnalytics";
import { ChangeEmailPopup } from "../components/profile/ChangeEmailPopup";
import { ChangePasswordPopup } from "../components/profile/ChangePasswordPopup";

export function SettingsScreen() {
  const navigation = useAppNavigation();
  const { logout, changeEmail, changePassword, deleteAccount, loading: authLoading } = useAuthStore();
  const { profile, fetchUser, updateUser } = useUserStore();
  const { user: authUser } = useAuthStore();
  const user = profile || authUser;
  
  const { trackEvent, trackButtonClick, resetUser } = useAnalytics(
    "SettingsScreen",
    {
      user_id: user?.id,
      user_name: user?.name,
    }
  );

  const [showChangeEmailPopup, setShowChangeEmailPopup] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleToggleSettings = async (key: string) => {
    if (!user?.id) return;

    if (key === "notifications") {
      trackButtonClick("toggle_notifications");
      setNotificationsEnabled(!notificationsEnabled);
      Toast.show({
        type: "info",
        text1: "Notifications",
        text2: `Notifications ${!notificationsEnabled ? "enabled" : "disabled"}`,
      });
    } else if (key === "privacy") {
      trackButtonClick("toggle_privacy");
      try {
        await updateUser(user.id, {
          locationVisibility: !user.locationVisibility,
        });
        Toast.show({
          type: "success",
          text1: "Privacy Updated",
          text2: `Profile is now ${!user.locationVisibility ? "public" : "private"}`,
        });
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Update Failed",
          text2: err.message || "An error occurred",
        });
      }
    }
  };

  const handleLogout = async () => {
    trackButtonClick("logout");
    try {
      await logout();
      resetUser();
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
  };

  const handleDeleteAccount = async () => {
    trackButtonClick("delete_account_confirm");
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
              resetUser();
              Toast.show({
                type: "success",
                text1: "Account Deleted",
                text2: "Your account has been permanently deleted",
              });
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
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Theme.colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Settings */}
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.settingsList}>
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => {
              trackButtonClick("change_email");
              setShowChangeEmailPopup(true);
            }}
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
            onPress={() => {
              trackButtonClick("change_password");
              setShowChangePassword(true);
            }}
          >
            <KeyRound
              size={18}
              color={Theme.colors.mutedForeground}
              style={styles.settingsRowIcon}
            />
            <Text style={styles.settingsRowText}>Change Password</Text>
            <ChevronRight
              size={18}
              color={Theme.colors.mutedForeground}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => {
              trackButtonClick("delete_account");
              handleDeleteAccount();
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

        {/* App Settings */}
        <Text style={styles.sectionTitle}>App Settings</Text>
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
              value={notificationsEnabled}
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

        {/* Help & Support */}
        <Text style={styles.sectionTitle}>Help & Support</Text>
        <View style={styles.settingsList}>
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => {
              trackButtonClick("contact_support");
              Alert.alert("Contact Support", "support@tappd.co.in");
            }}
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

        {/* Logout Button */}
        <View style={styles.logoutWrapper}>
          <Button
            style={styles.logoutButton}
            onClick={handleLogout}
            disabled={authLoading}
          >
            {authLoading ? (
              <ActivityIndicator color={Theme.colors.foreground} />
            ) : (
              <>
                <LogOut
                  size={16}
                  color={Theme.colors.foreground}
                  style={styles.mr2}
                />
                Logout
              </>
            )}
          </Button>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Change Email Popup */}
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
            if (user?.id) {
              await fetchUser(user.id);
            }
          } catch (err: any) {
            Toast.show({
              type: "error",
              text1: "Failed to Change Email",
              text2: err.message || "An error occurred",
            });
            throw err;
          }
        }}
        loading={authLoading}
      />

      {/* Change Password Popup */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backButton: {
    padding: Theme.spacing.s,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: Theme.fontWeights.medium,
    color: Theme.colors.foreground,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.m,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: Theme.fontWeights.medium,
    color: Theme.colors.mutedForeground,
    marginTop: Theme.spacing.l,
    marginBottom: Theme.spacing.s,
    textTransform: "uppercase",
  },
  settingsList: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: "hidden",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  settingsRowIcon: {
    marginRight: Theme.spacing.m,
  },
  settingsRowText: {
    flex: 1,
    fontSize: 15,
    color: Theme.colors.foreground,
  },
  settingsToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  settingsToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoutWrapper: {
    marginTop: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.m,
  },
  logoutButton: {
    backgroundColor: "#DC2626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  mr2: {
    marginRight: 8,
  },
  bottomSpacer: {
    height: Theme.spacing.xl,
  },
});
