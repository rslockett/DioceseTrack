import React from 'react';
import { MapPin } from 'lucide-react';

interface MapLinkProps {
  address: string;
}

export function MapLink({ address }: MapLinkProps) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  
  return (
    <a
      href={googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center text-blue-600 hover:text-blue-800"
    >
      <MapPin className="h-4 w-4 mr-1" />
      <span className="text-sm">Map</span>
    </a>
  );
} 