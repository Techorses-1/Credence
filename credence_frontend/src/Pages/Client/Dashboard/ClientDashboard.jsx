import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiFolder,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiTrendingUp,
  FiMessageSquare,
  FiUser,
  FiPhone,
  FiMail,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiInfo,
  FiDollarSign,
  FiCheck,
  FiXCircle,
  FiBriefcase,
  FiMapPin,
  FiFile,
  FiCreditCard,
  FiBell
} from "react-icons/fi";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ClientLayout from "../Layout/ClientLayout";
import "./ClientDashboard.scss";
import ConsentUpdateModal from "../Consentupdatemodal/Consentupdatemodal";

const ClientDashboard = () => {
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
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [allNotes, setAllNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Payment Reminder State
  const [showPaymentReminder, setShowPaymentReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState("");

  // Time filter options
  const timeFilterOptions = [
    { value: "this_month", label: "This Month", icon: "📅" },
    { value: "last_month", label: "Last Month", icon: "📅" },
    { value: "last_3_months", label: "Last 3 Months", icon: "📅" },
    { value: "custom", label: "Custom Range", icon: "📅" }
  ];

  /* ==================== PAYMENT REMINDER SYSTEM ==================== */
  useEffect(() => {
    checkPaymentReminder();
  }, []);

  const checkPaymentReminder = () => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Check if today is reminder day (20th or 25th)
    const isReminderDay = currentDay === 20 || currentDay === 25;

    if (!isReminderDay) {
      setShowPaymentReminder(false);
      return;
    }

    // Get client ID from localStorage or context
    const clientId = localStorage.getItem("clientId") || "current_client";
    const reminderKey = `payment_reminder_${clientId}_${currentYear}_${currentMonth}`;
    const userAction = localStorage.getItem(reminderKey);

    // Determine if we should show reminder
    let shouldShow = false;
    let message = "";

    if (currentDay === 20) {
      message = "💰 Payment Reminder: Monthly payment is due. Please make your payment by the 25th.";

      if (userAction === null) {
        shouldShow = true;
      } else if (userAction === "will_pay") {
        shouldShow = true;
      }
    } else if (currentDay === 25) {
      message = "⏰ Final Payment Reminder: Today is the last day for monthly payment.";

      if (userAction === "will_pay") {
        shouldShow = true;
      } else if (userAction === null) {
        shouldShow = true;
      }
    }

    setReminderMessage(message);
    setShowPaymentReminder(shouldShow && userAction !== "paid");
  };

  const handlePaymentAction = (action) => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const clientId = localStorage.getItem("clientId") || "current_client";
    const reminderKey = `payment_reminder_${clientId}_${currentYear}_${currentMonth}`;

    localStorage.setItem(reminderKey, action);

    if (action === "paid") {
      toast.success("✅ Payment marked as completed. Thank you!", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
    } else if (action === "will_pay") {
      toast.info("📅 Reminder set for 25th. Thank you!", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
    }

    setShowPaymentReminder(false);
  };

  const dismissReminder = () => {
    setShowPaymentReminder(false);
  };

  const fetchAllNotes = async () => {
    try {
      setLoadingNotes(true);

      if (dashboardData && dashboardData.data) {
        // Get ALL notes from ALL months in dashboard data
        let allNotesFromData = [];
        dashboardData.data.forEach(monthData => {
          if (monthData.notes && monthData.notes.list) {
            allNotesFromData = [...allNotesFromData, ...monthData.notes.list];
          }
        });

        // Also include notes from the backend API (if available)
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/client/notes/alert-preview`,
            {
              params: { limit: 100 },
              withCredentials: true
            }
          );

          if (response.data.success && response.data.preview) {
            // Merge API notes with dashboard notes
            const apiNotes = response.data.preview || [];
            // Combine and remove duplicates
            const combinedNotes = [...allNotesFromData, ...apiNotes];
            const uniqueNotes = Array.from(
              new Map(
                combinedNotes.map(note => [
                  `${note.note}-${note.addedAt}-${note.category}`,
                  note
                ])
              ).values()
            );

            setAllNotes(uniqueNotes);
          } else {
            setAllNotes(allNotesFromData);
          }
        } catch (apiError) {
          // If API fails, use dashboard data
          setAllNotes(allNotesFromData);
        }

        setShowNotesModal(true);
      } else {
        toast.error("No notes data available", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark"
        });
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

  const markAllNotesAsViewed = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/client/notes/mark-all-viewed`,
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

      // Refresh dashboard data
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

  const handleViewAllNotes = async () => {
    await fetchAllNotes();
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
        `${import.meta.env.VITE_API_URL}/client/dashboard/overview`,
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

        // Expand first month by default
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
        `${import.meta.env.VITE_API_URL}/client/dashboard/month-details`,
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

  const getMonthName = (month) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "";
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

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter, customStartDate, customEndDate]);

  /* ==================== RENDER FUNCTIONS ==================== */

  const renderStandaloneNotesSection = () => {
    // Get ALL notes from ALL months in dashboard data
    const getAllNotesFromDashboard = () => {
      if (!dashboardData || !dashboardData.data) return [];

      let allNotes = [];
      dashboardData.data.forEach(monthData => {
        if (monthData.notes && monthData.notes.list) {
          allNotes = [...allNotes, ...monthData.notes.list];
        }
      });

      return allNotes;
    };

    const allNotes = getAllNotesFromDashboard();
    const totalNotes = allNotes.length;
    const unviewedNotes = allNotes.filter(note => note.isUnviewed || note.isUnviewedByClient).length;

    // If NO notes at all, don't show section
    if (totalNotes === 0) {
      return null;
    }

    return (
      <div className="notes-overview-section">
        <div className="notes-overview-header">
          <h3><FiMessageSquare size={24} /> Notes Overview</h3>
          <div className="notes-overview-stats">
            <div className="stats-item">
              <span className="stats-number total-notes">{totalNotes}</span>
              <span className="stats-label">Total Notes</span>
            </div>
            <div className="stats-item">
              <span className="stats-number unread-notes">{unviewedNotes}</span>
              <span className="stats-label">Unread Notes</span>
            </div>
          </div>
        </div>

        <div className="notes-overview-actions">
          <button
            className="notes-action-btn view-all-btn"
            onClick={handleViewAllNotes}
          >
            <FiEye size={16} /> View All Notes
          </button>
          <button
            className="notes-action-btn mark-read-btn"
            onClick={markAllNotesAsViewed}
            disabled={unviewedNotes === 0}
          >
            <FiCheck size={16} /> Mark All as Read
          </button>
        </div>

        <div className="notes-overview-grid">
          {allNotes.slice(0, 4).map((note, index) => (
            <div
              key={index}
              className={`note-overview-card ${note.isUnviewed || note.isUnviewedByClient ? 'unviewed' : ''}`}
            >
              <div className="note-card-header">
                <span className={`note-source-badge ${note.source}`}>
                  {note.source === 'client' ? '📝 Your Note' : '👨‍💼 Employee'}
                </span>
                {(note.isUnviewed || note.isUnviewedByClient) && (
                  <span className="new-badge-overview">NEW</span>
                )}
              </div>

              <div className="note-card-content">
                <p className="note-text">
                  {note.note.length > 100 ? note.note.substring(0, 100) + '...' : note.note}
                </p>
              </div>

              <div className="note-card-footer">
                <span className="note-category">{note.category}</span>
                <span className="note-date">
                  <FiCalendar size={12} /> {formatDate(note.addedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {totalNotes > 4 && (
          <div className="notes-overview-footer">
            <button
              className="view-more-notes-btn"
              onClick={handleViewAllNotes}
            >
              <FiChevronDown size={16} /> Load More Notes ({totalNotes - 4} more)
            </button>
          </div>
        )}
      </div>
    );
  };

  // All Notes Modal
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
                    className={`note-item-full ${note.isUnviewed || note.isUnviewedByClient ? 'unviewed' : ''} ${note.source}`}
                  >
                    <div className="note-full-header">
                      <div className="note-full-type">
                        <span className={`note-source ${note.source}`}>
                          {note.source === 'client' ? '📝 Your Note' : '👨‍💼 Employee'}
                        </span>
                        <span className="note-category-full">{note.category}</span>
                        {/* ADD THIS LINE FOR NEW BADGE */}
                        {(note.isUnviewed || note.isUnviewedByClient) && (
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
                      <span className="note-added-by">
                        Added by: {note.addedBy || (note.source === 'client' ? 'You' : 'Employee')}
                      </span>
                      <span className="note-month">
                        {note.month}
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

  const renderDocumentStatus = (documents) => {
    const { requiredCategories, otherCategories, summary } = documents;

    return (
      <div className="documents-section">
        <div className="section-header">
          <h4><FiFolder size={18} /> Documents Status</h4>
          <span className={`status-badge ${summary.status}`}>
            {summary.uploadedCategories}/{summary.totalRequiredCategories} uploaded
          </span>
        </div>

        <div className="documents-list">
          {requiredCategories.map((category, index) => (
            <div key={index} className="document-category">
              <div className="category-header">
                <span className={`status-indicator ${category.status}`}>
                  {category.status === 'uploaded' ? '✅' : '❌'}
                </span>
                <span className="category-name">{category.category}</span>
              </div>

              <div className="files-list">
                {category.status === 'uploaded' ? (
                  category.files.map((file, fileIndex) => (
                    <div key={fileIndex} className="file-item">
                      <FiFileText size={14} />
                      <span className="file-name">{file.fileName}</span>
                      <span className="file-date">
                        {formatDate(file.uploadedAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="no-files">
                    <FiAlertCircle size={14} />
                    <span>No files uploaded</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {otherCategories.filter(cat => cat.uploadedFiles > 0).length > 0 && (
            <div className="other-categories">
              <h5>Other Categories:</h5>
              {otherCategories
                .filter(cat => cat.uploadedFiles > 0)
                .map((category, index) => (
                  <div key={index} className="document-category">
                    <div className="category-header">
                      <span className="status-indicator uploaded">
                        ✅
                      </span>
                      <span className="category-name">{category.categoryName}</span>
                    </div>
                    <div className="files-list">
                      {category.files.map((file, fileIndex) => (
                        <div key={fileIndex} className="file-item">
                          <FiFileText size={14} />
                          <span className="file-name">{file.fileName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTaskStatus = (tasks) => {
    const { list, summary } = tasks;

    return (
      <div className="tasks-section">
        <div className="section-header">
          <h4><FiCheckCircle size={18} /> Task Assignments</h4>
          <span className="status-badge">
            {summary.assignedTasks}/{summary.totalTasks} assigned • {summary.completedTasks} completed
          </span>
        </div>

        <div className="tasks-list">
          {list.map((task, index) => (
            <div key={index} className={`task-item ${task.status}`}>
              <div className="task-header">
                <span className={`task-status ${task.accountingDone ? 'completed' : task.status}`}>
                  {task.accountingDone ? '✅' : task.status === 'assigned' ? '🔄' : '❌'}
                </span>
                <span className="task-name">{task.taskName}</span>
              </div>

              <div className="task-details">
                {task.status === 'assigned' ? (
                  <>
                    {/* REMOVED: assigned-info div with employee name and email */}

                    <div className="task-progress">
                      <span className={`progress-status ${task.accountingDone ? 'completed' : 'pending'}`}>
                        {task.accountingDone ? (
                          <>✅ Completed on {formatDate(task.accountingDoneAt)}</>
                        ) : (
                          <>⏳ In Progress (Assigned to Employee)</>
                        )}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="not-assigned">
                    <FiAlertCircle size={12} /> Task not assigned yet
                  </div>
                )}
              </div>
            </div>
          ))}
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
            {summary.totalNotes} notes ({summary.clientNotes} yours, {summary.employeeNotes} employee)
            {summary.unviewedNotes > 0 && (
              <span className="notes-unviewed-count">
                • {summary.unviewedNotes} unread
              </span>
            )}
          </span>
        </div>

        <div className="notes-list">
          {list.slice(0, 3).map((note, index) => (
            <div key={index} className={`note-item ${note.source} ${note.isUnviewedByClient ? 'unviewed' : ''}`}>
              <div className="note-header">
                <span className={`note-type ${note.source}`}>
                  {note.source === 'client' ?
                    (note.type === 'month_note' ? '📝 Your General Note' : '🗑️ File Deletion Reason')
                    : '👨‍💼 Employee Feedback'
                  }
                </span>
                {note.isUnviewedByClient && (
                  <span className="note-new-badge">NEW</span>
                )}
                <span className="note-category">{note.category}</span>
                <span className="note-date">
                  <FiClock size={12} /> {formatDate(note.addedAt)}
                </span>
              </div>
              <div className="note-content">
                <p>{note.note}</p>
              </div>
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
                {monthData.monthStatus.accountingDone ? (
                  <span className="status-completed">✅ Accounting Completed</span>
                ) : monthData.monthStatus.isLocked ? (
                  <span className="status-locked">🔒 Month Locked</span>
                ) : (
                  <span className="status-active">📊 In Progress</span>
                )}
              </span>
            </h3>
            <p className="month-summary">
              {monthData.documents.summary.uploadedCategories}/3 documents •
              {monthData.tasks.summary.assignedTasks}/4 tasks •
              {monthData.notes.summary.totalNotes} notes
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
                {renderDocumentStatus(monthData.documents)}
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
            {/* Documents Section */}
            <div className="modal-section">
              <h4><FiFolder size={20} /> Documents</h4>
              <div className="documents-grid">
                {selectedMonthDetails.documents.status.map((category, index) => (
                  <div key={index} className="document-category-modal">
                    <div className="category-header-modal">
                      <span className={`status-indicator ${category.status}`}>
                        {category.status === 'uploaded' ? '✅' : '❌'}
                      </span>
                      <h5>{category.category}</h5>
                      <span className="files-count">
                        {category.uploadedFiles} file{category.uploadedFiles !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {category.files.length > 0 ? (
                      <div className="files-list-modal">
                        {category.files.map((file, fileIndex) => (
                          <div key={fileIndex} className="file-item-modal">
                            <FiFileText size={14} />
                            <div className="file-info">
                              <span className="file-name">{file.fileName}</span>
                              <span className="file-date">
                                Uploaded: {formatDate(file.uploadedAt)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-files-modal">
                        <FiAlertCircle size={16} />
                        <span>No files uploaded for this category</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks Section - UPDATED */}
            <div className="modal-section">
              <h4><FiCheckCircle size={20} /> Tasks</h4>
              <div className="tasks-grid">
                {selectedMonthDetails.tasks.list.map((task, index) => (
                  <div key={index} className={`task-card ${task.status}`}>
                    <div className="task-card-header">
                      <h5>{task.taskName}</h5>
                      <span className={`task-status-badge ${task.accountingDone ? 'completed' : task.status}`}>
                        {task.accountingDone ? '✅ Completed' : task.status === 'assigned' ? '🔄 Assigned' : '❌ Not Assigned'}
                      </span>
                    </div>

                    {task.status === 'assigned' && (
                      <div className="task-card-details">
                        {/* REMOVED: employee-info div with name, email, phone */}

                        <div className="task-progress-info">
                          {task.accountingDone ? (
                            <div className="completed-info">
                              <span className="completed-date">
                                ✅ Completed on {formatDate(task.accountingDoneAt)}
                              </span>
                              <span className="completed-by">
                                {/* CHANGED: removed employee name, just show "Employee" */}
                                By: Employee
                              </span>
                            </div>
                          ) : (
                            <div className="pending-info">
                              <span className="pending-status">
                                ⏳ In Progress - Assigned on {formatDate(task.assignedAt)}
                              </span>
                              <span className="assigned-by">
                                {/* CHANGED: removed admin name, just show generic text */}
                                Assigned by: Admin
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section - UPDATED */}
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
                  <div key={index} className={`note-card ${note.source} ${note.isUnviewedByClient ? 'unviewed' : ''}`}>
                    <div className="note-card-header">
                      <span className={`note-card-type ${note.source}`}>
                        {note.source === 'client' ?
                          (note.type === 'month_note' ? '📝 Your General Note' : '🗑️ File Deletion Reason')
                          : '👨‍💼 Employee Feedback'  // CHANGED: removed dynamic name, just shows "Employee Feedback"
                        }
                      </span>
                      {note.isUnviewedByClient && (
                        <span className="note-card-new-badge">NEW</span>
                      )}
                      <span className="note-card-category">
                        {note.category} {note.fileName ? `• ${note.fileName}` : ''}
                      </span>
                      <span className="note-card-date">
                        {formatDate(note.addedAt)}
                      </span>
                    </div>
                    <div className="note-card-content">
                      <p>{note.note}</p>
                    </div>
                    {/* REMOVED OR MODIFIED: note-card-footer with added-by information */}
                    {note.source === 'employee' && (
                      <div className="note-card-footer">
                        <span className="note-added-by">
                          {/* CHANGED: removed dynamic name, just show "Employee" */}
                          Added by: Employee
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderClientSummary = () => {
    if (!dashboardData?.client) return null;

    const client = dashboardData.client;

    return (
      <div className="client-summary-grid">
        <div className="summary-card personal-info">
          <div className="summary-header">
            <FiUser size={20} />
            <h4>Personal Information</h4>
          </div>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">Full Name:</span>
              <span className="summary-value">{client.firstName} {client.lastName}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Email:</span>
              <span className="summary-value">{client.email}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Phone:</span>
              <span className="summary-value">{client.phone}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Visa Type:</span>
              <span className="summary-value">{client.visaType}</span>
            </div>
          </div>
        </div>

        <div className="summary-card business-info">
          <div className="summary-header">
            <FiBriefcase size={20} />
            <h4>Business Information</h4>
          </div>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">Business Name:</span>
              <span className="summary-value">{client.businessName}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Nature of Business:</span>
              <span className="summary-value">{client.businessNature}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">VAT Period:</span>
              <span className="summary-value">{client.vatPeriod}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Business Address:</span>
              <span className="summary-value">{client.businessAddress}</span>
            </div>
          </div>
        </div>

        <div className="summary-card account-info">
          <div className="summary-header">
            <FiCreditCard size={20} />
            <h4>Account Information</h4>
          </div>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">Current Plan:</span>
              <span className="summary-value highlight">{client.planSelected}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Active Since:</span>
              <span className="summary-value">{client.activeSince}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Enrollment Date:</span>
              <span className="summary-value">{client.enrollmentDate}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ==================== MAIN RENDER ==================== */
  return (
    <ClientLayout>
      <ToastContainer />
      <div className="client-dashboard">
        {/* Header */}
        <div className="header-section">
          <div className="title-section">
            <h1 className="page-title">
              <FiTrendingUp size={28} /> My Dashboard
            </h1>
            <p className="page-subtitle">
              Welcome {dashboardData?.client?.name || "Client"} • View your accounting status
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

        {/* Payment Reminder */}
        {showPaymentReminder && (
          <div className="payment-reminder">
            <div className="reminder-content">
              <div className="reminder-icon">
                <FiDollarSign size={24} />
              </div>
              <div className="reminder-message">
                <h4>Payment Reminder</h4>
                <p>{reminderMessage}</p>
              </div>
              <div className="reminder-actions">
                <button
                  className="reminder-btn paid-btn"
                  onClick={() => handlePaymentAction("paid")}
                >
                  <FiCheck size={16} /> Already Paid
                </button>
                <button
                  className="reminder-btn will-pay-btn"
                  onClick={() => handlePaymentAction("will_pay")}
                >
                  <FiClock size={16} /> I Will Pay
                </button>
                <button
                  className="reminder-btn dismiss-btn"
                  onClick={dismissReminder}
                >
                  <FiX size={16} /> Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Time Filter */}
        <div className="filter-section">
          <div className="filter-header">
            <h3>
              <FiFilter size={20} /> Time Period: <span className="current-filter">{getFilterDisplayText()}</span>
            </h3>
            <p>Select time period to view your data</p>
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

        {/* NEW: Standalone Notes Section (always shows if there are notes) */}
        {renderStandaloneNotesSection()}

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your dashboard data...</p>
          </div>
        ) : dashboardData && dashboardData.data && dashboardData.data.length > 0 ? (
          <>
            {/* Client Info Summary */}
            <div className="client-summary-container">
              <h3 className="section-title">
                <FiInfo size={24} /> Account Summary
              </h3>
              {renderClientSummary()}
            </div>

            {/* Months Data */}
            <div className="months-container">
              <h3 className="section-title">
                <FiCalendar size={24} /> Monthly Accounting Status
              </h3>
              {dashboardData.data.map((monthData, index) => renderMonthCard(monthData, index))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h4>No data found</h4>
            <p>No accounting data available for the selected time period</p>
          </div>
        )}

        {/* All Notes Modal */}
        {renderAllNotesModal()}

        {/* Month Details Modal */}
        {showMonthDetailsModal && renderMonthDetailsModal()}
      </div>

      <ConsentUpdateModal />
    </ClientLayout>
  );
};

export default ClientDashboard;