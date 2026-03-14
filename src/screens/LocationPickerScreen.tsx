import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { X, MapPin, Search, Navigation, Check } from 'lucide-react-native';
import { Theme } from '../styles/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';

const GEOAPIFY_KEY = '3cf38a1b693d49e6b1b6433d1f05b0c9';

const DEFAULT_LOCATION = {
  latitude: 28.6139,
  longitude: 77.2090,
  zoom: 15,
};

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

export default function LocationPickerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_LOCATION);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Silently fall back to default location
        console.log('Location permission not granted, using default');
        return;
      }
      
      // Try to get location with timeout
      const locationPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000));
      
      const location = await Promise.race([locationPromise, timeoutPromise]);
      const { latitude, longitude } = (location as any).coords;
      const newLocation = { latitude, longitude, zoom: 16 };
      setMapCenter(newLocation);
      
      // Wait a bit for WebView to be ready, then send message
      setTimeout(() => {
        if (webViewRef.current) {
          webViewRef.current.postMessage(JSON.stringify({ type: 'setLocation', latitude, longitude, zoom: 16 }));
        }
      }, 100);
    } catch (e) {
      console.log('Location error (silent):', e);
      // Silently fail - don't show error to user
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 3) {
      setSuggestions([]);
      setShowResults(false);
      return;
    }
    try {
      // Filter for India only using countrycode:in
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&apiKey=${GEOAPIFY_KEY}&limit=5&filter=countrycode:in`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
      setShowResults(true);
    } catch (e) {}
  };

  const handleSuggestionPress = (item: any) => {
    const [longitude, latitude] = item.geometry.coordinates;
    const newLocation = { latitude, longitude, zoom: 16 };
    setMapCenter(newLocation);
    setSearchQuery(item.properties.formatted);
    setSuggestions([]);
    setShowResults(false);
    // Wait a bit for WebView to be ready, then send message
    setTimeout(() => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({ type: 'setLocation', latitude, longitude, zoom: 16 }));
      }
    }, 100);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapReady') setIsMapReady(true);
      else if (data.type === 'locationChange') {
        setMapCenter({ latitude: data.latitude, longitude: data.longitude, zoom: data.zoom });
      }
    } catch (e) {}
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${mapCenter.latitude}&lon=${mapCenter.longitude}&apiKey=${GEOAPIFY_KEY}`
      );
      const data = await res.json();
      const props = data.features?.[0]?.properties || {};
      const address = props.formatted || 'Selected Location';
      
      // Build location data matching HostScreen expectations
      const selectedLocation = {
        address: address,
        city: props.city || '',
        country: props.country || 'India',
        venue: props.name || props.address_line1 || address.split(',')[0],
        latitude: mapCenter.latitude,
        longitude: mapCenter.longitude,
      };
      
      // Navigate back with selectedLocation param
      // Use navigate with merge to update existing screen without re-mounting
      // @ts-ignore
      navigation.navigate({
        name: 'HostMain',
        params: { selectedLocation },
        merge: true,
      });
    } catch (e) {
      Alert.alert('Error', 'Could not get address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const mapHtml = getMapHTML(GEOAPIFY_KEY, mapCenter.latitude, mapCenter.longitude, mapCenter.zoom);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={['top', 'left', 'right']}>
      <LinearGradient colors={[Theme.colors.primary, Theme.colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerContent}>
          <MapPin size={24} color="#fff" />
          <Text style={styles.headerTitle}>Select Location</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color={Theme.colors.mutedForeground} style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="Search for a location..." placeholderTextColor={Theme.colors.mutedForeground} value={searchQuery} onChangeText={handleSearch} />
        </View>
        {showResults && suggestions.length > 0 && (
          <View style={styles.dropdown}>
            <FlatList data={suggestions} keyExtractor={(_, i) => i.toString()} renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSuggestionPress(item)}>
                <MapPin size={16} color={Theme.colors.primary} style={{ marginRight: 8 }} />
                <Text numberOfLines={1} style={{ flex: 1, color: Theme.colors.foreground }}>{item.properties.formatted}</Text>
              </TouchableOpacity>
            )} />
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.currentLocationButton} onPress={requestLocationPermission}>
        <Navigation size={18} color={Theme.colors.primary} />
        <Text style={styles.currentLocationText}>Use Current Location</Text>
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        {!isMapReady && (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
            <Text style={{ color: Theme.colors.mutedForeground, marginTop: 8 }}>Loading map...</Text>
          </View>
        )}
        <WebView ref={webViewRef} style={[styles.webView, !isMapReady && { opacity: 0 }]} source={{ html: mapHtml }} onMessage={handleWebViewMessage} javaScriptEnabled={true} domStorageEnabled={true} startInLoadingState={true} scrollEnabled={false} bounces={false} originWhitelist={['*']} />
      </View>

      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom || 20 }]}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={loading}>
          <LinearGradient colors={[Theme.colors.primary, Theme.colors.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.confirmGradient}>
            {loading ? <ActivityIndicator color="#fff" /> : <><Check size={20} color="#fff" style={{ marginRight: 8 }} /><Text style={styles.confirmText}>Confirm Location</Text></>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  closeButton: { padding: 4 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 12, zIndex: 100 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.card, borderRadius: 12, borderWidth: 1, borderColor: Theme.colors.border, paddingHorizontal: 12, height: 48 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: Theme.colors.foreground, fontSize: 16 },
  dropdown: { backgroundColor: Theme.colors.card, borderRadius: 12, maxHeight: 200, marginTop: 8, borderWidth: 1, borderColor: Theme.colors.border },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  currentLocationButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginBottom: 12, paddingVertical: 12, backgroundColor: 'rgba(180, 130, 194, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: Theme.colors.border },
  currentLocationText: { color: Theme.colors.primary, fontSize: 14, fontWeight: '600' },
  webView: { flex: 1 },
  mapLoading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.card, zIndex: 10 },
  bottomContainer: { backgroundColor: Theme.colors.background, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  confirmBtn: { borderRadius: 12, overflow: 'hidden' },
  confirmGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});