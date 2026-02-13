// src/screens/DraftEventsScreen.tsx

import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {  } from "react-native";

import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Trash2,
  Edit,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../styles/Theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useEventStore } from "../store/eventStore";
import { SCREEN_NAMES } from "../navigation/Routes";

/* ================= NAV TYPES ================= */

type RootStackParamList = {
  [SCREEN_NAMES.HOST]: { editingDraft?: any } | undefined;
  [SCREEN_NAMES.DRAFT_EVENTS]: undefined;
  [SCREEN_NAMES.PUBLISHED_EVENTS]: undefined;
};

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

/* ================= SCREEN ================= */

export function DraftEventsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const {
    draftEvents,
    fetchDraftEvents,
    deleteDraft,
    loading,
  } = useEventStore();

  useEffect(() => {
    fetchDraftEvents();
  }, [fetchDraftEvents]);

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const DraftCard = ({ draft }: { draft: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {draft.eventName || "Untitled Event"}
          </Text>
          <Text style={styles.desc} numberOfLines={2}>
            {draft.description || "No description"}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Draft</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Calendar size={16} color={Theme.colors.mutedForeground} />
        <Text style={styles.infoText}>
          {formatDate(draft.eventDate)} {draft.eventTime || ""}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <MapPin size={16} color={Theme.colors.mutedForeground} />
        <Text style={styles.infoText}>
          {draft.location || "Location not set"}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Users size={16} color={Theme.colors.mutedForeground} />
        <Text style={styles.infoText}>
          Up to {draft.maxCapacity || 0} people
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.modified}>Saved as draft</Text>

        <View style={styles.actions}>
          {/* EDIT */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              console.log("📝 EDIT CLICKED");
              console.log("📝 Draft object:", draft);
              console.log("📝 Draft ID:", draft.id);

              // ✅ CORRECT
              navigation.navigate(SCREEN_NAMES.HOST, {
                screen: SCREEN_NAMES.HOST_MAIN,
                params: {
                  editingDraft: draft,
                },
              });









            }}
          >
            <Edit size={16} color="#fff" />
          </TouchableOpacity>


          {/* DELETE */}
          <TouchableOpacity
            style={[styles.iconBtn, styles.deleteBtn]}
            onPress={() => deleteDraft(draft.id)}
          >
            <Trash2 size={16} color="#ff4d4f" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Theme.colors.background }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Draft Events</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.list}>
        {draftEvents.length === 0 && !loading ? (
          <Text style={styles.emptyText}>No drafts found</Text>
        ) : (
          draftEvents.map((draft) => (
            <DraftCard key={draft.id} draft={draft} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  list: {
    padding: 16,
    gap: 16,
  },
  emptyText: {
    color: Theme.colors.mutedForeground,
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#120b2a",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a224d",
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  desc: {
    color: "#b3b3c7",
    fontSize: 13,
  },
  badge: {
    backgroundColor: "#ff7a18",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  infoText: {
    color: "#b3b3c7",
    fontSize: 13,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#2a224d",
  },
  modified: {
    color: "#777",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#1f1a3a",
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: "#ff4d4f",
    backgroundColor: "transparent",
  },
});
