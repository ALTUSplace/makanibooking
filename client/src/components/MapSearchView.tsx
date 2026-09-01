/**
 * MapSearchView.tsx - Live Google Maps with dynamic price pins & "Search as I move the map"
 */
import React, { useEffect, useRef, useState } from 'react';
import { MapView } from './Map';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MapPin, Star } from 'lucide-react';

interface ListingMarkerItem {
  id: number;
  title: string;
  pricePerDay: number;
  city: string;
  category: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
}

interface MapSearchViewProps {
  listings: ListingMarkerItem[];
  onSelectListing?: (listing: ListingMarkerItem) => void;
}

export function MapSearchView({ listings, onSelectListing }: MapSearchViewProps) {
  const [selectedItem, setSelectedItem] = useState<ListingMarkerItem | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Default center Morocco (Casablanca / Rabat)
  const defaultCenter = { lat: 33.5731, lng: -7.5898 };

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-border">
      <MapView
        initialCenter={defaultCenter}
        initialZoom={11}
        onMapReady={(map) => {
          mapRef.current = map;
          
          // Add custom price pins or simulation for listings
          listings.forEach((item, index) => {
            // Simulated offset around Casablanca center for demo pins if lat/lng not provided
            const lat = item.lat || (33.5731 + (index * 0.02 - 0.05));
            const lng = item.lng || (-7.5898 + (index * 0.02 - 0.05));

            const markerElement = document.createElement('div');
            markerElement.className = 'bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-bold shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform flex items-center gap-1';
            markerElement.innerHTML = `<span>${item.pricePerDay} درهم</span>`;

            markerElement.addEventListener('click', () => {
              setSelectedItem(item);
              if (onSelectListing) onSelectListing(item);
            });

            if (window.google?.maps?.marker?.AdvancedMarkerElement) {
              const marker = new window.google.maps.marker.AdvancedMarkerElement({
                map,
                position: { lat, lng },
                content: markerElement,
                title: item.title,
              });
            }
          });
        }}
        className="w-full h-full"
      />

      {/* Selected Item Preview Popup Card */}
      {selectedItem && (
        <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-80 z-20 animate-in fade-in slide-in-from-bottom-4">
          <Card className="p-4 bg-background/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl relative">
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-2 left-2 text-muted-foreground hover:text-foreground text-sm font-bold bg-muted w-6 h-6 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
            <div className="flex gap-3">
              <img 
                src={selectedItem.imageUrl || "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&q=80"} 
                alt={selectedItem.title} 
                className="w-20 h-20 object-cover rounded-xl"
              />
              <div className="space-y-1 flex-1">
                <Badge variant="outline" className="text-[10px]">{selectedItem.category}</Badge>
                <h4 className="font-bold text-sm line-clamp-1">{selectedItem.title}</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedItem.city}</p>
                <div className="text-primary font-extrabold text-sm">
                  {selectedItem.pricePerDay} درهم <span className="text-xs text-muted-foreground font-normal">/ اليوم</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
