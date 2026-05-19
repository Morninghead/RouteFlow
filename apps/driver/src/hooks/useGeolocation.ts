import { useState, useEffect, useCallback, useRef } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';

export function useGeolocation(trackingEnabled: boolean = false) {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef<string | null>(null);

  const getCurrentPosition = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
      setPosition(pos);
      setLoading(false);
      return pos;
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!trackingEnabled) {
      // FIX: Clear watch when disabled
      if (watchIdRef.current) {
        Geolocation.clearWatch({ id: watchIdRef.current });
        watchIdRef.current = null;
      }
      return;
    }

    const startTracking = async () => {
      try {
        const id = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
          (pos, err) => {
            if (err) {
              setError(err.message);
            } else if (pos) {
              setPosition(pos);
              setError(null);
            }
          }
        );
        // FIX: Store in ref (synchronous, no race condition)
        watchIdRef.current = id;
      } catch (err: any) {
        setError(err.message || 'Failed to start tracking');
      }
    };

    startTracking();

    return () => {
      // FIX: Always clear using ref (handles async race condition)
      if (watchIdRef.current) {
        Geolocation.clearWatch({ id: watchIdRef.current });
        watchIdRef.current = null;
      }
    };
  }, [trackingEnabled]);

  return { position, error, loading, getCurrentPosition };
}
