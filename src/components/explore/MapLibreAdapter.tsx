import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { CameraSettings, MapAdapterProps } from './types';

import { MAP_STYLE_URL } from './constants';

// MapLibre does not use Mapbox access tokens in the same way.
// Avoid calling MapLibreGL.setAccessToken() (it doesn't exist) to prevent runtime crashes.
// If you switch to an SDK that requires a token, set it there conditionally.

export const MapLibreAdapter = React.forwardRef<any, MapAdapterProps>(
  ({ style, cameraSettings, children, ...props }, ref) => {
    return (
      <MapLibreGL.MapView
        ref={ref}
        style={style}
        // @ts-ignore - styleURL is valid in runtime despite type definition mismatch
        styleURL={MAP_STYLE_URL}
        logoEnabled={false}
        attributionEnabled={true}
        attributionPosition={{ bottom: 8, left: 8 }}
        {...props}
      >
        <MapLibreGL.Camera
          zoomLevel={cameraSettings?.zoomLevel}
          centerCoordinate={cameraSettings?.centerCoordinate}
          animationMode="flyTo"
          animationDuration={2000}
        />
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
            {children}
        </MapLibreGL.PointAnnotation>
    );
};
