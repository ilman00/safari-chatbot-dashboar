import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Stats {
  bookingsToday: number;
  bookingsThisWeek: number;
  bookingsThisMonth: number;
  totalCustomers: number;
  activeConversations: number;
  topPackage: string;
  chartData: { date: string; bookings: number }[];
}

// ── Stat Card (Updated for Light Theme) ────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string | number;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 border transition-all shadow-sm ${
        highlight
          ? "bg-amber-500 border-amber-600 text-white"
          : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      <div className="text-3xl mb-4">{icon}</div>
      <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
        {value}
      </div>
      <div className={`text-xs md:text-sm font-medium mt-1 uppercase tracking-wider ${
        highlight ? "text-amber-100" : "text-slate-500"
      }`}>
        {label}
      </div>
    </div>
  );
}

// ── Custom Tooltip (Updated for Light Theme) ──────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 shadow-xl rounded-lg px-4 py-2 text-sm">
        <p className="text-slate-500 font-medium">{label}</p>
        <p className="text-amber-600 font-bold">{payload[0].value} bookings</p>
      </div>
    );
  }
  return null;
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch {
      setError("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="bg-red-50 text-red-600 px-6 py-3 rounded-lg border border-red-100 font-medium">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  return (
    /* w-full and px-4/6/8 ensures it spans the screen but keeps breathing room on mobile */
    <div className="w-full min-h-screen bg-slate-50 px-4 py-6 md:px-8 lg:px-10 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-slate-900 text-3xl md:text-4xl font-black tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-1 font-medium">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button 
          onClick={fetchStats}
          className="w-fit px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Stat Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4 md:gap-6">
        <StatCard
          icon="📅"
          label="Today"
          value={stats?.bookingsToday ?? 0}
          highlight
        />
        <StatCard
          icon="📆"
          label="This Week"
          value={stats?.bookingsThisWeek ?? 0}
        />
        <StatCard
          icon="🗓️"
          label="This Month"
          value={stats?.bookingsThisMonth ?? 0}
        />
        <StatCard
          icon="👥"
          label="Customers"
          value={stats?.totalCustomers ?? 0}
        />
        <StatCard
          icon="💬"
          label="Active Chats"
          value={stats?.activeConversations ?? 0}
        />
        <StatCard
          icon="🏆"
          label="Top Package"
          value={stats?.topPackage ?? "—"}
        />
      </div>

      {/* 30-Day Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-slate-900 text-xl font-bold">Booking Trends</h2>
          <p className="text-slate-500 text-sm">Visual representation of the last 30 days</p>
        </div>
        
        <div className="h-[300px] md:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.chartData ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                interval={window.innerWidth < 768 ? 6 : 3} // Adjust density for mobile
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar 
                dataKey="bookings" 
                fill="#f59e0b" 
                radius={[6, 6, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}