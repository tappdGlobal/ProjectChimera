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
import { useNavigation } from "@react-navigation/native";
import { SCREEN_NAMES } from "../../navigation/Routes";
import { useAppNavigation } from "../../hooks/useAppNavigation";

const { height, width } = Dimensions.get("window");

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
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const { unfriendConnection } = useConnectionStore();
  const navigation = useAppNavigation();

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

  const PhotoViewer = () => (
    <Modal
      isVisible={!!selectedPhoto}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.9}
      onBackdropPress={() => setSelectedPhoto(null)}
      style={styles.photoViewerModal}
    >
      <View style={styles.photoViewerContainer}>
        <Image source={{ uri: selectedPhoto || undefined }} style={styles.photoViewerImage} />
        <TouchableOpacity style={styles.photoViewerClose} onPress={() => setSelectedPhoto(null)}>
          <X size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );

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

        {/* AVATAR (with gradient ring) */}
        <View style={styles.avatarWrapper}>
          <LinearGradient
            colors={GRADIENT_COLORS.primary}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.avatarGradient}
          >
            <View style={styles.avatarInnerBorder}>
              <Image
                source={{ uri: user.profilePicUrl || "https://via.placeholder.com/150" }}
                style={styles.avatar}
              />
            </View>
          </LinearGradient>
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
            <TouchableOpacity
              style={styles.messageWrapper}
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                // Navigate to Chat Detail through the root navigator
                // CHAT_DETAIL is registered in AppStackParamList
                navigation.navigate(SCREEN_NAMES.CHAT_DETAIL, {
                  chatId: user.id,
                  name: user.name,
                  avatar: user.profilePicUrl || "https://via.placeholder.com/150",
                });
              }}
            >
              <LinearGradient
                colors={GRADIENT_COLORS.primary}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.messageGradient}
              >
                <MessageCircle size={18} color={Theme.colors.primaryForeground} />
                <Text style={styles.messageText}>Message</Text>
              </LinearGradient>
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
              <Text style={styles.bio}>{user.bio || "No bio available."}</Text>

              {/* Occupation / Education two-column row */}
              <View style={styles.twoColumnRow}>
                <View style={styles.columnItem}>
                  <Text style={styles.infoLabel}>Occupation</Text>
                  <Text style={styles.infoValue}>{user.occupation || "-"}</Text>
                </View>

                <View style={styles.columnItem}>
                  <Text style={styles.infoLabel}>Education</Text>
                  <Text style={styles.infoValue}>{user.education || "-"}</Text>
                </View>
              </View>

              {/* Location */}
              <View style={[styles.section, { paddingTop: 6 }]}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{user.location || "-"}</Text>
              </View>

              {/* Interests */}
              <View style={[styles.section, { paddingTop: 6 }]}>
                <Text style={styles.infoLabel}>Interests</Text>
                <View style={styles.interestRow}>
                  {(user.interests || []).length === 0 ? (
                    <Text style={styles.infoValue}>No interests listed.</Text>
                  ) : (
                    (user.interests || []).map((it: string, idx: number) => (
                      <View key={`${it}-${idx}`} style={styles.interestChip}>
                        <Text style={styles.interestText}>{it}</Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.photoGridNoAdd}>
              {user.photos?.map((photo: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedPhotoIndex(index);
                    setSelectedPhoto(photo);
                  }}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: photo }} style={styles.photoGridImage} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
        {PhotoViewer()}
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
    height: height * 0.25,
    paddingTop: 16,
    paddingHorizontal: 20,
  },

  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  /* AVATAR */
  avatarWrapper: {
    alignItems: "center",
    marginTop: -48,
  },

  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    overflow: "hidden",
  },

  /* CONTENT */
  content: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },

  name: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "700",
    color: Theme.colors.foreground,
    textAlign: "center",
  },

  age: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    marginTop: 2,
    textAlign: "center",
  },

  friendPill: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
    marginTop: 16,
  },

  /* Message button (gradient) */
  messageWrapper: {
    flex: 1,
  },

  messageGradient: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  messageText: {
    color: Theme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: "700",
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
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    width: "100%",
  },

  tabItem: {
    flex: 1,
  },

  tabText: {
    textAlign: "center",
    paddingVertical: 12,
    color: Theme.colors.mutedForeground,
    fontSize: 15,
  },

  activeTab: {
    color: Theme.colors.foreground,
    borderWidth: 1,
    borderColor: GRADIENT_COLORS.primary[0],
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "transparent",
  },

  /* Avatar gradient ring */
  avatarGradient: {
    width: 126,
    height: 126,
    borderRadius: 63,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  avatarInnerBorder: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: Theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  /* About info layout */
  twoColumnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 12,
    gap: 16,
  },

  columnItem: {
    flex: 1,
  },

  infoLabel: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
    marginBottom: 6,
  },

  infoValue: {
    color: Theme.colors.foreground,
    fontSize: 15,
    fontWeight: "600",
  },

  interestRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },

  interestChip: {
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },

  interestText: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
  },

  /* SECTIONS */
  section: {
    width: "100%",
    marginTop: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Theme.colors.foreground,
    marginBottom: 6,
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

  /* Connection photo grid (no add) */
  photoGridNoAdd: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 14,
    gap: 10,
  },

  photoGridImage: {
    width: (width - 60) / 2,
    height: (width - 60) / 2,
    borderRadius: 12,
    marginBottom: 12,
  },

  /* Photo viewer modal */
  photoViewerModal: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  photoViewerContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.9)",
  },

  photoViewerImage: {
    width: "100%",
    height: "80%",
    resizeMode: "contain",
  },

  photoViewerClose: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
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
