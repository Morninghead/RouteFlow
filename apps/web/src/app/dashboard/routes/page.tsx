'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Route, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface RouteData {
  id: string;
  name: string;
  vehicleId: string;
  vehicleName: string;
  direction: 'pickup' | 'dropoff';
  stopCount: number;
  estimatedDuration: number;
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteData[]>([
    { 
      id: '1', 
      name: 'เส้นทางเช้า - รถตู้ 1', 
      vehicleId: '1',
      vehicleName: 'รถตู้ 1',
      direction: 'pickup',
      stopCount: 8,
      estimatedDuration: 45
    },
    { 
      id: '2', 
      name: 'เส้นทางเย็น - รถตู้ 1', 
      vehicleId: '1',
      vehicleName: 'รถตู้ 1',
      direction: 'dropoff',
      stopCount: 8,
      estimatedDuration: 50
    },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    vehicleId: '',
    direction: 'pickup' as 'pickup' | 'dropoff',
    stopCount: 0,
    estimatedDuration: 0,
  });

  const vehicles = [
    { id: '1', name: 'รถตู้ 1' },
    { id: '2', name: 'รถบัส 1' },
  ];

  const handleAdd = () => {
    setEditingRoute(null);
    setFormData({ name: '', vehicleId: '', direction: 'pickup', stopCount: 0, estimatedDuration: 0 });
    setDialogOpen(true);
  };

  const handleEdit = (route: RouteData) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      vehicleId: route.vehicleId,
      direction: route.direction,
      stopCount: route.stopCount,
      estimatedDuration: route.estimatedDuration,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this route?')) {
      setRoutes(routes.filter(r => r.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = vehicles.find(v => v.id === formData.vehicleId);
    if (editingRoute) {
      setRoutes(routes.map(r => 
        r.id === editingRoute.id 
          ? { ...r, ...formData, vehicleName: vehicle?.name || '' }
          : r
      ));
    } else {
      setRoutes([...routes, { 
        id: Date.now().toString(), 
        ...formData,
        vehicleName: vehicle?.name || ''
      }]);
    }
    setDialogOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Routes</h1>
          <p className="text-gray-600">Manage bus routes and schedules</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Route
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route Name</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Stops</TableHead>
              <TableHead>Est. Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map((route) => (
              <TableRow key={route.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-gray-400" />
                    {route.name}
                  </div>
                </TableCell>
                <TableCell>{route.vehicleName}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    route.direction === 'pickup' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {route.direction === 'pickup' ? 'Pick-up' : 'Drop-off'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {route.stopCount} stops
                  </div>
                </TableCell>
                <TableCell>{route.estimatedDuration} min</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(route)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(route.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editingRoute ? 'Edit Route' : 'Add New Route'}
            </DialogTitle>
            <DialogDescription>
              {editingRoute ? 'Update route information' : 'Create a new bus route'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 p-6">
              <div>
                <Label htmlFor="name">Route Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., เส้นทางเช้า - รถตู้ 1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="vehicleId">Vehicle</Label>
                <Select
                  id="vehicleId"
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  required
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="direction">Direction</Label>
                <Select
                  id="direction"
                  value={formData.direction}
                  onChange={(e) => setFormData({ ...formData, direction: e.target.value as any })}
                  required
                >
                  <option value="pickup">Pick-up (Morning)</option>
                  <option value="dropoff">Drop-off (Afternoon)</option>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stopCount">Number of Stops</Label>
                  <Input
                    id="stopCount"
                    type="number"
                    min="1"
                    value={formData.stopCount}
                    onChange={(e) => setFormData({ ...formData, stopCount: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedDuration">Est. Duration (min)</Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    min="1"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingRoute ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
