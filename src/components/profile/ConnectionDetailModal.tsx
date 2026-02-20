import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Modal from "react-native-modal";
import { LinearGradient } from "expo-linear-gradient";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";
import { X, ArrowLeft, MessageCircle, UserMinus, AlertTriangle } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useConnectionStore } from "../../store/connectionStore";

const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  user: any;
  onClose: () => void;
  onUnfriend?: () => void;
}

// Custom Confirmation Modal Component
interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmModal = ({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmModalProps) => (
  <Modal
    isVisible={visible}
    animationIn="fadeIn"
    animationOut="fadeOut"
    backdropOpacity={0.7}
    onBackdropPress={!isLoading ? onCancel : undefined}
    style={styles.confirmModal}
  >
    <View style={styles.confirmContainer}>
      <View style={styles.confirmIconContainer}>
        <AlertTriangle size={32} color="#ff3040" />
      </View>
      <Text style={styles.confirmTitle}>{title}</Text>
      <Text style={styles.confirmMessage}>{message}</Text>
      <View style={styles.confirmButtons}>
        <TouchableOpacity
          style={[styles.confirmBtn, styles.cancelBtn]}
          onPress={onCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelBtnText}>{cancelText}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmBtn, styles.removeConfirmBtn, isLoading && styles.btnDisabled]}
          onPress={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.removeConfirmBtnText}>{confirmText}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export const ConnectionDetailModal = ({
  visible,
  user,
  onClose,
  onUnfriend,
}: Props) => {
  const [tab, setTab] = useState<"about" | "photos">("about");
  const [isRemoving, setIsRemoving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { unfriendConnection } = useConnectionStore();

  if (!user) return null;

  const handleRemovePress = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmRemove = async () => {
    setIsRemoving(true);
    const result = await unfriendConnection(user.id);
    setIsRemoving(false);
    setShowConfirmModal(false);
    
    if (result.success) {
      onUnfriend?.();
      onClose();
    }
    // Error is handled silently - could add a toast notification here
  };

  return (
    <Modal
      isVisible={visible}
      style={{ margin: 0 }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* HEADER */}
        <LinearGradient
          colors={GRADIENT_COLORS.primary as [string, string]}
          style={styles.header}
        >
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={onClose}>
              <ArrowLeft size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose}>
              <X size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* AVATAR */}
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri: user.profilePicUrl || "https://via.placeholder.com/150",
            }}
            style={styles.avatar}
          />
        </View>

        {/* CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* NAME & AGE (NO BOX) */}
          <Text style={styles.name}>{user.name}</Text>
          {user.age && (
            <Text style={styles.age}>{user.age} years old</Text>
          )}

          {/* FRIEND PILL */}
          <View style={styles.friendPill}>
            <Text style={styles.friendPillText}>friend</Text>
          </View>

          {/* ACTION BUTTONS WITH ICONS */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.messageBtn}>
              <MessageCircle size={18} color={Theme.colors.primaryForeground} />
              <Text style={styles.messageText}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.removeBtn, isRemoving && styles.removeBtnDisabled]}
              onPress={handleRemovePress}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <ActivityIndicator size="small" color={Theme.colors.foreground} />
              ) : (
                <>
                  <UserMinus size={18} color={Theme.colors.foreground} />
                  <Text style={styles.removeText}>Remove</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* TABS */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setTab("about")}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === "about" && styles.activeTab,
                ]}
              >
                About
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setTab("photos")}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === "photos" && styles.activeTab,
                ]}
              >
                Photos
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB CONTENT */}
          {tab === "about" ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bio}>
                {user.bio || "No bio available."}
              </Text>
            </View>
          ) : (
            <View style={styles.photoGrid}>
              {user.photos?.map((photo: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.photo}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Confirmation Modal */}
      <ConfirmModal
        visible={showConfirmModal}
        title="Remove Friend"
        message={`Are you sure you want to remove ${user.name || "this user"} from your connections?`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleConfirmRemove}
        onCancel={() => setShowConfirmModal(false)}
        isLoading={isRemoving}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },

  /* HEADER */
  header: {
    height: height * 0.32,
    paddingTop: 16, // 👈 buttons higher now
    paddingHorizontal: 20,
  },

  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  /* AVATAR */
  avatarWrapper: {
    alignItems: "center",
    marginTop: -70,
  },

  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: Theme.colors.background,
  },

  /* CONTENT */
  content: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  name: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "700",
    color: Theme.colors.foreground,
    textAlign: "center",
  },

  age: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },

  friendPill: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#2563EB",
  },

  friendPillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  /* ACTION BUTTONS */
  actionRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 24,
  },

  messageBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  messageText: {
    color: Theme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: "600",
  },

  removeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  removeBtnDisabled: {
    opacity: 0.6,
  },

  removeText: {
    color: Theme.colors.foreground,
    fontSize: 15,
    fontWeight: "600",
  },

  /* TABS */
  tabs: {
    flexDirection: "row",
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    width: "100%",
  },

  tabItem: {
    flex: 1,
  },

  tabText: {
    textAlign: "center",
    paddingVertical: 14,
    color: Theme.colors.mutedForeground,
    fontSize: 15,
  },

  activeTab: {
    color: Theme.colors.foreground,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.primary,
  },

  /* SECTIONS */
  section: {
    width: "100%",
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Theme.colors.foreground,
    marginBottom: 8,
  },

  bio: {
    color: Theme.colors.mutedForeground,
    lineHeight: 20,
  },

  /* PHOTOS */
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginTop: 20,
  },

  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },

  /* CONFIRMATION MODAL */
  confirmModal: {
    margin: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  confirmContainer: {
    backgroundColor: "#1c1c1e",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },

  confirmIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 48, 64, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  confirmTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Theme.colors.foreground,
    marginBottom: 8,
    textAlign: "center",
  },

  confirmMessage: {
    fontSize: 15,
    color: Theme.colors.mutedForeground,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },

  confirmButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelBtn: {
    backgroundColor: "#2c2c2e",
  },

  cancelBtnText: {
    color: Theme.colors.foreground,
    fontSize: 15,
    fontWeight: "600",
  },

  removeConfirmBtn: {
    backgroundColor: "#ff3040",
  },

  removeConfirmBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  btnDisabled: {
    opacity: 0.6,
  },
});
