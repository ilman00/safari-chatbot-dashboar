import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Conversations from "./pages/Conversation";
import Bookings from "./pages/Booking";
import Customers from "./pages/Customers";
import Layout from "./components/Layout";

// const isLoggedIn = () => !!localStorage.getItem("token");

// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   return isLoggedIn() ? <>{children}</> : <Navigate to="/login" />;
// };

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/conversations" element={<Conversations />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/customers" element={<Customers />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}