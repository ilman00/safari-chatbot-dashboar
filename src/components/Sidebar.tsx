import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

const links = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/conversations", label: "Conversations", icon: "💬" },
  { to: "/bookings", label: "Bookings", icon: "📋" },
  { to: "/customers", label: "Customers", icon: "👥" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* ───────── MOBILE TOP BAR ───────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏜️</span>
          <span className="text-gray-900 font-bold text-sm">
            Share Desert Safari
          </span>
        </div>

        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </header>

      {/* ───────── MOBILE BACKDROP ───────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={closeMobile}
        />
      )}

      {/* ───────── SIDEBAR ───────── */}
      <aside
        className={`
          fixed top-0 left-0 h-dvh w-64 z-50
          bg-white border-r border-gray-200
          flex flex-col
          transform transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="text-2xl mb-1">🏜️</div>

          <h1 className="text-gray-900 font-bold text-base leading-tight">
            Share Desert Safari
          </h1>

          <p className="text-gray-400 text-xs mt-0.5">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}