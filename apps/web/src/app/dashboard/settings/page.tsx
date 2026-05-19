'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    schoolName: 'โรงเรียนสาธิตมหาวิทยาลัย',
    otpInterval: '30',
    photoRequired: 'true',
    telegramBotToken: '',
    lineChannelAccessToken: '',
    lineChannelSecret: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure school and system settings</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">School Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Trip Settings</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="otpInterval">OTP Interval (seconds)</Label>
                <Input
                  id="otpInterval"
                  type="number"
                  min="10"
                  max="300"
                  value={formData.otpInterval}
                  onChange={(e) => setFormData({ ...formData, otpInterval: e.target.value })}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Time interval for generating new OTP codes for passenger verification
                </p>
              </div>

              <div>
                <Label htmlFor="photoRequired">Photo Requirement</Label>
                <Select
                  id="photoRequired"
                  value={formData.photoRequired}
                  onChange={(e) => setFormData({ ...formData, photoRequired: e.target.value })}
                  required
                >
                  <option value="true">Required</option>
                  <option value="false">Optional</option>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Require drivers to take photos during passenger pickup/dropoff
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="telegramBotToken">Telegram Bot Token</Label>
                <Input
                  id="telegramBotToken"
                  type="password"
                  value={formData.telegramBotToken}
                  onChange={(e) => setFormData({ ...formData, telegramBotToken: e.target.value })}
                  placeholder="Enter your Telegram bot token"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Get your bot token from @BotFather on Telegram
                </p>
              </div>

              <div>
                <Label htmlFor="lineChannelAccessToken">LINE Channel Access Token</Label>
                <Input
                  id="lineChannelAccessToken"
                  type="password"
                  value={formData.lineChannelAccessToken}
                  onChange={(e) => setFormData({ ...formData, lineChannelAccessToken: e.target.value })}
                  placeholder="Enter your LINE channel access token"
                />
              </div>

              <div>
                <Label htmlFor="lineChannelSecret">LINE Channel Secret</Label>
                <Input
                  id="lineChannelSecret"
                  type="password"
                  value={formData.lineChannelSecret}
                  onChange={(e) => setFormData({ ...formData, lineChannelSecret: e.target.value })}
                  placeholder="Enter your LINE channel secret"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Configure LINE Official Account for notifications
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
