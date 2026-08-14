import { useEffect, useState } from "react";
import axios from "axios";
import EmployeeSidebar from "./EmployeeSidebar";
import "./EmployeeLayout.scss";

const EmployeeLayout = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/employee/me`, {
        withCredentials: true
      })
      .then(() => setLoading(false))
      .catch(() => (window.location.href = "/login"));
  }, []);

  if (loading) return (
    <div className="employee-loading">
      <div className="spinner"></div>
      <p>Loading Employee Portal...</p>
    </div>
  );

  return (
    <EmployeeSidebar>
      <main className="employee-main-content">
        {children}
      </main>
    </EmployeeSidebar>
  );
};

export default EmployeeLayout;