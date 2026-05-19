'use client';

import { useState, useEffect } from 'react';
import { Bus } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, []);

  const handleLineLogin = () => {
    setLoading(true);
    setError('');

    fetch('/api/auth/line?action=url')
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError('Failed to initialize login. Please try again.');
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

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm">
              Sign in to manage your fleet and routes
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleLineLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#06C755] text-white py-3.5 rounded-lg font-semibold hover:bg-[#05a347] transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? (
              <span>Connecting...</span>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 0-.27.12-.27.27v5.46c0 .15.12.27.27.27h.8c.15 0 .27-.12.27-.27V9.07c0-.15-.12-.27-.27-.27h-.8zm-2.13 0c-.15 0-.27.12-.27.27v5.46c0 .15.12.27.27.27h.8c.15 0 .27-.12.27-.27V9.07c0-.15-.12-.27-.27-.27h-.8zm-2.14 0c-.15 0-.27.12-.27.27v5.46c0 .15.12.27.27.27h.8c.15 0 .27-.12.27-.27V9.07c0-.15-.12-.27-.27-.27h-.8zm-2.13 0c-.15 0-.27.12-.27.27v5.46c0 .15.12.27.27.27h.8c.15 0 .27-.12.27-.27V9.07c0-.15-.12-.27-.27-.27h-.8z"/>
                </svg>
                <span>Log in with LINE</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            Secure login powered by LINE. No password needed.
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
