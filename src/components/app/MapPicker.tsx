import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { LeafletMouseEvent } from 'leaflet';

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

interface MapUpdaterProps {
  position: [number, number];
  zoom: number;
}

// A component to programmatically update the map's view
const MapUpdater = ({ position, zoom }: MapUpdaterProps) => {
  const map = useMap();
  const prevPositionRef = useRef<[number, number] | null>(null);
  const prevZoomRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Only update if position or zoom actually changed
    const positionChanged = !prevPositionRef.current || 
      prevPositionRef.current[0] !== position[0] || 
      prevPositionRef.current[1] !== position[1];
    const zoomChanged = prevZoomRef.current !== zoom;
    
    if (positionChanged || zoomChanged) {
      map.setView(position, zoom);
      prevPositionRef.current = position;
      prevZoomRef.current = zoom;
    }
  }, [position, zoom, map]);
  return null;
};

interface MapPickerProps {
  onLocationChange: (lat: number, lng: number) => void;
  position: [number, number];
  zoom?: number;
}

const MapPicker = ({ onLocationChange, position, zoom = 13 }: MapPickerProps) => {
  const [markerInstance, setMarkerInstance] = useState<L.Marker | null>(null);

  // Update marker position when position prop changes
  useEffect(() => {
    if (markerInstance != null && Number.isFinite(position[0]) && Number.isFinite(position[1])) {
      markerInstance.setLatLng([position[0], position[1]]);
    }
  }, [position, markerInstance]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        if (markerInstance != null) {
          const { lat, lng } = markerInstance.getLatLng();
          onLocationChange(lat, lng);
        }
      },
    }),
    [onLocationChange, markerInstance],
  );

  // A component to handle map click events
  const MapClickHandler = ({ marker }: { marker: L.Marker | null }) => {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        const ll = e?.latlng;
        if (!ll) return;
        const { lat, lng } = ll;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        // Update marker position immediately
        if (marker != null) {
          marker.setLatLng([lat, lng]);
        }
        onLocationChange(lat, lng);
      },
    });
    return null;
  };

  // Callback to store marker instance
  const markerRefCallback = (marker: L.Marker | null) => {
    setMarkerInstance(marker);
  };

  return (
    <div className="h-full w-full rounded-md border" style={{ height: '300px' }}>
      <MapContainer center={position} zoom={zoom} 
        scrollWheelZoom={true} 
        touchZoom={true} 
        doubleClickZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Number.isFinite(position?.[0]) && Number.isFinite(position?.[1]) && (
          <Marker
            key={`${position[0]}-${position[1]}`}
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRefCallback}
            icon={defaultIcon}
          >
          <Popup>Drag the marker to the desired location.</Popup>
          </Marker>
        )}
        <MapClickHandler marker={markerInstance} />
        <MapUpdater position={position} zoom={zoom} />
      </MapContainer>
    </div>
  );
};

export default MapPicker;
