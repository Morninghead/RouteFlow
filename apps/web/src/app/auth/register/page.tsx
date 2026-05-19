'use client';

import Link from 'next/link';
import { Bus } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Bus className="w-16 h-16 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register</h1>
          <p className="text-gray-600">Contact your school administrator to create an account</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <p className="text-gray-700 mb-6">
              User accounts are created by school administrators. Please contact your school to get access.
            </p>
            
            <Link
              href="/auth/login"
              className="inline-block bg-amber-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-600 transition"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
