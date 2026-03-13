// src/screens/LocationPickerScreen.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { X, MapPin, Search, Navigation, Check } from "lucide-react-native";
import { Theme } from "../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HostStackParamList } from "../navigation/Routes";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");
const GEOAPIFY_API_KEY = "3cf38a1b693d49e6b1b6433d1f05b0c9";

// Default location (New Delhi, India)
const DEFAULT_LOCATION = {
  latitude: 28.6139,
  longitude: 77.2090,
  zoom: 15,
};

interface SearchResult {
  place_id: string;
  formatted: string;
  lat: number;
  lon: number;
  name?: string;
  address_line1?: string;
  city?: string;
  country?: string;
}

interface MapLocation {
  latitude: number;
  longitude: number;
  zoom: number;
}

type LocationPickerNavigationProp = NativeStackNavigationProp<HostStackParamList, "LocationPicker">;
type LocationPickerRouteProp = RouteProp<HostStackParamList, "LocationPicker">;

// HTML content for the map with Leaflet + Geoapify (no Google Maps API needed)
const getMapHTML = (apiKey: string, lat: number, lng: number, zoom: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; overflow: hidden; }
    #map { height: 100vh; width: 100vw; }
    .center-pin {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -100%);
      z-index: 1000;
      pointer-events: none;
    }
    .pin-icon {
      width: 40px;
      height: 40px;
      background: #b482c2;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pin-icon::after {
      content: '';
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      transform: rotate(45deg);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="center-pin">
    <div class="pin-icon"></div>
  </div>
  <script>
    // Initialize map
    const map = L.map('map', {
      center: [${lat}, ${lng}],
      zoom: ${zoom},
      zoomControl: false,
      attributionControl: false
    });

    // Add Geoapify tile layer (no Google Maps API needed)
    L.tileLayer('https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}', {
      maxZoom: 19,
      attribution: 'Powered by Geoapify'
    }).addTo(map);

    // Track center changes and send to React Native
    map.on('moveend', function() {
      const center = map.getCenter();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'locationChange',
        latitude: center.lat,
        longitude: center.lng,
        zoom: map.getZoom()
      }));
    });

    map.on('zoomend', function() {
      const center = map.getCenter();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'zoomChange',
        latitude: center.lat,
        longitude: center.lng,
        zoom: map.getZoom()
      }));
    });

    // Listen for messages from React Native
    window.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'setLocation') {
          map.setView([data.latitude, data.longitude], data.zoom || 15, {
            animate: true,
            duration: 0.5
          });
        }
      } catch (e) {}
    });

    // Signal that map is ready
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'mapReady'
    }));
  </script>
</body>
</html>
`;

export const LocationPickerScreen: React.FC = () => {
  const navigation = useNavigation<LocationPickerNavigationProp>();
  const route = useRoute<LocationPickerRouteProp>();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mapLocation, setMapLocation] = useState<MapLocation>(DEFAULT_LOCATION);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapHtml, setMapHtml] = useState(() => getMapHTML(GEOAPIFY_API_KEY, DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, DEFAULT_LOCATION.zoom));

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search with debounce
  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_API_KEY}&limit=5&filter=countrycode:in`
      );
      const data = await response.json();

      if (data.features) {
        const results: SearchResult[] = data.features.map((feature: any) => ({
          place_id: feature.properties.place_id,
          formatted: feature.properties.formatted,
          lat: feature.properties.lat,
          lon: feature.properties.lon,
          name: feature.properties.name,
          address_line1: feature.properties.address_line1,
          city: feature.properties.city,
          country: feature.properties.country,
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
    }, 400);
  };

  const handleSelectResult = (result: SearchResult) => {
    setSearchQuery(result.formatted);
    setShowResults(false);

    const newLocation = {
      latitude: result.lat,
      longitude: result.lon,
      zoom: 16,
    };

    setMapLocation(newLocation);

    // Update map HTML with new center to prevent reset on re-render
    setMapHtml(getMapHTML(GEOAPIFY_API_KEY, result.lat, result.lon, 16));
    
    // Also send message to WebView to update map location
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'setLocation',
        latitude: result.lat,
        longitude: result.lon,
        zoom: 16
      }));
    }
  };

  // Handle messages from WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapReady') {
        setIsMapReady(true);
      } else if (data.type === 'locationChange' || data.type === 'zoomChange') {
        setMapLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          zoom: data.zoom,
        });
      }
    } catch (e) {
      console.log('WebView message error:', e);
    }
  };

  // Get current location with proper permission handling using expo-location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Silently use default location, no alert
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const { latitude, longitude } = location.coords;
      const newLocation = {
        latitude,
        longitude,
        zoom: 16,
      };
      setMapLocation(newLocation);
      
      // Update map HTML with new center
      setMapHtml(getMapHTML(GEOAPIFY_API_KEY, latitude, longitude, 16));

      // Send message to WebView
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'setLocation',
          latitude,
          longitude,
          zoom: 16
        }));
      }
    } catch (e) {
      console.log("Location error:", e);
      // Silently fall back to default, no alert
    }
  };

  // Get location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleConfirmLocation = async () => {
    setIsLoading(true);
    try {
      const { latitude, longitude } = mapLocation;
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const props = feature.properties;

        const locationData = {
          address: props.formatted,
          lat: latitude,
          lng: longitude,
          city: props.city || "",
          country: props.country || "",
          venue: props.name || props.address_line1 || "",
        };

        // Navigate back with the location data
        navigation.navigate("HostMain", { selectedLocation: locationData });
      } else {
        Alert.alert("Error", "Could not resolve address for this location.");
      }
    } catch (error) {
      console.log("Reverse geocode error:", error);
      Alert.alert("Error", "Location not found. Please try again.");
    } finally {
      setIsLoading(false);
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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color={Theme.colors.mutedForeground} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a location..."
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
          <View style={styles.resultsDropdown}>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.place_id}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
      </View>

      {/* Current Location Button */}
      <TouchableOpacity 
        style={styles.currentLocationButton}
        onPress={getCurrentLocation}
      >
        <Navigation size={18} color={Theme.colors.primary} />
        <Text style={styles.currentLocationText}>Use Current Location</Text>
      </TouchableOpacity>

      {/* Map Container with WebView + Leaflet */}
      <View style={styles.mapContainer}>
        {!isMapReady && (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
            <Text style={{ color: Theme.colors.mutedForeground, marginTop: 8 }}>
              Loading map...
            </Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          style={[styles.webView, !isMapReady && { opacity: 0 }]}
          source={{ html: mapHtml }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          scrollEnabled={false}
          bounces={false}
          originWhitelist={['*']}
          mixedContentMode="compatibility"
        />
      </View>

      {/* Bottom Section */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom || 20 }]}>
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesText}>
            Lat: {mapLocation.latitude.toFixed(6)}, Lng: {mapLocation.longitude.toFixed(6)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmLocation}
          disabled={isLoading}
        >
          <LinearGradient
            colors={[Theme.colors.primary, Theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Check size={20} color="#fff" style={styles.confirmIcon} />
                <Text style={styles.confirmButtonText}>Confirm Location</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Theme.colors.background,
    zIndex: 100,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Theme.colors.foreground,
    fontSize: 16,
    paddingVertical: 10,
  },
  resultsDropdown: {
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 250,
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
    marginBottom: 12,
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
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
  },
  mapLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.card,
    zIndex: 10,
  },
  bottomContainer: {
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  coordinatesContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  coordinatesText: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },
  confirmButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  confirmButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  confirmIcon: {
    marginRight: 4,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LocationPickerScreen;
