'use client';

import { useState } from 'react';
import { Calendar, MapPin, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface Trip {
  id: string;
  routeName: string;
  vehicleName: string;
  driverName: string;
  scheduledStart: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export default function TripsPage() {
  const [trips] = useState<Trip[]>([
    { 
      id: '1', 
      routeName: 'เส้นทางเช้า - รถตู้ 1',
      vehicleName: 'รถตู้ 1',
      driverName: 'สมชาย ขับดี',
      scheduledStart: '2024-01-15T06:30:00',
      actualStart: '2024-01-15T06:32:00',
      actualEnd: '2024-01-15T07:15:00',
      status: 'completed'
    },
    { 
      id: '2', 
      routeName: 'เส้นทางเย็น - รถตู้ 1',
      vehicleName: 'รถตู้ 1',
      driverName: 'สมชาย ขับดี',
      scheduledStart: '2024-01-15T15:00:00',
      status: 'scheduled'
    },
  ]);

  const getStatusBadge = (status: string) => {
    const badges = {
      scheduled: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels = {
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('th-TH', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
          <p className="text-gray-600">View and monitor trip history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Filter by Date
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Scheduled Start</TableHead>
              <TableHead>Actual Start</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {trip.routeName}
                  </div>
                </TableCell>
                <TableCell>{trip.vehicleName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {trip.driverName}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {formatDateTime(trip.scheduledStart)}
                  </div>
                </TableCell>
                <TableCell>
                  {trip.actualStart ? formatDateTime(trip.actualStart) : '-'}
                </TableCell>
                <TableCell>{getStatusBadge(trip.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-600 mb-1">Total Trips Today</div>
          <div className="text-2xl font-bold text-gray-900">12</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-600">8</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-600 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">2</div>
        </div>
      </div>
    </div>
  );
}
