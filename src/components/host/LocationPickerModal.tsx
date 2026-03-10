// src/components/host/LocationPickerModal.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { X, MapPin, Check, Navigation, Search } from "lucide-react-native";
import { Theme } from "../../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";

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

const GOOGLE_PLACES_API_KEY = "YOUR_GOOGLE_PLACES_API_KEY"; // Replace with your actual API key
const { width } = Dimensions.get("window");

// Default to Delhi, India
const DEFAULT_LOCATION = {
  latitude: 28.6139,
  longitude: 77.2090,
};

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
  initialLocation = "",
}) => {
  const insets = useSafeAreaInsets();
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [addressData, setAddressData] = useState<LocationData | null>(null);
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [mapUrl, setMapUrl] = useState<string>("");

  // Get current location on mount
  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible]);

  // Update map when location changes
  useEffect(() => {
    if (selectedPlace) {
      const lat = selectedPlace.geometry?.location?.lat || currentLocation.latitude;
      const lng = selectedPlace.geometry?.location?.lng || currentLocation.longitude;
      updateMapUrl(lat, lng);
    }
  }, [selectedPlace]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      setCurrentLocation({ latitude, longitude });
      updateMapUrl(latitude, longitude);

      // Reverse geocode to get address
      await reverseGeocode(latitude, longitude);
    } catch (error) {
      console.log("Error getting location:", error);
      updateMapUrl(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
    }
  };

  const updateMapUrl = (lat: number, lng: number) => {
    // Using Google Static Maps API
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${GOOGLE_PLACES_API_KEY}`;
    setMapUrl(url);
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const locationData = extractLocationData(result);
        setAddressData(locationData);
        setSelectedPlace(result);
      }
    } catch (error) {
      console.log("Reverse geocode error:", error);
    }
  };

  const extractLocationData = (details: any): LocationData => {
    const components = details?.address_components || [];
    
    const getComponent = (types: string[]) => {
      const component = components.find((c: any) =>
        types.some((type) => c.types.includes(type))
      );
      return component?.long_name || "";
    };

    const streetNumber = getComponent(["street_number"]);
    const route = getComponent(["route"]);
    const subLocality = getComponent(["sublocality", "sublocality_level_1"]);
    const locality = getComponent(["locality"]);
    const city = locality || getComponent(["administrative_area_level_2"]);
    const state = getComponent(["administrative_area_level_1"]);
    const country = getComponent(["country"]);
    const postalCode = getComponent(["postal_code"]);

    const addressParts = [
      streetNumber && route ? `${streetNumber} ${route}` : route,
      subLocality,
      city,
      state,
      postalCode,
    ].filter(Boolean);

    const address = addressParts.join(", ");
    const venue = details?.name || details?.formatted_address?.split(",")[0] || "";
    const location = city && country ? `${city}, ${country}` : details?.formatted_address || "";

    const geometry = details?.geometry;
    const lat = geometry?.location?.lat || currentLocation.latitude;
    const lng = geometry?.location?.lng || currentLocation.longitude;

    return {
      location,
      address: address || details?.formatted_address || "",
      city,
      country,
      venue,
      latitude: lat,
      longitude: lng,
    };
  };

  const handlePlaceSelect = async (data: any, details: any = null) => {
    if (details) {
      setSelectedPlace(details);
      const locationData = extractLocationData(details);
      setAddressData(locationData);
      
      // Update map
      const lat = details.geometry.location.lat;
      const lng = details.geometry.location.lng;
      updateMapUrl(lat, lng);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please allow location access to use this feature.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      await reverseGeocode(latitude, longitude);
    } catch (error) {
      Alert.alert("Error", "Could not get current location.");
    }
  };

  const handleConfirm = () => {
    if (addressData) {
      onSelectLocation(addressData);
      onClose();
    } else {
      Alert.alert("No Location Selected", "Please search and select a location first.");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay} edges={["top", "left", "right"]}>
        <View style={[styles.modalContainer, { paddingBottom: insets.bottom }]}>
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

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Search Bar */}
            <View style={styles.searchWrapper}>
              <GooglePlacesAutocomplete
                placeholder="Search for a venue or address..."
                onPress={handlePlaceSelect}
                fetchDetails={true}
                query={{
                  key: GOOGLE_PLACES_API_KEY,
                  language: "en",
                }}
                styles={{
                  container: styles.autocompleteContainer,
                  textInput: styles.textInput,
                  listView: styles.listView,
                  row: styles.row,
                  separator: styles.separator,
                  description: styles.description,
                }}
                textInputProps={{
                  placeholderTextColor: Theme.colors.mutedForeground,
                  returnKeyType: "search",
                }}
                enablePoweredByContainer={false}
                minLength={2}
                debounce={300}
              />
            </View>

            {/* Current Location Button */}
            <TouchableOpacity 
              style={styles.currentLocationButton}
              onPress={handleUseCurrentLocation}
            >
              <Navigation size={18} color={Theme.colors.primary} />
              <Text style={styles.currentLocationText}>Use Current Location</Text>
            </TouchableOpacity>

            {/* Map Preview */}
            {mapUrl ? (
              <View style={styles.mapContainer}>
                <Image 
                  source={{ uri: mapUrl }} 
                  style={styles.mapImage}
                  resizeMode="cover"
                />
                <View style={styles.mapOverlay}>
                  <View style={styles.markerContainer}>
                    <View style={styles.marker}>
                      <MapPin size={20} color="#fff" />
                    </View>
                    <View style={styles.markerArrow} />
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.mapPlaceholder}>
                <MapPin size={40} color={Theme.colors.mutedForeground} />
                <Text style={styles.mapPlaceholderText}>Map will appear here</Text>
              </View>
            )}

            {/* Selected Location Info */}
            {addressData ? (
              <View style={styles.infoContainer}>
                <View style={styles.infoHeader}>
                  <Check size={16} color="#22c55e" />
                  <Text style={styles.infoTitle}>Location Selected</Text>
                </View>
                <Text style={styles.infoVenue} numberOfLines={1}>
                  {addressData.venue}
                </Text>
                <Text style={styles.infoAddress} numberOfLines={2}>
                  {addressData.address}
                </Text>
                <Text style={styles.infoDetails}>
                  {addressData.city}{addressData.city && addressData.country ? ", " : ""}{addressData.country}
                </Text>
              </View>
            ) : (
              <View style={styles.infoContainerEmpty}>
                <Search size={24} color={Theme.colors.mutedForeground} />
                <Text style={styles.infoEmptyText}>
                  Search for a location or use current location
                </Text>
              </View>
            )}

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                💡 Tip: Type the venue name or address in the search box above, then select from the list to auto-fill all fields.
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
                !addressData && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!addressData}
            >
              <LinearGradient
                colors={
                  addressData
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
      </SafeAreaView>
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
    maxHeight: "80%",
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
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 10,
  },
  autocompleteContainer: {
    flex: 0,
  },
  textInput: {
    backgroundColor: Theme.colors.card,
    color: Theme.colors.foreground,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    height: 50,
  },
  listView: {
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Theme.colors.card,
  },
  separator: {
    height: 1,
    backgroundColor: Theme.colors.border,
  },
  description: {
    color: Theme.colors.foreground,
    fontSize: 14,
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
  mapContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: Theme.colors.card,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapPlaceholder: {
    marginHorizontal: 16,
    marginTop: 16,
    height: 200,
    borderRadius: 16,
    backgroundColor: Theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderStyle: "dashed",
  },
  mapPlaceholderText: {
    color: Theme.colors.mutedForeground,
    marginTop: 12,
    fontSize: 14,
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  markerContainer: {
    alignItems: "center",
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Theme.colors.primary,
    marginTop: -3,
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
