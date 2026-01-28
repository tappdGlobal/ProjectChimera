import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import { Theme } from "../../styles/Theme";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import { getNearbyEventsApi, NearbyEvent } from "../../api/geoEventApi";
import { SCREEN_NAMES } from "../../navigation/Routes";
import { RefreshCw } from "lucide-react-native";

// Conditionally import MapLibre - it requires native modules not available in Expo Go
let Maplibre: any = null;
try {
  // Only try to import if not in Expo Go
  if (Constants.executionEnvironment !== Constants.ExecutionEnvironment.StoreClient) {
    Maplibre = require("@maplibre/maplibre-react-native");
  }
} catch (error) {
  console.warn("MapLibre not available (requires development build):", error);
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

export function MapTabContent() {
  const navigation = useNavigation<any>();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<NearbyEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Fetch nearby events when user location is available
  useEffect(() => {
    if (userLocation) {
      fetchNearbyEvents();
    }
  }, [userLocation]);

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError(
          "Location permission denied. Please enable location services in settings.",
        );
        setLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLoading(false);
    } catch (err) {
      console.error("Error getting location:", err);
      setError(
        "Failed to get your location. Please check your location services.",
      );
      setLoading(false);
    }
  };

  const fetchNearbyEvents = async () => {
    if (!userLocation) return;

    try {
      setEventsLoading(true);
      setEventsError(null);

      const response = await getNearbyEventsApi({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        radius: 10, // 10km radius
      });

      // Backend returns events - handle different response structures
      // The backend controller returns the array directly, but API wrapper may nest it
      let eventsArray: NearbyEvent[] = [];
      
      // Check if response.data is the array directly (backend returns array)
      if (Array.isArray(response.data)) {
        eventsArray = response.data;
      } 
      // Check if response.data has an events property (structured response)
      else if (response.data && typeof response.data === 'object' && 'events' in response.data && Array.isArray((response.data as any).events)) {
        eventsArray = (response.data as any).events;
      }
      // Fallback: try to extract from nested structure
      else if ((response as any).data?.data && Array.isArray((response as any).data.data)) {
        eventsArray = (response as any).data.data;
      }

      // Map events to ensure _id field exists (backend may return id)
      const mappedEvents = eventsArray.map((event: any) => ({
        ...event,
        _id: event._id || event.id, // Handle both id and _id
        latitude: event.latitude || event.location?.latitude,
        longitude: event.longitude || event.location?.longitude,
      })).filter((event: any) => 
        // Only include events with valid coordinates
        event.latitude && event.longitude &&
        typeof event.latitude === 'number' && 
        typeof event.longitude === 'number'
      );

      setEvents(mappedEvents);
    } catch (err: any) {
      console.error("Error fetching nearby events:", err);
      setEventsError(err.message || "Failed to fetch events");
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleEventMarkerPress = (event: NearbyEvent) => {
    // Navigate to event detail screen
    const eventId = event._id || (event as any).id;
    navigation.navigate(SCREEN_NAMES.EVENT_DETAIL, {
      event: {
        ...event,
        _id: eventId,
        id: eventId,
        title: event.eventName,
        eventName: event.eventName,
      },
    });
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Location Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  // No location state
  if (!userLocation) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Unable to determine your location</Text>
      </View>
    );
  }

  // Check if MapLibre is available (not available in Expo Go)
  if (!Maplibre || !Maplibre.MapView) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Map Unavailable</Text>
          <Text style={styles.errorText}>
            The map feature requires a development build and is not available in Expo Go.
          </Text>
          <Text style={[styles.errorText, { marginTop: 12, fontSize: 12 }]}>
            To use the map, build the app using:{'\n'}
            • Android: npx expo run:android{'\n'}
            • iOS: npx expo run:ios{'\n'}
            • Or: eas build --profile development --platform android
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Maplibre.MapView 
        ref={mapRef}
        style={styles.map} 
        logoEnabled={false}
        onDidFinishLoadingMap={() => {
          console.log("Map loaded successfully");
        }}
      >
        <Maplibre.Camera
          zoomLevel={14}
          centerCoordinate={[userLocation.longitude, userLocation.latitude]}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* User Location Marker */}
        <Maplibre.PointAnnotation
          id="userLocation"
          coordinate={[userLocation.longitude, userLocation.latitude]}
        >
          <View style={styles.markerContainer}>
            <View style={styles.markerOuter}>
              <View style={styles.markerInner} />
            </View>
          </View>
        </Maplibre.PointAnnotation>

        {/* Event Markers */}
        {events.map((event) => {
          // Only show events with valid coordinates
          if (!event.latitude || !event.longitude) return null;

          return (
            <Maplibre.PointAnnotation
              key={event._id || (event as any).id}
              id={`event-${event._id || (event as any).id}`}
              coordinate={[event.longitude, event.latitude]}
              onSelected={() => handleEventMarkerPress(event)}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleEventMarkerPress(event)}
              >
                <View style={styles.eventMarkerContainer}>
                  <View style={styles.eventMarker}>
                    <Text style={styles.eventMarkerText}>
                      {event.eventName?.charAt(0).toUpperCase() || 'E'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Maplibre.PointAnnotation>
          );
        })}

        {/* User Location Component for continuous tracking */}
        <Maplibre.UserLocation
          visible={true}
          showsUserHeadingIndicator={true}
          renderMode="native"
        />
      </Maplibre.MapView>

      {/* Events Info Overlay with Refresh Button */}
      <View style={styles.eventsInfo}>
        <Text style={styles.eventsInfoText}>
          {events.length > 0 
            ? `${events.length} ${events.length === 1 ? "event" : "events"} nearby`
            : "No events nearby"}
        </Text>
        <TouchableOpacity
          onPress={fetchNearbyEvents}
          disabled={eventsLoading || !userLocation}
          style={[
            styles.refreshButton,
            (eventsLoading || !userLocation) && styles.refreshButtonDisabled,
          ]}
        >
          <RefreshCw 
            size={16} 
            color="#FFFFFF" 
            style={eventsLoading ? styles.refreshIconRotating : undefined}
          />
        </TouchableOpacity>
      </View>

      {/* Loading indicator for events */}
      {eventsLoading && (
        <View style={styles.eventsLoading}>
          <ActivityIndicator size="small" color={Theme.colors.primary} />
          <Text style={styles.eventsLoadingText}>Loading events...</Text>
        </View>
      )}

      {/* Error message for events */}
      {eventsError && (
        <View style={styles.eventsError}>
          <Text style={styles.eventsErrorText}>{eventsError}</Text>
          <TouchableOpacity onPress={fetchNearbyEvents} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  map: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    color: Theme.colors.mutedForeground,
    fontSize: 16,
  },
  errorCard: {
    backgroundColor: Theme.colors.muted,
    borderRadius: Theme.radius.xl,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
    width: "100%",
    maxWidth: 360,
  },
  errorTitle: {
    color: Theme.colors.foreground,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  errorText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(147, 51, 234, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  markerInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Theme.colors.primary,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  eventMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  eventMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.primary,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  eventMarkerText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  eventsInfo: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventsInfoText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  refreshIconRotating: {
    transform: [{ rotate: "180deg" }],
  },
  eventsLoading: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  eventsLoadingText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  eventsError: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(220, 38, 38, 0.9)",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  eventsErrorText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
});
