import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, X, ArrowLeft, MapPin } from "lucide-react-native";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProfileUser {
  id: string;
  name: string;
  gender?: string;
  age?: number;
  location?: string;
  profilePicUrl?: string;
  bio?: string;
  interests?: string[];
  occupation?: string;
  education?: string;
  events?: number;
  mutualFriends?: number;
  photos?: string[];
}

interface Props {
  visible: boolean;
  user: ProfileUser | null;
  onClose: () => void;
}

export const ProfileDetailModal = ({
  visible,
  user,
  onClose,
}: Props) => {
  const [tab, setTab] = useState<"about" | "photos">("about");

  if (!user) return null;

  return (
    <Modal
      isVisible={visible}
      style={{ margin: 0 }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Gradient Header */}
          <LinearGradient
            colors={GRADIENT_COLORS.primary as [string, string]}
            style={styles.header}
          >
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={onClose}>
                <ArrowLeft color={Theme.colors.primaryForeground} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <X color={Theme.colors.primaryForeground} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Profile Image */}
          <View style={styles.imageWrapper}>
            <Image
              source={{
                uri:
                  user.profilePicUrl ||
                  "https://via.placeholder.com/150",
              }}
              style={styles.profileImage}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.name}>{user.name}</Text>

            <Text style={styles.subText}>
              {user.age || "N/A"} years old • {user.gender || "N/A"}
            </Text>

            <View style={styles.locationRow}>
              <MapPin size={14} color={Theme.colors.primary} />
              <Text style={styles.locationText}>
                {user.location || "Unknown"}
              </Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {user.events ?? 0}
                </Text>
                <Text style={styles.statLabel}>Events</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {user.mutualFriends ?? 0}
                </Text>
                <Text style={styles.statLabel}>Mutual Friends</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.declineBtn}>
                <X size={18} color={Theme.colors.foreground} />
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>

              <LinearGradient
                colors={GRADIENT_COLORS.primary as [string, string]}
                style={styles.acceptBtn}
              >
                <Heart size={18} color={Theme.colors.primaryForeground} />
                <Text style={styles.acceptText}>Accept</Text>
              </LinearGradient>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity onPress={() => setTab("about")}>
                <Text
                  style={[
                    styles.tabText,
                    tab === "about" && styles.activeTab,
                  ]}
                >
                  About
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setTab("photos")}>
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

            {/* ABOUT */}
            {tab === "about" ? (
              <View style={{ width: "100%" }}>
                <Text style={styles.sectionTitle}>About Me</Text>
                <Text style={styles.bio}>
                  {user.bio || "No bio available"}
                </Text>

                <View style={styles.infoGrid}>
                  <InfoItem label="Occupation" value={user.occupation} />
                  <InfoItem label="Education" value={user.education} />
                </View>

                {user.interests && user.interests.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Interests</Text>
                    <View style={styles.tagsWrap}>
                      {user.interests.map((item, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            ) : (
              <View style={styles.photoGrid}>
                {user.photos?.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    style={styles.photo}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const InfoItem = ({ label, value }: any) => (
  <View style={{ width: "48%", marginBottom: 12 }}>
    <Text style={{ color: Theme.colors.mutedForeground, fontSize: 12 }}>
      {label}
    </Text>
    <Text style={{ color: Theme.colors.foreground, fontWeight: "600" }}>
      {value || "N/A"}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    height: 170,
    paddingTop: 55,
    paddingHorizontal: 20,
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imageWrapper: {
    alignItems: "center",
    marginTop: -60,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Theme.colors.background,
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: Theme.colors.foreground,
  },
  subText: {
    color: Theme.colors.mutedForeground,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationText: {
    color: Theme.colors.primary,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  statItem: { alignItems: "center" },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: Theme.colors.foreground,
  },
  statLabel: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 20,
  },
  declineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  declineText: {
    color: Theme.colors.foreground,
  },
  acceptBtn: {
    flex: 1,
    borderRadius: Theme.radius.md,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  acceptText: {
    color: Theme.colors.primaryForeground,
    fontWeight: "600",
  },
  tabs: {
    flexDirection: "row",
    gap: 30,
    marginBottom: 16,
  },
  tabText: {
    color: Theme.colors.mutedForeground,
    fontSize: 16,
  },
  activeTab: {
    color: Theme.colors.foreground,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.primary,
    paddingBottom: 4,
  },
  sectionTitle: {
    color: Theme.colors.foreground,
    fontWeight: "600",
    marginBottom: 8,
  },
  bio: {
    color: Theme.colors.mutedForeground,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: Theme.colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Theme.radius.sm,
  },
  tagText: {
    color: Theme.colors.foreground,
    fontSize: 12,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: Theme.radius.sm,
  },
});
