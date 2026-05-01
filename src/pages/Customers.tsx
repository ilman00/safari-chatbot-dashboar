import { useState, useEffect } from "react";
import api from "../api/axios";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Customer {
    phone: string;
    name: string | null;
    lastMessage: string;
    lastMessageTime: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/admin/conversations");
      setCustomers(res.data);
      setFiltered(res.data);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      customers.filter(
        (c) =>
          c.phone.includes(q) ||
          (c.name && c.name.toLowerCase().includes(q))
      )
    );
  }, [search, customers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Customers</h1>
        <p className="text-gray-400 text-sm mt-1">
          {customers.length} total contacts in the system
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone number..."
          className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-50
0 transition"
        />
      </div>

      {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
            {loading ? (
                <div className="p-5 text-gray-400">Loading customers...</div>
            ) : filtered.length === 0 ? (
                <div className="p-5 text-gray-400">No customers found</div>
            ) : (
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-800">
                            <th className="px-5 py-3 text-sm text-gray-400">Name</th>
                            <th className="px-5 py-3 text-sm text-gray-400">Phone</th>
                            <th className="px-5 py-3 text-sm text-gray-400">Last Message</th>
                            <th className="px-5 py-3 text-sm text-gray-400">Last Message Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((c) => (
                            <tr key={c.phone} className="border-b border-gray-800 hover:bg-gray-800 transition">  
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-sm">
                                            {(c.name || c.phone)[0].toUpperCase()}
                                        </div>
                                        <span>{c.name || "Unknown"}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3">{c.phone}</td>
                                <td className="px-5 py-3 text-gray-300">{c.lastMessage}</td>
                                <td className="px-5 py-3 text-gray-400 text-sm">{formatDate(c.lastMessageTime)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    </div>
    );  
}