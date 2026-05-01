import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Conversations from "./pages/Conversation";
import Bookings from "./pages/Booking";
import Customers from "./pages/Customers";

import Layout from "./components/Layout";

const isLoggedIn = () => {
  const token = localStorage.getItem("token");
  return token && token !== "undefined" && token !== "null";
};

const ProtectedRoute = () => {
  return isLoggedIn() ? <Layout /> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/customers" element={<Customers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}