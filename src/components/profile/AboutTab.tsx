import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Edit } from "lucide-react-native";

import { SCREEN_NAMES } from "../../navigation/Routes";
import { useAppNavigation } from "../../hooks/useAppNavigation";
import { useUserStore } from "../../store/userStore";
import { GRADIENT_COLORS, Theme } from "../../styles/Theme";

interface Props {
  userId: string | null;
}

export const AboutTab: React.FC<Props> = ({ userId }) => {
  const navigation = useAppNavigation();

  const { profile, fetchUser, loading } = useUserStore();
  const user = profile;

  // ✅ Always fetch when tab opens & userId exists
  useEffect(() => {
    if (!userId) {
      console.log("AboutTab ❌ userId is null");
      return;
    }
    fetchUser(userId);
  }, [userId]);

  const lookingForList = useMemo(() => {
    if (!user?.lookingFor) return ["Friendship"];

    if (typeof user.lookingFor === "string") {
      return user.lookingFor.split(",").map((i) => i.trim());
    }

    if (Array.isArray(user.lookingFor)) return user.lookingFor;

    return ["Friendship"];
  }, [user]);

  // ⏳ Loading UI
  if (loading) {
    return (
      <View style={{ padding: 24, alignItems: "center" }}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  // ❌ Only show error if loading finished and no user
  if (!user && !loading) {
    return (
      <View style={{ padding: 24 }}>
        <Text style={{ color: "#999" }}>Unable to load profile.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ===== Edit Button ===== */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate(SCREEN_NAMES.EDIT_PROFILE)}
      >
        <LinearGradient
          colors={GRADIENT_COLORS.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.editButtonFull}
        >
          <Edit size={18} color="#fff" />
          <Text style={styles.editButtonText}>Edit Details</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* ===== About Me ===== */}
      <Text style={styles.sectionTitle}>About Me</Text>
      <Text style={styles.bioText}>{user?.bio ?? "No bio available."}</Text>

      {/* Occupation & Education */}
      <View style={styles.twoColumnRow}>
        <View style={styles.columnHalf}>
          <Text style={styles.label}>Occupation</Text>
          <Text style={styles.value}>{user?.occupation ?? "Not specified"}</Text>
        </View>
        <View style={styles.columnHalf}>
          <Text style={styles.label}>Education</Text>
          <Text style={styles.value}>{user?.education ?? "Not specified"}</Text>
        </View>
      </View>

      {/* Looking For */}
      <Text style={styles.sectionTitle}>Looking For</Text>
      <View style={styles.chipsRow}>
        {lookingForList.map((item, index) => (
          <View key={index} style={styles.chip}>
            <Text style={styles.chipText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Age & Height */}
      <View style={styles.twoColumnRow}>
        <View style={styles.columnHalf}>
          <Text style={styles.label}>Age</Text>
          <Text style={styles.value}>{user?.age ?? "-"}</Text>
        </View>
        <View style={styles.columnHalf}>
          <Text style={styles.label}>Height</Text>
          <Text style={styles.value}>
            {user?.height
              ? `${Math.floor(user.height / 30.48)}'${Math.round(
                  (user.height % 30.48) / 2.54
                )}"`
              : "-"}
          </Text>
        </View>
      </View>

      {/* Gender & Location */}
      <View style={styles.twoColumnRow}>
        <View style={styles.columnHalf}>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>
            {user?.gender
              ? user.gender.charAt(0).toUpperCase() +
                user.gender.slice(1).toLowerCase()
              : "-"}
          </Text>
        </View>
        <View style={styles.columnHalf}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{user?.location ?? "-"}</Text>
        </View>
      </View>

      {/* Interests */}
      <Text style={styles.sectionTitle}>Interests</Text>
      <View style={styles.interestsRow}>
        {(user?.interests ?? []).map((interest, index) => (
          <View key={index} style={styles.interestTag}>
            <Text style={styles.interestText}>{interest}</Text>
          </View>
        ))}
      </View>

      {/* Smoking & Drinking */}
      <View style={styles.twoColumnRow}>
        <View style={styles.columnHalf}>
          <Text style={styles.label}>Smoking</Text>
          <Text style={styles.value}>{user?.smoking ?? "-"}</Text>
        </View>
        <View style={styles.columnHalf}>
          <Text style={styles.label}>Drinking</Text>
          <Text style={styles.value}>{user?.drinking ?? "-"}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24 },

  editButtonFull: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 24,
  },

  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  sectionTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 8,
  },

  bioText: {
    color: Theme.colors.mutedForeground,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
  },

  label: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
    marginBottom: 4,
  },

  value: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "600",
  },

  twoColumnRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },

  columnHalf: { flex: 1 },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },

  chip: {
    backgroundColor: Theme.colors.secondary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },

  chipText: {
    color: Theme.colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },

  interestsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },

  interestTag: {
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  interestText: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "500",
  },
});
