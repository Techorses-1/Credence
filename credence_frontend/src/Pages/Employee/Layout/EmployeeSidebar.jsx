import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";

// Icons
import { BiLogOut, BiLogIn } from "react-icons/bi";
import { GiHamburgerMenu } from "react-icons/gi";
import { RxCross1 } from "react-icons/rx";
import {
  FiUser,
  FiHome,
  FiUsers,
  FiCheckSquare,
  FiShield ,
  FiDollarSign  
} from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";

import "./EmployeeSidebar.scss";

const EmployeeSidebar = ({ children }) => {
  const [toggle, setToggle] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("employeeToken") || document.cookie.includes("employeeToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = () => navigate("/login");

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/employee/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("employeeToken");
    document.cookie = "employeeToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsLoggedIn(false);
    navigate("/login");
  };

  // Auto-collapse sidebar on route change (mobile only)
  useEffect(() => {
    if (window.innerWidth < 768) {
      setToggle(true);
    }
  }, [location.pathname]);

  // Toggle sidebar
  const handleToggle = () => {
    setToggle(!toggle);
  };

  // Menu Data for Employee - ONLY EXISTING PAGES
  const menuData = [
    { icon: <MdOutlineDashboard />, title: "Dashboard", path: "/employee/dashboard" },
    { icon: <FiUsers />, title: "Clients", path: "/employee/assigned" },
    { icon: <FiDollarSign   />, title: "Clients Payment", path: "/employee/clientpayment" },
    { icon: <FiCheckSquare />, title: "Finance Requests", path: "/employee/finance" },  
  ];

  return (
    <div className="employee-layout-container">
      {/* SIDEBAR */}
      <div id="employee-sidebar" className={toggle ? "hide" : ""}>
        <div className="employee-logo">
          <div className="employee-logoBox">
            {toggle ? (
              <GiHamburgerMenu
                className="employee-menuIconHidden"
                onClick={handleToggle}
              />
            ) : (
              <>
                <div className="employee-sidebar-logo">
                  <FiShield size={24} />
                  <span>Employee Panel</span>
                </div>
                <RxCross1
                  className="employee-menuIconHidden"
                  onClick={handleToggle}
                />
              </>
            )}
          </div>
        </div>

        <ul className="employee-side-menu">
          {menuData.map(({ icon, title, path }, i) => (
            <li key={i}>
              <NavLink
                to={path}
                className={({ isActive }) => (isActive ? "active" : "")}
                end
              >
                <span className="employee-menu-icon">{icon}</span>
                <span className="employee-menu-title">{title}</span>
              </NavLink>
            </li>
          ))}

          {isLoggedIn && (
            <li className="employee-logout-menu-item">
              <button className="employee-sidebar-logout-btn" onClick={handleLogout}>
                <BiLogOut />
                <span>Logout</span>
              </button>
            </li>
          )}
        </ul>

        {/* SIDEBAR FOOTER */}
        <div className="employee-sidebar-footer">
          <span>Designed & Developed By</span>
          <a
            // href="https://techorses.com"
            // target="_blank"
            rel="noopener noreferrer"
            className="employee-footer-link"
          >
            Vapautus Media Private Limited
          </a>
        </div>

      </div>

      {/* MAIN CONTENT AREA */}
      <div id="employee-main-content" className={toggle ? "expanded" : ""}>
        {/* TOP NAVBAR */}
        <nav className="employee-top-nav">
          <div className="employee-nav-left">
            <GiHamburgerMenu
              className="employee-menuIcon"
              onClick={handleToggle}
            />
            <div className="employee-page-title">
              {(() => {
                const path = location.pathname;
                if (path.includes("dashboard")) return "Dashboard";
                if (path.includes("assigned")) return "Clients";
                if (path.includes("tasks")) return "Tasks";
                return "Employee Panel";
              })()}
            </div>
          </div>

          <div className="employee-nav-right">
            {!isLoggedIn ? (
              <button className="employee-icon-button" onClick={handleLogout}>
                <BiLogIn />
              </button>
            ) : (
              <div className="employee-profile">
                <div className="employee-profile-icon">
                  <FiUser />
                </div>
                <button className="employee-icon-button" onClick={handleLogout}>
                  <BiLogOut />
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* PAGE CONTENT (passed from EmployeeLayout) */}
        <div className="employee-page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default EmployeeSidebar;