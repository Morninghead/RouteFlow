'use client';

import { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Camera } from 'lucide-react';

interface TripHistory {
  id: string;
  date: string;
  type: 'pickup' | 'dropoff';
  status: 'completed' | 'missed' | 'late';
  time: string;
  photoUrl?: string;
}

export default function ParentHistoryPage() {
  const [history] = useState<TripHistory[]>([
    {
      id: '1',
      date: '2024-01-15',
      type: 'pickup',
      status: 'completed',
      time: '6:45 AM',
      photoUrl: '/placeholder-photo.jpg',
    },
    {
      id: '2',
      date: '2024-01-15',
      type: 'dropoff',
      status: 'completed',
      time: '3:30 PM',
      photoUrl: '/placeholder-photo.jpg',
    },
    {
      id: '3',
      date: '2024-01-14',
      type: 'pickup',
      status: 'completed',
      time: '6:42 AM',
    },
    {
      id: '4',
      date: '2024-01-14',
      type: 'dropoff',
      status: 'late',
      time: '3:45 PM',
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'missed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late':
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'missed':
        return 'Missed';
      case 'late':
        return 'Late';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4">
        <h1 className="text-xl font-bold">Trip History</h1>
        <p className="text-sm opacity-90">View past trips and attendance</p>
      </div>

      <div className="p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow-sm border p-3 text-center">
            <div className="text-2xl font-bold text-green-600">28</div>
            <div className="text-xs text-gray-600 mt-1">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-3 text-center">
            <div className="text-2xl font-bold text-amber-600">2</div>
            <div className="text-xs text-gray-600 mt-1">Late</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-3 text-center">
            <div className="text-2xl font-bold text-red-600">0</div>
            <div className="text-xs text-gray-600 mt-1">Missed</div>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {history.map((trip) => (
            <div key={trip.id} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(trip.status)}
                  <div>
                    <div className="font-medium">
                      {trip.type === 'pickup' ? 'Morning Pickup' : 'Afternoon Dropoff'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(trip.date).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(trip.status)}`}>
                  {getStatusText(trip.status)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  {trip.time}
                </div>
                {trip.photoUrl && (
                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                    <Camera className="w-4 h-4" />
                    View Photo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
