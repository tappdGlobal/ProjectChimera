import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";
import { X, ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  user: any;
  onClose: () => void;
}

export const ConnectionDetailModal = ({
  visible,
  user,
  onClose,
}: Props) => {
  if (!user) return null;

  const renderIntentPills = () => {
    if (!user.intent) return null;

    return (
      <View style={styles.intentRow}>
        {user.intent.map((intent: string, index: number) => {
          let backgroundColor = "#3B82F6"; // friend default

          if (intent === "RELATIONSHIP") backgroundColor = "#EC4899";
          if (intent === "NETWORKING") backgroundColor = "#F59E0B";

          return (
            <View
              key={index}
              style={[styles.intentPill, { backgroundColor }]}
            >
              <Text style={styles.intentText}>
                {intent === "FRIENDSHIP"
                  ? "friend"
                  : intent === "RELATIONSHIP"
                  ? "match"
                  : "business"}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
  <Modal visible={visible} animationType="slide">
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Gradient Header */}
      <LinearGradient
  colors={GRADIENT_COLORS.primary}
  style={styles.header}
>
  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
    <X size={22} color="#fff" />
  </TouchableOpacity>

  <Image
    source={{
      uri: user.profilePicUrl || "https://via.placeholder.com/150",
    }}
    style={styles.avatar}
  />
</LinearGradient>


      {/* Profile Content */}
      <ScrollView contentContainerStyle={styles.content}>
        

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.age}>
          {user.age ? `${user.age} years old` : ""}
        </Text>

        {renderIntentPills()}

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>
            {user.bio || "No bio available."}
          </Text>
        </View>

        {/* Basic Info */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Occupation</Text>
            <Text style={styles.infoValue}>
              {user.occupation || "N/A"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Education</Text>
            <Text style={styles.infoValue}>
              {user.education || "N/A"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>
              {user.location || "N/A"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  </Modal>
);

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },

header: {
  height: height * 0.34, // taller hero
  justifyContent: "flex-end",
  alignItems: "center",
  paddingBottom: 60,
},



  closeBtn: {
    alignSelf: "flex-end",
  },

content: {
  alignItems: "center",
  paddingHorizontal: 20,
  paddingTop: 80, // more breathing space after avatar
  paddingBottom: 40,
},



  avatar: {
  width: 120,
  height: 120,
  borderRadius: 60,
  borderWidth: 4,
  borderColor: Theme.colors.background,
  marginBottom: -60, // KEY FIX → overlap hero properly
},


name: {
  marginTop: 12,
  fontSize: 22,
  fontWeight: "700",
  color: Theme.colors.foreground,
},


  age: {
    color: Theme.colors.mutedForeground,
    marginTop: 4,
  },

  intentRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },

  intentPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  intentText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  section: {
    width: "100%",
    marginTop: 30,
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

  infoGrid: {
    width: "100%",
    marginTop: 30,
    gap: 18,
  },

  infoItem: {},

  infoLabel: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },

  infoValue: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
});
