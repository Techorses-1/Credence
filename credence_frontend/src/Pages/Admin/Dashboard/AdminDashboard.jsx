import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiTrendingUp,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiClock,
  FiMessageSquare,
  FiFileText,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiCalendar,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiChevronRight,
  FiChevronLeft,
  FiLock,
  FiDollarSign,
  FiBell,
  FiBook,
  FiBriefcase,
  FiCheckCircle // New icon for completed tasks
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "../Layout/AdminLayout";
import "./AdminDashboard.scss";
import AdminNotesPanel from "./Notes/AdminNotesPanel";
import Select from 'react-select'; // Add this import

const AdminDashboard = () => {
  const navigate = useNavigate();

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("this_month");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Modal states
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Unviewed Notes specific states
  const [unviewedNotesSummary, setUnviewedNotesSummary] = useState(null);
  const [selectedClientNotes, setSelectedClientNotes] = useState(null);
  const [notesLoading, setNotesLoading] = useState(false);

  // Completed Tasks specific states
  const [completedTasksSearch, setCompletedTasksSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filteredCompletedTasks, setFilteredCompletedTasks] = useState(null);

  // Time filter options
  const timeFilterOptions = [
    { value: "today", label: "Today", icon: "📅" },
    { value: "this_week", label: "This Week", icon: "📅" },
    { value: "this_month", label: "This Month", icon: "📅" },
    { value: "last_month", label: "Last Month", icon: "📅" },
    { value: "last_3_months", label: "Last 3 Months", icon: "📅" },
    { value: "custom", label: "Custom Range", icon: "📅" }
  ];

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
        `${import.meta.env.VITE_API_URL}/admin/dashboard/overview`,
        {
          params,
          withCredentials: true
        }
      );

      if (response.data.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showToast("Error loading dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnviewedNotesSummary = async () => {
    try {
      setNotesLoading(true);

      const params = { timeFilter };
      if (timeFilter === "custom" && customStartDate && customEndDate) {
        params.customStart = customStartDate;
        params.customEnd = customEndDate;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/dashboard/unviewed-notes-summary`,
        {
          params,
          withCredentials: true
        }
      );

      if (response.data.success) {
        setUnviewedNotesSummary(response.data);
        setModalData(response.data);
        setActiveModal('unviewedNotes');
      }
    } catch (error) {
      console.error("Error fetching unviewed notes summary:", error);
      showToast("Error loading unviewed notes", "error");
    } finally {
      setNotesLoading(false);
    }
  };

  const fetchClientUnviewedNotes = async (clientId) => {
    try {
      setNotesLoading(true);

      const params = { timeFilter };
      if (timeFilter === "custom" && customStartDate && customEndDate) {
        params.customStart = customStartDate;
        params.customEnd = customEndDate;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/dashboard/client-unviewed-notes/${clientId}`,
        {
          params,
          withCredentials: true
        }
      );

      if (response.data.success) {
        setSelectedClientNotes(response.data);
      }
    } catch (error) {
      console.error("Error fetching client unviewed notes:", error);
      showToast("Error loading client notes", "error");
    } finally {
      setNotesLoading(false);
    }
  };

  const markNoteAsRead = async (notePath, clientId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/dashboard/notes/mark-note-read`,
        {
          clientId,
          notePath
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        if (selectedClientNotes) {
          const updatedNotesByMonth = selectedClientNotes.notesByMonth.map(monthData => ({
            ...monthData,
            notes: monthData.notes.filter(note => note.noteId !== notePath)
          })).filter(monthData => monthData.notes.length > 0);

          const newTotal = updatedNotesByMonth.reduce((sum, month) => sum + month.notes.length, 0);

          setSelectedClientNotes(prev => ({
            ...prev,
            totalUnviewedNotes: newTotal,
            notesByMonth: updatedNotesByMonth
          }));

          if (unviewedNotesSummary) {
            const updatedClients = unviewedNotesSummary.clients.map(client => {
              if (client.clientId === clientId) {
                const newTotal = client.totalUnviewedNotes - 1;
                return {
                  ...client,
                  totalUnviewedNotes: newTotal > 0 ? newTotal : 0
                };
              }
              return client;
            }).filter(client => client.totalUnviewedNotes > 0);

            const newTotalNotes = updatedClients.reduce((sum, client) => sum + client.totalUnviewedNotes, 0);

            setUnviewedNotesSummary(prev => ({
              ...prev,
              summary: {
                ...prev.summary,
                totalUnviewedNotes: newTotalNotes,
                totalClientsWithNotes: updatedClients.length
              },
              clients: updatedClients
            }));

            if (dashboardData) {
              setDashboardData(prev => ({
                ...prev,
                metrics: {
                  ...prev.metrics,
                  recentNotes: newTotalNotes
                }
              }));
            }
          }

          showToast("Note marked as read", "success");
        }
      }
    } catch (error) {
      console.error("Error marking note as read:", error);
      showToast("Error marking note as read", "error");
    }
  };

  const markAllClientNotesAsRead = async (clientId) => {
    try {
      setNotesLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/dashboard/notes/mark-client-read/${clientId}`,
        {
          timeFilter,
          customStart: timeFilter === "custom" ? customStartDate : undefined,
          customEnd: timeFilter === "custom" ? customEndDate : undefined
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        const updatedClients = unviewedNotesSummary.clients.filter(client => client.clientId !== clientId);
        const newTotalNotes = updatedClients.reduce((sum, client) => sum + client.totalUnviewedNotes, 0);

        setUnviewedNotesSummary(prev => ({
          ...prev,
          summary: {
            ...prev.summary,
            totalUnviewedNotes: newTotalNotes,
            totalClientsWithNotes: updatedClients.length
          },
          clients: updatedClients
        }));

        setSelectedClientNotes(null);

        if (dashboardData) {
          setDashboardData(prev => ({
            ...prev,
            metrics: {
              ...prev.metrics,
              recentNotes: newTotalNotes
            }
          }));
        }

        showToast(response.data.message, "success");
      }
    } catch (error) {
      console.error("Error marking client notes as read:", error);
      showToast("Error marking client notes as read", "error");
    } finally {
      setNotesLoading(false);
    }
  };

  const markAllNotesAsRead = async () => {
    try {
      setNotesLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/dashboard/notes/mark-all-read`,
        {
          timeFilter,
          customStart: timeFilter === "custom" ? customStartDate : undefined,
          customEnd: timeFilter === "custom" ? customEndDate : undefined
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setUnviewedNotesSummary(null);
        setSelectedClientNotes(null);
        setActiveModal(null);

        if (dashboardData) {
          setDashboardData(prev => ({
            ...prev,
            metrics: {
              ...prev.metrics,
              recentNotes: 0
            }
          }));
        }

        showToast(response.data.message, "success");
      }
    } catch (error) {
      console.error("Error marking all notes as read:", error);
      showToast("Error marking all notes as read", "error");
    } finally {
      setNotesLoading(false);
    }
  };

  const fetchCompletedTasks = async () => {
    try {
      setModalLoading(true);
      setActiveModal('completedTasks');
      setCompletedTasksSearch("");
      setSelectedEmployee(null);
      setFilteredCompletedTasks(null);

      const params = { timeFilter };
      if (timeFilter === "custom" && customStartDate && customEndDate) {
        params.customStart = customStartDate;
        params.customEnd = customEndDate;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/dashboard/completed-tasks`,
        {
          params,
          withCredentials: true
        }
      );

      if (response.data.success) {
        setModalData(response.data);
        setFilteredCompletedTasks(response.data.monthsData);
      }
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
      showToast("Error loading completed tasks", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const fetchModalData = async (modalType) => {
    try {
      setModalLoading(true);
      setActiveModal(modalType);

      let endpoint = "";
      const params = { timeFilter };

      if (timeFilter === "custom" && customStartDate && customEndDate) {
        params.customStart = customStartDate;
        params.customEnd = customEndDate;
      }

      switch (modalType) {
        case 'activeClients':
          endpoint = "/admin/dashboard/active-clients";
          break;
        case 'activeEmployees':
          endpoint = "/admin/dashboard/active-employees";
          break;
        case 'unassignedClients':
          endpoint = "/admin/dashboard/unassigned-clients";
          break;
        case 'idleEmployees':
          endpoint = "/admin/dashboard/idle-employees";
          break;
        case 'incompleteTasks':
          endpoint = "/admin/dashboard/incomplete-tasks";
          break;
        case 'recentNotes':
          endpoint = "/admin/dashboard/recent-notes";
          break;
        case 'uploadedLocked':
          endpoint = "/admin/dashboard/uploaded-but-locked";
          break;
        case 'pendingFinance':
          navigate("/admin/enrollments");
          return;
        default:
          return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          params,
          withCredentials: true
        }
      );

      if (response.data.success) {
        setModalData(response.data);
      }
    } catch (error) {
      console.error(`Error fetching ${modalType} data:`, error);
      showToast(`Error loading ${modalType.replace(/([A-Z])/g, ' $1').toLowerCase()}`, "error");
    } finally {
      setModalLoading(false);
    }
  };

  /* ==================== FILTER FUNCTIONS FOR COMPLETED TASKS ==================== */
  const applyCompletedTasksFilters = () => {
    if (!modalData || !modalData.monthsData) return;

    let filtered = modalData.monthsData.map(month => ({
      ...month,
      tasks: month.tasks.filter(task => {
        // Apply search filter (client name OR employee name)
        const matchesSearch = completedTasksSearch === "" ||
          task.clientName.toLowerCase().includes(completedTasksSearch.toLowerCase()) ||
          task.employeeName.toLowerCase().includes(completedTasksSearch.toLowerCase());

        // Apply employee filter
        const matchesEmployee = !selectedEmployee || selectedEmployee.value === "all" ||
          task.employeeId === selectedEmployee.value;

        return matchesSearch && matchesEmployee;
      })
    })).filter(month => month.tasks.length > 0); // Remove months with no tasks after filtering

    setFilteredCompletedTasks(filtered);
  };

  useEffect(() => {
    if (activeModal === 'completedTasks' && modalData) {
      applyCompletedTasksFilters();
    }
  }, [completedTasksSearch, selectedEmployee, modalData]);

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

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMonthYear = (year, month) => {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  const getFilterDisplayText = () => {
    const filter = timeFilterOptions.find(f => f.value === timeFilter);
    if (timeFilter === "custom" && customStartDate && customEndDate) {
      return `${formatDate(customStartDate)} to ${formatDate(customEndDate)}`;
    }
    return filter?.label || "This Month";
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleOpenUnviewedNotes = () => {
    fetchUnviewedNotesSummary();
  };

  const handleViewClientNotes = (clientId) => {
    fetchClientUnviewedNotes(clientId);
  };

  const handleBackToClientList = () => {
    setSelectedClientNotes(null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
    setSelectedClientNotes(null);
    setUnviewedNotesSummary(null);
    setFilteredCompletedTasks(null);
    setCompletedTasksSearch("");
    setSelectedEmployee(null);
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

  const renderMetricsGrid = () => {
    if (!dashboardData) return null;

    const metrics = [
      {
        title: "Active Clients",
        value: dashboardData.metrics.activeClients,
        subtitle: "Total active clients",
        icon: <FiUsers />,
        color: "#7cd64b",
        onClick: () => fetchModalData('activeClients')
      },
      {
        title: "Active Employees",
        value: dashboardData.metrics.activeEmployees,
        subtitle: "Total active employees",
        icon: <FiUserCheck />,
        color: "#7cd64b",
        onClick: () => fetchModalData('activeEmployees')
      },
      {
        title: "Unassigned Clients",
        value: dashboardData.metrics.unassignedClients,
        subtitle: "Clients with missing tasks",
        icon: <FiUserX />,
        color: "#ff6b6b",
        onClick: () => fetchModalData('unassignedClients')
      },
      {
        title: "Idle Employees",
        value: dashboardData.metrics.idleEmployees,
        subtitle: "Employees without assignments",
        icon: <FiClock />,
        color: "#ffa500",
        onClick: () => fetchModalData('idleEmployees')
      },
      {
        title: "Incomplete Tasks",
        value: dashboardData.metrics.incompleteTasks,
        subtitle: "Clients with pending tasks",
        icon: <FiAlertCircle />,
        color: "#ff4b4b",
        onClick: () => fetchModalData('incompleteTasks')
      },
      {
        title: "Completed Tasks",
        value: dashboardData.metrics.completedTasks || 0,
        subtitle: "Tasks marked as complete",
        icon: <FiCheckCircle />,
        color: "#10b981",
        onClick: fetchCompletedTasks
      },
      {
        title: "Pending Finance Requests",
        value: dashboardData.metrics.pendingFinancialRequests || 0,
        subtitle: "Financial statement requests",
        icon: <FiDollarSign />,
        color: "#3498db",
        onClick: () => fetchModalData('pendingFinance')
      }
    ];

    return (
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`metric-card ${metric.onClick ? 'clickable' : ''}`}
            style={{ borderTopColor: metric.color }}
            onClick={metric.onClick}
          >
            <div className="metric-header">
              <div className="metric-icon" style={{ background: `${metric.color}15` }}>
                {metric.icon}
              </div>
              <div className="metric-content">
                <h3>{metric.value}</h3>
                <p className="metric-title">{metric.title}</p>
                <p className="metric-subtitle" style={{ color: metric.color }}>
                  {metric.subtitle}
                </p>
              </div>
            </div>
            {metric.onClick && (
              <div className="metric-action">
                <FiChevronRight size={20} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCompletedTasksModal = () => {
    if (activeModal !== 'completedTasks' || !modalData) return null;

    const tasksToDisplay = filteredCompletedTasks || modalData.monthsData || [];

    return (
      <div className="modal-overlay">
        <div className="modal completed-tasks-modal">
          <div className="modal-header">
            <div className="modal-title">
              <FiCheckCircle size={24} color="#10b981" />
              <h3>
                Completed Tasks
                <span className="completed-summary-badge">
                  {modalData.totalCompletedTasks} completed tasks
                </span>
              </h3>
            </div>
            <button className="close-modal" onClick={closeModal}>
              <FiX size={24} />
            </button>
          </div>

          <div className="modal-body">
            <div className="filter-info">
              <p>
                <strong>Time Period:</strong> {getFilterDisplayText()}
                {modalData.monthsInRange ? ` (${modalData.monthsInRange} months)` : ''}
              </p>
            </div>

            {/* Filters Section */}
            <div className="completed-tasks-filters">
              <div className="search-filter">
                <input
                  type="text"
                  placeholder="Search by client or employee..."
                  value={completedTasksSearch}
                  onChange={(e) => setCompletedTasksSearch(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="employee-filter">
                <Select
                  options={modalData.employees || []}
                  value={selectedEmployee}
                  onChange={setSelectedEmployee}
                  placeholder="Filter by employee..."
                  isClearable={false}
                  className="employee-select"
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            {modalLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading completed tasks...</p>
              </div>
            ) : tasksToDisplay.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <h4>No completed tasks found</h4>
                <p>No tasks have been marked as complete for the selected time period</p>
              </div>
            ) : (
              <div className="completed-tasks-list">
                {tasksToDisplay.map((month, monthIndex) => {
                  // Group tasks by client+employee for this month
                  const groupedTasks = [];
                  const groupMap = new Map();

                  month.tasks.forEach(task => {
                    const groupKey = `${task.clientId}_${task.employeeId}`;

                    if (!groupMap.has(groupKey)) {
                      groupMap.set(groupKey, {
                        clientId: task.clientId,
                        clientName: task.clientName,
                        employeeId: task.employeeId,
                        employeeName: task.employeeName,
                        tasks: [],
                        latestCompletion: task.completedAt
                      });
                    }

                    const group = groupMap.get(groupKey);
                    group.tasks.push(task.task);

                    // Keep the latest completion date
                    if (new Date(task.completedAt) > new Date(group.latestCompletion)) {
                      group.latestCompletion = task.completedAt;
                    }
                  });

                  // Convert map to array
                  groupMap.forEach(value => {
                    groupedTasks.push(value);
                  });

                  // Sort by client name
                  groupedTasks.sort((a, b) => a.clientName.localeCompare(b.clientName));

                  return (
                    <div key={monthIndex} className="completed-month-section">
                      <div className="completed-month-header">
                        <h4>
                          <FiCalendar size={18} /> {month.monthName}
                          <span className="completed-month-count">
                            {month.totalCompleted} task{month.totalCompleted !== 1 ? 's' : ''}
                          </span>
                        </h4>
                      </div>

                      <div className="responsive-table">
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th>Client Name</th>
                              <th>Employee Name</th>
                              <th>Completed Tasks</th>
                              <th>Completed On</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedTasks.map((group, groupIndex) => (
                              <tr key={groupIndex}>
                                <td>
                                  <div className="client-cell">
                                    <div className="client-avatar-small">
                                      {getInitials(group.clientName)}
                                    </div>
                                    <span>{group.clientName}</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="employee-cell">
                                    <span className="employee-name">{group.employeeName}</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="completed-tasks-list-cell">
                                    {group.tasks.map((task, taskIndex) => (
                                      <span key={taskIndex} className="task-completed-badge">
                                        {task}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td>
                                  <span className="completed-date">
                                    {formatDateTime(group.latestCompletion)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderUnviewedNotesModal = () => {
    if (activeModal !== 'unviewedNotes' || !modalData) return null;

    if (selectedClientNotes) {
      return (
        <div className="modal-overlay">
          <div className="modal notes-modal">
            <div className="modal-header">
              <button
                className="back-button"
                onClick={handleBackToClientList}
                disabled={notesLoading}
              >
                <FiChevronLeft size={20} /> Back to Client List
              </button>
              <div className="modal-title">
                <FiMessageSquare size={24} />
                <h3>
                  {selectedClientNotes.client.name} - Unviewed Notes
                  <span className="notes-count-badge">
                    {selectedClientNotes.totalUnviewedNotes} notes
                  </span>
                </h3>
              </div>
              <button className="close-modal" onClick={closeModal}>
                <FiX size={24} />
              </button>
            </div>

            <div className="modal-body">
              {notesLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading notes...</p>
                </div>
              ) : selectedClientNotes.totalUnviewedNotes === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h4>All notes marked as read</h4>
                  <p>No unviewed notes found for this client</p>
                </div>
              ) : (
                <>
                  <div className="client-actions">
                    <button
                      className="mark-all-client-btn"
                      onClick={() => markAllClientNotesAsRead(selectedClientNotes.client.clientId)}
                      disabled={notesLoading}
                    >
                      <FiCheck size={16} /> Mark All as Read for {selectedClientNotes.client.name}
                    </button>
                  </div>

                  <div className="client-notes-list">
                    {selectedClientNotes.notesByMonth.map((monthData, monthIndex) => (
                      <div key={monthIndex} className="month-notes-section">
                        <div className="month-header">
                          <h4>
                            <FiCalendar size={18} /> {monthData.monthName}
                            <span className="month-notes-count">({monthData.totalNotes} notes)</span>
                          </h4>
                        </div>

                        <div className="notes-list">
                          {monthData.notes.map((note, noteIndex) => (
                            <div key={noteIndex} className="note-item unviewed">
                              <div className="note-header">
                                <span className={`note-source ${note.source}`}>
                                  {note.source === 'client' ? '📝 Client' : '👨‍💼 Employee'}
                                </span>
                                <span className="note-category">{note.category}</span>
                                {note.fileName && (
                                  <span className="note-file">
                                    <FiFileText size={12} /> {note.fileName}
                                  </span>
                                )}
                                <span className="note-date">
                                  <FiClock size={12} /> {formatDate(note.addedAt)}
                                </span>
                              </div>

                              <div className="note-content">
                                <p>{note.note}</p>
                              </div>

                              <div className="note-footer">
                                <span className="note-added-by">
                                  Added by: {note.addedBy}
                                </span>
                                <button
                                  className="mark-read-btn"
                                  onClick={() => markNoteAsRead(
                                    note.noteId,
                                    selectedClientNotes.client.clientId
                                  )}
                                  disabled={notesLoading}
                                >
                                  <FiCheck size={14} /> Mark as Read
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="modal-overlay">
        <div className="modal unviewed-notes-modal">
          <div className="modal-header">
            <div className="modal-title">
              <FiMessageSquare size={24} />
              <h3>
                Unviewed Notes Summary
                <span className="notes-summary-badge">
                  {modalData.summary.totalUnviewedNotes} notes • {modalData.summary.totalClientsWithNotes} clients
                </span>
              </h3>
            </div>
            <div className="modal-actions">
              <button className="close-modal" onClick={closeModal}>
                <FiX size={24} />
              </button>
            </div>
          </div>

          <div className="modal-body">
            <div className="filter-info">
              <p>
                <strong>Time Period:</strong> {getFilterDisplayText()} {modalData.monthsInRange ? `(${modalData.monthsInRange} months)` : ''}
              </p>
            </div>

            {notesLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading unviewed notes...</p>
              </div>
            ) : modalData.summary.totalClientsWithNotes === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎉</div>
                <h4>No unviewed notes</h4>
                <p>All notes have been reviewed for the selected time period</p>
              </div>
            ) : (
              <div className="responsive-table">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Contact</th>
                      <th>Unviewed Notes</th>
                      <th>Months</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.clients.map((client, index) => (
                      <tr key={index} className="clickable-row">
                        <td>
                          <div className="client-cell">
                            <div className="client-avatar-small">
                              {getInitials(client.name)}
                            </div>
                            <div>
                              <span className="client-name">{client.name}</span>
                              <br />
                              <small className="client-id">ID: {client.clientId}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div className="contact-email">{client.email}</div>
                            {client.phone && client.phone !== "N/A" && (
                              <div className="contact-phone">{client.phone}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="notes-count-cell">
                            <span className="notes-count-big">{client.totalUnviewedNotes}</span>
                            <span className="notes-label">unviewed notes</span>
                          </div>
                        </td>
                        <td>
                          <div className="months-list">
                            {Object.entries(client.unviewedByMonth).map(([month, count]) => (
                              <span key={month} className="month-chip">
                                {month} ({count})
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <button
                            className="view-client-notes-btn"
                            onClick={() => handleViewClientNotes(client.clientId)}
                            disabled={notesLoading}
                          >
                            <FiEye size={14} /> View Notes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderModal = () => {
    if (!activeModal || !modalData) return null;

    if (activeModal === 'unviewedNotes') {
      return renderUnviewedNotesModal();
    }

    if (activeModal === 'completedTasks') {
      return renderCompletedTasksModal();
    }

    let modalTitle = "";
    let icon = null;

    switch (activeModal) {
      case 'activeClients':
        modalTitle = "Active Clients";
        icon = <FiUsers />;
        break;
      case 'activeEmployees':
        modalTitle = "Active Employees";
        icon = <FiUserCheck />;
        break;
      case 'unassignedClients':
        modalTitle = "Unassigned Clients";
        icon = <FiUserX />;
        break;
      case 'idleEmployees':
        modalTitle = "Idle Employees";
        icon = <FiClock />;
        break;
      case 'incompleteTasks':
        modalTitle = "Clients with Incomplete Tasks";
        icon = <FiAlertCircle />;
        break;
      case 'recentNotes':
        modalTitle = "Recent Notes";
        icon = <FiMessageSquare />;
        break;
      case 'uploadedLocked':
        modalTitle = "Clients with Uploaded Documents in Locked Months";
        icon = <FiLock />;
        break;
      default:
        return null;
    }

    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h3>
              {icon} {modalTitle}
              {modalData.count !== undefined && (
                <span className="count-badge">{modalData.count}</span>
              )}
            </h3>
            <button className="close-modal" onClick={closeModal}>
              <FiX size={24} />
            </button>
          </div>

          <div className="modal-body">
            <div className="filter-info">
              <p>
                <strong>Time Period:</strong> {getFilterDisplayText()} {modalData.monthsInRange ? `(${modalData.monthsInRange} months)` : ''}
              </p>
            </div>

            {modalLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading data...</p>
              </div>
            ) : activeModal === 'uploadedLocked' ? (
              modalData.monthsData && modalData.monthsData.length > 0 ? (
                <div className="uploaded-locked-modal-content">
                  <div className="modal-summary">
                    <div className="summary-stats">
                      <div className="stat-item">
                        <div className="stat-label">Total Clients</div>
                        <div className="stat-value">{modalData.totalClients}</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label">Total Months</div>
                        <div className="stat-value">{modalData.monthsData.length}</div>
                      </div>
                    </div>
                  </div>

                  <div className="months-list">
                    {modalData.monthsData.map((month, index) => (
                      <div key={index} className="month-section">
                        <div className="month-header">
                          <h4>
                            <FiCalendar size={20} /> {month.monthName}
                          </h4>
                          <span className="month-status locked">
                            🔒 {month.count} client{month.count !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="month-clients">
                          <div className="responsive-table">
                            <table className="dashboard-table">
                              <thead>
                                <tr>
                                  <th>Client</th>
                                  <th>Contact</th>
                                  <th>Uploaded Files</th>
                                  <th>Locked By</th>
                                  <th>Locked Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {month.clients.map((client, clientIndex) => (
                                  <tr key={clientIndex}>
                                    <td>
                                      <div className="client-cell">
                                        <span>{client.name}</span>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="contact-info">
                                        <div>{client.email}</div>
                                        {client.phone && client.phone !== "N/A" && (
                                          <small>{client.phone}</small>
                                        )}
                                      </div>
                                    </td>
                                    <td>
                                      <span className="file-count-badge">
                                        {client.totalFiles} file{client.totalFiles !== 1 ? 's' : ''}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="locked-by">{client.lockedBy}</span>
                                    </td>
                                    <td>
                                      <span className="locked-date">
                                        {client.lockedAt ? formatDate(client.lockedAt) : "Unknown"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📁</div>
                  <h4>No locked months with uploaded files</h4>
                  <p>All good! No clients have uploaded documents in locked months.</p>
                </div>
              )
            ) : modalData.count > 0 ? (
              <div className="responsive-table">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      {activeModal === 'activeClients' && (
                        <>
                          <th>Client Name</th>
                          <th>Contact</th>
                          <th>Plan</th>
                          <th>Joined Date</th>
                        </>
                      )}
                      {activeModal === 'activeEmployees' && (
                        <>
                          <th>Employee Name</th>
                          <th>Contact</th>
                          <th>Joined Date</th>
                        </>
                      )}
                      {activeModal === 'unassignedClients' && (
                        <>
                          <th>Client Name</th>
                          <th>Contact</th>
                          <th>Missing Tasks by Month</th>
                        </>
                      )}
                      {activeModal === 'idleEmployees' && (
                        <>
                          <th>Employee Name</th>
                          <th>Contact</th>
                          <th>Idle Months</th>
                        </>
                      )}
                      {activeModal === 'incompleteTasks' && (
                        <>
                          <th>Client Name</th>
                          <th>Contact</th>
                          <th>Pending Tasks by Month</th>
                        </>
                      )}
                      {activeModal === 'recentNotes' && (
                        <>
                          <th>Client Name</th>
                          <th>Contact</th>
                          <th>Notes Summary</th>
                          <th>Latest Note</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {activeModal === 'activeClients' && modalData.clients?.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="client-cell">
                            <div className="client-avatar-small">
                              {getInitials(item.name)}
                            </div>
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div>{item.email}</div>
                            {item.phone && item.phone !== "N/A" && (
                              <small>{item.phone}</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="plan-badge">{item.plan}</span>
                        </td>
                        <td>{item.joined}</td>
                      </tr>
                    ))}

                    {activeModal === 'activeEmployees' && modalData.employees?.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="client-cell">
                            <div className="client-avatar-small">
                              {getInitials(item.name)}
                            </div>
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div>{item.email}</div>
                            {item.phone && item.phone !== "N/A" && (
                              <small>{item.phone}</small>
                            )}
                          </div>
                        </td>
                        <td>{item.joined}</td>
                      </tr>
                    ))}

                    {activeModal === 'unassignedClients' && modalData.clients?.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="client-cell">
                            <div className="client-avatar-small">
                              {getInitials(item.name)}
                            </div>
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div>{item.email}</div>
                            {item.phone && item.phone !== "N/A" && (
                              <small>{item.phone}</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="missing-tasks-by-month">
                            {item.missingTasksByMonth?.map((monthData, monthIndex) => (
                              <div key={monthIndex} className="month-missing-tasks">
                                <strong className="month-name">{monthData.monthName}:</strong>
                                <div className="task-chips">
                                  {monthData.missingTasks.map((task, taskIndex) => (
                                    <span key={taskIndex} className="task-chip warning">
                                      {task}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {activeModal === 'idleEmployees' && modalData.employees?.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="client-cell">
                            <div className="client-avatar-small">
                              {getInitials(item.name)}
                            </div>
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div>{item.email}</div>
                            {item.phone && item.phone !== "N/A" && (
                              <small>{item.phone}</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="idle-months-list">
                            {item.idleMonths?.map((month, monthIndex) => (
                              <span key={monthIndex} className="month-chip warning">
                                {formatMonthYear(month.year, month.month)}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {activeModal === 'incompleteTasks' && modalData.clients?.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="client-cell">
                            <div className="client-avatar-small">
                              {getInitials(item.name)}
                            </div>
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div>{item.email}</div>
                            {item.phone && item.phone !== "N/A" && (
                              <small>{item.phone}</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="incomplete-tasks-by-month">
                            {item.incompleteByMonth?.map((monthData, monthIndex) => (
                              <div key={monthIndex} className="month-incomplete-tasks">
                                <strong className="month-name">{monthData.monthName}:</strong>
                                <div className="task-items">
                                  {monthData.incompleteTasks.map((task, taskIndex) => (
                                    <div key={taskIndex} className="incomplete-task-item">
                                      <span className="task-name">{task.task}</span>
                                      <span className="task-assigned">→ {task.assignedTo}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {activeModal === 'recentNotes' && modalData.notesByClient?.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="client-cell">
                            <div className="client-avatar-small">
                              {getInitials(item.clientName)}
                            </div>
                            <span>{item.clientName}</span>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div>{item.clientEmail}</div>
                          </div>
                        </td>
                        <td>
                          <div className="notes-summary">
                            <div className="notes-count">
                              Total: <strong>{item.totalNotes}</strong> notes
                            </div>
                            <div className="notes-breakdown">
                              {item.fileNotesCount} file notes • {item.categoryNotesCount} category notes
                            </div>
                          </div>
                        </td>
                        <td>
                          {item.latestNote && (
                            <div className="latest-note">
                              {item.latestNote.note.substring(0, 60)}...
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h4>No data found</h4>
                <p>No records available for the selected time period</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDashboardSummary = () => {
    if (!dashboardData) return null;

    return (
      <div className="dashboard-summary">
        <div className="summary-card">
          <div className="summary-header">
            <h4>
              <FiTrendingUp size={20} /> Dashboard Summary
            </h4>
          </div>
          <div className="summary-content">
            <p>
              <strong>Time Period:</strong> {getFilterDisplayText()}
            </p>
            <p>
              <strong>Months in Range:</strong> {dashboardData.dateRange?.monthsCount || 1}
            </p>
            <p>
              <strong>Active Clients:</strong> {dashboardData.metrics.activeClients}
            </p>
            <p>
              <strong>Active Employees:</strong> {dashboardData.metrics.activeEmployees}
            </p>
          </div>
        </div>
      </div>
    );
  };

  /* ==================== MAIN RENDER ==================== */
  return (
    <AdminLayout>
      <ToastContainer />
      <div className="admin-dashboard">
        {/* Header */}
        <div className="header-section">
          <div className="title-section">
            <h1 className="page-title">
              <FiTrendingUp size={28} /> Admin Dashboard
            </h1>
            <p className="page-subtitle">
              Welcome {localStorage.getItem("adminName") || "Admin"} • Monitor system metrics and alerts
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

        <AdminNotesPanel />

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

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : dashboardData ? (
          <>
            {/* Metrics Grid */}
            {renderMetricsGrid()}

            {/* Dashboard Summary */}
            {renderDashboardSummary()}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h4>No data found</h4>
            <p>No dashboard data available</p>
          </div>
        )}

        {/* Modals */}
        {renderModal()}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;