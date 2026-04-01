'use client';

import React, { useState } from 'react';
import { Map, List, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryMapProps {
  providers: {
    id: string;
    name: string;
    slug: string;
    address: string;
    lat: number | null;
    lng: number | null;
    verified: boolean;
    featured: boolean;
    avg_rating: number | null;
  }[];
  categoryName: string;
  categorySlug: string;
}

/**
 * Embedded Google Map showing all providers in a category.
 * Uses a search query to center on Nuevo Progreso with markers.
 */
export default function CategoryMap({ providers, categoryName, categorySlug }: CategoryMapProps) {
  const [view, setView] = useState<'list' | 'map'>('list');

  // Filter to providers with coordinates
  const withCoords = providers.filter(p => p.lat && p.lng);

  // Use a search-based embed centered on Nuevo Progreso
  const centerLat = 26.055;
  const centerLng = -97.958;
  const embedUrl = `https://maps.google.com/maps?q=${categoryName.toLowerCase()}+in+Nuevo+Progreso+Tamaulipas+Mexico&z=16&output=embed`;

  if (withCoords.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setView('list')}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border',
            view === 'list'
              ? 'bg-brand-blue text-white border-brand-blue'
              : 'bg-white text-neutral-500 border-neutral-200 hover:border-brand-blue hover:text-brand-blue'
          )}
        >
          <List className="w-3.5 h-3.5" />
          List
        </button>
        <button
          onClick={() => setView('map')}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border',
            view === 'map'
              ? 'bg-brand-blue text-white border-brand-blue'
              : 'bg-white text-neutral-500 border-neutral-200 hover:border-brand-blue hover:text-brand-blue'
          )}
        >
          <Map className="w-3.5 h-3.5" />
          Map View
        </button>
        <span className="text-xs text-neutral-400 ml-2">
          {withCoords.length} locations mapped
        </span>
      </div>

      {/* Map (shown when toggled) */}
      {view === 'map' && (
        <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm mb-6">
          <div className="relative w-full h-[400px] sm:h-[500px]">
            <iframe
              title={`Map of ${categoryName} in Nuevo Progreso`}
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          {/* Provider list overlay at bottom */}
          <div className="bg-white p-4 border-t border-neutral-100">
            <p className="text-sm text-neutral-mid flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-blue" />
              <strong>{withCoords.length}</strong> {categoryName.toLowerCase()} locations in Nuevo Progreso, Tamaulipas
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
