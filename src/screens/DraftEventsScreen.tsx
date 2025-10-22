// src/screens/DraftEventsScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Trash2,
  Edit,
  Eye,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../styles/Theme";

// Migrated UI Components
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/Dialog";
import { Separator } from "../components/ui/Separator";

interface DraftEvent {
  id: string;
  name: string;
  genre: string;
  category: string;
  date: string;
  time: string;
  location: string;
  maxOccupancy: number;
  description: string;
  tickets: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  createdAt: string;
  lastModified: string;
}

// Helper to fetch/load drafts from AsyncStorage
const loadDrafts = async (): Promise<DraftEvent[]> => {
  try {
    const draftsJson = await AsyncStorage.getItem("eventDrafts");
    return draftsJson ? JSON.parse(draftsJson) : [];
  } catch (e) {
    console.error("Failed to load drafts:", e);
    return [];
  }
};

const deleteDraftFromStorage = async (draftId: string) => {
  try {
    const existingDrafts = await loadDrafts();
    const updatedDrafts = existingDrafts.filter(
      (draft) => draft.id !== draftId
    );
    await AsyncStorage.setItem("eventDrafts", JSON.stringify(updatedDrafts));
  } catch (e) {
    console.error("Failed to delete draft:", e);
    Alert.alert("Error", "Failed to delete draft event.");
  }
};

export function DraftEventsScreen() {
  const navigation = useNavigation();
  const [drafts, setDrafts] = useState<DraftEvent[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<DraftEvent | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  // Initial load
  useEffect(() => {
    loadDrafts().then(setDrafts);
  }, []);

  // Helper to refresh drafts
  const refreshDrafts = () => {
    loadDrafts().then(setDrafts);
  };

  const handleDeleteDraft = async (draftId: string) => {
    await deleteDraftFromStorage(draftId);
    refreshDrafts();
    setShowDeleteConfirm(null);
    if (selectedDraft?.id === draftId) {
      setSelectedDraft(null);
    }
  };

  const handlePublishDraft = (draft: DraftEvent) => {
    console.log("Publishing draft:", draft);
    // Implement publish logic (API call)
    handleDeleteDraft(draft.id); // Remove from drafts after successful publish
  };

  const handleEditDraft = (draft: DraftEvent) => {
    // Navigate back to the HostScreen with the draft data
    // NOTE: This assumes HostScreen handles the navigation logic to load data
    (navigation as any).navigate("Host", { editingDraft: draft });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const DraftCard = ({ draft }: { draft: DraftEvent }) => (
    <Card style={styles.draftCardBase} onClick={() => setSelectedDraft(draft)}>
      <CardContent style={styles.draftCardContent}>
        <View style={styles.draftCardHeader}>
          <View style={styles.flex1}>
            <Text style={styles.draftCardTitle}>{draft.name}</Text>
            <Text style={styles.draftCardDescription}>{draft.description}</Text>
          </View>
          <Badge style={styles.draftBadge}>Draft</Badge>
        </View>

        <View style={styles.draftCardInfo}>
          <View style={styles.infoRow}>
            <Calendar size={16} color={Theme.colors.mutedForeground} />
            <Text style={styles.infoText}>
              {formatDate(draft.date)} at {draft.time}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={16} color={Theme.colors.mutedForeground} />
            <Text style={styles.infoText}>{draft.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Users size={16} color={Theme.colors.mutedForeground} />
            <Text style={styles.infoText}>
              Up to {draft.maxOccupancy} people
            </Text>
          </View>
        </View>

        <View style={styles.draftCardFooter}>
          <Text style={styles.draftModifiedText}>
            Modified {formatDate(draft.lastModified)}
          </Text>
          <View style={styles.draftCardActions}>
            <Button
              size="icon"
              variant="outline"
              onClick={(e) => {
                // e.stopPropagation is not needed in RN, rely on onClick bubbling
                handleEditDraft(draft);
              }}
            >
              <Edit size={16} color={Theme.colors.foreground} />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setShowDeleteConfirm(draft.id)}
            >
              <Trash2 size={16} color={Theme.colors.destructive} />
            </Button>
          </View>
        </View>
      </CardContent>
    </Card>
  );

  const DraftDetailModal = ({ draft }: { draft: DraftEvent }) => (
    <Dialog open={!!draft} onOpenChange={() => setSelectedDraft(null)}>
      <DialogContent style={styles.detailModalContent}>
        <DialogHeader>
          <DialogTitle>{draft.name}</DialogTitle>
          <DialogDescription>
            Draft event details and management options
          </DialogDescription>
        </DialogHeader>

        <ScrollView style={styles.flex1}>
          <View style={styles.spaceY4}>
            <View>
              <Badge style={styles.genreBadge}>{draft.genre}</Badge>
              <Text style={styles.detailDescriptionText}>
                {draft.description}
              </Text>
            </View>

            <Separator style={styles.separatorStyle} />

            {/* Info Rows */}
            <View style={styles.spaceY3}>
              {/* Date/Time */}
              <View style={styles.detailInfoRow}>
                <Calendar size={20} color={Theme.colors.primary} />
                <View>
                  <Text style={styles.detailInfoText}>
                    {formatDate(draft.date)}
                  </Text>
                  <Text style={styles.detailInfoSubText}>{draft.time}</Text>
                </View>
              </View>
              {/* Location */}
              <View style={styles.detailInfoRow}>
                <MapPin size={20} color={Theme.colors.primary} />
                <View>
                  <Text style={styles.detailInfoText}>{draft.location}</Text>
                </View>
              </View>
              {/* Occupancy */}
              <View style={styles.detailInfoRow}>
                <Users size={20} color={Theme.colors.primary} />
                <View>
                  <Text style={styles.detailInfoText}>
                    Max {draft.maxOccupancy} attendees
                  </Text>
                </View>
              </View>
            </View>

            <Separator style={styles.separatorStyle} />

            {/* Ticket Types */}
            <View>
              <Text style={styles.detailTicketTitle}>Ticket Types</Text>
              <View style={styles.spaceY2}>
                {draft.tickets.map((ticket) => (
                  <View key={ticket.id} style={styles.ticketRow}>
                    <Text style={styles.ticketNameText}>{ticket.name}</Text>
                    <Text style={styles.ticketPriceText}>₹{ticket.price}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.modalActionButtons}>
              <Button
                variant="outline"
                style={styles.deleteDraftButton}
                onClick={() => {
                  setShowDeleteConfirm(draft.id);
                  setSelectedDraft(null); // Close detail modal first
                }}
              >
                <Trash2
                  size={16}
                  color={Theme.colors.destructive}
                  style={styles.mr2}
                />
                Delete Draft
              </Button>
              <Button
                onClick={() => handlePublishDraft(draft)}
                style={styles.publishDraftButton}
              >
                Publish Event
              </Button>
            </View>
          </View>
        </ScrollView>
      </DialogContent>
    </Dialog>
  );

  // --- MAIN RENDER ---
  return (
    <SafeAreaView style={styles.flex1} edges={["top"]}>
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.mainHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={Theme.colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.mainHeaderTitle}>Draft Events</Text>
          <View style={styles.w10} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollPadding}
        >
          {drafts.length === 0 ? (
            <View style={styles.emptyState}>
              <Eye
                size={48}
                color={Theme.colors.mutedForeground}
                style={styles.emptyStateIcon}
              />
              <Text style={styles.emptyStateTitle}>No Draft Events</Text>
              <Text style={styles.emptyStateText}>
                Your saved draft events will appear here
              </Text>
            </View>
          ) : (
            drafts.map((draft) => <DraftCard key={draft.id} draft={draft} />)
          )}
        </ScrollView>

        {/* Draft Detail Modal */}
        {selectedDraft && <DraftDetailModal draft={selectedDraft} />}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!showDeleteConfirm}
          onOpenChange={() => setShowDeleteConfirm(null)}
        >
          <DialogContent style={styles.deleteConfirmModal}>
            <DialogHeader>
              <DialogTitle>Delete Draft Event?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. The draft event will be
                permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <View style={styles.deleteConfirmActions}>
              <Button
                variant="outline"
                style={styles.deleteConfirmCancel}
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  showDeleteConfirm && handleDeleteDraft(showDeleteConfirm)
                }
                style={styles.deleteConfirmDelete}
              >
                Delete
              </Button>
            </View>
          </DialogContent>
        </Dialog>
      </View>
    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  flex1: { flex: 1 },
  mainContainer: { flex: 1, backgroundColor: Theme.colors.background },
  mainHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  mainHeaderTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: { padding: 8, borderRadius: 9999, position: "absolute", left: 8 },
  w10: { width: 40 },
  scrollPadding: { padding: 16, gap: 16 },

  // --- Draft Card ---
  draftCardBase: {
    backgroundColor: Theme.colors.card,
    borderColor: Theme.colors.border,
  },
  draftCardContent: { padding: 16 },
  draftCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  draftCardTitle: {
    color: Theme.colors.foreground,
    fontSize: 16,
    marginBottom: 4,
    flexShrink: 1,
    fontWeight: "bold",
  },
  draftCardDescription: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    flexShrink: 1,
  },
  draftBadge: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
    color: Theme.colors.foreground,
    marginLeft: 8,
  }, // Orange-500 equivalent
  draftCardInfo: { gap: 8, marginVertical: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { color: Theme.colors.mutedForeground, fontSize: 14 },
  draftCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  draftModifiedText: { color: Theme.colors.mutedForeground, fontSize: 12 },
  draftCardActions: { flexDirection: "row", gap: 8 },

  // --- Empty State ---
  emptyState: { alignItems: "center", justifyContent: "center", height: 200 },
  emptyStateIcon: { color: Theme.colors.mutedForeground, marginBottom: 16 },
  emptyStateTitle: {
    color: Theme.colors.mutedForeground,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyStateText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
  },

  // --- Detail Modal ---
  detailModalContent: { width: "95%", maxHeight: "90%", padding: 24 },
  spaceY4: { gap: 16 },
  spaceY3: { gap: 12 },
  spaceY2: { gap: 8 },
  separatorStyle: { backgroundColor: Theme.colors.border, marginVertical: 8 },
  genreBadge: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
    color: Theme.colors.primaryForeground,
    marginBottom: 8,
  },
  detailDescriptionText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    lineHeight: 20,
  },
  detailInfoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  detailInfoText: { color: Theme.colors.foreground, fontSize: 16 },
  detailInfoSubText: { color: Theme.colors.mutedForeground, fontSize: 14 },
  detailTicketTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "bold",
  },
  ticketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: Theme.radius.sm,
  },
  ticketNameText: { color: "rgba(255, 255, 255, 0.8)", fontSize: 14 },
  ticketPriceText: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  modalActionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  deleteDraftButton: {
    flex: 1,
    borderColor: Theme.colors.destructive,
    color: Theme.colors.destructive,
    borderWidth: 1,
    paddingVertical: 12,
  },
  publishDraftButton: { flex: 1, backgroundColor: Theme.colors.primary },
  mr2: { marginRight: 8 },

  // --- Delete Confirm Dialog ---
  deleteConfirmModal: { width: "80%", padding: 24 },
  deleteConfirmActions: { flexDirection: "row", gap: 12, paddingTop: 16 },
  deleteConfirmCancel: { flex: 1, borderColor: Theme.colors.border },
  deleteConfirmDelete: { flex: 1, backgroundColor: Theme.colors.destructive },
});
