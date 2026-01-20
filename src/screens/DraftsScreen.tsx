import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Edit,
  Trash2,
} from "lucide-react-native";
import { Theme } from "../styles/Theme";

interface DraftEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: string;
  modifiedDate: string;
}

/* ================= MOCK DATA ================= */

const mockDrafts: DraftEvent[] = [
  {
    id: "1",
    title: "Summer Music Festival",
    description:
      "A vibrant summer music festival featuring local and international artists...",
    date: "Mon, Jul 15 at 18:00",
    location: "Central Park Amphitheater",
    capacity: "Up to 500 people",
    modifiedDate: "Modified 15/06/2024",
  },
  {
    id: "2",
    title: "Tech Innovation Conference",
    description:
      "Annual tech conference bringing together industry leaders and innovators.",
    date: "Tue, Aug 20 at 09:00",
    location: "Convention Center Hall A",
    capacity: "Up to 200 people",
    modifiedDate: "Modified 10/06/2024",
  },
  {
    id: "3",
    title: "Yoga & Wellness Retreat",
    description:
      "A peaceful retreat focused on mindfulness, yoga, and holistic wellness...",
    date: "Thu, Sep 5 at 07:00",
    location: "Seaside Wellness Resort",
    capacity: "Up to 50 people",
    modifiedDate: "Modified 05/06/2024",
  },
];

export const DraftsScreen = () => {
  const navigation = useNavigation();

  const [drafts, setDrafts] = useState<DraftEvent[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD MOCK DATA ================= */

  useEffect(() => {
    // simulate loading
    setTimeout(() => {
      setDrafts(mockDrafts);
      setLoading(false);
    }, 500);
  }, []);

  /* ================= HANDLERS ================= */

  const handleEdit = (id: string) => {
    const draft = drafts.find((d) => d.id === id);
    if (draft) {
      (navigation as any).navigate("Host", { editingDraft: draft });
    }
  };

  const handleDelete = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  /* ================= RENDER ITEM ================= */

  const renderDraftItem = ({ item }: { item: DraftEvent }) => (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.draftBadge}>
          <Text style={styles.draftBadgeText}>Draft</Text>
        </View>
      </View>

      <Text style={styles.cardDescription}>{item.description}</Text>

      {/* Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={Theme.colors.mutedForeground} />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={16} color={Theme.colors.mutedForeground} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Users size={16} color={Theme.colors.mutedForeground} />
          <Text style={styles.detailText}>{item.capacity}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.modifiedText}>{item.modifiedDate}</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={() => handleEdit(item.id)}
            style={styles.actionButton}
          >
            <Edit size={16} color={Theme.colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={[styles.actionButton, styles.deleteButton]}
          >
            <Trash2 size={16} color="#d4183d" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Draft Events</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>Loading drafts...</Text>
        </View>
      ) : (
        <FlatList
          data={drafts}
          renderItem={renderDraftItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
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
  listContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: Theme.colors.card, // Dark card background
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.foreground,
    flex: 1,
    marginRight: 8,
  },
  draftBadge: {
    // Let's match the screenshot closer: looks like an orange/brown outline or pill.
    // Screenshot: "Draft" text is Orange, Background is dark brown/orange mix?
    // Actually looks like: bg: #451a03 (brownish), text: #fbbf24 (amber-400)
    // Let's use a custom style here to match.
    backgroundColor: "rgba(245, 158, 11, 0.15)", // amber-500 with opacity
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  draftBadgeText: {
    color: "#fbbf24", // amber-400
    fontSize: 12,
    fontWeight: "600",
  },
  cardDescription: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    marginBottom: 16,
    lineHeight: 20,
  },
  detailsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  detailText: {
    fontSize: 14,
    color: Theme.colors.mutedForeground, // Lighter text for details
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modifiedText: {
    fontSize: 12,
    color: Theme.colors.mutedForeground, // Very muted text
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Theme.colors.inputBackground, // slightly lighter than card
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  deleteButton: {
    borderColor: "rgba(212, 24, 61, 0.3)", // destructive color border
    backgroundColor: "rgba(212, 24, 61, 0.1)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: Theme.colors.foreground,
    marginTop: 16,
    fontSize: 16,
  },
});
