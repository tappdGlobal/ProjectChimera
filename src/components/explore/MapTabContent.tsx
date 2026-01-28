import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, Platform } from "react-native";
import * as Location from "expo-location";
import { Theme } from "../../styles/Theme";

// Only import MapLibre on native platforms
let Maplibre: any = null;
if (Platform.OS !== 'web') {
  Maplibre = require("@maplibre/maplibre-react-native").default;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

export function MapTabContent() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

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

  // Web fallback - show message instead of map
  if (Platform.OS === 'web') {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Map View</Text>
          <Text style={styles.errorText}>
            Interactive maps are only available on the mobile app.
            {"\n\n"}
            Your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Maplibre.MapView style={styles.map} logoEnabled={false}>
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

        {/* User Location Component for continuous tracking */}
        <Maplibre.UserLocation
          visible={true}
          showsUserHeadingIndicator={true}
          renderMode="native"
        />
      </Maplibre.MapView>
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
});
