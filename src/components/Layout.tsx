import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex h-dvh overflow-hidden bg-gray-50">
      {/* Sidebar renders itself — fixed on desktop, overlay on mobile */}
      <Sidebar />

      {/* Main content: on desktop, offset by sidebar width (16rem = 256px) */}
      <main className="flex-1 md:ml-64 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}