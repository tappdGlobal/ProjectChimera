import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { CameraSettings, MapAdapterProps } from './types';

import { MAP_STYLE_URL } from './constants';

// MapLibre does not use Mapbox access tokens in the same way.
// Avoid calling MapLibreGL.setAccessToken() (it doesn't exist) to prevent runtime crashes.
// If you switch to an SDK that requires a token, set it there conditionally.

export const MapLibreAdapter = React.forwardRef<any, MapAdapterProps>(
  ({ style, cameraSettings, children, ...props }, ref) => {
    const hasCameraModes = !!(MapLibreGL as any).CameraModes;
    const isMapRegistered = !!(MapLibreGL as any)?.MapView;

    useEffect(() => {
      // Request location permissions on mount
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            console.warn('Location permission denied');
          }
        } catch (err) {
          console.warn('Failed to request location permission:', err);
        }
      })();

      // Validate style URL is reachable
      fetch(MAP_STYLE_URL, { method: 'HEAD' })
        .then((res) => {
          if (!res.ok) {
            console.warn(`Map style URL returned status ${res.status}: ${MAP_STYLE_URL}`);
          }
        })
        .catch((err) => {
          console.error('Map style URL not reachable from device:', MAP_STYLE_URL, err);
        });
    }, []);

    if (!isMapRegistered) {
      console.warn('MapLibre native module not registered. Map will render fallback. See https://github.com/maplibre/maplibre-react-native');
      return (
        <View style={[style, styles.fallback]}>
          <Text style={styles.fallbackText}>Map unavailable — native module not registered. Use a development build or follow docs.</Text>
        </View>
      );
    }

    return (
      <MapLibreGL.MapView
        ref={ref}
        style={style}
        // @ts-ignore - styleURL is valid in runtime despite type definition mismatch
        styleURL={MAP_STYLE_URL}
        logoEnabled={false}
        attributionEnabled={true}
        attributionPosition={{ bottom: 8, left: 8 }}
        onDidFailLoadingMap={() => console.warn('MapLibre: Map failed to load')}
        // @ts-ignore - onMapError may not be in type definitions but exists at runtime
        onMapError={() => console.warn('MapLibre: Map error')}
        {...props}
      >
        { (MapLibreGL as any).Camera ? (
          <MapLibreGL.Camera
            zoomLevel={cameraSettings?.zoomLevel}
            centerCoordinate={cameraSettings?.centerCoordinate}
            {...(hasCameraModes ? { animationMode: 'flyTo', animationDuration: 2000 } : {})}
          />
        ) : null }
        {/* User Location Puck */}
        <MapLibreGL.UserLocation visible={true} showsUserHeadingIndicator={true} />
        {children}
      </MapLibreGL.MapView>
    );
  }
);

// Exports for sub-components to abstract them if needed, 
// strictly we should abstract these too if we use them in the parent.
export const MapMarker = ({ coordinate, children }: { coordinate: number[]; children: React.ReactNode }) => {
    return (
        <MapLibreGL.PointAnnotation id={`marker-${coordinate.join(',')}`} coordinate={coordinate}>
            {children as any}
        </MapLibreGL.PointAnnotation>
    );
};

const styles = StyleSheet.create({
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A1F',
  },
  fallbackText: {
    color: '#FFFFFF',
    opacity: 0.85,
    textAlign: 'center',
    padding: 12,
  },
});
