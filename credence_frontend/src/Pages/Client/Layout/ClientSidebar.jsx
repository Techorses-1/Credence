import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Icons
import { BiLogOut, BiLogIn } from "react-icons/bi";
import { GiHamburgerMenu } from "react-icons/gi";
import { RxCross1 } from "react-icons/rx";
import {
  FiUser,
  FiUploadCloud,
  FiShield,
  FiFile,
  FiFileMinus
} from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";

import "./ClientSidebar.scss";
import FinancialStatementModal from "../FInancialStatements/FinancialStatementModal";

const ClientSidebar = ({ children }) => {
  const [toggle, setToggle] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showFinancialStatementModal, setShowFinancialStatementModal] = useState(false);
  const [clientInfo, setClientInfo] = useState(null);
  const [loadingClientInfo, setLoadingClientInfo] = useState(false);
  const [downloadingTerms, setDownloadingTerms] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Check login status - ONLY COOKIES (NO localStorage)
  useEffect(() => {
    const hasToken = document.cookie.includes("clientToken");
    setIsLoggedIn(hasToken);

    if (hasToken) {
      fetchClientInfo();
    }
  }, []);

  // Fetch client info
  const fetchClientInfo = async () => {
    setLoadingClientInfo(true);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/client/profile`,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setClientInfo(response.data);
      }
    } catch (error) {
      console.error("Error fetching client info:", error);

      // Try alternative endpoint
      try {
        const altResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/client/dashboard/overview`,
          { withCredentials: true }
        );

        if (altResponse.data?.client) {
          setClientInfo(altResponse.data.client);
        }
      } catch (altError) {
        console.error("Alternative endpoint also failed:", altError);
      }
    } finally {
      setLoadingClientInfo(false);
    }
  };

  // Handle Financial Statements button click
  const handleFinancialStatementsClick = () => {
    if (!clientInfo || Object.keys(clientInfo).length === 0) {
      toast.info("Loading client information...", {
        position: "top-center",
        autoClose: 2000,
      });
      fetchClientInfo().then(() => {
        setShowFinancialStatementModal(true);
      });
    } else {
      setShowFinancialStatementModal(true);
    }
  };

  const handleLogin = () => navigate("/login");

  // ✅ FIXED LOGOUT - ONLY COOKIES (NO localStorage)
  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/client/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Logout error:", error);
    }

    // ✅ ONLY CLEAR COOKIES (NO localStorage)
    document.cookie = "clientToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "employeeToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    setIsLoggedIn(false);
    setClientInfo(null);
    navigate("/login");
  };

  // Terms & Conditions Download
  const handleTermsDownload = async () => {
    if (downloadingTerms) return;

    const toastId = toast.loading("Downloading Terms & Conditions...", {
      position: "top-center",
    });

    try {
      setDownloadingTerms(true);

      let res;
      try {
        res = await fetch(`${import.meta.env.VITE_API_URL}/admin/pdf/public/current`);
      } catch (networkError) {
        toast.dismiss(toastId);
        if (networkError.message === 'Failed to fetch' || networkError.name === 'TypeError') {
          toast.error("📡 No internet connection! Please check your network and try again.", {
            position: "top-center",
            autoClose: 4000,
          });
        } else {
          toast.error("🌐 Network error! Please check your internet connection.", {
            position: "top-center",
            autoClose: 4000,
          });
        }
        return;
      }

      if (!res.ok) {
        toast.dismiss(toastId);
        toast.error(`Failed to fetch agreement information. Status: ${res.status}`, {
          position: "top-center",
          autoClose: 4000,
        });
        return;
      }

      const data = await res.json();

      if (!data.success || !data.pdf) {
        toast.dismiss(toastId);
        toast.error("Terms & Conditions PDF not available. Please contact support.", {
          position: "top-center",
          autoClose: 4000,
        });
        return;
      }

      let fileResponse;
      try {
        fileResponse = await fetch(data.pdf.fileUrl);
      } catch (networkError) {
        toast.dismiss(toastId);
        if (networkError.message === 'Failed to fetch' || networkError.name === 'TypeError') {
          toast.error("📡 No internet connection! Please check your network and try again.", {
            position: "top-center",
            autoClose: 4000,
          });
        } else {
          toast.error("🌐 Network error! Please check your internet connection.", {
            position: "top-center",
            autoClose: 4000,
          });
        }
        return;
      }

      if (!fileResponse.ok) {
        toast.dismiss(toastId);
        toast.error(`Failed to download file. Status: ${fileResponse.status}`, {
          position: "top-center",
          autoClose: 4000,
        });
        return;
      }

      const contentType = fileResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        toast.dismiss(toastId);
        toast.error("Invalid file format. Expected PDF.", {
          position: "top-center",
          autoClose: 4000,
        });
        return;
      }

      const blob = await fileResponse.blob();

      if (blob.size === 0) {
        toast.dismiss(toastId);
        toast.error("Downloaded file is empty. Please try again.", {
          position: "top-center",
          autoClose: 4000,
        });
        return;
      }

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Terms_and_Conditions_v${data.pdf.version || 1}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

      toast.dismiss(toastId);
      toast.success(`✓ Terms & Conditions downloaded successfully! (${(blob.size / 1024).toFixed(2)} KB)`, {
        position: "top-center",
        autoClose: 3000,
      });

    } catch (error) {
      console.error("Download error:", error);
      toast.dismiss(toastId);

      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        toast.error("📡 No internet connection! Please check your network and try again.", {
          position: "top-center",
          autoClose: 4000,
        });
      }
      else if (error.name === 'AbortError') {
        toast.error("⏱️ Request timed out. Please check your connection and try again.", {
          position: "top-center",
          autoClose: 4000,
        });
      }
      else if (error.message === 'NetworkError' || error.message?.includes('network')) {
        toast.error("🌐 Network error! Please check your internet connection.", {
          position: "top-center",
          autoClose: 4000,
        });
      }
      else {
        toast.error("Something went wrong. Please try again later.", {
          position: "top-center",
          autoClose: 4000,
        });
      }
    } finally {
      setDownloadingTerms(false);
    }
  };

  // Auto-collapse sidebar
  useEffect(() => {
    if (window.innerWidth < 768) {
      setToggle(true);
    }
  }, [location.pathname]);

  const handleToggle = () => {
    setToggle(!toggle);
  };

  const handleFinancialStatementSuccess = (data) => {
    console.log("Financial statement request submitted:", data);
    toast.success("✓ Financial statement request submitted successfully!", {
      position: "top-center",
      autoClose: 3000,
    });
  };

  // Menu Data
  const menuData = [
    { icon: <MdOutlineDashboard />, title: "Dashboard", path: "/client/dashboard" },
    { icon: <FiUploadCloud />, title: "Upload Files", path: "/client/upload" },
    { icon: <FiUser />, title: "Profile", path: "/client/profile" },
  ];

  return (
    <>
      <div className="client-layout-container">
        {/* SIDEBAR */}
        <div id="client-sidebar" className={toggle ? "hide" : ""}>
          <div className="client-logo">
            <div className="client-logoBox">
              {toggle ? (
                <GiHamburgerMenu className="client-menuIconHidden" onClick={handleToggle} />
              ) : (
                <>
                  <div className="client-sidebar-logo">
                    <FiShield size={24} />
                    <span>Client Portal</span>
                  </div>
                  <RxCross1 className="client-menuIconHidden" onClick={handleToggle} />
                </>
              )}
            </div>
          </div>

          <ul className="client-side-menu">
            {menuData.map(({ icon, title, path }, i) => (
              <li key={i}>
                <NavLink
                  to={path}
                  className={({ isActive }) => (isActive ? "active" : "")}
                  end
                >
                  <span className="client-menu-icon">{icon}</span>
                  <span className="client-menu-title">{title}</span>
                </NavLink>
              </li>
            ))}

            {/* Financial Statements Button */}
            <li>
              <button
                className="client-financial-button"
                onClick={handleFinancialStatementsClick}
                disabled={loadingClientInfo}
              >
                <span className="client-menu-icon">
                  <FiFileMinus />
                </span>
                <span className="client-menu-title">
                  Finance Statements
                  {loadingClientInfo && " (Loading...)"}
                </span>
              </button>
            </li>

            {/* Terms & Conditions Button */}
            <li>
              <button
                className="client-terms-button"
                onClick={handleTermsDownload}
                disabled={downloadingTerms}
              >
                <span className="client-menu-icon">
                  <FiFile />
                </span>
                <span className="client-menu-title">
                  {downloadingTerms ? "Downloading..." : "Terms & Conditions"}
                </span>
              </button>
            </li>
          </ul>

          {/* SIDEBAR FOOTER */}
          <div className="client-sidebar-footer">
            <span>Designed & Developed By</span>
            <a
              rel="noopener noreferrer"
              className="client-footer-link"
            >
              Vapautus Media Private Limited
            </a>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div id="client-main-content" className={toggle ? "expanded" : ""}>
          {/* TOP NAVBAR */}
          <nav className="client-top-nav">
            <div className="client-nav-left">
              <GiHamburgerMenu className="client-menuIcon" onClick={handleToggle} />
              <div className="client-page-title">
                {(() => {
                  const path = location.pathname;
                  if (path.includes("dashboard")) return "Dashboard";
                  if (path.includes("upload")) return "Upload Files";
                  if (path.includes("profile")) return "My Profile";
                  return "Client Portal";
                })()}
              </div>
            </div>

            <div className="client-nav-right">
              {!isLoggedIn ? (
                <button className="client-icon-button" onClick={handleLogout}>
                  <BiLogIn />
                </button>
              ) : (
                <div className="client-profile">
                  <div className="client-profile-icon">
                    <FiUser />
                  </div>
                  <button className="client-icon-button" onClick={handleLogout}>
                    <BiLogOut />
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* PAGE CONTENT */}
          <div className="client-page-content">
            {children}
          </div>
        </div>

        {/* FINANCIAL STATEMENT MODAL */}
        <FinancialStatementModal
          isOpen={showFinancialStatementModal}
          onClose={() => setShowFinancialStatementModal(false)}
          clientInfo={clientInfo || {}}
          onSuccess={handleFinancialStatementSuccess}
        />
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
    </>
  );
};

export default ClientSidebar;