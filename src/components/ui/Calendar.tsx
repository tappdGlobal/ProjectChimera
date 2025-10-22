// src/components/ui/Calendar.tsx

import React from "react";
import { View, StyleSheet, TextStyle, ViewStyle } from "react-native";
import CalendarPicker from "react-native-calendar-picker";
import { Theme } from "../../styles/Theme";

interface CalendarProps {
  onDateChange: (date: any) => void;
  // This component is highly simplified to fit the native component props
}

export function Calendar({ onDateChange }: CalendarProps) {
  // Translate ShadCN/Tailwind theme to CalendarPicker props
  return (
    <View style={styles.container}>
      <CalendarPicker
        onDateChange={onDateChange}
        // Custom styling for the dark theme
        textStyle={styles.textStyle}
        todayTextStyle={styles.todayTextStyle}
        selectedDayStyle={styles.selectedDayStyle}
        selectedDayTextStyle={styles.selectedDayTextStyle}
        monthTitleStyle={styles.monthTitleStyle}
        yearTitleStyle={styles.monthTitleStyle}
        dayLabelsWrapper={styles.dayLabelsWrapper}
        headerWrapperStyle={styles.headerWrapperStyle}
        // Settings
        allowRangeSelection={false}
        initialDate={new Date()}
        minDate={new Date()}
        maxDate={new Date(2026, 12, 31)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // p-3 equivalent
    padding: 12,
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  textStyle: {
    color: Theme.colors.foreground,
    fontSize: 14,
  } as TextStyle,
  todayTextStyle: {
    color: Theme.colors.foreground,
  } as TextStyle,
  selectedDayStyle: {
    backgroundColor: Theme.colors.primary, // bg-primary
    borderRadius: Theme.radius.md,
  } as ViewStyle,
  selectedDayTextStyle: {
    color: Theme.colors.primaryForeground, // text-primary-foreground
  } as TextStyle,
  monthTitleStyle: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  } as TextStyle,
  weekdaysTextStyle: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  } as TextStyle,
  dayLabelsWrapper: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
  } as ViewStyle,
  headerWrapperStyle: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5,
  } as ViewStyle,
});
