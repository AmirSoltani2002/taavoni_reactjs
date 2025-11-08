import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

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

interface MapViewProps {
  position: [number, number];
  zoom?: number;
  title?: string;
}

const MapView = ({ position, zoom = 13, title }: MapViewProps) => {
  return (
    <div className="h-full w-full rounded-md border" style={{ height: '400px' }}>
      <MapContainer 
        center={position} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        touchZoom={true} 
        doubleClickZoom={true}
        dragging={true}
        zoomControl={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Number.isFinite(position?.[0]) && Number.isFinite(position?.[1]) && (
          <Marker
            position={position}
            icon={defaultIcon}
          >
            {title && <Popup>{title}</Popup>}
          </Marker>
        )}
        <MapUpdater position={position} zoom={zoom} />
      </MapContainer>
    </div>
  );
};

export default MapView;

