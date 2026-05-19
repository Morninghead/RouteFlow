'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface Vehicle {
  id: string;
  name: string;
  type: 'van' | 'bus' | 'car';
  licensePlate: string;
  maxPassengers: number;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: '1', name: 'รถตู้ 1', type: 'van', licensePlate: 'กข-1234 กรุงเทพ', maxPassengers: 12 },
    { id: '2', name: 'รถบัส 1', type: 'bus', licensePlate: 'กข-5678 กรุงเทพ', maxPassengers: 45 },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'van' as 'van' | 'bus' | 'car',
    licensePlate: '',
    maxPassengers: 12,
  });

  const handleAdd = () => {
    setEditingVehicle(null);
    setFormData({ name: '', type: 'van', licensePlate: '', maxPassengers: 12 });
    setDialogOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      type: vehicle.type,
      licensePlate: vehicle.licensePlate,
      maxPassengers: vehicle.maxPassengers,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      setVehicles(vehicles.filter(v => v.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      setVehicles(vehicles.map(v => 
        v.id === editingVehicle.id 
          ? { ...v, ...formData }
          : v
      ));
    } else {
      setVehicles([...vehicles, { id: Date.now().toString(), ...formData }]);
    }
    setDialogOpen(false);
  };

  const getVehicleTypeLabel = (type: string) => {
    const labels = { van: 'รถตู้', bus: 'รถบัส', car: 'รถยนต์' };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-600">Manage your fleet of vehicles</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-400" />
                    {vehicle.name}
                  </div>
                </TableCell>
                <TableCell>{getVehicleTypeLabel(vehicle.type)}</TableCell>
                <TableCell>{vehicle.licensePlate}</TableCell>
                <TableCell>{vehicle.maxPassengers} seats</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(vehicle)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(vehicle.id)}
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
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </DialogTitle>
            <DialogDescription>
              {editingVehicle ? 'Update vehicle information' : 'Add a new vehicle to your fleet'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 p-6">
              <div>
                <Label htmlFor="name">Vehicle Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., รถตู้ 1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Vehicle Type</Label>
                <Select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  required
                >
                  <option value="van">รถตู้ (Van)</option>
                  <option value="bus">รถบัส (Bus)</option>
                  <option value="car">รถยนต์ (Car)</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  placeholder="e.g., กข-1234 กรุงเทพ"
                  required
                />
              </div>

              <div>
                <Label htmlFor="maxPassengers">Maximum Passengers</Label>
                <Input
                  id="maxPassengers"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxPassengers}
                  onChange={(e) => setFormData({ ...formData, maxPassengers: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingVehicle ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
