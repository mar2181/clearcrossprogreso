'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface MapViewProps {
  lat: number;
  lng: number;
  name: string;
  address?: string;
  className?: string;
}

export default function MapView({ lat, lng, name, address, className = '' }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // If no API key, show static fallback
    if (!apiKey) {
      setError(true);
      return;
    }

    // Load Google Maps script if not already loaded
    if (typeof window !== 'undefined' && !(window as any).google?.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      script.onerror = () => setError(true);
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (!mapRef.current || !(window as any).google?.maps) return;

      try {
        const position = { lat, lng };
        const map = new (window as any).google.maps.Map(mapRef.current, {
          center: position,
          zoom: 16,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
        });

        new (window as any).google.maps.Marker({
          position,
          map,
          title: name,
        });

        setMapLoaded(true);
      } catch {
        setError(true);
      }
    }
  }, [lat, lng, name]);

  // Fallback: static map link when Google Maps JS fails or no API key
  if (error) {
    return (
      <div className={`relative rounded-xl overflow-hidden bg-neutral-100 ${className}`}>
        <div className="flex flex-col items-center justify-center h-full min-h-[280px] p-6 text-center">
          <MapPin className="w-10 h-10 text-brand-blue mb-3" />
          <p className="font-semibold text-neutral-900 mb-1">{name}</p>
          {address && <p className="text-sm text-neutral-600 mb-4">{address}</p>}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors"
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <div
        ref={mapRef}
        className="w-full min-h-[280px] h-full"
      />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 animate-pulse">
          <MapPin className="w-8 h-8 text-neutral-300" />
        </div>
      )}
    </div>
  );
}
