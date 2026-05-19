'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Link as LinkIcon, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { parseGoogleMapsUrl } from '@repo/shared';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  initialLocation?: { lat: number; lng: number; address?: string };
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [method, setMethod] = useState<'url' | 'gps' | 'map'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUrlParse = () => {
    setError('');
    try {
      const parsed = parseGoogleMapsUrl(urlInput);
      if (parsed) {
        setCurrentLocation(parsed);
        onLocationSelect(parsed);
      } else {
        setError('Invalid Google Maps URL. Please paste a valid URL.');
      }
    } catch (err) {
      setError('Failed to parse URL. Please check the format.');
    }
  };

  const handleGpsCapture = () => {
    setError('');
    setLoading(true);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(location);
        onLocationSelect(location);
        setLoading(false);
      },
      (err) => {
        setError(`GPS Error: ${err.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleMapSearch = async () => {
    setError('');
    setLoading(true);

    try {
      // In production, use Google Geocoding API
      // For now, simulate search
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock result - in production, call Google Geocoding API
      const mockLocation = {
        lat: 13.7563,
        lng: 100.5018,
        address: searchInput,
      };
      
      setCurrentLocation(mockLocation);
      onLocationSelect(mockLocation);
      setLoading(false);
    } catch (err) {
      setError('Search failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b pb-4">
        <Button
          type="button"
          variant={method === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMethod('url')}
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          Paste URL
        </Button>
        <Button
          type="button"
          variant={method === 'gps' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMethod('gps')}
        >
          <Navigation className="w-4 h-4 mr-2" />
          Use GPS
        </Button>
        <Button
          type="button"
          variant={method === 'map' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMethod('map')}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Search Map
        </Button>
      </div>

      {method === 'url' && (
        <div className="space-y-3">
          <Label htmlFor="urlInput">Google Maps URL</Label>
          <div className="flex gap-2">
            <Input
              id="urlInput"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="flex-1"
            />
            <Button type="button" onClick={handleUrlParse}>
              Parse
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Paste a Google Maps URL or share link to extract coordinates
          </p>
        </div>
      )}

      {method === 'gps' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Click the button below to capture your current GPS location
          </p>
          <Button
            type="button"
            onClick={handleGpsCapture}
            disabled={loading}
            className="w-full"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {loading ? 'Getting Location...' : 'Capture GPS Location'}
          </Button>
          <p className="text-xs text-gray-500">
            Make sure location permissions are enabled in your browser
          </p>
        </div>
      )}

      {method === 'map' && (
        <div className="space-y-3">
          <Label htmlFor="searchInput">Search Address</Label>
          <div className="flex gap-2">
            <Input
              id="searchInput"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter address or place name"
              className="flex-1"
            />
            <Button type="button" onClick={handleMapSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center text-sm text-gray-600">
            Map preview will appear here
            <br />
            <span className="text-xs">(Google Maps integration required)</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {currentLocation && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-green-900">Location Selected</div>
              <div className="text-sm text-green-700 mt-1">
                Latitude: {currentLocation.lat.toFixed(6)}
                <br />
                Longitude: {currentLocation.lng.toFixed(6)}
              </div>
              <a
                href={`https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:underline mt-2 inline-block"
              >
                View on Google Maps →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
