import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SCREEN_NAMES } from "../navigation/Routes";
import { Theme } from "../styles/Theme";

const categories = [
  "Date Night",
  "Pool Party",
  "House Party",
  "Rooftop Parties",
  "Corporate Conferences",
  "Startup Pitch Nights",
  "Yoga Retreats",
  "Sound Healing",
  "Football Matches",
  "Cricket Screenings",
  "Coding Bootcamps",
  "Tech Hackathons",
  "Charity Galas",
  "Fundraisers",
  "Kids Theatre",
  "Educational Fun Events",
  "New Year's Eve Parties",
  "Theatre Plays",
  "Stand-up Comedy",
  "Dance Performances",
  "Live Bands",
  "DJ & EDM Nights",
  "Cocktail Nights",
];

export default function AllCategoriesScreen() {
  const navigation = useNavigation<any>();

  const handlePress = (category: string) => {
    navigation.navigate(SCREEN_NAMES.CATEGORY_EVENTS, { category });
  };

  return (
    <View style={styles.screen}>
      <FlatList
        key="single-column"
        data={categories}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => handlePress(item)}
          >
            <Text style={styles.text}>{item}</Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={Theme.colors.mutedForeground}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },

  container: {
    paddingVertical: Theme.spacing.m,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingVertical: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.m,

    marginHorizontal: Theme.spacing.m,
    marginBottom: Theme.spacing.s,

    backgroundColor: Theme.colors.card,

    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },

  text: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: Theme.fontWeights.medium,
  },
});