import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import "./AdminLayout.scss";

const AdminLayout = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/admin/me`, {
        withCredentials: true
      })
      .then(() => setLoading(false))
      .catch(() => (window.location.href = "/admin/login"));
  }, []);

  if (loading) return (
    <div className="admin-loading">
      <div className="spinner"></div>
      <p>Loading Admin Panel...</p>
    </div>
  );

  return (
    <AdminSidebar>
      <main className="admin-main-content">
        {children}
      </main>
    </AdminSidebar>
  );
};

export default AdminLayout;