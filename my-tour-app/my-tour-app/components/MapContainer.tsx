'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

const userIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});

const locationIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 1 });
  }, [lat, lng, map]);
  return null;
}

interface Location {
  id: string; name: string; lat: number; lng: number; radius: number;
}

export default function MapComponent({ location }: { location: { lat: number; lng: number } | null }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const defaultCenter: [number, number] = [20.2506, 105.9745];

  useEffect(() => {
    fetch('/api/locations').then(res => res.json()).then(data => setLocations(data)).catch(console.error);
  }, []);

  return (
    <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map((loc) => (
        <div key={loc.id}>
          <Circle center={[loc.lat, loc.lng]} radius={loc.radius} pathOptions={{ color: '#3b82f6', fillOpacity: 0.1, dashArray: '5,5' }} />
          <Marker position={[loc.lat, loc.lng]} icon={locationIcon}>
            <Popup><b>{loc.name}</b><br/>Bán kính: {loc.radius}m</Popup>
          </Marker>
        </div>
      ))}
      {location && (
        <>
          <Marker position={[location.lat, location.lng]} icon={userIcon}>
            <Popup>📍 Vị trí của bạn</Popup>
          </Marker>
          <RecenterMap lat={location.lat} lng={location.lng} />
        </>
      )}
    </MapContainer>
  );
}
