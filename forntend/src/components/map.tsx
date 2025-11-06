
'use client';

import { APIProvider, Map as GoogleMap, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { Printer } from 'lucide-react';
import React, { useEffect } from 'react';

type Farmer = {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
};

type MapProps = {
    farmers: Farmer[];
    center: { lat: number; lng: number };
    zoom: number;
    selectedFarmerId?: number | null;
}

const MapViewUpdater = ({ center, zoom }: { center: { lat: number, lng: number }, zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        if (map) {
            map.moveCamera({ center, zoom });
        }
    }, [map, center, zoom]);
    return null;
};

export function Map({ farmers, center, zoom, selectedFarmerId }: MapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="relative w-full h-full rounded-lg bg-secondary overflow-hidden border flex items-center justify-center">
        <div className="text-center p-4">
          <p className="font-semibold">Google Maps API Key is missing.</p>
          <p className="text-sm text-muted-foreground">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file to see the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <APIProvider apiKey={apiKey}>
        <GoogleMap
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="shareprinto-map"
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          <MapViewUpdater center={center} zoom={zoom} />
          {farmers.map((farmer) => (
            <AdvancedMarker key={String(farmer.id)} position={{ lat: farmer.lat, lng: farmer.lng }}>
              <div className={`p-2 rounded-full shadow-md transition-all ${String(selectedFarmerId) === String(farmer.id) ? 'bg-blue-500 text-white scale-125' : 'bg-primary text-primary-foreground'}`}>
                <Printer className="h-5 w-5" />
              </div>
            </AdvancedMarker>
          ))}
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
