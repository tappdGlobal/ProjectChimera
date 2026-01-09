import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { GRADIENT_COLORS } from "../../styles/Theme";

export type EventDetailsData = {
  title: string;

  dateLabel: string;
  timeLabel: string;

  location: string;

  genderPreference: string;
  ageRestriction: string;

  description: string;

  onAddToCalendar?: () => void;
  onOpenMaps?: () => void;
};

interface Props {
  data: EventDetailsData;
}

export function EventDetailsSection({ data }: Props) {
  return (
    <View style={styles.container}>
      {/* TITLE */}
      <Text style={styles.title}>{data.title}</Text>

      {/* DATE + CALENDAR */}
      <View style={styles.rowBetween}>
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={18} color={Theme.colors.primary} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.primaryText}>{data.dateLabel}</Text>
            <Text style={styles.secondaryText}>{data.timeLabel}</Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.85} onPress={data.onAddToCalendar}>
          <LinearGradient
            colors={GRADIENT_COLORS.primary as [string, string]}
            style={styles.calendarBtn}
          >
            <Text style={styles.calendarText}>Add to Calendar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* LOCATION */}
      <View style={styles.rowBetween}>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={18} color={Theme.colors.primary} />
          <Text style={[styles.primaryText, { marginLeft: 10 }]}>
            {data.location}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.mapBtn}
          onPress={data.onOpenMaps}
        >
          <Text style={styles.mapText}>Open Maps</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* PREFERENCES */}
      <View style={styles.preferenceRow}>
        <Ionicons name="people-outline" size={18} color={Theme.colors.primary} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.label}>Gender Preference</Text>
          <Text style={styles.value}>{data.genderPreference}</Text>
        </View>
      </View>

      <View style={styles.preferenceRow}>
        <Ionicons name="time-outline" size={18} color={Theme.colors.primary} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.label}>Age Restrictions</Text>
          <Text style={styles.value}>{data.ageRestriction}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* ABOUT */}
      <Text style={styles.aboutTitle}>About This Event</Text>
      <Text style={styles.description}>{data.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Theme.spacing.m,
  },

  title: {
    fontSize: 24,
    fontWeight: "600",
    color: Theme.colors.foreground,
    marginBottom: Theme.spacing.l,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.l,
  },

  primaryText: {
    color: Theme.colors.foreground,
    fontSize: 17,
    fontWeight: "500",
  },

  secondaryText: {
    color: Theme.colors.mutedForeground,
    fontSize: 15,
    marginTop: 2,
  },

  calendarBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.radius.md,
  },

  calendarText: {
    color: Theme.colors.primaryForeground,
    fontSize: 14,
    fontWeight: "500",
  },

 mapBtn: {
  borderWidth: 1,
  borderColor: "rgba(196, 81, 201, 0.4)", 
  paddingHorizontal: 16,
  paddingVertical: 9,
  borderRadius: Theme.radius.md,
  backgroundColor: "rgba(196, 81, 201, 0.08)", 
},


  mapText: {
    color: Theme.colors.foreground,
    fontSize: 14,
  },

  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.l,
  },

  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.m,
  },

  label: {
    color: Theme.colors.mutedForeground,
    fontSize: 15,
  },

  value: {
    color: Theme.colors.foreground,
    fontSize: 17,
    fontWeight: "500",
    marginTop: 2,
  },

  aboutTitle: {
    color: Theme.colors.foreground,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: Theme.spacing.s,
  },

  description: {
    color: Theme.colors.mutedForeground,
    fontSize: 16,
    lineHeight: 24,
  },
});
