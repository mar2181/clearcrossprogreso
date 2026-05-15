'use client';

import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface ProviderMapProps {
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  categorySlug: string;
}

/**
 * Embedded Google Map for provider location.
 * Uses the free embed API (no key required) for display,
 * and a direct Google Maps link for directions.
 */
export default function ProviderMap({ name, address, lat, lng, categorySlug }: ProviderMapProps) {
  // Generate embed URL using lat/lng if available, otherwise use address
  const embedUrl = lat && lng
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(address + ', Nuevo Progreso, Tamaulipas, Mexico')}&z=17&output=embed`;

  const directionsUrl = lat && lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address + ', Nuevo Progreso, Tamaulipas, Mexico')}`;

  const placeUrl = lat && lng
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
      {/* Map embed */}
      <div className="relative w-full h-72 sm:h-80">
        <iframe
          title={`Map showing location of ${name}`}
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Action bar below map */}
      <div className="bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-neutral-dark">{address}</p>
            <p className="text-xs text-neutral-400">Nuevo Progreso, Tamaulipas, Mexico</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:bg-brand-navy transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            Directions
          </a>
          <a
            href={placeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border-2 border-neutral-200 text-neutral-dark text-sm font-semibold rounded-lg hover:border-brand-blue hover:text-brand-blue transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in Maps
          </a>
        </div>
      </div>
    </div>
  );
}
