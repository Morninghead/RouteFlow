'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number, address: string) => void;
  height?: string;
}

declare global {
  interface Window {
    google: typeof google;
    initMapPicker?: () => void;
  }
}

export function MapPicker({ lat, lng, onChange, height = '300px' }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const defaultCenter = { lat: lat || 13.7563, lng: lng || 100.5018 };

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
      center: defaultCenter,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
    });
    mapInstanceRef.current = map;

    const marker = new window.google.maps.Marker({
      position: defaultCenter,
      map,
      draggable: true,
      title: 'ลากเพื่อเลือกตำแหน่ง',
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
        marker.setPosition(e.latLng);
        handlePosition(e.latLng);
      }
    });

    // Setup Places Autocomplete search box
    const input = document.getElementById('map-search-input') as HTMLInputElement;
    if (input) {
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: 'th' },
      });
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
        id="map-search-input"
        type="text"
        placeholder="ค้นหาที่อยู่..."
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-lg border border-gray-200" />
      <p className="text-xs text-gray-500">คลิกบนแผนที่หรือลากหมุดเพื่อเลือกตำแหน่ง</p>
    </div>
  );
}
