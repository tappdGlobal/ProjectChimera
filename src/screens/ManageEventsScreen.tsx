import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Search,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Info
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useHostStore } from "../store/hostStore";
import { HostEvent } from "../types/hostTypes";
import { SCREEN_NAMES } from "../navigation/Routes";

export default function ManageEventsScreen() {
  const navigation = useNavigation();
  const { events, loading, fetchHostEvents, fetchEventsGuestsCount, guestsCountMap } = useHostStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHostEvents();
    if (events && events.length > 0) {
      await fetchEventsGuestsCount(events.map(e => e.id));
    }
    setRefreshing(false);
  };

  useEffect(() => {
    const fetchInitial = async () => {
      await fetchHostEvents();
    };
    fetchInitial();
  }, [fetchHostEvents]);

  // Fetch exact guests array sizes when events array is loaded
  useEffect(() => {
    if (events && events.length > 0) {
      fetchEventsGuestsCount(events.map(e => e.id));
    }
  }, [events]);

  const formatEventDate = (datetimeString: string) => {
    try {
      const date = new Date(datetimeString);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } catch (e) {
      return "Date TBD";
    }
  };

  const formatEventTime = (datetimeString: string) => {
    try {
      const date = new Date(datetimeString);
      let hours = date.getHours();
      let minutes: any = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    } catch (e) {
      return "Time TBD";
    }
  };



  const renderEvent = (event: HostEvent) => {
    const guestsLength = guestsCountMap.get(event.id);
    const realBookedCount = guestsLength ?? event.bookedCount ?? 0;

    return (
      <TouchableOpacity 
        key={event.id} 
        style={styles.eventCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate(SCREEN_NAMES.EVENT_DASHBOARD as never, { event } as never)}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.eventName}</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live Now</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.iconRow}>
            <Calendar size={16} color="#B482C2" />
            <Text style={styles.metaText}>{formatEventDate(event.eventDatetime)}</Text>
          </View>
          <Text style={styles.dotSeparator}>•</Text>
          <View style={styles.iconRow}>
            <Clock size={16} color="#B482C2" />
            <Text style={styles.metaText}>{formatEventTime(event.eventDatetime)}</Text>
          </View>
        </View>
        <View style={[styles.iconRow, { marginTop: 12 }]}>
          <MapPin size={16} color="#B482C2" />
          <Text style={styles.metaText}>{event.location || 'Location TBD'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <View style={styles.ticketRow}>
            <Ticket size={20} color="#D946EF" />
            <Text style={styles.ticketCountText}>
              {realBookedCount} Tickets Booked
            </Text>
          </View>
          <View>
            <Text style={styles.manageText}>Manage Event →</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredEvents = events?.filter(event => 
    (event.eventName || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
    ((event.location || "").toLowerCase().includes((searchQuery || "").toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0714" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Manage Events</Text>
          <Text style={styles.subtitle}>Events published by you</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.searchContainerWrapper}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#8A85A3" />
          <TextInput
            placeholder="Search your events..."
            placeholderTextColor="#8A85A3"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#C84BFF" />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#C84BFF"
            />
          }
        >
          {(filteredEvents && filteredEvents.length > 0) ? (
            filteredEvents.map(renderEvent)
          ) : (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: '#8A85A3', fontSize: 16 }}>No events found.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0714", 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#8A85A3",
    fontSize: 14,
  },
  searchContainerWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1D162B",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: "#C84BFF",
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    marginLeft: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  eventCard: {
    backgroundColor: "#161125",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  eventTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 12,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.15)", 
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  liveText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "600",
  },
  upcomingBadge: {
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.2)",
  },
  upcomingText: {
    color: "#EAB308",
    fontSize: 12,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dotSeparator: {
    color: "#5C567A",
    marginHorizontal: 8,
    fontSize: 14,
  },
  metaText: {
    color: "#8A85A3",
    fontSize: 14,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginVertical: 18,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ticketCountText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 10,
  },
  manageText: {
    color: "#D946EF", 
    fontSize: 14,
    fontWeight: "600",
  },
  upcomingInfoContainer: {
    marginTop: -4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoTextMain: {
    color: "#EAB308",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  infoTextSub: {
    color: "#5C567A",
    fontSize: 13,
    lineHeight: 18,
    paddingRight: 10,
  }
});