import { useAuth } from "../context/AuthContext";
import { AdminPanel } from "../components/AdminPanel";
import { Navigate } from "react-router";

export function AdminPage() {
  const { user } = useAuth();

  // Only admins can access this page
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <AdminPanel />
    </div>
  );
}
