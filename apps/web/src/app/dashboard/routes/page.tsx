'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Route, MapPin, Loader2, Wand2, ChevronDown, ChevronUp, Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';

interface RouteData {
  id: string;
  name: string;
  vehicle_id: string;
  type: string;
  stops: any[];
  total_distance: number;
  estimated_duration: number;
  is_active: boolean;
}

interface OptimizeResult {
  summary: { totalPassengers: number; totalVehicles: number; unassignedPassengers: number };
  routes: any[];
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [error, setError] = useState('');

  const schoolId = process.env.NEXT_PUBLIC_SCHOOL_ID;

  useEffect(() => { fetchRoutes(); }, []);

  async function fetchRoutes() {
    setLoading(true);
    const query = supabase.from('routes').select('*').order('name');
    if (schoolId) query.eq('school_id', schoolId);
    const { data } = await query;
    if (data) setRoutes(data);
    setLoading(false);
  }

  async function handleAutoGenerate() {
    if (!schoolId) { setError('กรุณาตั้งค่า NEXT_PUBLIC_SCHOOL_ID'); return; }
    if (!confirm('ระบบจะสร้าง Route ใหม่โดยอัตโนมัติ และลบ Route เก่าที่สร้างโดยระบบ ดำเนินการต่อ?')) return;
    setOptimizing(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/routes/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ school_id: schoolId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'เกิดข้อผิดพลาด'); }
      else { setResult(data); fetchRoutes(); }
    } catch (e) {
      setError('ไม่สามารถเชื่อมต่อได้');
    }
    setOptimizing(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('ลบเส้นทางนี้?')) return;
    await supabase.from('routes').delete().eq('id', id);
    setRoutes(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">เส้นทางรถ</h1>
          <p className="text-gray-500 text-sm">จัดการเส้นทางและตารางเดินรถ</p>
        </div>
        <Button
          onClick={handleAutoGenerate}
          disabled={optimizing}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          {optimizing
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />กำลังคำนวณ...</>
            : <><Wand2 className="w-4 h-4 mr-2" />สร้าง Route อัตโนมัติ</>
          }
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">✓ สร้าง Route สำเร็จ</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center"><div className="text-2xl font-bold text-green-700">{result.summary.totalPassengers}</div><div className="text-green-600">ผู้โดยสารทั้งหมด</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-green-700">{result.summary.totalVehicles}</div><div className="text-green-600">รถที่ใช้</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-orange-600">{result.summary.unassignedPassengers}</div><div className="text-orange-500">ยังไม่มีรถ</div></div>
          </div>
          <div className="mt-3 space-y-2">
            {result.routes.map((r: any, i: number) => (
              <div key={i} className="bg-white rounded border border-green-100 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-sm">{r.vehicleName}</span>
                    <span className="text-xs text-gray-500">• {r.stopCount} จุด • {r.totalDistanceKm} กม. • {r.estimatedDurationMin} นาที</span>
                  </div>
                  <button onClick={() => setExpandedRoute(expandedRoute === r.id ? null : r.id)} className="text-xs text-amber-600">
                    {expandedRoute === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                {expandedRoute === r.id && (
                  <ol className="mt-2 space-y-1 pl-4">
                    {r.stops?.map((s: any, j: number) => (
                      <li key={j} className="text-xs text-gray-600 flex items-center gap-1">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-medium text-[10px]">{j+1}</span>
                        {s.passenger_name}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin w-6 h-6 text-amber-500" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อเส้นทาง</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>จุดจอด</TableHead>
                <TableHead>ระยะทาง</TableHead>
                <TableHead>เวลาโดยประมาณ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">ยังไม่มีเส้นทาง — กดปุ่ม "สร้าง Route อัตโนมัติ" เพื่อเริ่มต้น</TableCell></TableRow>
              )}
              {routes.map(route => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2"><Route className="w-4 h-4 text-gray-400" />{route.name}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${route.type === 'pickup' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {route.type === 'pickup' ? 'รับ' : 'ส่ง'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" />{route.stops?.length || 0} จุด</div>
                  </TableCell>
                  <TableCell>{route.total_distance > 0 ? `${(route.total_distance / 1000).toFixed(1)} กม.` : '-'}</TableCell>
                  <TableCell>{route.estimated_duration > 0 ? `${route.estimated_duration} นาที` : '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(route.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
