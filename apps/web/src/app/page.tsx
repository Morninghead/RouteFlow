import Link from 'next/link';
import { Bus, MapPin, Bell, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Bus className="w-20 h-20 text-amber-500" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            School Bus Router
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Multi-tenant route planning, live tracking, and parent notifications for school transportation
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <FeatureCard
            icon={<MapPin className="w-8 h-8" />}
            title="Smart Routing"
            description="Optimized pickup/drop-off routes with Google Maps"
          />
          <FeatureCard
            icon={<Bell className="w-8 h-8" />}
            title="Multi-Channel Alerts"
            description="Telegram, LINE OA, and web push notifications"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Photo Proofs"
            description="Driver captures timestamped, geotagged pickup photos"
          />
          <FeatureCard
            icon={<Bus className="w-8 h-8" />}
            title="Live Tracking"
            description="Parents see real-time bus location on map"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-8 py-4 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition text-center"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-4 bg-white text-amber-500 border-2 border-amber-500 rounded-lg font-semibold hover:bg-amber-50 transition text-center"
          >
            Register
          </Link>
        </div>

        <div className="mt-16 text-center text-sm text-gray-500">
          <p>Roles: SuperAdmin • Admin • Staff • Driver • Parent</p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="text-amber-500 mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
