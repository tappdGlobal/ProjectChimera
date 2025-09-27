// src/screens/ExploreAllScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ArrowLeft, Filter, ChevronRight } from "lucide-react-native"; // Renamed ArrowLeft to ChevronRight for list item
import { LinearGradient } from "expo-linear-gradient"; // For 'gradient-primary'
import { Button } from "../components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../components/ui/Sheet";
import { Badge } from "../components/ui/Badge";
import { Theme, GRADIENT_COLORS } from "../styles/Theme";

// --- DATA & HELPER FUNCTIONS ---
const eventCategoriesData = {
  // ... [Paste the full eventCategoriesData object here] ...
  "Arts, Culture & Entertainment": [
    "Theatre Plays",
    "Stand-up Comedy",
    "Dance Performances",
    "Classical Music & Opera",
    "Film Screenings & Festivals",
    "Art Exhibitions & Galleries",
    "Poetry Slams & Literature Evenings",
    "Cultural Heritage Shows",
  ],
  "Music & Nightlife": [
    "Live Bands",
    "International Artist Gigs",
    "DJ & EDM Nights",
    "Jazz & Blues Sessions",
    "Acoustic Evenings",
    "Open Mic Music",
    "Karaoke Nights",
    "Music Festivals",
  ],
  "Social & Lifestyle": [
    "Cocktail Nights",
    "Rooftop Parties",
    "Luxury Brand Launches",
    "Fashion Shows",
    "Food & Wine Tastings",
    "Sunday Brunches",
    "Pop-up Experiences",
    "High-Society Mixers",
  ],
  "Business & Networking": [
    "Corporate Conferences",
    "Startup Pitch Nights",
    "Tech & Innovation Summits",
    "Panel Discussions",
    "Industry Trade Shows",
    "B2B Networking Mixers",
    "Professional Workshops",
    "Masterclasses",
  ],
  "Wellness & Personal Growth": [
    "Yoga Retreats",
    "Sound Healing",
    "Meditation Circles",
    "Fitness Bootcamps",
    "Mindfulness Workshops",
    "Life Coaching Sessions",
    "Wellness Retreats",
    "Motivational Talks",
  ],
  "Sports & Outdoors": [
    "Football Matches",
    "Cricket Screenings",
    "Tennis Tournaments",
    "Golf Events",
    "Marathons & Runs",
    "Cycling Rallies",
    "Trekking & Hiking Trips",
    "Adventure Sports",
  ],
  "Education & Learning": [
    "Coding Bootcamps",
    "Tech Hackathons",
    "Academic Seminars",
    "Skill Development Classes",
    "Creative Writing Workshops",
    "Book Clubs",
    "Expert Panel Talks",
    "Student Fests",
  ],
  "Community & Causes": [
    "Charity Galas",
    "Fundraisers",
    "Volunteering Drives",
    "Blood Donation Camps",
    "Religious Gatherings",
    "Interfaith Events",
    "Cultural Festivals",
    "Awareness Campaigns",
  ],
  "Family & Kids": [
    "Kids Theatre",
    "Educational Fun Events",
    "Parenting Workshops",
    "Family Picnics",
    "Activity Camps",
    "Storytelling Sessions",
    "School Fairs",
    "Amusement Park Events",
  ],
  "Seasonal & Special": [
    "New Year's Eve Parties",
    "Holi/Diwali Festivals",
    "Christmas Carnivals",
    "Eid Celebrations",
    "Halloween Specials",
    "City Food Festivals",
    "National Holiday Events",
    "Annual City Fairs",
  ],
};

const getEventCount = (category: string) => {
  const seed = category
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Math.floor((seed % 6) + 5);
};
// --- END DATA ---

interface ExploreAllProps {
  // Navigation props should be passed here, but for now we use the original props
  onBack: () => void;
  onCategorySelect: (category: string) => void;
}

export function ExploreAllScreen({
  onBack,
  onCategorySelect,
}: ExploreAllProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const genres = Object.keys(eventCategoriesData);

  const getFilteredCategories = () => {
    if (!selectedGenre) {
      return Object.entries(eventCategoriesData).flatMap(
        ([genre, categories]) =>
          categories.map((category) => ({
            category,
            genre,
            eventCount: getEventCount(category),
          }))
      );
    } else {
      return eventCategoriesData[
        selectedGenre as keyof typeof eventCategoriesData
      ].map((category) => ({
        category,
        genre: selectedGenre,
        eventCount: getEventCount(category),
      }));
    }
  };

  const filteredCategories = getFilteredCategories();

  const handleGenreSelect = (genre: string | null) => {
    setSelectedGenre(genre);
    setIsFilterOpen(false); // Close the sheet after selection
  };

  // Custom Gradient Button Component
  const GradientButton: React.FC<React.ComponentProps<typeof Button>> = ({
    children,
    style,
    ...props
  }) => {
    return (
      <LinearGradient
        colors={GRADIENT_COLORS.primary as [string, string, ...string[]]}
        style={[styles.gradientButton, style]}
        start={[0, 0]}
        end={[1, 1]}
      >
        <Button
          variant="default" // Use default variant for internal styling control
          textStyle={{ color: Theme.colors.foreground }}
          style={styles.gradientInnerButton}
          {...props}
        >
          {children}
        </Button>
      </LinearGradient>
    );
  };

  // Custom Filter Button with Badge
  const FilterButton: React.FC<{ onPress: () => void; hasFilter: boolean }> = ({
    onPress,
    hasFilter,
  }) => (
    <TouchableOpacity onPress={onPress} style={styles.filterButton}>
      <Filter size={24} color={Theme.colors.foreground} />
      {hasFilter && <View style={styles.filterBadge} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header (fixed position) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Theme.colors.foreground} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>All Event Categories</Text>

        {/* Filter Trigger Button wrapped in Sheet Root */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <FilterButton
            onPress={() => setIsFilterOpen(true)}
            hasFilter={!!selectedGenre}
          />

          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Filter by Genre</SheetTitle>
              <SheetDescription>
                Select a genre to filter event categories, or choose "All
                Genres" to see everything.
              </SheetDescription>
            </SheetHeader>
            <ScrollView style={styles.sheetBody}>
              {/* All Genres Button */}
              {selectedGenre === null ? (
                <GradientButton
                  onClick={() => handleGenreSelect(null)}
                  style={styles.genreButton}
                >
                  All Genres
                </GradientButton>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleGenreSelect(null)}
                  style={styles.genreButton}
                >
                  All Genres
                </Button>
              )}

              {/* Genre List Buttons */}
              {genres.map((genre) =>
                selectedGenre === genre ? (
                  <GradientButton
                    key={genre}
                    onClick={() => handleGenreSelect(genre)}
                    style={styles.genreButton}
                  >
                    {genre}
                  </GradientButton>
                ) : (
                  <Button
                    key={genre}
                    variant="outline"
                    onClick={() => handleGenreSelect(genre)}
                    style={styles.genreButton}
                  >
                    {genre}
                  </Button>
                )
              )}
            </ScrollView>
          </SheetContent>
        </Sheet>
      </View>

      {/* Selected Genre Display */}
      {selectedGenre && (
        <View style={styles.filterDisplayContainer}>
          <View style={styles.filterDisplayContent}>
            <Text style={styles.filteredByText}>Filtered by:</Text>
            <View style={styles.gradientBadgeWrapper}>
              {/* Manually applying gradient to the Badge wrapper */}
              <LinearGradient
                colors={
                  GRADIENT_COLORS.primary as [string, string, ...string[]]
                }
                style={styles.gradientBadge}
                start={[0, 0]}
                end={[1, 1]}
              >
                <Badge
                  variant="default"
                  textStyle={{ color: Theme.colors.foreground }}
                >
                  {selectedGenre}
                </Badge>
              </LinearGradient>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedGenre(null)}
              style={styles.clearFilterButton}
            >
              <Text style={styles.clearFilterText}>Clear filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Categories List (Scrollable Content) */}
      {/* Replaces overflow-y-auto px-4 py-4 safe-bottom */}
      <ScrollView
        contentContainerStyle={styles.listContentContainer}
        style={styles.scrollView}
      >
        <View style={styles.categoryList}>
          {filteredCategories.map((item, index) => (
            <TouchableOpacity
              key={`${item.genre}-${item.category}-${index}`}
              onPress={() => onCategorySelect(item.category)}
              style={styles.categoryListItem}
              activeOpacity={0.8}
            >
              <View style={styles.listItemContent}>
                <View style={styles.listItemTextContainer}>
                  <Text style={styles.categoryTitle}>{item.category}</Text>
                  <Text style={styles.categoryGenre}>{item.genre}</Text>
                </View>
                <View style={styles.eventCountContainer}>
                  <Text style={styles.eventCountText}>
                    {item.eventCount} events
                  </Text>
                  {/* Arrow for navigation: rotate-180 is handled by ChevronRight */}
                  <ChevronRight
                    size={16}
                    color={Theme.colors.mutedForeground}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {/* Simulating safe-bottom padding for the list */}
        <View style={styles.safeBottomPadding} />
      </ScrollView>
    </View>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  // --- Header Styles ---
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16, // p-4
    borderBottomWidth: 1,
    borderColor: Theme.colors.border, // border-b border-white/10
    zIndex: 10, // Ensure header is above scroll content
    backgroundColor: Theme.colors.background,
  },
  backButton: {
    padding: 8, // p-2
    borderRadius: 9999, // rounded-full
    // hover:bg-white/10 simulated by activeOpacity on touchable
  },
  headerTitle: {
    color: Theme.colors.foreground, // text-white
    fontSize: 18,
    fontWeight: "bold", // Assuming h1 in the context is a primary header
  },
  filterButton: {
    padding: 8,
    borderRadius: 9999,
  },
  filterBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    backgroundColor: Theme.colors.primary,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Theme.colors.background, // Tiny border for visibility against background
  },
  // --- Filter Sheet Styles ---
  sheetBody: {
    paddingVertical: 10,
    // Add flexGrow: 1 if needed for full height
  },
  genreButton: {
    width: "100%",
    justifyContent: "flex-start", // justify-start
    marginBottom: 8,
  },
  // Custom button styles for gradient application
  gradientButton: {
    borderRadius: Theme.radius.md,
    marginBottom: 8,
  },
  gradientInnerButton: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  // --- Filter Display Styles ---
  filterDisplayContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12, // py-3
    borderBottomWidth: 1,
    borderColor: Theme.colors.border, // border-b border-white/10
  },
  filterDisplayContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // gap-2
  },
  filteredByText: {
    color: Theme.colors.mutedForeground, // text-white/70
    fontSize: 14, // text-sm
  },
  gradientBadgeWrapper: {
    borderRadius: Theme.radius.md,
    overflow: "hidden",
  },
  gradientBadge: {
    // Height and width handled by the Badge component content
    padding: 1,
    // This wrapper is needed to apply the LinearGradient effect
  },
  clearFilterButton: {
    marginLeft: 8,
  },
  clearFilterText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  // --- List Styles ---
  scrollView: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryList: {
    gap: 12, // space-y-3
  },
  categoryListItem: {
    width: "100%",
    padding: 16, // p-4
    backgroundColor: Theme.colors.muted, // bg-white/5
    borderRadius: Theme.radius.lg, // rounded-lg
    borderWidth: 1,
    borderColor: Theme.colors.border, // border border-white/10
    // hover:bg-white/10 & hover:border-primary/50 simulation handled by activeOpacity
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listItemTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  categoryTitle: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "bold", // h3
  },
  categoryGenre: {
    color: Theme.colors.mutedForeground, // text-white/70
    fontSize: 14, // text-sm mt-1
    marginTop: 4,
  },
  eventCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // gap-2
  },
  eventCountText: {
    color: Theme.colors.mutedForeground, // text-white/70
    fontSize: 14, // text-sm
  },
  listArrow: {
    // rotate-180 is handled by using ChevronRight instead of ArrowLeft
    color: Theme.colors.mutedForeground, // text-white/50
  },
  // safe-bottom: padding-bottom: 5rem (80px)
  safeBottomPadding: {
    height: 80,
  },
});
