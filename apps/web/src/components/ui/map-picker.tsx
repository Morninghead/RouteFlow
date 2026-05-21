'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number, address: string) => void;
  height?: string;
  /** ISO 3166-1 alpha-2 country code to restrict search (e.g. 'th'). Omit for global. */
  countryCode?: string;
  /** Default map center when no lat/lng provided. Defaults to world center. */
  defaultLat?: number;
  defaultLng?: number;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
}

declare global {
  interface Window {
    google: typeof google;
    initMapPicker?: () => void;
  }
}

export function MapPicker({
  lat, lng, onChange, height = '300px',
  countryCode,
  defaultLat = 20, defaultLng = 0,
  searchPlaceholder = 'Search address...',
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const searchInputId = useRef(`map-search-${Math.random().toString(36).slice(2)}`);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const hasInitialPin = lat !== undefined && lng !== undefined;
  const center = { lat: lat ?? defaultLat, lng: lng ?? defaultLng };

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Google Maps API key not configured');
      return;
    }

    if (window.google?.maps) {
      setLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script';
    if (document.getElementById(scriptId)) {
      const check = setInterval(() => {
        if (window.google?.maps) {
          setLoaded(true);
          clearInterval(check);
        }
      }, 100);
      return () => clearInterval(check);
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => setError('Failed to load Google Maps');
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: hasInitialPin ? 14 : 2,
      mapTypeControl: false,
      streetViewControl: false,
    });
    mapInstanceRef.current = map;

    const marker = new window.google.maps.Marker({
      position: hasInitialPin ? center : undefined,
      map: hasInitialPin ? map : undefined,
      draggable: true,
    });
    markerRef.current = marker;

    const geocoder = new window.google.maps.Geocoder();

    const handlePosition = (position: google.maps.LatLng) => {
      const lat = position.lat();
      const lng = position.lng();
      geocoder.geocode({ location: position }, (results, status) => {
        const address = status === 'OK' && results?.[0]
          ? results[0].formatted_address
          : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        onChange(lat, lng, address);
      });
    };

    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      if (pos) handlePosition(pos);
    });

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        marker.setMap(map);
        marker.setPosition(e.latLng);
        handlePosition(e.latLng);
      }
    });

    // Setup Places Autocomplete search box
    const input = document.getElementById(searchInputId.current) as HTMLInputElement;
    if (input) {
      const opts: any = {};
      if (countryCode) opts.componentRestrictions = { country: countryCode };
      const autocomplete = new window.google.maps.places.Autocomplete(input, opts);
      autocomplete.bindTo('bounds', map);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;
        map.setCenter(place.geometry.location);
        map.setZoom(16);
        marker.setPosition(place.geometry.location);
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onChange(lat, lng, place.formatted_address || '');
      });
    }
  }, [loaded]);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg text-sm text-gray-500" style={{ height }}>
        <MapPin className="mr-2 h-4 w-4" /> {error}
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg text-sm text-gray-500" style={{ height }}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500 mr-2" />
        กำลังโหลดแผนที่...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        id={searchInputId.current}
        type="text"
        placeholder={searchPlaceholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-lg border border-gray-200" />
      <p className="text-xs text-gray-500">คลิกบนแผนที่หรือลากหมุดเพื่อเลือกตำแหน่ง</p>
    </div>
  );
}
