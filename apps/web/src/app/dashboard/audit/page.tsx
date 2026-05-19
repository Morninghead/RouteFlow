'use client';

import { useState } from 'react';
import { Shield, User, Calendar, Filter } from 'lucide-react';
import { Select } from '@/components/ui/select';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
}

export default function AuditLogPage() {
  const [filter, setFilter] = useState('all');
  const [logs] = useState<AuditLog[]>([
    {
      id: '1',
      timestamp: '2024-01-15T14:30:00',
      user: 'admin@school.com',
      action: 'CREATE',
      resource: 'Vehicle',
      details: 'Created new vehicle: รถตู้ 2',
      ipAddress: '192.168.1.100',
    },
    {
      id: '2',
      timestamp: '2024-01-15T14:25:00',
      user: 'staff@school.com',
      action: 'UPDATE',
      resource: 'Passenger',
      details: 'Updated passenger: สมชาติ รักเรียน',
      ipAddress: '192.168.1.101',
    },
    {
      id: '3',
      timestamp: '2024-01-15T14:20:00',
      user: 'admin@school.com',
      action: 'DELETE',
      resource: 'Route',
      details: 'Deleted route: เส้นทางเก่า',
      ipAddress: '192.168.1.100',
    },
  ]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-600">Track all system activities and changes</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1"
          >
            <option value="all">All Actions</option>
            <option value="create">Create Only</option>
            <option value="update">Update Only</option>
            <option value="delete">Delete Only</option>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="divide-y">
          {logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="font-medium">{log.resource}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{log.details}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString('th-TH')}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 ml-8">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {log.user}
                </div>
                <div>IP: {log.ipAddress}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
