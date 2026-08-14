import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiTrendingUp,
  FiMessageSquare,
  FiBriefcase,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiInfo,
  FiCheck,
  FiXCircle,
  FiUsers,
  FiFileText,
  FiFolder,
  FiFile,
  FiBell,
  FiChevronLeft
} from "react-icons/fi";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmployeeLayout from "../Layout/EmployeeLayout";
import "./EmployeeDashboard.scss";
import EmployeeNotesPanel from "./EmpNotes/EmployeeNotesPanel";

const EmployeeDashboard = () => {
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("this_month");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [expandedMonths, setExpandedMonths] = useState({});
  const [selectedMonthDetails, setSelectedMonthDetails] = useState(null);
  const [showMonthDetailsModal, setShowMonthDetailsModal] = useState(false);

  // State for notes
  const [alertNotes, setAlertNotes] = useState({
    preview: [],
    hasUnviewedNotes: false,
    unviewedCount: 0,
    totalNotes: 0
  });

  // NEW STATES FOR CLIENT-WISE NOTES
  const [clientsSummary, setClientsSummary] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientNotes, setClientNotes] = useState([]);
  const [showClientsModal, setShowClientsModal] = useState(false);
  const [showClientNotesModal, setShowClientNotesModal] = useState(false);
  const [loadingClientNotes, setLoadingClientNotes] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [allNotes, setAllNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Time filter options
  const timeFilterOptions = [
    { value: "this_month", label: "This Month", icon: "📅" },
    { value: "last_month", label: "Last Month", icon: "📅" },
    { value: "last_3_months", label: "Last 3 Months", icon: "📅" },
    { value: "custom", label: "Custom Range", icon: "📅" }
  ];

  /* ==================== NEW CLIENT-WISE NOTES FUNCTIONS ==================== */
  const fetchClientsSummary = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee/notes/clients-summary`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setClientsSummary(response.data.clients);
      }
    } catch (error) {
      console.error("Error fetching clients summary:", error);
    }
  };

  const fetchClientNotes = async (clientId) => {
    try {
      setLoadingClientNotes(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee/notes/client/${clientId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setClientNotes(response.data.notes);
        setSelectedClient(response.data.client);
        setShowClientsModal(false);
        setShowClientNotesModal(true);
      }
    } catch (error) {
      console.error("Error fetching client notes:", error);
      toast.error("Error loading client notes", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
    } finally {
      setLoadingClientNotes(false);
    }
  };

  const markClientNotesAsViewed = async (clientId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/employee/notes/client/${clientId}/mark-viewed`,
        {},
        { withCredentials: true }
      );

      // Refresh data
      await fetchClientsSummary();
      await fetchDashboardData();

      // Update client notes state
      if (selectedClient && selectedClient.clientId === clientId) {
        setClientNotes(prev => prev.map(note => ({ ...note, isUnviewed: false, isNew: false })));
      }

      toast.success("Client notes marked as read!", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });

    } catch (error) {
      console.error("Error marking client notes as viewed:", error);
      toast.error("Error marking client notes as read", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
    }
  };

  const markAllNotesAsViewed = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/employee/notes/mark-all-viewed`,
        {},
        { withCredentials: true }
      );

      // Update local state
      setAlertNotes(prev => ({
        ...prev,
        hasUnviewedNotes: false,
        unviewedCount: 0,
        preview: prev.preview.map(note => ({
          ...note,
          isUnviewed: false,
          isNew: false
        }))
      }));

      // Refresh all data
      await fetchClientsSummary();
      await fetchDashboardData();

      toast.success("All notes marked as read!", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });

    } catch (error) {
      console.error("Error marking notes as viewed:", error);
      toast.error("Error marking notes as read", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
    }
  };

  const fetchAllNotes = async () => {
    try {
      setLoadingNotes(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee/notes/all-notes`,
        { params: { limit: 100 }, withCredentials: true }
      );

      if (response.data.success) {
        setAllNotes(response.data.notes);
        setShowNotesModal(true);
      }
    } catch (error) {
      console.error("Error fetching all notes:", error);
      toast.error("Error loading notes", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleViewAllNotes = async () => {
    // First show clients modal, not all notes directly
    await fetchClientsSummary();
    setShowClientsModal(true);
  };

  /* ==================== API CALLS ==================== */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const params = { timeFilter };
      if (timeFilter === "custom" && customStartDate && customEndDate) {
        params.customStart = customStartDate;
        params.customEnd = customEndDate;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee/dashboard/overview`,
        {
          params,
          withCredentials: true
        }
      );

      if (response.data.success) {
        setDashboardData(response.data);

        // Check for alert notes in response
        if (response.data.alertInfo) {
          setAlertNotes({
            preview: response.data.alertInfo.previewNotes || [],
            hasUnviewedNotes: response.data.alertInfo.hasUnviewedNotes,
            unviewedCount: response.data.alertInfo.unviewedNotesCount || 0,
            totalNotes: response.data.alertInfo.totalNotes || 0
          });
        }

        // Expand first month by default if exists
        if (response.data.data && response.data.data.length > 0) {
          const firstMonthKey = `${response.data.data[0].year}_${response.data.data[0].month}`;
          setExpandedMonths({ [firstMonthKey]: true });
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showToast("Error loading dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthDetails = async (year, month) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee/dashboard/month-details`,
        {
          params: { year, month },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setSelectedMonthDetails(response.data);
        setShowMonthDetailsModal(true);
      }
    } catch (error) {
      console.error("Error fetching month details:", error);
      showToast("Error loading month details", "error");
    }
  };

  /* ==================== HELPER FUNCTIONS ==================== */
  const showToast = (message, type = "success") => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      theme: "dark"
    });
  };

  const handleTimeFilterChange = (newFilter) => {
    setTimeFilter(newFilter);
    setShowCustomDate(newFilter === "custom");

    if (newFilter !== "custom") {
      setCustomStartDate("");
      setCustomEndDate("");
    }
  };

  const applyCustomDateFilter = () => {
    if (!customStartDate || !customEndDate) {
      showToast("Please select both start and end dates", "warning");
      return;
    }

    const start = new Date(customStartDate);
    const end = new Date(customEndDate);

    if (start > end) {
      showToast("Start date must be before end date", "warning");
      return;
    }

    fetchDashboardData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const toggleMonthExpansion = (year, month) => {
    const key = `${year}_${month}`;
    setExpandedMonths(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getFilterDisplayText = () => {
    const filter = timeFilterOptions.find(f => f.value === timeFilter);
    if (timeFilter === "custom" && customStartDate && customEndDate) {
      return `${formatDate(customStartDate)} to ${formatDate(customEndDate)}`;
    }
    return filter?.label || "This Month";
  };

  // Set default custom dates to current month
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setCustomStartDate(firstDay.toISOString().split('T')[0]);
    setCustomEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter, customStartDate, customEndDate]);

  // Fetch clients summary on mount
  useEffect(() => {
    fetchClientsSummary();
  }, []);

  /* ==================== RENDER FUNCTIONS ==================== */

  const renderStandaloneNotesSection = () => {
    const totalClientsWithNotes = clientsSummary.length;
    const totalUnviewed = clientsSummary.reduce((sum, client) => sum + client.unviewedNotes, 0);

    // If NO notes at all, don't show section
    if (totalClientsWithNotes === 0) {
      return null;
    }

    return (
      <div className="standalone-notes-section">
        <div className="section-header">
          <h3><FiMessageSquare size={24} /> Notes Overview</h3>
          <div className="notes-summary-badge">
            <span className="total-notes">Clients with notes: {totalClientsWithNotes}</span>
            {totalUnviewed > 0 && (
              <span className="unviewed-notes">• {totalUnviewed} unread</span>
            )}
            <button
              className="mark-all-viewed-btn-small"
              onClick={markAllNotesAsViewed}
              disabled={totalUnviewed === 0}
            >
              <FiCheck size={14} /> Mark All Read
            </button>
          </div>
        </div>

        <div className="notes-grid">
          {clientsSummary.slice(0, 4).map((client, index) => (
            <div key={index} className="client-notes-card">
              <div className="client-notes-card-header">
                <span className="client-name-badge">
                  <FiUser size={14} /> {client.clientName}
                </span>
                {client.unviewedNotes > 0 && (
                  <span className="client-unread-badge">{client.unviewedNotes} unread</span>
                )}
              </div>

              <div className="client-notes-card-content">
                <p className="client-business">{client.businessName}</p>
                <p className="client-email">
                  <FiMail size={12} /> {client.clientEmail}
                </p>
              </div>

              <div className="client-notes-card-footer">
                <button
                  className="view-client-notes-btn"
                  onClick={() => fetchClientNotes(client.clientId)}
                >
                  <FiEye size={14} /> View Notes
                </button>
                {client.unviewedNotes > 0 && (
                  <button
                    className="mark-client-read-btn"
                    onClick={() => markClientNotesAsViewed(client.clientId)}
                  >
                    <FiCheck size={14} /> Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {totalClientsWithNotes > 4 && (
          <div className="notes-section-footer">
            <button
              className="view-all-notes-btn-standalone"
              onClick={handleViewAllNotes}
            >
              <FiEye size={16} /> View All Clients ({totalClientsWithNotes})
            </button>
          </div>
        )}
      </div>
    );
  };

  // Clients List Modal
  const renderClientsModal = () => {
    if (!showClientsModal) return null;

    const totalUnviewed = clientsSummary.reduce((sum, client) => sum + client.unviewedNotes, 0);

    return (
      <div className="modal-overlay clients-modal-overlay">
        <div className="modal clients-modal">
          <div className="modal-header">
            <div className="modal-header-left">
              <FiUsers size={24} />
              <h3>Clients with Notes ({clientsSummary.length})</h3>
              {totalUnviewed > 0 && (
                <span className="modal-unviewed-badge">
                  {totalUnviewed} unread notes
                </span>
              )}
            </div>
            <div className="modal-header-right">
              <button
                className="mark-all-modal-btn"
                onClick={markAllNotesAsViewed}
                disabled={totalUnviewed === 0}
              >
                <FiCheck size={16} /> Mark All as Read
              </button>
              <button
                className="close-modal"
                onClick={() => {
                  setShowClientsModal(false);
                  setClientsSummary([]);
                }}
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          <div className="modal-body clients-modal-body">
            {clientsSummary.length === 0 ? (
              <div className="empty-clients">
                <FiMessageSquare size={48} />
                <h4>No clients with notes</h4>
                <p>You don't have any notes from clients yet.</p>
              </div>
            ) : (
              <div className="clients-list-modal">
                {clientsSummary.map((client, index) => (
                  <div key={index} className="client-item-modal">
                    <div className="client-item-header">
                      <div className="client-info">
                        <h4>{client.clientName}</h4>
                        <p className="client-business">{client.businessName}</p>
                        <p className="client-contact">
                          <FiMail size={12} /> {client.clientEmail}
                          {client.clientPhone && (
                            <>
                              <span className="contact-separator">•</span>
                              <FiPhone size={12} /> {client.clientPhone}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="client-notes-info">
                        <span className={`unread-count ${client.unviewedNotes > 0 ? 'has-unread' : ''}`}>
                          {client.unviewedNotes} unread
                        </span>
                      </div>
                    </div>

                    <div className="client-item-actions">
                      <button
                        className="view-client-btn"
                        onClick={() => fetchClientNotes(client.clientId)}
                      >
                        <FiEye size={14} /> View Notes
                      </button>
                      {client.unviewedNotes > 0 && (
                        <button
                          className="mark-client-read-btn"
                          onClick={() => markClientNotesAsViewed(client.clientId)}
                        >
                          <FiCheck size={14} /> Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Client Notes Modal
  const renderClientNotesModal = () => {
    if (!showClientNotesModal || !selectedClient) return null;

    const clientUnviewedCount = clientNotes.filter(note => note.isUnviewed).length;

    return (
      <div className="modal-overlay client-notes-modal-overlay">
        <div className="modal client-notes-modal">
          <div className="modal-header">
            <div className="modal-header-left">
              <button
                className="back-to-clients"
                onClick={() => {
                  setShowClientNotesModal(false);
                  setShowClientsModal(true);
                }}
              >
                <FiChevronLeft size={20} />
              </button>
              <div>
                <h3>{selectedClient.clientName}'s Notes</h3>
                <p className="client-subtitle">
                  <FiMail size={14} /> {selectedClient.clientEmail}
                </p>
              </div>
              {clientUnviewedCount > 0 && (
                <span className="modal-unviewed-badge">
                  {clientUnviewedCount} unread
                </span>
              )}
            </div>
            <div className="modal-header-right">
              <button
                className="mark-all-modal-btn"
                onClick={() => markClientNotesAsViewed(selectedClient.clientId)}
                disabled={clientUnviewedCount === 0}
              >
                <FiCheck size={16} /> Mark All as Read
              </button>
              <button
                className="close-modal"
                onClick={() => {
                  setShowClientNotesModal(false);
                  setSelectedClient(null);
                  setClientNotes([]);
                }}
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          <div className="modal-body client-notes-modal-body">
            {loadingClientNotes ? (
              <div className="loading-notes">
                <div className="spinner"></div>
                <p>Loading client notes...</p>
              </div>
            ) : clientNotes.length === 0 ? (
              <div className="empty-notes">
                <FiMessageSquare size={48} />
                <h4>No notes found</h4>
                <p>{selectedClient.clientName} doesn't have any notes yet.</p>
              </div>
            ) : (
              <div className="client-notes-list">
                {clientNotes.map((note, index) => (
                  <div
                    key={index}
                    className={`note-item-full ${note.source} ${note.isUnviewed ? 'unviewed' : ''}`}
                  >
                    <div className="note-full-header">
                      <div className="note-full-type">
                        <span className={`note-source ${note.source}`}>
                          {note.source === 'client' ? '📝 Client Note' : '👨‍💼 Your Note'}
                        </span>
                        <span className="note-category-full">{note.category}</span>
                        {note.isUnviewed && (
                          <span className="new-badge-full">NEW</span>
                        )}
                      </div>
                      <span className="note-full-date">
                        <FiClock size={12} /> {formatDate(note.addedAt)}
                      </span>
                    </div>

                    {note.fileName && (
                      <div className="note-file-info">
                        <FiFileText size={14} />
                        <span>{note.fileName}</span>
                      </div>
                    )}

                    <div className="note-full-content">
                      <p>{note.fullNote || note.note}</p>
                    </div>

                    <div className="note-full-footer">
                      <span className="note-month">
                        {note.monthName} {note.year}
                      </span>
                      <span className="note-added-by">
                        Added by: {note.addedBy || (note.source === 'employee' ? 'You' : 'Client')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // All Notes Modal (Old - kept for backward compatibility)
  const renderAllNotesModal = () => {
    if (!showNotesModal) return null;

    return (
      <div className="modal-overlay notes-modal-overlay">
        <div className="modal notes-modal">
          <div className="modal-header">
            <div className="modal-header-left">
              <FiMessageSquare size={24} />
              <h3>All Notes ({allNotes.length})</h3>
              {alertNotes.hasUnviewedNotes && (
                <span className="modal-unviewed-badge">
                  {alertNotes.unviewedCount} unread
                </span>
              )}
            </div>
            <div className="modal-header-right">
              <button
                className="mark-all-modal-btn"
                onClick={markAllNotesAsViewed}
                disabled={!alertNotes.hasUnviewedNotes}
              >
                <FiCheck size={16} /> Mark All as Read
              </button>
              <button
                className="close-modal"
                onClick={() => {
                  setShowNotesModal(false);
                  setAllNotes([]);
                }}
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          <div className="modal-body notes-modal-body">
            {loadingNotes ? (
              <div className="loading-notes">
                <div className="spinner"></div>
                <p>Loading notes...</p>
              </div>
            ) : allNotes.length === 0 ? (
              <div className="empty-notes">
                <FiMessageSquare size={48} />
                <h4>No notes found</h4>
                <p>You don't have any notes yet.</p>
              </div>
            ) : (
              <div className="all-notes-list">
                {allNotes.map((note, index) => (
                  <div
                    key={index}
                    className={`note-item-full ${note.source} ${note.isUnviewed ? 'unviewed' : ''}`}
                  >
                    <div className="note-full-header">
                      <div className="note-full-type">
                        <span className={`note-source ${note.source}`}>
                          {note.source === 'client' ? '📝 Client Note' : '👨‍💼 Your Note'}
                        </span>
                        <span className="note-category-full">{note.category}</span>
                        {note.isUnviewed && (
                          <span className="new-badge-full">NEW</span>
                        )}
                      </div>
                      <span className="note-full-date">
                        <FiClock size={12} /> {formatDate(note.addedAt)}
                      </span>
                    </div>

                    <div className="note-client-info">
                      <FiUser size={14} />
                      <span className="client-name-full">{note.clientName}</span>
                      {note.clientEmail && (
                        <span className="client-email-full">
                          <FiMail size={12} /> {note.clientEmail}
                        </span>
                      )}
                    </div>

                    {note.fileName && (
                      <div className="note-file-info">
                        <FiFileText size={14} />
                        <span>{note.fileName}</span>
                      </div>
                    )}

                    <div className="note-full-content">
                      <p>{note.fullNote || note.note}</p>
                    </div>

                    <div className="note-full-footer">
                      <span className="note-added-by">
                        Added by: {note.addedBy || (note.source === 'employee' ? 'You' : 'Client')}
                      </span>
                      <span className="note-month">
                        {note.monthName} {note.year}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Rest of your existing render functions...
  const renderEmployeeInfo = () => {
    if (!dashboardData?.employee) return null;

    const employee = dashboardData.employee;

    return (
      <div className="employee-info-card">
        <div className="employee-header">
          <div className="employee-avatar">
            <FiUser size={32} />
          </div>
          <div className="employee-details">
            <h3>{employee.name}</h3>
            <span className={`status-badge ${employee.isActive === 'Active' ? 'active' : 'inactive'}`}>
              {employee.isActive}
            </span>
          </div>
        </div>

        <div className="employee-contact">
          <div className="contact-item">
            <FiMail size={16} />
            <span>{employee.email}</span>
          </div>
          <div className="contact-item">
            <FiPhone size={16} />
            <span>{employee.phone}</span>
          </div>
          <div className="contact-item">
            <FiCalendar size={16} />
            <span>Active Since: {employee.activeSince}</span>
          </div>
        </div>

        <div className="employee-stats">
          <div className="stat-item">
            <span className="stat-label">Assigned Clients</span>
            <span className="stat-value">{dashboardData.summaries?.totalClients || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending Tasks</span>
            <span className="stat-value pending">{dashboardData.summaries?.tasks?.pendingTasks || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed Tasks</span>
            <span className="stat-value completed">{dashboardData.summaries?.tasks?.totalCompleted || 0}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderTaskStatus = (tasks) => {
    const { list, summary } = tasks;

    if (list.length === 0) {
      return (
        <div className="empty-tasks">
          <FiAlertCircle size={24} />
          <p>No tasks assigned for this month</p>
        </div>
      );
    }

    const pendingTasks = list.filter(task => !task.accountingDone);

    return (
      <div className="tasks-section">
        <div className="section-header">
          <h4><FiCheckCircle size={18} /> Pending Tasks ({pendingTasks.length})</h4>
          <span className="task-summary">
            {summary.completedTasks}/{summary.totalTasks} completed
          </span>
        </div>

        <div className="tasks-list">
          {pendingTasks.slice(0, 5).map((task, index) => (
            <div key={index} className="task-item pending">
              <div className="task-header">
                <span className="task-status">
                  {task.accountingDone ? '✅' : '⏳'}
                </span>
                <span className="task-name">{task.taskName}</span>
              </div>

              <div className="task-details">
                <div className="client-info">
                  <span className="client-name">
                    <FiUser size={12} /> {task.clientName}
                  </span>
                </div>
                <div className="task-progress">
                  <span className="progress-status pending">
                    {task.accountingDone ? (
                      <>✅ Completed on {formatDate(task.accountingDoneAt)}</>
                    ) : (
                      <>⏳ Pending - Assigned on {formatDate(task.assignedAt)}</>
                    )}
                  </span>
                  {task.assignedBy && (
                    <span className="assigned-by">
                      Assigned by: {task.adminName || task.assignedBy}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {pendingTasks.length > 5 && (
            <button className="view-all-tasks">
              View all {pendingTasks.length} tasks <FiChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderNotes = (notes) => {
    const { list, summary } = notes;

    if (list.length === 0) return null;

    return (
      <div className="notes-section">
        <div className="section-header">
          <h4><FiMessageSquare size={18} /> Recent Notes</h4>
          <span className="notes-count">
            {summary.totalNotes} notes ({summary.clientNotes} client, {summary.employeeNotes} yours)
            {summary.unviewedNotes > 0 && (
              <span className="notes-unviewed-count">
                • {summary.unviewedNotes} unread
              </span>
            )}
          </span>
        </div>

        <div className="notes-list">
          {list.slice(0, 3).map((note, index) => (
            <div key={index} className={`note-item ${note.source} ${note.isUnviewed ? 'unviewed' : ''}`}>
              <div className="note-header">
                <span className={`note-type ${note.source}`}>
                  {note.source === 'client' ?
                    (note.type === 'month_note' ? '📝 Client Note' : '📝 Client Note')
                    : '👨‍💼 Your Note'
                  }
                </span>
                <span className="note-client">{note.clientName}</span>
                {note.isUnviewed && (
                  <span className="note-new-badge">NEW</span>
                )}
                <span className="note-date">
                  <FiClock size={12} /> {formatDate(note.addedAt)}
                </span>
              </div>
              <div className="note-content">
                <p>{note.note}</p>
              </div>
              {note.source === 'client' && (
                <div className="note-footer">
                  <span className="note-category">{note.category}</span>
                  {note.fileName && (
                    <span className="note-filename">File: {note.fileName}</span>
                  )}
                </div>
              )}
            </div>
          ))}

          {list.length > 3 && (
            <button
              className="view-all-notes"
              onClick={() => {
                if (dashboardData.data && dashboardData.data.length > 0) {
                  const monthData = dashboardData.data[0];
                  fetchMonthDetails(monthData.year, monthData.month);
                }
              }}
            >
              View all notes <FiChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderMonthCard = (monthData, index) => {
    const key = `${monthData.year}_${monthData.month}`;
    const isExpanded = expandedMonths[key] || false;
    const pendingTasks = monthData.tasks.list.filter(task => !task.accountingDone);

    return (
      <div key={index} className="month-card">
        <div
          className="month-header"
          onClick={() => toggleMonthExpansion(monthData.year, monthData.month)}
        >
          <div className="month-title">
            <h3>
              {monthData.monthName} {monthData.year}
              <span className="month-status">
                {monthData.monthStatus.allTasksCompleted ? (
                  <span className="status-completed">✅ All Tasks Completed</span>
                ) : monthData.monthStatus.hasPendingTasks ? (
                  <span className="status-pending">⏳ {pendingTasks.length} Pending Tasks</span>
                ) : (
                  <span className="status-no-tasks">📭 No Assignments</span>
                )}
              </span>
            </h3>
            <p className="month-summary">
              {monthData.clients.length} clients • {monthData.tasks.summary.pendingTasks} pending tasks • {monthData.notes.summary.totalNotes} notes
              {monthData.notes.summary.unviewedNotes > 0 && (
                <span className="month-unviewed-notes">
                  • {monthData.notes.summary.unviewedNotes} unread
                </span>
              )}
            </p>
          </div>

          <div className="month-actions">
            <button
              className="view-details-btn"
              onClick={(e) => {
                e.stopPropagation();
                fetchMonthDetails(monthData.year, monthData.month);
              }}
            >
              <FiEye size={16} /> Details
            </button>
            <span className="expand-icon">
              {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="month-content">
            <div className="content-grid">
              <div className="grid-column">
                <div className="clients-section">
                  <div className="section-header">
                    <h4><FiUsers size={18} /> Assigned Clients ({monthData.clients.length})</h4>
                  </div>
                  <div className="clients-list">
                    {monthData.clients.map((client, idx) => (
                      <div key={idx} className="client-item">
                        <div className="client-header">
                          <span className="client-name">{client.clientName}</span>
                          <span className="client-tasks">
                            {client.tasks.filter(t => !t.accountingDone).length} pending
                          </span>
                        </div>
                        <div className="client-details">
                          <span className="client-email">
                            <FiMail size={12} /> {client.clientEmail}
                          </span>
                          <span className="client-business">
                            <FiBriefcase size={12} /> {client.businessName || "No business name"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid-column">
                {renderTaskStatus(monthData.tasks)}
              </div>

              <div className="grid-column">
                {renderNotes(monthData.notes)}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMonthDetailsModal = () => {
    if (!selectedMonthDetails) return null;

    return (
      <div className="modal-overlay">
        <div className="modal month-details-modal">
          <div className="modal-header">
            <h3>
              <FiCalendar size={24} />
              {selectedMonthDetails.month.monthName} {selectedMonthDetails.month.year} - Detailed View
            </h3>
            <button
              className="close-modal"
              onClick={() => setShowMonthDetailsModal(false)}
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="modal-body">
            <div className="modal-section">
              <h4><FiUsers size={20} /> Assigned Clients ({selectedMonthDetails.clients.length})</h4>
              <div className="clients-grid">
                {selectedMonthDetails.clients.map((client, index) => (
                  <div key={index} className="client-card">
                    <div className="client-card-header">
                      <h5>{client.clientName}</h5>
                      <span className="client-tasks-badge">
                        {client.pendingTasks} pending • {client.completedTasks} completed
                      </span>
                    </div>

                    <div className="client-card-details">
                      <div className="client-contact">
                        <div className="contact-item">
                          <FiMail size={14} /> {client.clientEmail}
                        </div>
                        <div className="contact-item">
                          <FiPhone size={14} /> {client.clientPhone}
                        </div>
                        <div className="contact-item">
                          <FiBriefcase size={14} /> {client.businessName}
                        </div>
                        <div className="contact-item">
                          <FiFileText size={14} /> VAT: {client.vatPeriod}
                        </div>
                      </div>

                      <div className="client-tasks">
                        <h6>Assigned Tasks:</h6>
                        {client.tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className={`task-item-modal ${task.accountingDone ? 'completed' : 'pending'}`}>
                            <div className="task-header-modal">
                              <span className="task-name">{task.taskName}</span>
                              <span className={`task-status ${task.accountingDone ? 'completed' : 'pending'}`}>
                                {task.accountingDone ? '✅ Completed' : '⏳ Pending'}
                              </span>
                            </div>
                            {task.assignedAt && (
                              <div className="task-info">
                                Assigned: {formatDate(task.assignedAt)}
                                {task.assignedBy && ` by ${task.adminName || task.assignedBy}`}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <h4><FiMessageSquare size={20} /> All Notes ({selectedMonthDetails.notes.total})</h4>
              {selectedMonthDetails.notes.unviewedCount > 0 && (
                <div className="unviewed-notes-header">
                  <span className="unviewed-count-badge">
                    {selectedMonthDetails.notes.unviewedCount} unread notes
                  </span>
                  <button
                    className="mark-month-viewed-btn"
                    onClick={async () => {
                      await markAllNotesAsViewed();
                      setShowMonthDetailsModal(false);
                    }}
                  >
                    <FiCheck size={14} /> Mark all as read
                  </button>
                </div>
              )}
              <div className="notes-list-modal">
                {selectedMonthDetails.notes.list.map((note, index) => (
                  <div key={index} className={`note-card ${note.source} ${note.isUnviewed ? 'unviewed' : ''}`}>
                    <div className="note-card-header">
                      <span className={`note-card-type ${note.source}`}>
                        {note.source === 'client' ?
                          (note.type === 'month_note' ? '📝 Client Note' : '📝 Client Note')
                          : '👨‍💼 Your Note'
                        }
                      </span>
                      <span className="note-card-client">{note.clientName}</span>
                      {note.isUnviewed && (
                        <span className="note-card-new-badge">NEW</span>
                      )}
                      <span className="note-card-date">
                        {formatDate(note.addedAt)}
                      </span>
                    </div>
                    <div className="note-card-content">
                      <p>{note.note}</p>
                    </div>
                    <div className="note-card-footer">
                      <span className="note-card-category">
                        {note.category} {note.fileName ? `• File: ${note.fileName}` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ==================== MAIN RENDER ==================== */
  return (
    <EmployeeLayout>
      <ToastContainer />
      <div className="employee-dashboard">
        {/* Header */}
        <div className="header-section">
          <div className="title-section">
            <h1 className="page-title">
              <FiTrendingUp size={28} /> Employee Dashboard
            </h1>
            <p className="page-subtitle">
              Manage your assigned tasks and client communications
            </p>
          </div>

          <div className="action-section">
            <button
              className="refresh-btn"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <FiRefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>

        {/* Employee Info & Stats */}
        <div className="employee-summary-section">
          {renderEmployeeInfo()}
        </div>
        
        <div>
          <EmployeeNotesPanel />
        </div>

        {/* NEW: Standalone Notes Section (Client-wise) */}
        {/* {renderStandaloneNotesSection()}  */}

        {/* Time Filter */}
        <div className="filter-section">
          <div className="filter-header">
            <h3>
              <FiFilter size={20} /> Time Period: <span className="current-filter">{getFilterDisplayText()}</span>
            </h3>
            <p>Select time period to view your assignments</p>
          </div>
          <div className="filter-buttons">
            {timeFilterOptions.map(filter => (
              <button
                key={filter.value}
                className={`filter-btn ${timeFilter === filter.value ? 'active' : ''}`}
                onClick={() => handleTimeFilterChange(filter.value)}
                disabled={loading}
              >
                <span className="filter-icon">{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          {showCustomDate && (
            <div className="custom-date-range">
              <div className="date-inputs">
                <div className="date-input-group">
                  <label>
                    <FiCalendar size={16} /> Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    disabled={loading}
                    className="date-input"
                  />
                </div>
                <div className="date-input-group">
                  <label>
                    <FiCalendar size={16} /> End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    disabled={loading}
                    className="date-input"
                  />
                </div>
                <button
                  className="apply-date-btn"
                  onClick={applyCustomDateFilter}
                  disabled={loading || !customStartDate || !customEndDate}
                >
                  <FiCheck size={16} /> Apply Date Range
                </button>
              </div>
              <p className="date-range-hint">
                Selected: {formatDate(customStartDate)} to {formatDate(customEndDate)}
              </p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your dashboard data...</p>
          </div>
        ) : dashboardData && dashboardData.data && dashboardData.data.length > 0 ? (
          <>
            {/* Months Data */}
            <div className="months-container">
              <h3 className="section-title">
                <FiCalendar size={24} /> Monthly Assignments
              </h3>
              {dashboardData.data.map((monthData, index) => renderMonthCard(monthData, index))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h4>No assignments found</h4>
            <p>You don't have any assignments for the selected time period</p>
          </div>
        )}

        {/* All Notes Modal (Old) */}
        {renderAllNotesModal()}

        {/* NEW: Clients Modal */}
        {renderClientsModal()}

        {/* NEW: Client Notes Modal */}
        {renderClientNotesModal()}

        {/* Month Details Modal */}
        {showMonthDetailsModal && renderMonthDetailsModal()}
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;