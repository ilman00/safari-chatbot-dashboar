import { useEffect, useState } from "react";
import api from "../api/axios";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Booking {
  id: number;
  phone_number: string;
  name: string;
  package: string;
  safari_date: string;
  adults: number;
  children: number;
  hotel: string;
  created_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── CSV Export ─────────────────────────────────────────────────────────────────
function exportCSV(bookings: Booking[]) {
  const headers = [
    "ID", "Name", "Phone", "Package",
    "Safari Date", "Adults", "Children", "Hotel", "Booked At"
  ];
  const rows = bookings.map((b) => [
    b.id, b.name, b.phone_number, b.package,
    formatDate(b.safari_date), b.adults, b.children,
    b.hotel, formatDate(b.created_at),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${v}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bookings_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [packageFilter, setPackageFilter] = useState("");

  // ── Fetch bookings ───────────────────────────────────────────────────────────
  const fetchBookings = async () => {
    try {
      const params: Record<string, string> = {};
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      if (packageFilter) params.package = packageFilter;

      const res = await api.get("/admin/bookings", { params });
      setBookings(res.data);
    } catch {
      console.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleFilter = () => {
    setLoading(true);
    fetchBookings();
  };

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    setPackageFilter("");
    setLoading(true);
    setTimeout(fetchBookings, 0);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Bookings</h1>
          <p className="text-gray-400 text-sm mt-1">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <button
          onClick={() => exportCSV(bookings)}
          disabled={bookings.length === 0}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-semibold px-4 py-2 rounded-lg text-sm transition"
        >
          ⬇️ Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition"
          />
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition"
          />
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Package</label>
          <select
            value={packageFilter}
            onChange={(e) => setPackageFilter(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition"
          >
            <option value="">All Packages</option>
            <option value="Evening Desert Safari">Evening Desert Safari</option>
            <option value="Evening Safari with Quad Bike">Evening Safari with Quad Bike</option>
            <option value="Evening Safari with Dune Buggy">Evening Safari with Dune Buggy</option>
            <option value="Morning Desert Safari">Morning Desert Safari</option>
            <option value="Private Morning Safari">Private Morning Safari</option>
            <option value="Overnight Safari">Overnight Safari</option>
            <option value="Private Desert Experience">Private Desert Experience</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleFilter}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition"
          >
            Apply
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-16 animate-pulse">
            Loading bookings...
          </p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-16">
            No bookings found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Phone</th>
                  <th className="text-left px-5 py-3">Package</th>
                  <th className="text-left px-5 py-3">Safari Date</th>
                  <th className="text-left px-5 py-3">Guests</th>
                  <th className="text-left px-5 py-3">Hotel</th>
                  <th className="text-left px-5 py-3">Booked At</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr
                    key={b.id}
                    className={`border-b border-gray-800 hover:bg-gray-800 transition ${
                      i % 2 === 0 ? "" : "bg-gray-900/50"
                    }`}
                  >
                    <td className="px-5 py-3 text-white font-medium">{b.name || "—"}</td>
                    <td className="px-5 py-3 text-gray-300">{b.phone_number}</td>
                    <td className="px-5 py-3">
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-xs">
                        {b.package}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-300">{formatDate(b.safari_date)}</td>
                    <td className="px-5 py-3 text-gray-300">
                      {b.adults}A {b.children > 0 ? `· ${b.children}C` : ""}
                    </td>
                    <td className="px-5 py-3 text-gray-300 max-w-[160px] truncate">{b.hotel}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(b.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}