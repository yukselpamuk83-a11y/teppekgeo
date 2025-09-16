
'use client';

import dynamic from 'next/dynamic';
import { MapMarker } from '@/lib/types';

// Çalışan Leaflet Map bileşenini dinamik olarak yükle
const LeafletMap = dynamic(
  () => import('./leaflet-map'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mx-auto"></div>
          <p className="text-teal-600 font-medium">Harita yükleniyor...</p>
        </div>
      </div>
    )
  }
);

interface WorldMapProps {
  markers: MapMarker[];
  selectedMarkerId?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapMove?: (center: [number, number], zoom: number) => void;
  onShowDetails?: (marker: MapMarker) => void;
  onApplyJob?: (marker: MapMarker) => void;
  onContactPerson?: (marker: MapMarker) => void;
  className?: string;
}

export default function WorldMap(props: WorldMapProps) {
  return <LeafletMap {...props} />;
}
