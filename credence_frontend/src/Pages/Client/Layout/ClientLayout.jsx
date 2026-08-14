import { useEffect, useState } from "react";
import axios from "axios";
import ClientSidebar from "./ClientSidebar";
import "./ClientLayout.scss";

const ClientLayout = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/client/me`, {
        withCredentials: true
      })
      .then(() => setLoading(false))
      .catch(() => (window.location.href = "/login"));
  }, []);

  if (loading) return (
    <div className="client-loading">
      <div className="spinner"></div>
      <p>Loading Client Portal...</p>
    </div>
  );

  return (
    <ClientSidebar>
      <main className="client-main-content">
        {children}
      </main>
    </ClientSidebar>
  );
};

export default ClientLayout;