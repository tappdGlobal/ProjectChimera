import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../styles/Theme";
import { FeedEvent } from "../types/feedTypes";
import { getFilteredFeedApi } from "../api/feedApi";
import { EventCard } from "../components/common/EventCard";

type RootStackParamList = {
  CategoryEvents: { category: string };
};

type Props = StackScreenProps<RootStackParamList, "CategoryEvents">;

export function CategoryEventsScreen({ route, navigation }: Props) {
  const { category } = route.params;

  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);

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
    <EventCard
      event={{
        id: item.id,
        title: item.eventName,
        date: item.eventDate,
        time: item.eventTime,
        location: `${item.venue}, ${item.city}`,
        image: item.images?.[0] ?? "",
      }}
      size="medium"
    />
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
});