import { ReactNode } from 'react';

export interface CameraSettings {
  zoomLevel: number;
  centerCoordinate: number[];
}

export interface MapAdapterProps {
  style?: any;
  cameraSettings?: CameraSettings;
  children?: ReactNode;
  [key: string]: any; // Allow other props pass-through
}

export interface MapMarkerProps {
    coordinate: number[];
    children: ReactNode;
}
