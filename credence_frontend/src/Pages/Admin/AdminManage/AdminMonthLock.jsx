import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import {
  FiUsers,
  FiUser,
  FiMail,
  FiCalendar,
  FiLock,
  FiUnlock,
  FiChevronDown,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiSearch,
  FiClock
} from "react-icons/fi";
import { Snackbar, Alert } from "@mui/material";
import "./AdminMonthLock.scss";

const AdminMonthLock = () => {
  // Client states
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Month/Year states
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);

  // Lock states
  const [isLocked, setIsLocked] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);
  const [lockDetails, setLockDetails] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Years array
  const years = [
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
    new Date().getFullYear() - 2,
    new Date().getFullYear() + 1
  ];

  // Months array
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  // Show snackbar
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Load all clients
  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/clients`,
        { withCredentials: true }
      );
      setClients(res.data);
    } catch (error) {
      console.error("Error loading clients:", error);
      showSnackbar("Error loading clients", "error");
    } finally {
      setLoading(false);
    }
  };

  // Check month lock status
  const checkMonthStatus = async (clientId, year, month) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/clients/${clientId}`,
        { withCredentials: true }
      );

      let clientData = res.data.client || res.data;
      const yearKey = String(year);
      const monthKey = String(month);
      
      const monthData = clientData.documents?.[yearKey]?.[monthKey];
      
      if (monthData) {
        setIsLocked(monthData.isLocked || false);
        setLockDetails({
          lockedAt: monthData.lockedAt,
          lockedBy: monthData.lockedBy
        });
      } else {
        setIsLocked(false);
        setLockDetails(null);
      }
    } catch (error) {
      console.error("Error checking month status:", error);
      setIsLocked(false);
      setLockDetails(null);
    }
  };

  // Handle client selection
  const handleClientSelect = async (client) => {
    setSelectedClient(client);
    await checkMonthStatus(client.clientId, selectedYear, selectedMonth);
  };

  // Handle year/month change
  const handleMonthYearChange = async (year, month) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    if (selectedClient) {
      await checkMonthStatus(selectedClient.clientId, year, month);
    }
  };

  // Lock month
  const handleLockMonth = async () => {
    if (!selectedClient || lockLoading) return;

    try {
      setLockLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin-manage/month-lock/${selectedClient.clientId}`,
        {
          year: selectedYear,
          month: selectedMonth
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsLocked(true);
        setLockDetails({
          lockedAt: response.data.lockedAt,
          lockedBy: response.data.lockedBy
        });
        showSnackbar(`Month ${selectedMonth}/${selectedYear} locked successfully!`, "success");
      }
    } catch (error) {
      console.error("Error locking month:", error);
      showSnackbar(`Error: ${error.response?.data?.message || error.message}`, "error");
    } finally {
      setLockLoading(false);
    }
  };

  // Unlock month
  const handleUnlockMonth = async () => {
    if (!selectedClient || lockLoading) return;

    try {
      setLockLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin-manage/month-unlock/${selectedClient.clientId}`,
        {
          year: selectedYear,
          month: selectedMonth
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsLocked(false);
        setLockDetails(null);
        showSnackbar(`Month ${selectedMonth}/${selectedYear} unlocked successfully!`, "success");
      }
    } catch (error) {
      console.error("Error unlocking month:", error);
      showSnackbar(`Error: ${error.response?.data?.message || error.message}`, "error");
    } finally {
      setLockLoading(false);
    }
  };

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === "" ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && client.isActive) ||
      (statusFilter === "inactive" && !client.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Load clients on mount
  useEffect(() => {
    loadClients();
  }, []);

  // Check status when client or month/year changes
  useEffect(() => {
    if (selectedClient) {
      checkMonthStatus(selectedClient.clientId, selectedYear, selectedMonth);
    }
  }, [selectedClient, selectedYear, selectedMonth]);

  // Format month/year display
  const formatMonthYear = (month, year) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (isActive) => (
    <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
      {isActive ? (
        <>
          <FiCheckCircle /> Active
        </>
      ) : (
        <>
          <FiXCircle /> Inactive
        </>
      )}
    </span>
  );

  return (
    <AdminLayout>
      <div className="admin-month-lock">
        {/* Header */}
        <div className="month-lock-header">
          <div className="header-left">
            <h2>Month Lock Management</h2>
            <p className="subtitle">
              Lock or unlock client months - Simple month-level control
            </p>
          </div>
        </div>

        <div className="main-content">
          {/* Left Sidebar - Clients List */}
          <div className="clients-sidebar">
            <div className="sidebar-header">
              <h3>Clients</h3>
              <span className="count-badge">{filteredClients.length}</span>
            </div>

            <div className="search-filter-section">
              <div className="search-box">
                <FiSearch size={18} />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-buttons">
                <button
                  className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('active')}
                >
                  Active
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('inactive')}
                >
                  Inactive
                </button>
              </div>
            </div>

            <div className="clients-list">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading clients...</p>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="empty-state">
                  <FiUsers size={32} />
                  <p>No clients found</p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client.clientId}
                    className={`client-card ${selectedClient?.clientId === client.clientId ? 'active' : ''}`}
                    onClick={() => handleClientSelect(client)}
                  >
                    <div className="client-avatar">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="client-info">
                      <h4>{client.name}</h4>
                      <p className="client-email">{client.email}</p>
                      <div className="client-meta">
                        {getStatusBadge(client.isActive)}
                      </div>
                    </div>
                    {selectedClient?.clientId === client.clientId && (
                      <div className="active-indicator">
                        <FiChevronRight size={20} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Content - Month Lock Controls */}
          <div className="month-lock-content">
            {selectedClient ? (
              <>
                {/* Client Profile */}
                <div className="client-profile-header">
                  <div className="profile-avatar">
                    {selectedClient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-info">
                    <h2>{selectedClient.name}</h2>
                    <div className="profile-details">
                      <span className="detail-item">
                        <FiMail size={14} /> {selectedClient.email}
                      </span>
                      <span className="detail-item">
                        <FiUser size={14} /> {selectedClient.phone || 'No phone'}
                      </span>
                      {getStatusBadge(selectedClient.isActive)}
                    </div>
                  </div>
                </div>

                {/* Month Selection */}
                <div className="month-selection-section">
                  <h3>
                    <FiCalendar size={20} /> Select Month & Year
                  </h3>

                  <div className="month-dropdowns">
                    {/* Year Dropdown */}
                    <div className="dropdown-wrapper">
                      <button
                        className="dropdown-toggle"
                        onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                      >
                        <span>{selectedYear}</span>
                        <FiChevronDown size={16} />
                      </button>
                      {yearDropdownOpen && (
                        <div className="dropdown-menu">
                          {years.map(year => (
                            <button
                              key={year}
                              className="dropdown-item"
                              onClick={() => {
                                setYearDropdownOpen(false);
                                handleMonthYearChange(year, selectedMonth);
                              }}
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Month Dropdown */}
                    <div className="dropdown-wrapper">
                      <button
                        className="dropdown-toggle"
                        onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
                      >
                        <span>{months.find(m => m.value === selectedMonth)?.label}</span>
                        <FiChevronDown size={16} />
                      </button>
                      {monthDropdownOpen && (
                        <div className="dropdown-menu">
                          {months.map(month => (
                            <button
                              key={month.value}
                              className="dropdown-item"
                              onClick={() => {
                                setMonthDropdownOpen(false);
                                handleMonthYearChange(selectedYear, month.value);
                              }}
                            >
                              {month.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="selected-month-display">
                      <span className="current-month-text">
                        {formatMonthYear(selectedMonth, selectedYear)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Display */}
                <div className="month-status-section">
                  <div className="status-card">
                    <div className="status-header">
                      <h4>Current Status</h4>
                      <div className={`status-badge-large ${isLocked ? 'locked' : 'unlocked'}`}>
                        {isLocked ? (
                          <>
                            <FiLock size={18} /> LOCKED
                          </>
                        ) : (
                          <>
                            <FiUnlock size={18} /> UNLOCKED
                          </>
                        )}
                      </div>
                    </div>

                    {isLocked && lockDetails && (
                      <div className="lock-details">
                        <div className="detail-item">
                          <FiClock size={14} />
                          <span>Locked at: {new Date(lockDetails.lockedAt).toLocaleString()}</span>
                        </div>
                        <div className="detail-item">
                          <FiUser size={14} />
                          <span>Locked by: {lockDetails.lockedBy || 'Unknown'}</span>
                        </div>
                      </div>
                    )}

                    {!isLocked && (
                      <div className="unlock-details">
                        <FiAlertCircle size={16} />
                        <span>This month is currently unlocked</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="month-actions">
                  {!isLocked ? (
                    <button
                      className={`action-btn lock-btn ${lockLoading ? 'loading' : ''}`}
                      onClick={handleLockMonth}
                      disabled={lockLoading}
                    >
                      {lockLoading ? (
                        <>
                          <div className="spinner-small"></div>
                          Locking...
                        </>
                      ) : (
                        <>
                          <FiLock size={20} />
                          Lock Month
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className={`action-btn unlock-btn ${lockLoading ? 'loading' : ''}`}
                      onClick={handleUnlockMonth}
                      disabled={lockLoading}
                    >
                      {lockLoading ? (
                        <>
                          <div className="spinner-small"></div>
                          Unlocking...
                        </>
                      ) : (
                        <>
                          <FiUnlock size={20} />
                          Unlock Month
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Info Box */}
                <div className="info-box">
                  <FiAlertCircle size={16} />
                  <span>
                    {isLocked 
                      ? "This month is locked. Click 'Unlock Month' to unlock it."
                      : "This month is unlocked. Click 'Lock Month' to lock it."
                    }
                  </span>
                </div>
              </>
            ) : (
              <div className="no-client-selected">
                <FiUsers size={64} />
                <h3>Select a Client</h3>
                <p>Choose a client from the list to manage month locks</p>
              </div>
            )}
          </div>
        </div>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </AdminLayout>
  );
};

export default AdminMonthLock;