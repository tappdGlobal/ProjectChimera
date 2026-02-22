import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { useWishlistStore } from "../store/wishlistStore";
import { StackScreenProps } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../styles/Theme";
import { FeedEvent } from "../types/feedTypes";
import { getFilteredFeedApi } from "../api/feedApi";
import { ExploreStackParamList, SCREEN_NAMES } from "../navigation/Routes";
type Props = StackScreenProps<
  ExploreStackParamList,
  typeof SCREEN_NAMES.CATEGORY_EVENTS
>;

export function CategoryEventsScreen({ route, navigation }: Props) {
  const { category } = route.params;

  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlistedMap = useWishlistStore((state) => state.isWishlistedMap);
  const wishlistLoadingMap = useWishlistStore(
    (state) => state.wishlistLoadingMap
  );
  useEffect(() => {
    const fetchFiltered = async () => {
      try {
        const response = await getFilteredFeedApi(category);
        setEvents(response);
      } catch (error) {
        console.error("Filter error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiltered();
  }, [category]);

  const renderItem = ({ item }: { item: FeedEvent }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate(SCREEN_NAMES.EVENT_DETAIL, {
          event: item,
        })
      }
      style={{ marginBottom: Theme.spacing.m }}
    >
      <View style={styles.card}>
        <Image
          source={{ uri: item.images?.[0] }}
          style={styles.image}
        />

        <View style={styles.content}>
          <Text style={styles.title}>{item.eventName}</Text>

          <View style={styles.row}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={Theme.colors.primary}
            />
            <Text style={styles.metaText}>
              {item?.eventDate
                ? new Date(item.eventDate).toDateString()
                : "Date TBA"}{" "}
              • {item?.eventTime || "Time TBA"}
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons
              name="location-outline"
              size={16}
              color={Theme.colors.primary}
            />
            <Text style={styles.metaText}>
              {item.venue}, {item.city}
            </Text>
          </View>

          {/* 🔥 Wishlist Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.wishlistButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleWishlist(item.id);
            }}
            disabled={wishlistLoadingMap?.[item.id]}
          >
            {wishlistLoadingMap?.[item.id] ? (
              <ActivityIndicator size="small" color={Theme.colors.primary} />
            ) : (
              <>
                <Ionicons
                  name={isWishlistedMap?.[item.id] ? "heart" : "heart-outline"}
                  size={18}
                  color={
                    isWishlistedMap?.[item.id]
                      ? Theme.colors.primary
                      : Theme.colors.primaryForeground
                  }
                />
                <Text style={styles.wishlistText}>
                  {isWishlistedMap?.[item.id]
                    ? "Wishlisted"
                    : "Add to Wishlist"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.m,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background,
  },

  card: {
    flexDirection: "row",
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: Theme.radius.lg,
  },

  content: {
    flex: 1,
    marginLeft: Theme.spacing.m,
  },

  title: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: Theme.fontWeights.medium,
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  metaText: {
    color: Theme.colors.mutedForeground,
    fontSize: 13,
    marginLeft: 6,
  },

  wishlistButton: {
    marginTop: Theme.spacing.s,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.radius.lg,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  wishlistText: {
    color: Theme.colors.primaryForeground,
    fontWeight: Theme.fontWeights.medium,
    marginLeft: 6,
  },
});