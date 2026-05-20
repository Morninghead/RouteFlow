'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Bus, Mail, Lock, Eye, EyeOff } from 'lucide-react';

type Tab = 'staff' | 'line';

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('staff');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    if (errorParam) setError(decodeURIComponent(errorParam));
  }, []);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
      } else {
        window.location.href = data.redirect || '/dashboard';
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLineLogin = () => {
    setLoading(true);
    setError('');
    fetch('/api/auth/line?action=url')
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError('Failed to initialize LINE login. Please try again.');
          setLoading(false);
        }
      })
      .catch(() => {
        setError('Failed to connect to login service. Please try again.');
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Bus className="w-16 h-16 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RouteFlow</h1>
          <p className="text-gray-600">Fleet & Route Management Platform</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => { setTab('staff'); setError(''); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition ${
                tab === 'staff'
                  ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Staff / Admin
            </button>
            <button
              onClick={() => { setTab('line'); setError(''); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition ${
                tab === 'line'
                  ? 'text-[#06C755] border-b-2 border-[#06C755] bg-green-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Parents / Drivers
            </button>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {tab === 'staff' ? (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@school.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-6">
                  Parents and drivers sign in with LINE — no password needed.
                </p>
                <button
                  onClick={handleLineLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-[#06C755] text-white py-3.5 rounded-lg font-semibold hover:bg-[#05a347] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span>Connecting...</span>
                  ) : (
                    <>
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                      </svg>
                      <span>Log in with LINE</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
