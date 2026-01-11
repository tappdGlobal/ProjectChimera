import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { Theme } from "../../styles/Theme";
import { Locate, MapPin } from "lucide-react-native";
import { MapLibreAdapter, MapMarker } from "./MapLibreAdapter";

export function MapTabContent() {
  const [locationPermission, setLocationPermission] =
    useState<Location.PermissionStatus | null>(null);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      if (status === Location.PermissionStatus.GRANTED) {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      }
    })();
  }, []);

  const handleEnableLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status);
    if (status === Location.PermissionStatus.GRANTED) {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    } else {
      Alert.alert(
        "Permission Required",
        "Please enable location services to use this feature."
      );
    }
  };

  const defaultCenter = [72.8777, 19.0760]; // Mumbai
  const centerCoordinate = userLocation 
        ? [userLocation.coords.longitude, userLocation.coords.latitude] 
        : defaultCenter;

  return (
    <View style={styles.container}>
      {locationPermission === Location.PermissionStatus.GRANTED ? (
         <MapLibreAdapter
            style={styles.map}
            cameraSettings={{
                zoomLevel: 12,
                centerCoordinate: centerCoordinate
            }}
         >
            {/* Example Markers to match screenshot */}
            <MapMarker coordinate={[72.84, 19.11]}>
              <View style={styles.markerContainer}>
                 <View style={[styles.markerBadge, { backgroundColor: '#A020F0' }]}>
                    <Text style={styles.markerText}>B</Text>
                 </View>
                 <MapPin size={24} color="#A020F0" fill="#A020F0" />
              </View>
            </MapMarker>

         </MapLibreAdapter>
      ) : (
          <View style={styles.permissionContainer}>
              <View style={styles.permissionCard}>
                <Text style={styles.permissionTitle}>Location access denied</Text>
                <Text style={styles.permissionDesc}>Enable location to see events near you</Text>
                <TouchableOpacity style={styles.enableButton} onPress={handleEnableLocation}>
                    <Text style={styles.enableButtonText}>Enable</Text>
                </TouchableOpacity>
              </View>
              
               <MapLibreAdapter
                    style={[styles.map, StyleSheet.absoluteFillObject, { zIndex: -1, opacity: 0.5 }]}
                    cameraSettings={{
                        zoomLevel: 10,
                        centerCoordinate: defaultCenter
                    }}
                />
          </View>
      )}

      {/* Floating Action Button for Recenter (if permission granted) */}
      {locationPermission === Location.PermissionStatus.GRANTED && (
        <TouchableOpacity 
            style={styles.recenterButton}
            onPress={async () => {
                const location = await Location.getCurrentPositionAsync({});
                setUserLocation(location);
            }}
        >
            <Locate size={24} color={Theme.colors.foreground} />
        </TouchableOpacity>
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
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 60,
  },
  permissionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    marginBottom: 4,
  },
  permissionDesc: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    marginBottom: 12,
  },
  enableButton: {
    backgroundColor: "#7C3AED", // Purple
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  enableButtonText: {
    color: "white",
    fontWeight: "600",
  },
  recenterButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: -8,
    zIndex: 1,
    borderWidth: 1,
    borderColor: "white",
  },
  markerText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
});
