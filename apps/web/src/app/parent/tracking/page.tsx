'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, User, Camera, CheckCircle } from 'lucide-react';

interface Stop {
  id: string;
  passengerName: string;
  address: string;
  status: 'pending' | 'completed';
  eta?: string;
  photoUrl?: string;
  completedAt?: string;
}

export default function ParentTrackingPage() {
  const [currentStop, setCurrentStop] = useState<Stop>({
    id: '1',
    passengerName: 'สมชาติ รักเรียน',
    address: '123 ถ.สุขุมวิท',
    status: 'pending',
    eta: '5 minutes',
  });

  const [busLocation, setBusLocation] = useState({
    lat: 13.7563,
    lng: 100.5018,
  });

  const [tripStatus, setTripStatus] = useState<'not_started' | 'in_progress' | 'completed'>('in_progress');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4">
        <h1 className="text-xl font-bold">Track Your Child</h1>
        <p className="text-sm opacity-90">Morning Trip - Route 1</p>
      </div>

      {/* Map Placeholder */}
      <div className="bg-gray-200 h-64 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600">Live Map</p>
          <p className="text-sm text-gray-500">Google Maps Integration Required</p>
        </div>
      </div>

      {/* Status Card */}
      <div className="p-4">
        {tripStatus === 'in_progress' && currentStop.status === 'pending' && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{currentStop.passengerName}</h2>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <MapPin className="w-4 h-4" />
                  {currentStop.address}
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="font-medium text-amber-900">Bus Approaching</div>
                  <div className="text-sm text-amber-700">ETA: {currentStop.eta}</div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>The bus is on its way to pick up your child. Please ensure they are ready at the pickup point.</p>
            </div>
          </div>
        )}

        {tripStatus === 'in_progress' && currentStop.status === 'completed' && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{currentStop.passengerName}</h2>
                <div className="text-sm text-gray-600 mt-1">
                  Picked up at {currentStop.completedAt}
                </div>
              </div>
            </div>

            {currentStop.photoUrl && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Photo Proof</span>
                </div>
                <img
                  src={currentStop.photoUrl}
                  alt="Pickup proof"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm text-green-800">
                ✓ Your child has been safely picked up and is on the way to school.
              </div>
            </div>
          </div>
        )}

        {tripStatus === 'completed' && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 mx-auto mb-3 text-green-500" />
              <h2 className="text-xl font-bold mb-2">Trip Completed</h2>
              <p className="text-gray-600">
                Your child has arrived safely at school.
              </p>
            </div>
          </div>
        )}

        {/* Trip Details */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-semibold mb-3">Trip Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Route</span>
              <span className="font-medium">Morning Route 1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vehicle</span>
              <span className="font-medium">รถตู้ 1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Driver</span>
              <span className="font-medium">สมชาย ขับดี</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Started</span>
              <span className="font-medium">6:30 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
