'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  address: string;
}

export default function PassengersPage() {
  const [passengers, setPassengers] = useState<Passenger[]>([
    { 
      id: '1', 
      firstName: 'สมชาติ', 
      lastName: 'รักเรียน', 
      nickname: 'ชาติ',
      grade: 'ป.3',
      parentName: 'นางสาวสมหญิง รักเรียน',
      parentPhone: '+66812345682',
      address: '123 ถ.สุขุมวิท กรุงเทพฯ'
    },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    grade: '',
    parentName: '',
    parentPhone: '',
    address: '',
  });

  const handleAdd = () => {
    setEditingPassenger(null);
    setFormData({ firstName: '', lastName: '', nickname: '', grade: '', parentName: '', parentPhone: '', address: '' });
    setDialogOpen(true);
  };

  const handleEdit = (passenger: Passenger) => {
    setEditingPassenger(passenger);
    setFormData({
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      nickname: passenger.nickname || '',
      grade: passenger.grade,
      parentName: passenger.parentName,
      parentPhone: passenger.parentPhone,
      address: passenger.address,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this passenger?')) {
      setPassengers(passengers.filter(p => p.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPassenger) {
      setPassengers(passengers.map(p => 
        p.id === editingPassenger.id 
          ? { ...p, ...formData, nickname: formData.nickname || undefined }
          : p
      ));
    } else {
      setPassengers([...passengers, { 
        id: Date.now().toString(), 
        ...formData,
        nickname: formData.nickname || undefined
      }]);
    }
    setDialogOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Passengers</h1>
          <p className="text-gray-600">Manage student passengers</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Passenger
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passengers.map((passenger) => (
              <TableRow key={passenger.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <div>{passenger.firstName} {passenger.lastName}</div>
                      {passenger.nickname && (
                        <div className="text-xs text-gray-500">({passenger.nickname})</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{passenger.grade}</TableCell>
                <TableCell>{passenger.parentName}</TableCell>
                <TableCell>{passenger.parentPhone}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(passenger)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(passenger.id)}
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
              {editingPassenger ? 'Edit Passenger' : 'Add New Passenger'}
            </DialogTitle>
            <DialogDescription>
              {editingPassenger ? 'Update passenger information' : 'Add a new student passenger'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nickname">Nickname (Optional)</Label>
                  <Input
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="e.g., ป.3"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="parentName">Parent/Guardian Name</Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="parentPhone">Parent Phone</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="+66812345678"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Home address"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPassenger ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
