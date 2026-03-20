// src/components/host/LocationPickerModal.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { X, MapPin, Check, Search, Navigation } from "lucide-react-native";
import { Theme } from "../../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { WebView } from "react-native-webview";

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

const GEOAPIFY_API_KEY = "3cf38a1b693d49e6b1b6433d1f05b0c9";
const { width, height } = Dimensions.get("window");

// Default to Delhi, India
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
  city?: string;
  country?: string;
  name?: string;
}

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
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="center-pin"><div class="pin-icon"></div></div>
  <script>
    const map = L.map('map', {
      center: [${lat}, ${lng}],
      zoom: ${zoom},
      zoomControl: false,
      attributionControl: false
    });
    L.tileLayer('https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}', {
      maxZoom: 19,
      attribution: 'Powered by Geoapify'
    }).addTo(map);
    map.on('moveend', function() {
      const center = map.getCenter();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'locationChange',
        latitude: center.lat,
        longitude: center.lng,
        zoom: map.getZoom()
      }));
    });
    window.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'setLocation') {
          map.setView([data.latitude, data.longitude], data.zoom || 15, { animate: true });
        }
      } catch (e) {}
    });
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
  </script>
</body>
</html>
`;

export default function LocationPickerModal({
  visible,
  onClose,
  onSelectLocation,
  initialLocation,
}: LocationPickerModalProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    zoom: DEFAULT_LOCATION.zoom,
  });
  const [mapReady, setMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          query
        )}&limit=5&filter=countrycode:in&apiKey=${GEOAPIFY_API_KEY}`
      );
      const data = await response.json();
      if (data.features) {
        setSearchResults(
          data.features.map((feature: any) => ({
            place_id: feature.properties.place_id,
            formatted: feature.properties.formatted,
            lat: feature.properties.lat,
            lon: feature.properties.lon,
            city: feature.properties.city,
            country: feature.properties.country,
            name: feature.properties.name,
          }))
        );
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultSelect = (result: SearchResult) => {
    setSelectedLocation({
      latitude: result.lat,
      longitude: result.lon,
      zoom: 16,
    });
    
    // Update map via WebView
    if (webViewRef.current && mapReady) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "setLocation",
          latitude: result.lat,
          longitude: result.lon,
          zoom: 16,
        })
      );
    }
    
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "locationChange") {
        setSelectedLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          zoom: data.zoom,
        });
      } else if (data.type === "mapReady") {
        setMapReady(true);
      }
    } catch (e) {
      console.error("WebView message error:", e);
    }
  };

  const reverseGeocode = async (lat: number, lon: number): Promise<LocationData> => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEOAPIFY_API_KEY}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0].properties;
        return {
          location: feature.formatted || `${lat}, ${lon}`,
          address: feature.formatted || `${lat}, ${lon}`,
          city: feature.city || feature.county || "",
          country: feature.country || "India",
          venue: feature.name || feature.street || "",
          latitude: lat,
          longitude: lon,
        };
      }
    } catch (error) {
      console.error("Reverse geocode error:", error);
    }
    
    return {
      location: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      address: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      city: "",
      country: "India",
      venue: "",
      latitude: lat,
      longitude: lon,
    };
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    const locationData = await reverseGeocode(
      selectedLocation.latitude,
      selectedLocation.longitude
    );
    setIsLoading(false);
    onSelectLocation(locationData);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.searchResult}
      onPress={() => handleSearchResultSelect(item)}
    >
      <MapPin size={20} color={Theme.colors.primary} />
      <View style={styles.searchResultText}>
        <Text style={styles.searchResultTitle} numberOfLines={1}>
          {item.name || item.formatted}
        </Text>
        <Text style={styles.searchResultSubtitle} numberOfLines={1}>
          {item.formatted}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Theme.colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Theme.colors.mutedForeground} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search location..."
              placeholderTextColor={Theme.colors.mutedForeground}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {isSearching && (
              <ActivityIndicator size="small" color={Theme.colors.primary} />
            )}
          </View>
          
          {/* Search Results - Inside search section to avoid overlap */}
          {searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.place_id}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            style={styles.map}
            source={{
              html: getMapHTML(
                GEOAPIFY_API_KEY,
                selectedLocation.latitude,
                selectedLocation.longitude,
                selectedLocation.zoom
              ),
            }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
              </View>
            )}
          />
          
          {/* Center Pin Overlay */}
          <View style={styles.centerPinContainer} pointerEvents="none">
            <View style={styles.pinIcon} />
          </View>
        </View>

        {/* Bottom Panel */}
        <View style={styles.bottomPanel}>
          <View style={styles.locationInfo}>
            <MapPin size={20} color={Theme.colors.primary} />
            <Text style={styles.coordinates} numberOfLines={1}>
              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            disabled={isLoading}
          >
            <LinearGradient
              colors={["#a9016d", "#740182"]}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Check size={20} color="#fff" />
                  <Text style={styles.confirmButtonText}>Confirm Location</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.foreground,
  },
  placeholder: {
    width: 40,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 100,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Theme.colors.foreground,
  },
  searchResultsContainer: {
    marginTop: 8,
    maxHeight: 200,
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  searchResult: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  searchResultText: {
    marginLeft: 12,
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Theme.colors.foreground,
  },
  searchResultSubtitle: {
    fontSize: 14,
    color: Theme.colors.mutedForeground,
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  centerPinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -40,
    zIndex: 1000,
  },
  pinIcon: {
    width: 40,
    height: 40,
    backgroundColor: Theme.colors.primary,
    borderRadius: 50,
    borderBottomRightRadius: 0,
    transform: [{ rotate: "-45deg" }],
    borderWidth: 3,
    borderColor: "#fff",
  },
  bottomPanel: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  coordinates: {
    marginLeft: 8,
    fontSize: 14,
    color: Theme.colors.mutedForeground,
  },
  confirmButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
