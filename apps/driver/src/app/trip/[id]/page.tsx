'use client';

import { useState, useEffect } from 'react';
import { Camera, MapPin, CheckCircle, Clock, Navigation } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

interface Stop {
  id: string;
  passengerName: string;
  address: string;
  location: { lat: number; lng: number };
  status: 'pending' | 'completed' | 'skipped';
  photoUrl?: string;
  completedAt?: string;
}

export default function TripPage({ params }: { params: { id: string } }) {
  const [stops, setStops] = useState<Stop[]>([
    {
      id: '1',
      passengerName: 'สมชาติ รักเรียน',
      address: '123 ถ.สุขุมวิท',
      location: { lat: 13.7563, lng: 100.5018 },
      status: 'pending',
    },
    {
      id: '2',
      passengerName: 'สมหญิง ใจดี',
      address: '456 ถ.พญาไท',
      location: { lat: 13.7563, lng: 100.5318 },
      status: 'pending',
    },
  ]);

  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [tripStarted, setTripStarted] = useState(false);

  const { takePhoto, loading: cameraLoading } = useCamera();
  const { position, getCurrentPosition } = useGeolocation(tripStarted);
  const { addToQueue, isOnline, queue } = useOfflineQueue();

  const currentStop = stops[currentStopIndex];

  const handleStartTrip = async () => {
    await getCurrentPosition();
    setTripStarted(true);
  };

  const handleTakePhoto = async () => {
    const photo = await takePhoto();
    if (photo && currentStop) {
      const updatedStops = [...stops];
      updatedStops[currentStopIndex] = {
        ...currentStop,
        photoUrl: photo.dataUrl,
      };
      setStops(updatedStops);

      // Add to offline queue
      await addToQueue('photo', {
        stopId: currentStop.id,
        photo: photo.dataUrl,
        timestamp: photo.timestamp,
      });
    }
  };

  const handleCompleteStop = async () => {
    if (!currentStop) return;

    const updatedStops = [...stops];
    updatedStops[currentStopIndex] = {
      ...currentStop,
      status: 'completed',
      completedAt: new Date().toISOString(),
    };
    setStops(updatedStops);

    // Add attendance to queue
    await addToQueue('attendance', {
      stopId: currentStop.id,
      location: position?.coords,
      timestamp: Date.now(),
    });

    // Move to next stop
    if (currentStopIndex < stops.length - 1) {
      setCurrentStopIndex(currentStopIndex + 1);
    }
  };

  const handleSkipStop = () => {
    if (!currentStop) return;

    const updatedStops = [...stops];
    updatedStops[currentStopIndex] = {
      ...currentStop,
      status: 'skipped',
    };
    setStops(updatedStops);

    if (currentStopIndex < stops.length - 1) {
      setCurrentStopIndex(currentStopIndex + 1);
    }
  };

  const completedCount = stops.filter((s) => s.status === 'completed').length;
  const progress = (completedCount / stops.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-amber-500 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">Trip #{params.id}</h1>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="w-2 h-2 bg-green-400 rounded-full" />
            ) : (
              <div className="w-2 h-2 bg-red-400 rounded-full" />
            )}
            <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            <span>{completedCount}/{stops.length} completed</span>
          </div>
          {queue.length > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{queue.length} pending sync</span>
            </div>
          )}
        </div>
        <div className="mt-2 bg-white/20 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {!tripStarted ? (
        <div className="p-6 text-center">
          <Navigation className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h2 className="text-xl font-bold mb-2">Ready to Start?</h2>
          <p className="text-gray-600 mb-6">
            Make sure you're at the starting location before beginning the trip.
          </p>
          <button
            onClick={handleStartTrip}
            className="bg-amber-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-amber-600"
          >
            Start Trip
          </button>
        </div>
      ) : currentStop ? (
        <div className="p-4">
          {/* Current Stop Card */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Stop {currentStopIndex + 1} of {stops.length}
                </div>
                <h2 className="text-lg font-bold">{currentStop.passengerName}</h2>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <MapPin className="w-4 h-4" />
                  {currentStop.address}
                </div>
              </div>
            </div>

            {/* Photo Section */}
            <div className="mb-4">
              {currentStop.photoUrl ? (
                <div className="relative">
                  <img
                    src={currentStop.photoUrl}
                    alt="Passenger"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={handleTakePhoto}
                    disabled={cameraLoading}
                    className="absolute bottom-2 right-2 bg-white text-gray-700 px-3 py-2 rounded-lg text-sm font-medium shadow-lg"
                  >
                    Retake Photo
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleTakePhoto}
                  disabled={cameraLoading}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-amber-500 hover:bg-amber-50 transition"
                >
                  <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <div className="font-medium text-gray-700">
                    {cameraLoading ? 'Opening camera...' : 'Take Photo'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Photo proof required
                  </div>
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSkipStop}
                className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50"
              >
                Skip Stop
              </button>
              <button
                onClick={handleCompleteStop}
                disabled={!currentStop.photoUrl}
                className="bg-green-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Stop
              </button>
            </div>
          </div>

          {/* Upcoming Stops */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold mb-3">Upcoming Stops</h3>
            <div className="space-y-2">
              {stops.slice(currentStopIndex + 1, currentStopIndex + 4).map((stop, idx) => (
                <div key={stop.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                    {currentStopIndex + idx + 2}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{stop.passengerName}</div>
                    <div className="text-xs text-gray-500">{stop.address}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-bold mb-2">Trip Completed!</h2>
          <p className="text-gray-600">
            All stops have been completed. Great job!
          </p>
        </div>
      )}
    </div>
  );
}
