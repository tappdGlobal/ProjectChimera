import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapAdapterProps, MapMarkerProps } from './types';
import { MAP_STYLE_URL } from './constants';

export const MapLibreAdapter = React.forwardRef<any, MapAdapterProps>(
  ({ style, cameraSettings, children, ...props }, ref) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);

    useEffect(() => {
      if (map.current || !mapContainer.current) return;

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: MAP_STYLE_URL,
        center: (cameraSettings?.centerCoordinate as [number, number]) || [0, 0],
        zoom: cameraSettings?.zoomLevel || 1,
        attributionControl: false,
      });

      map.current.addControl(new maplibregl.AttributionControl(), 'bottom-left');
      map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');

      // Forward ref if needed (simplified)
      if (ref) {
          if (typeof ref === 'function') {
              ref(map.current);
          } else {
              ref.current = map.current;
          }
      }

    }, []);

    // Update Camera
    useEffect(() => {
        if (!map.current || !cameraSettings) return;
        map.current.flyTo({
            center: cameraSettings.centerCoordinate as [number, number],
            zoom: cameraSettings.zoomLevel
        });
    }, [cameraSettings]);

    // Handle User Location (Browser Geolocation API or just relying on the passed props)
    // For web, we can use maplibregl.GeolocateControl or just a marker.
    // Let's add the GeolocateControl once.
    useEffect(() => {
        if (!map.current) return;
        // Check if control already exists? maplibregl doesn't make it easy to check loops.
        // Simplified: Just add it if strict mode doesn't render twice.
        const geolocate = new maplibregl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true
        });
        map.current.addControl(geolocate, 'top-right');
        
        // Trigger it? 
        // geolocate.trigger(); // Might need user gesture or permission flow handling
    }, []);

    return (
      <View style={style}>
        <div 
            ref={mapContainer} 
            style={{ width: '100%', height: '100%' }} 
        />
        {/* Render children (Using a portal or similar tech would be better for markers, 
            but for now simplify: pass children if they are non-map React nodes, 
            but map markers on web usually need to be added via map instance) 
            
            Key limitation: React Children as markers in maplibre-gl web requires 
            react-dom/portal or custom Marker logic. 
            
            We will assume the children are our parsed Markers.
        */}
        {React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type === MapMarker) {
                return React.cloneElement(child, { map: map.current } as any);
            }
            return child;
        })}
      </View>
    );
  }
);

export const MapMarker = ({ coordinate, children, map }: MapMarkerProps & { map?: maplibregl.Map }) => {
    const markerRef = useRef<maplibregl.Marker | null>(null);
    const elRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!map || !elRef.current) return;

        // Create a DOM element for the marker
        const el = elRef.current;
        
        markerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat(coordinate as [number, number])
            .addTo(map);

        return () => {
            markerRef.current?.remove();
        };
    }, [map]);

    useEffect(() => {
        markerRef.current?.setLngLat(coordinate as [number, number]);
    }, [coordinate]);

    return (
        <div ref={elRef} style={{ display: 'block' }}>
            {/* We render the React Native View children into this div. 
                React Native Web will verify this is compatible. 
            */}
             {children} 
        </div>
    );
};
