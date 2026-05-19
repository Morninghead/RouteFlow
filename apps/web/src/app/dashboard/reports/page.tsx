'use client';

import { useState } from 'react';
import { Download, FileText, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState('last_7_days');

  const handleExportCSV = () => {
    // Mock CSV export
    const csvContent = 'Date,Passenger,Status,Time\n2024-01-15,สมชาติ รักเรียน,Completed,6:45 AM\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_${dateRange}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and export system reports</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Generate Report</h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full"
            >
              <option value="attendance">Attendance Report</option>
              <option value="trips">Trip History</option>
              <option value="vehicles">Vehicle Usage</option>
              <option value="drivers">Driver Performance</option>
              <option value="routes">Route Efficiency</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full"
            >
              <option value="today">Today</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="custom">Custom Range</option>
            </Select>
          </div>
        </div>

        <Button onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">Total Trips</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">1,234</div>
          <div className="text-sm text-gray-600 mt-1">This month</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold">Attendance Rate</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">98.5%</div>
          <div className="text-sm text-green-600 mt-1">+2.3% from last month</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold">Avg. Delay</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">3.2 min</div>
          <div className="text-sm text-gray-600 mt-1">Per trip</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Reports</h2>
        <div className="space-y-3">
          {[
            { name: 'Attendance Report - January 2024', date: '2024-01-15', size: '245 KB' },
            { name: 'Trip History - Last 30 Days', date: '2024-01-10', size: '512 KB' },
            { name: 'Vehicle Usage - December 2023', date: '2024-01-01', size: '189 KB' },
          ].map((report, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium text-sm">{report.name}</div>
                  <div className="text-xs text-gray-500">
                    Generated on {new Date(report.date).toLocaleDateString()} • {report.size}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
