// src/screens/DraftEventsScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { ArrowLeft, Calendar, MapPin, Users, Trash2, Edit } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../styles/Theme";

interface DraftEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxOccupancy: number;
  lastModified: string;
}

const DUMMY_DRAFTS: DraftEvent[] = [
  {
    id: "1",
    name: "Summer Music Festival",
    description: "A vibrant summer music festival featuring local and international artists across genres.",
    date: "2024-07-15",
    time: "18:00",
    location: "Central Park Amphitheater",
    maxOccupancy: 500,
    lastModified: "2024-06-15",
  },
  {
    id: "2",
    name: "Tech Innovation Conference",
    description: "Annual tech conference bringing together industry leaders and innovators.",
    date: "2024-08-20",
    time: "09:00",
    location: "Convention Center Hall A",
    maxOccupancy: 200,
    lastModified: "2024-06-10",
  },
  {
    id: "3",
    name: "Startup Pitch Night",
    description: "Pitch your startup idea to investors and mentors.",
    date: "2024-09-05",
    time: "17:30",
    location: "WeWork Auditorium",
    maxOccupancy: 150,
    lastModified: "2024-06-18",
  },
  {
    id: "4",
    name: "Food Carnival",
    description: "Street food, live music and fun activities for everyone.",
    date: "2024-10-01",
    time: "12:00",
    location: "City Ground",
    maxOccupancy: 800,
    lastModified: "2024-06-20",
  },
  {
    id: "5",
    name: "AI Workshop",
    description: "Hands-on workshop on modern AI tools and techniques.",
    date: "2024-07-28",
    time: "10:00",
    location: "Tech Hub Lab 3",
    maxOccupancy: 60,
    lastModified: "2024-06-22",
  },
];

export function DraftEventsScreen() {
  const navigation = useNavigation();
  const [drafts, setDrafts] = useState<DraftEvent[]>([]);

  useEffect(() => {
    setDrafts(DUMMY_DRAFTS);
  }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const DraftCard = ({ draft }: { draft: DraftEvent }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{draft.name}</Text>
          <Text style={styles.desc} numberOfLines={2}>
            {draft.description}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Draft</Text>
        </View>
      </View>

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
        <Text style={styles.infoText}>Up to {draft.maxOccupancy} people</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.modified}>Modified {formatDate(draft.lastModified)}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Edit size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.deleteBtn]}>
            <Trash2 size={16} color="#ff4d4f" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Draft Events</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {drafts.map((d) => (
          <DraftCard key={d.id} draft={d} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

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
    borderWidth: 1,
    borderColor: "#ffb37a", // light orange border
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
