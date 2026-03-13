// src/components/host/LocationPickerModal.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { X, MapPin, Check, Navigation, Search, Crosshair } from "lucide-react-native";
import { Theme } from "../../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import MapView, { UrlTile } from "react-native-maps";

interface LocationData {
  location: string;
  address: string;
  city: string;
  country: string;
  venue: string;
  latitude?: number;
  longitude?: number;
}

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (locationData: LocationData) => void;
  initialLocation?: string;
}

const GEOAPIFY_API_KEY = "2c3c85c5f29947d58a663a5a4dd5e5f5"; // Replace with your actual Geoapify API key
const { width, height } = Dimensions.get("window");

// Default to Delhi, India
const DEFAULT_LOCATION = {
  latitude: 28.6139,
  longitude: 77.2090,
};

interface SearchResult {
  place_id: string;
  formatted: string;
  lat: number;
  lon: number;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  country?: string;
  name?: string;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
  initialLocation = "",
}) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_LOCATION);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get current location on mount
  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible]);

  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_API_KEY}&limit=5`
      );
      const data = await response.json();

      if (data.features) {
        const results: SearchResult[] = data.features.map((feature: any) => ({
          place_id: feature.properties.place_id,
          formatted: feature.properties.formatted,
          lat: feature.properties.lat,
          lon: feature.properties.lon,
          address_line1: feature.properties.address_line1,
          address_line2: feature.properties.address_line2,
          city: feature.properties.city,
          country: feature.properties.country,
          name: feature.properties.name,
        }));
        setSearchResults(results);
        setShowResults(true);
      }
    } catch (error) {
      console.log("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchLocations(text);
    }, 300);
  };

  const handleSelectResult = (result: SearchResult) => {
    const locationData: LocationData = {
      location: result.city && result.country ? `${result.city}, ${result.country}` : result.formatted,
      address: result.formatted,
      city: result.city || "",
      country: result.country || "",
      venue: result.name || result.address_line1 || result.formatted.split(",")[0],
      latitude: result.lat,
      longitude: result.lon,
    };

    setSelectedLocation(locationData);
    setMapCenter({ latitude: result.lat, longitude: result.lon });
    setSearchQuery(result.formatted);
    setShowResults(false);

    // Animate map to selected location
    mapRef.current?.animateToRegion({
      latitude: result.lat,
      longitude: result.lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // If permission denied, just use default location
        setMapCenter(DEFAULT_LOCATION);
        mapRef.current?.animateToRegion({
          latitude: DEFAULT_LOCATION.latitude,
          longitude: DEFAULT_LOCATION.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        await reverseGeocode(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      setMapCenter({ latitude, longitude });

      // Animate map to current location
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      
      // Reverse geocode to get address
      await reverseGeocode(latitude, longitude);
    } catch (error) {
      console.log("Error getting location:", error);
      // On error, use default location instead of showing alert
      setMapCenter(DEFAULT_LOCATION);
      mapRef.current?.animateToRegion({
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      await reverseGeocode(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const props = feature.properties;
        
        const locationData: LocationData = {
          location: props.city && props.country ? `${props.city}, ${props.country}` : props.formatted,
          address: props.formatted,
          city: props.city || "",
          country: props.country || "",
          venue: props.name || props.address_line1 || props.formatted.split(",")[0],
          latitude,
          longitude,
        };
        
        setSelectedLocation(locationData);
        setSearchQuery(props.formatted);
      }
    } catch (error) {
      console.log("Reverse geocode error:", error);
    }
  };

  const handleUseCurrentLocation = async () => {
    await getCurrentLocation();
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation);
      onClose();
    } else {
      Alert.alert("No Location Selected", "Please search for a location or use current location.");
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectResult(item)}
    >
      <MapPin size={18} color={Theme.colors.primary} style={styles.resultIcon} />
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.name || item.address_line1 || item.formatted.split(",")[0]}
        </Text>
        <Text style={styles.resultSubtitle} numberOfLines={1}>
          {item.formatted}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { paddingBottom: insets.bottom || 20 }]}>
          {/* Header */}
          <LinearGradient
            colors={[Theme.colors.primary, Theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.header, { paddingTop: insets.top > 0 ? 8 : 16 }]}
          >
            <View style={styles.headerContent}>
              <MapPin size={24} color="#fff" />
              <Text style={styles.headerTitle}>Select Location</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Search Bar */}
            <View style={styles.searchWrapper}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color={Theme.colors.mutedForeground} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for a venue or address..."
                  placeholderTextColor={Theme.colors.mutedForeground}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  returnKeyType="search"
                />
                {isSearching && (
                  <ActivityIndicator size="small" color={Theme.colors.primary} />
                )}
              </View>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <View style={styles.resultsContainer}>
                  <FlatList
                    data={searchResults}
                    renderItem={renderSearchResult}
                    keyExtractor={(item) => item.place_id}
                    scrollEnabled={false}
                  />
                </View>
              )}
            </View>

            {/* Current Location Button */}
            <TouchableOpacity 
              style={styles.currentLocationButton}
              onPress={handleUseCurrentLocation}
            >
              <Navigation size={18} color={Theme.colors.primary} />
              <Text style={styles.currentLocationText}>Use Current Location</Text>
            </TouchableOpacity>

            {/* Map Section */}
            <View style={styles.mapSection}>
              <Text style={styles.mapSectionTitle}>Pick on Map</Text>
              <Text style={styles.mapSectionSubtitle}>
                Drag the map to move the pin. The pin shows your selected location.
              </Text>

              {/* Interactive MapView */}
              <View style={styles.mapWrapper}>
                <MapView
                  ref={mapRef}
                  style={StyleSheet.absoluteFillObject}
                  initialRegion={{
                    latitude: mapCenter.latitude,
                    longitude: mapCenter.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                  onRegionChangeComplete={(region) => {
                    setMapCenter({ latitude: region.latitude, longitude: region.longitude });
                    reverseGeocode(region.latitude, region.longitude);
                  }}
                >
                  <UrlTile
                    urlTemplate={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`}
                    maximumZ={19}
                    flipY={false}
                    zIndex={1}
                  />
                </MapView>

                {/* Fixed Center Pin — does not move */}
                <View pointerEvents="none" style={styles.pinOverlay}>
                  <View style={styles.pinContainer}>
                    <View style={styles.pin}>
                      <MapPin size={24} color="#fff" />
                    </View>
                    <View style={styles.pinArrow} />
                  </View>
                </View>

                {/* Center on current location button */}
                <TouchableOpacity
                  style={styles.centerButton}
                  onPress={getCurrentLocation}
                >
                  <Crosshair size={20} color={Theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Selected Location Info */}
            {selectedLocation ? (
              <View style={styles.infoContainer}>
                <View style={styles.infoHeader}>
                  <Check size={16} color="#22c55e" />
                  <Text style={styles.infoTitle}>Location Selected</Text>
                </View>
                <Text style={styles.infoVenue} numberOfLines={1}>
                  {selectedLocation.venue}
                </Text>
                <Text style={styles.infoAddress} numberOfLines={2}>
                  {selectedLocation.address}
                </Text>
                <Text style={styles.infoDetails}>
                  {selectedLocation.city}{selectedLocation.city && selectedLocation.country ? ", " : ""}{selectedLocation.country}
                </Text>
              </View>
            ) : (
              <View style={styles.infoContainerEmpty}>
                <MapPin size={32} color={Theme.colors.mutedForeground} />
                <Text style={styles.infoEmptyText}>
                  Search for a location, use current location, or pick on map
                </Text>
              </View>
            )}

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                💡 Tip: Search for a location, tap "Use Current Location", or use the arrow buttons on the map to adjust the pin position.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedLocation && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!selectedLocation}
            >
              <LinearGradient
                colors={
                  selectedLocation
                    ? [Theme.colors.primary, Theme.colors.secondary]
                    : ["#666", "#888"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmButtonGradient}
              >
                <Text style={styles.confirmButtonText}>Confirm Location</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    minHeight: "60%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flexGrow: 1,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Theme.colors.foreground,
    fontSize: 16,
    paddingVertical: 12,
  },
  resultsContainer: {
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: "hidden",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  resultIcon: {
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    color: Theme.colors.foreground,
    fontSize: 14,
    fontWeight: "600",
  },
  resultSubtitle: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: "rgba(180, 130, 194, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  currentLocationText: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  mapSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  mapSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.foreground,
    marginBottom: 4,
  },
  mapSectionSubtitle: {
    fontSize: 12,
    color: Theme.colors.mutedForeground,
    marginBottom: 12,
  },
  mapWrapper: {
    height: 250,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: Theme.colors.card,
  },
  pinOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  pinContainer: {
    alignItems: "center",
    marginTop: -20,
  },
  pin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pinArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Theme.colors.primary,
    marginTop: -4,
  },
  centerButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#22c55e",
  },
  infoContainerEmpty: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderStyle: "dashed",
  },
  infoEmptyText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22c55e",
  },
  infoVenue: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.foreground,
    marginBottom: 4,
  },
  infoAddress: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    marginBottom: 4,
    lineHeight: 20,
  },
  infoDetails: {
    fontSize: 13,
    color: Theme.colors.primary,
    fontWeight: "500",
  },
  instructionsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    padding: 12,
    backgroundColor: "rgba(180, 130, 194, 0.1)",
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: Theme.colors.mutedForeground,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Theme.colors.card,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LocationPickerModal;
