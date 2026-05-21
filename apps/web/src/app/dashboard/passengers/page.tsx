'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { MapPicker } from '@/components/ui/map-picker';
import { TableSkeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Passenger {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  grade?: string;
  address: string;
  home_lat?: number;
  home_lng?: number;
}

const EMPTY_FORM = {
  first_name: '', last_name: '', phone_number: '',
  grade: '', address: '', home_lat: 0, home_lng: 0,
};

export default function PassengersPage() {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const { user, loading: authLoading } = useAuth();
  const schoolId = user?.schoolId ?? null;

  // Wait for auth to settle before fetching — prevents race condition
  useEffect(() => {
    if (authLoading) return;
    fetchPassengers();
  }, [authLoading, schoolId]);

  async function fetchPassengers() {
    setLoading(true);
    const query = supabase.from('passengers').select('id,first_name,last_name,phone_number,grade,address,home_lat,home_lng').order('first_name');
    if (schoolId) query.eq('school_id', schoolId);
    const { data, error } = await query;
    if (!error && data) setPassengers(data);
    setLoading(false);
  }

  function handleAdd() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setError('');
    setDialogOpen(true);
  }

  function handleEdit(p: Passenger) {
    setEditingId(p.id);
    setFormData({ first_name: p.first_name, last_name: p.last_name, phone_number: p.phone_number, grade: p.grade || '', address: p.address, home_lat: p.home_lat || 0, home_lng: p.home_lng || 0 });
    setError('');
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('ลบผู้โดยสารนี้?')) return;
    await supabase.from('passengers').delete().eq('id', id);
    setPassengers(prev => prev.filter(p => p.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.home_lat || !formData.home_lng) { setError('กรุณาเลือกที่อยู่บนแผนที่'); return; }
    setSaving(true);
    const payload: any = { ...formData, school_id: schoolId };
    let err;
    if (editingId) {
      ({ error: err } = await supabase.from('passengers').update(payload).eq('id', editingId));
    } else {
      ({ error: err } = await supabase.from('passengers').insert(payload));
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    setDialogOpen(false);
    fetchPassengers();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ผู้โดยสาร (นักเรียน)</h1>
          <p className="text-gray-500 text-sm">จัดการข้อมูลนักเรียนและที่อยู่บ้าน</p>
        </div>
        <Button onClick={handleAdd} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> เพิ่มผู้โดยสาร
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <table className="w-full"><tbody><TableSkeleton rows={5} cols={6} /></tbody></table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead>ระดับชั้น</TableHead>
                <TableHead>เบอร์โทร</TableHead>
                <TableHead>ที่อยู่</TableHead>
                <TableHead>พิกัด</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passengers.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">ยังไม่มีข้อมูลผู้โดยสาร</TableCell></TableRow>
              )}
              {passengers.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" />{p.first_name} {p.last_name}</div>
                  </TableCell>
                  <TableCell>{p.grade || '-'}</TableCell>
                  <TableCell>{p.phone_number}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-gray-600">{p.address}</TableCell>
                  <TableCell>
                    {p.home_lat ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <MapPin className="w-3 h-3" /> มีพิกัด
                      </span>
                    ) : (
                      <span className="text-xs text-red-400">ไม่มีพิกัด</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editingId ? 'แก้ไขผู้โดยสาร' : 'เพิ่มผู้โดยสารใหม่'}</DialogTitle>
            <DialogDescription>กรอกข้อมูลและเลือกที่อยู่บนแผนที่</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 px-6 py-4 max-h-[70vh] overflow-y-auto">
              {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div><Label>ชื่อ</Label><Input value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required /></div>
                <div><Label>นามสกุล</Label><Input value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>เบอร์โทร</Label><Input value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} placeholder="+66812345678" required /></div>
                <div><Label>ระดับชั้น</Label><Input value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} placeholder="ป.3" /></div>
              </div>
              <div>
                <Label>ที่อยู่ (กรอกอัตโนมัติจากแผนที่)</Label>
                <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="ที่อยู่บ้าน" required />
              </div>
              <div>
                <Label className="flex items-center gap-1 mb-2"><MapPin className="w-4 h-4 text-amber-500" /> เลือกตำแหน่งบนแผนที่ <span className="text-red-500">*</span></Label>
                <MapPicker
                  lat={formData.home_lat || undefined}
                  lng={formData.home_lng || undefined}
                  onChange={(lat, lng, address) => setFormData(f => ({ ...f, home_lat: lat, home_lng: lng, address: f.address || address }))}
                  height="250px"
                />
                {formData.home_lat ? (
                  <p className="text-xs text-green-600 mt-1">{formData.home_lat.toFixed(5)}, {formData.home_lng.toFixed(5)}</p>
                ) : null}
              </div>
            </div>
            <DialogFooter className="px-6 pb-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
              <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                {editingId ? 'บันทึก' : 'เพิ่ม'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
