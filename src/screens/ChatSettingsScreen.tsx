import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Heart,
  Paperclip,
  UserX,
  Shield,
  AlertTriangle,
  Palette,
  Check,
  X,
} from "lucide-react-native";
import { Theme } from "../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";

const ActionItem = ({
  icon: Icon,
  title,
  subtitle,
  color = Theme.colors.foreground,
  iconColor,
  onPress,
}: {
  icon: any;
  title: string;
  subtitle: string;
  color?: string;
  iconColor?: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.actionItem} onPress={onPress}>
    <View style={styles.actionIconContainer}>
      <Icon size={20} color={iconColor || "#A855F7"} />
    </View>
    <View style={styles.actionTextContainer}>
      <Text style={[styles.actionTitle, { color }]}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
    <ChevronRight size={16} color={Theme.colors.mutedForeground} />
  </TouchableOpacity>
);

export function ChatSettingsScreen() {
  const navigation = useNavigation();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("Default Purple");
  const [showDateModal, setShowDateModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const themes = [
    { name: "Default Purple", color: "#D946EF" },
    { name: "Ocean Blue", color: "#0EA5E9" },
    { name: "Sunset Orange", color: "#F97316" },
    { name: "Forest Green", color: "#22C55E" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Theme.colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.userCard}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?u=emma" }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>Emma Johnson</Text>
            <Text style={styles.userContext}>
              Connected via Jazz Night Event
            </Text>
          </View>
        </View>

        {/* Chat Theme Section */}
        <View style={[styles.section, { zIndex: 20 }]}>
          <View style={styles.sectionHeader}>
            <Palette size={18} color="#D946EF" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Chat Theme</Text>
          </View>

          <View style={{ zIndex: 10 }}>
            <TouchableOpacity
              style={styles.themeSelector}
              onPress={() => setIsThemeOpen(!isThemeOpen)}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={[
                    styles.colorPreview,
                    {
                      backgroundColor: themes.find(
                        (t) => t.name === selectedTheme
                      )?.color,
                    },
                  ]}
                />
                <Text style={styles.themeName}>{selectedTheme}</Text>
              </View>
              <ChevronDown size={16} color={Theme.colors.mutedForeground} />
            </TouchableOpacity>

            {/* Theme Dropdown */}
            {isThemeOpen && (
              <View style={styles.themeDropdown}>
                {themes.map((theme) => (
                  <TouchableOpacity
                    key={theme.name}
                    style={styles.themeOption}
                    onPress={() => {
                      setSelectedTheme(theme.name);
                      setIsThemeOpen(false);
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={[
                          styles.colorPreview,
                          { backgroundColor: theme.color },
                        ]}
                      />
                      <Text style={styles.themeName}>{theme.name}</Text>
                    </View>
                    {selectedTheme === theme.name && (
                      <Check size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Actions List */}
        <View style={[styles.actionsList, { zIndex: 1 }]}>
          <ActionItem
            icon={Heart}
            title="Friend for Date"
            subtitle="Ask if they're interested in dating"
            iconColor="#EF4444" // Red heart
            onPress={() => setShowDateModal(true)}
          />
          <ActionItem
            icon={Paperclip}
            title="Attachment"
            subtitle="Send photos, videos, or files"
            iconColor="#3B82F6" // Blue clip
          />
          <ActionItem
            icon={UserX}
            title="Remove User"
            subtitle="Remove this person from your friends"
            iconColor="#F59E0B" // Orange user
            onPress={() => setShowRemoveModal(true)}
          />
          <ActionItem
            icon={Shield}
            title="Block User"
            subtitle="Block and report this user"
            iconColor="#EF4444" // Red shield
            onPress={() => setShowBlockModal(true)}
          />
          <ActionItem
            icon={AlertTriangle}
            title="Report an Issue"
            subtitle="Report inappropriate behavior"
            color="#EF4444" // Red text for report
            iconColor="#FCD34D" // Yellow alert
          />
        </View>

        {/* Connection Info */}
        <View style={styles.connectionInfoCard}>
          <Text style={styles.connectionTitle}>Connection Info</Text>
          <Text style={styles.connectionDetail}>• Connected: 2 days ago</Text>
          <Text style={styles.connectionDetail}>
            • Mutual interests: Jazz, Live Music
          </Text>
          <Text style={styles.connectionDetail}>
            • Mutual friends: 3 people
          </Text>
        </View>
      </ScrollView>

      {/* Date Request Modal */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Heart size={20} color="#EF4444" fill="#EF4444" />
                <Text style={styles.modalTitle}>
                  Send Anonymous Date Request
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <X size={20} color={Theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Your request will be sent anonymously to Emma Johnson. They will
              only know it's you if they also express interest by selecting
              "Friend for Date".
            </Text>

            <View style={styles.stepsContainer}>
              <View style={styles.stepItem}>
                <View
                  style={[styles.stepNumber, { backgroundColor: "#4C1D95" }]}
                >
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepTitle}>Anonymous Request</Text>
                  <Text style={styles.stepDesc}>
                    Your identity stays hidden until mutual interest
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View
                  style={[styles.stepNumber, { backgroundColor: "#4C1D95" }]}
                >
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepTitle}>Wait for Match</Text>
                  <Text style={styles.stepDesc}>
                    If they also click "Friend for Date", you'll both be
                    notified
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View
                  style={[styles.stepNumber, { backgroundColor: "#be185d" }]}
                >
                  <Heart size={12} color="#fff" fill="#fff" />
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepTitle}>
                    Theme Changes Automatically
                  </Text>
                  <Text style={styles.stepDesc}>
                    Chat theme will switch to romantic Date Theme on mutual
                    match
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setShowDateModal(false)}
              >
                <LinearGradient
                  colors={["#D946EF", "#A855F7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <Heart
                    size={16}
                    color="#fff"
                    fill="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.confirmButtonText}>Send Request</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Remove Friend Modal */}
      <Modal
        visible={showRemoveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRemoveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: "#F59E0B" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Remove Friend</Text>
              <TouchableOpacity onPress={() => setShowRemoveModal(false)}>
                <X size={20} color={Theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Are you sure you want to remove Emma Johnson from your friends
              list? This action cannot be undone.
            </Text>

            <View style={styles.warningBox}>
              <AlertTriangle
                size={24}
                color="#F59E0B"
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.warningTitle}>This will:</Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>
                  • Remove Emma Johnson from your friends list
                </Text>
                <Text style={styles.bulletItem}>
                  • Remove you from their friends list
                </Text>
                <Text style={styles.bulletItem}>• Delete all chat history</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowRemoveModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: "#F97316" }]}
                onPress={() => setShowRemoveModal(false)}
              >
                <UserX size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.confirmButtonText}>Remove Friend</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Block User Modal */}
      <Modal
        visible={showBlockModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBlockModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: "#EF4444" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Block User</Text>
              <TouchableOpacity onPress={() => setShowBlockModal(false)}>
                <X size={20} color={Theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Are you sure you want to block Emma Johnson? You can unblock them
              later in settings.
            </Text>

            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  borderColor: "rgba(239, 68, 68, 0.2)",
                },
              ]}
            >
              <Shield size={24} color="#EF4444" style={{ marginBottom: 12 }} />
              <Text style={styles.warningTitle}>This will:</Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>
                  • Prevent them from messaging you
                </Text>
                <Text style={styles.bulletItem}>
                  • Hide your profile from them
                </Text>
                <Text style={styles.bulletItem}>
                  • Hide their activity from you
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowBlockModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: "#EF4444" }]}
                onPress={() => setShowBlockModal(false)}
              >
                <Shield size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.confirmButtonText}>Block User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0A1F", // Deep dark purple background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.foreground,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1625", // Slightly lighter card bg
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  userContext: {
    fontSize: 13,
    color: Theme.colors.mutedForeground,
  },
  section: {},
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  themeSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A1625",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  colorPreview: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#D946EF", // Pink/Purple for default
    marginRight: 12,
  },
  themeName: {
    color: "#fff",
    fontSize: 14,
  },
  actionsList: {
    backgroundColor: "#1A1625",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  actionIconContainer: {
    width: 32,
    alignItems: "center",
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
    color: "#fff",
  },
  actionSubtitle: {
    fontSize: 12,
    color: Theme.colors.mutedForeground,
  },
  connectionInfoCard: {
    backgroundColor: "#1A1625",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  connectionDetail: {
    fontSize: 13,
    color: Theme.colors.mutedForeground,
    marginBottom: 6,
    lineHeight: 20,
  },

  // Theme Dropdown
  themeDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#1E1A2C", // Slightly darker than item
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    zIndex: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#110E1F",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  modalDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
    marginBottom: 24,
  },

  // Steps
  stepsContainer: {
    backgroundColor: "#1A1625",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  stepItem: {
    flexDirection: "row",
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  stepDesc: {
    color: "#9CA3AF",
    fontSize: 12,
    lineHeight: 16,
  },

  // Modal Actions
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
  },
  gradientButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  removeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },

  // Warning Box
  warningBox: {
    backgroundColor: "rgba(245, 158, 11, 0.1)", // Orange/Amber tint
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  warningTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  bulletList: {
    gap: 6,
  },
  bulletItem: {
    color: "#D1D5DB",
    fontSize: 13,
  },
});
