import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="w-full md:w-[calc(100%-16rem)] flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}