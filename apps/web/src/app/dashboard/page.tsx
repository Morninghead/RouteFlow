import { Bus, Users, MapPin, Bell } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bus className="w-8 h-8 text-amber-500" />
              <h1 className="text-xl font-bold">School Bus Router</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Admin Dashboard</span>
              <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Welcome back! Here's an overview of your school transportation system.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Bus className="w-6 h-6" />}
            title="Active Vehicles"
            value="12"
            color="amber"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Total Passengers"
            value="245"
            color="blue"
          />
          <StatCard
            icon={<MapPin className="w-6 h-6" />}
            title="Active Routes"
            value="8"
            color="green"
          />
          <StatCard
            icon={<Bell className="w-6 h-6" />}
            title="Notifications Today"
            value="34"
            color="purple"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <QuickAction title="Add New Vehicle" href="/dashboard/vehicles/new" />
              <QuickAction title="Create Route" href="/dashboard/routes/new" />
              <QuickAction title="Add Passenger" href="/dashboard/passengers/new" />
              <QuickAction title="Schedule Trip" href="/dashboard/trips/new" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <ActivityItem
                title="Trip completed"
                description="Bus 1 - Morning Route"
                time="10 minutes ago"
              />
              <ActivityItem
                title="New passenger added"
                description="สมชาติ รักเรียน (ป.3)"
                time="1 hour ago"
              />
              <ActivityItem
                title="Route updated"
                description="Afternoon Route - Van 2"
                time="2 hours ago"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string; color: string }) {
  const colorClasses = {
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  }[color];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses} mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}

function QuickAction({ title, href }: { title: string; href: string }) {
  return (
    <a
      href={href}
      className="block px-4 py-3 rounded-lg hover:bg-gray-50 transition border border-gray-200"
    >
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </a>
  );
}

function ActivityItem({ title, description, time }: { title: string; description: string; time: string }) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b last:border-0">
      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}
