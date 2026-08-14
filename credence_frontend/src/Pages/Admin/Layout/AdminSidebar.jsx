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
  FiFileText,
  FiCheckSquare,
  FiSettings,
  FiShield,
  FiUserPlus,
  FiSend,
  FiRefreshCw,
  FiActivity,
  FiBriefcase,
  FiUpload, 
   
} from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";
import { TbUsers, TbReportAnalytics } from "react-icons/tb";

import "./AdminSidebar.scss";

const AdminSidebar = ({ children }) => {
  const [toggle, setToggle] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [isTriggeringPlanChange, setIsTriggeringPlanChange] = useState(false);
  const [isSendingUploadReminders, setIsSendingUploadReminders] = useState(false);

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  const [showResultModal, setShowResultModal] = useState(false);
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [resultType, setResultType] = useState("success");

  const navigate = useNavigate();
  const location = useLocation();

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("adminToken") || document.cookie.includes("adminToken");
    setIsLoggedIn(!!token);
  }, []);

  // --- DATE VALIDATION FOR UPLOAD REMINDER (Finland time) ---
  const getFinlandDay = () => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      timeZone: 'Europe/Helsinki'
    });
    return parseInt(formatter.format(new Date()), 10);
  };

  const currentDay = getFinlandDay();
  const isUploadReminderEnabled = currentDay >= 1 && currentDay <= 25;

  const handleLogin = () => navigate("/admin/login");

  const handleLogout = async () => {
    console.log("🔥 LOGOUT BUTTON CLICKED");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      console.log("🔥 LOGOUT API RESPONSE:", res.status);

      if (res.ok) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        document.cookie = "adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setIsLoggedIn(false);
        navigate("/admin/login");
        console.log("✅ Logout successful, redirecting to login...");
      } else {
        console.error("❌ Logout failed with status:", res.status);
        alert("Logout failed. Please try again.");
      }
    } catch (err) {
      console.error("❌ LOGOUT FETCH ERROR:", err);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      setIsLoggedIn(false);
      navigate("/admin/login");
    }
  };

  // --- MODAL HELPERS ---
  const openConfirmModal = (message, onConfirm) => {
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const showResult = (title, message, type = "success") => {
    setResultTitle(title);
    setResultMessage(message);
    setResultType(type);
    setShowResultModal(true);
  };

  // --- PAYMENT REMINDER HANDLER ---
  const handleSendPaymentRemindersConfirmed = async () => {
    setIsSendingReminders(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/payment-reminders/send-test-reminder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        showResult(
          "✅ Success",
          `Sent ${data.details?.sent || 0} payment reminders. Failed: ${data.details?.failed || 0}`,
          "success"
        );
      } else {
        showResult("❌ Failed", data.message, "error");
      }
    } catch (error) {
      showResult("❌ Network Error", error.message, "error");
    } finally {
      setIsSendingReminders(false);
    }
  };

  // --- PLAN CHANGE HANDLER ---
  const handleTriggerPlanChangeConfirmed = async () => {
    setIsTriggeringPlanChange(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/trigger-plan-change`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        showResult(
          "✅ Plan Change Triggered",
          `Triggered by: ${data.triggeredBy}\nTime: ${data.timestamp}\nMessage: ${data.message}`,
          "success"
        );
      } else {
        showResult("❌ Failed", data.message, "error");
      }
    } catch (error) {
      showResult("❌ Network Error", error.message, "error");
    } finally {
      setIsTriggeringPlanChange(false);
    }
  };

  // --- DOCUMENT UPLOAD REMINDER HANDLER ---
  const handleSendUploadRemindersConfirmed = async () => {
    setIsSendingUploadReminders(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/document-upload-reminders/send-test-upload-reminder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        showResult(
          "✅ Success",
          `Sent ${data.details?.sent || 0} upload reminders. Failed: ${data.details?.failed || 0}`,
          "success"
        );
      } else {
        showResult("❌ Failed", data.message, "error");
      }
    } catch (error) {
      showResult("❌ Network Error", error.message, "error");
    } finally {
      setIsSendingUploadReminders(false);
    }
  };

  // Auto-collapse sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth < 768) {
      setToggle(true);
    }
  }, [location.pathname]);

  const handleToggle = () => setToggle(!toggle);

  const menuData = [
    {
      icon: <MdOutlineDashboard />,
      title: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: <FiFileText />,
      title: "Client Manage",
      path: "/admin/enrollments",
    },
    {
      icon: <FiUsers />,
      title: "Employees",
      path: "/admin/employees",
    },
    {
      icon: <FiBriefcase />,
      title: "Clients Info",
      path: "/admin/clients",
    },
    {
      icon: <FiActivity />,
      title: "Activity Logs",
      path: "/admin/logs",
    },
    {
      icon: <FiFileText  />,
      title: "Agreement Pdf",
      path: "/admin/pdf",
    },
    {
      icon: <FiFileText  />,
      title: "BLogs Management",
      path: "/admin/blogs",
    },
  ];

  return (
    <div className="admin-layout-container">
      {/* SIDEBAR */}
      <div id="admin-sidebar" className={toggle ? "hide" : ""}>
        <div className="admin-logo">
          <div className="admin-logoBox">
            {toggle ? (
              <GiHamburgerMenu className="admin-menuIconHidden" onClick={handleToggle} />
            ) : (
              <>
                <div className="admin-sidebar-logo">
                  <FiShield size={24} />
                  <span>Admin Panel</span>
                </div>
                <RxCross1 className="admin-menuIconHidden" onClick={handleToggle} />
              </>
            )}
          </div>
        </div>

        <ul className="admin-side-menu">
          {menuData.map(({ icon, title, path }, i) => (
            <li key={i}>
              <NavLink
                to={path}
                className={({ isActive }) => (isActive ? "active" : "")}
                end
              >
                <span className="admin-menu-icon">{icon}</span>
                <span className="admin-menu-title">{title}</span>
              </NavLink>
            </li>
          ))}

          {/* Payment Reminder Button */}
          <li>
            <button
              className="admin-payment-reminder-btn"
              onClick={() =>
                openConfirmModal(
                  "Send payment reminders to all active clients?",
                  handleSendPaymentRemindersConfirmed
                )
              }
              disabled={isSendingReminders}
              data-tooltip="Payment Reminders"
            >
              <span className="admin-menu-icon">
                {isSendingReminders ? <span className="reminder-spinner"></span> : <FiSend />}
              </span>
              <span className="admin-menu-title">
                {isSendingReminders ? "Sending..." : "Payment Reminders"}
              </span>
            </button>
          </li>

          {/* Plan Change Trigger Button */}
          {/* <li>
            <button
              className="admin-plan-change-btn"
              onClick={() =>
                openConfirmModal(
                  "Are you sure you want to manually trigger plan change cron job? This will process all scheduled plan changes.",
                  handleTriggerPlanChangeConfirmed
                )
              }
              disabled={isTriggeringPlanChange}
              data-tooltip="Trigger Plan Change"
            >
              <span className="admin-menu-icon">
                {isTriggeringPlanChange ? <span className="reminder-spinner"></span> : <FiRefreshCw />}
              </span>
              <span className="admin-menu-title">
                {isTriggeringPlanChange ? "Processing..." : "Trigger Plan Change"}
              </span>
            </button>
          </li> */}

          {/* Document Upload Reminder Button with date validation */}
          <li>
            <button
              className="admin-upload-reminder-btn"
              onClick={() =>
                openConfirmModal(
                  "Send document upload reminders to all active clients?",
                  handleSendUploadRemindersConfirmed
                )
              }
              disabled={isSendingUploadReminders || !isUploadReminderEnabled}
              // data-tooltip={
              //   isUploadReminderEnabled
              //     ? "Document Upload Reminder"
              //     : "Available only from 1st to 25th of each month"
              // }
            >
              <span className="admin-menu-icon">
                {isSendingUploadReminders ? <span className="reminder-spinner"></span> : <FiUpload />}
              </span>
              <span className="admin-menu-title">
                {isSendingUploadReminders ? "Sending..." : "Doc Upload Reminder"}
              </span>
            </button>
          </li>
        </ul>

        <div className="admin-sidebar-footer">
          <span>Designed & Developed By</span>
          <a rel="noopener noreferrer" className="admin-footer-link">
            Vapautus Media Private Limited
          </a>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div id="admin-main-content" className={toggle ? "expanded" : ""}>
        <nav className="admin-top-nav">
          <div className="admin-nav-left">
            <GiHamburgerMenu className="admin-menuIcon" onClick={handleToggle} />
            <div className="admin-page-title">
              {(() => {
                const path = location.pathname;
                if (path.includes("dashboard")) return "Admin Dashboard";
                if (path.includes("enrollments")) return "Client Management";
                if (path.includes("employees")) return "Employees";
                if (path.includes("employees-tasks")) return "Employees Tasks";
                if (path.includes("clients")) return "Clients";
                if (path.includes("register")) return "Register Admin";
                if (path.includes("settings")) return "Settings";
                return "Admin Panel";
              })()}
            </div>
          </div>

          <div className="admin-nav-right">
            {!isLoggedIn ? (
              <button className="admin-icon-button" onClick={handleLogout}>
                <BiLogIn />
              </button>
            ) : (
              <div className="admin-profile">
                <div className="admin-profile-icon">
                  <FiUser />
                </div>
                <button className="admin-icon-button" onClick={handleLogout}>
                  <BiLogOut />
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="admin-page-content">{children}</div>
      </div>

      {/* CONFIRM MODAL */}
      {showConfirmModal && (
        <div className="admin-modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Action</h3>
            <p>{confirmMessage}</p>
            <div className="admin-modal-actions">
              <button className="admin-modal-btn cancel" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="admin-modal-btn confirm" onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESULT MODAL */}
      {showResultModal && (
        <div className="admin-modal-overlay" onClick={() => setShowResultModal(false)}>
          <div className={`admin-modal-content ${resultType}`} onClick={(e) => e.stopPropagation()}>
            <h3>{resultTitle}</h3>
            <p style={{ whiteSpace: "pre-line" }}>{resultMessage}</p>
            <div className="admin-modal-actions">
              <button className="admin-modal-btn close" onClick={() => setShowResultModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;