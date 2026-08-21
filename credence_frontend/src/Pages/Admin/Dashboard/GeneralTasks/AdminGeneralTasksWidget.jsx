// components/AdminDashboard/AdminGeneralTasksWidget.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
    FiFileText,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiChevronRight,
    FiRefreshCw,
    FiUser,
    FiCalendar,
    FiX,
    FiAlertCircle,
    FiEye
} from "react-icons/fi";

const AdminGeneralTasksWidget = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0
    });
    const [pendingTasks, setPendingTasks] = useState([]);
    const [showAllModal, setShowAllModal] = useState(false);
    const [allPendingTasks, setAllPendingTasks] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [allTasksLoading, setAllTasksLoading] = useState(false);

    // Fetch general tasks summary (for stats + latest 5 pending)
    const fetchTasks = async () => {
        try {
            setRefreshing(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin-employee/general-tasks/all`,
                { withCredentials: true }
            );

            if (response.data.success) {
                const allTasks = response.data.data || [];

                // Calculate stats
                const total = allTasks.length;
                const pending = allTasks.filter(t => t.status === "pending").length;
                const completed = allTasks.filter(t => t.status === "completed").length;
                const cancelled = allTasks.filter(t => t.status === "cancelled").length;

                setStats({ total, pending, completed, cancelled });

                // Get latest 5 pending tasks (sorted by createdAt DESC)
                const pendingList = allTasks
                    .filter(t => t.status === "pending")
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);

                setPendingTasks(pendingList);
            }
        } catch (error) {
            console.error("Error fetching general tasks:", error);
            toast.error("Failed to load general tasks", {
                position: "top-right",
                autoClose: 3000,
                theme: "dark"
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fetch ALL pending tasks (for modal)
    const fetchAllPendingTasks = async () => {
        try {
            setModalLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin-employee/general-tasks/all?status=pending`,
                { withCredentials: true }
            );

            if (response.data.success) {
                const pendingList = (response.data.data || [])
                    .filter(t => t.status === "pending")
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setAllPendingTasks(pendingList);
                setShowAllModal(true);
            }
        } catch (error) {
            console.error("Error fetching all pending tasks:", error);
            toast.error("Failed to load pending tasks", {
                position: "top-right",
                autoClose: 3000,
                theme: "dark"
            });
        } finally {
            setModalLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <span className="admin-task-status pending">
                        <FiClock size={12} /> Pending
                    </span>
                );
            case "completed":
                return (
                    <span className="admin-task-status completed">
                        <FiCheckCircle size={12} /> Completed
                    </span>
                );
            case "cancelled":
                return (
                    <span className="admin-task-status cancelled">
                        <FiXCircle size={12} /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className="admin-task-status unknown">
                        <FiAlertCircle size={12} /> {status}
                    </span>
                );
        }
    };

    // Get initials
    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    // Loading state
    if (loading) {
        return (
            <div className="admin-general-tasks-widget loading">
                <div className="widget-loading-spinner"></div>
                <p>Loading general tasks...</p>
            </div>
        );
    }

    return (
        <div className="admin-general-tasks-widget">
            {/* Widget Header */}
            <div className="widget-header">
                <div className="header-left">
                    <FiFileText size={22} className="header-icon" />
                    <h3>General Tasks Overview</h3>
                    <span className="total-badge">{stats.total} total</span>
                </div>
                <button
                    className="widget-refresh-btn"
                    onClick={fetchTasks}
                    disabled={refreshing}
                >
                    <FiRefreshCw className={refreshing ? "spinning" : ""} size={16} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="widget-stats-grid">
                <div className="widget-stat-item total">
                    <div className="stat-icon">
                        <FiFileText size={18} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total</span>
                    </div>
                </div>
                <div className="widget-stat-item pending">
                    <div className="stat-icon">
                        <FiClock size={18} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.pending}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                </div>
                <div className="widget-stat-item completed">
                    <div className="stat-icon">
                        <FiCheckCircle size={18} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.completed}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                </div>
                <div className="widget-stat-item cancelled">
                    <div className="stat-icon">
                        <FiXCircle size={18} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.cancelled}</span>
                        <span className="stat-label">Cancelled</span>
                    </div>
                </div>
            </div>

            {/* Latest Pending Tasks */}
            <div className="widget-tasks-section">
                <div className="tasks-section-header">
                    <h4>
                        <FiClock size={16} />
                        Latest Pending Tasks
                        <span className="pending-count">{stats.pending} pending</span>
                    </h4>
                    {stats.pending > 5 && (
                        <button
                            className="view-all-btn"
                            onClick={fetchAllPendingTasks}
                            disabled={modalLoading}
                        >
                            View All <FiChevronRight size={14} />
                        </button>
                    )}
                </div>

                {pendingTasks.length === 0 ? (
                    <div className="no-pending-tasks">
                        <FiCheckCircle size={32} />
                        <p>No pending tasks! 🎉</p>
                    </div>
                ) : (
                    <div className="pending-tasks-table-wrap">
                        <table className="pending-tasks-table">
                            <thead>
                                <tr>
                                    <th className="col-date">Date</th>
                                    <th className="col-task">Task</th>
                                    <th className="col-employee">Employee</th>
                                    <th className="col-status">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingTasks.map((task) => (
                                    <tr key={task.taskId}>
                                        <td className="col-date">{formatDate(task.createdAt)}</td>
                                        <td className="col-task">
                                            <div className="task-text" title={task.task}>
                                                {task.task}
                                            </div>
                                            <small className="task-admin">
                                                <FiUser size={10} /> {task.createdByName || "Admin"}
                                            </small>
                                        </td>
                                        <td className="col-employee">
                                            <div className="employee-cell">
                                                <div className="employee-avatar-small">
                                                    {getInitials(task.employeeName)}
                                                </div>
                                                <span>{task.employeeName || "Unknown"}</span>
                                            </div>
                                        </td>
                                        <td className="col-status">{getStatusBadge(task.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {stats.pending > 0 && (
                    <div className="tasks-footer-actions">
                        <button
                            className="view-all-pending-btn"
                            onClick={fetchAllPendingTasks}
                            disabled={modalLoading}
                        >
                            <FiEye size={16} />
                            View All {stats.pending} Pending Tasks
                            <FiChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* ==================== ALL PENDING TASKS MODAL ==================== */}
            {showAllModal && (
                <div className="admin-pending-tasks-modal-overlay" onClick={() => setShowAllModal(false)}>
                    <div className="admin-pending-tasks-modal" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="admin-pending-modal-header">
                            <div className="modal-header-left">
                                <FiClock size={22} className="modal-icon" />
                                <h3>All Pending Tasks</h3>
                                <span className="pending-total-badge">
                                    {allPendingTasks.length} pending
                                </span>
                            </div>
                            <button
                                className="admin-modal-close"
                                onClick={() => setShowAllModal(false)}
                                disabled={modalLoading}
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="admin-pending-modal-body">
                            {modalLoading ? (
                                <div className="modal-loading-state">
                                    <div className="modal-spinner"></div>
                                    <p>Loading all pending tasks...</p>
                                </div>
                            ) : allPendingTasks.length === 0 ? (
                                <div className="modal-empty-state">
                                    <FiCheckCircle size={48} className="empty-icon" />
                                    <h4>No Pending Tasks</h4>
                                    <p>All tasks have been completed! 🎉</p>
                                </div>
                            ) : (
                                <div className="modal-tasks-table-wrap">
                                    <table className="modal-tasks-table">
                                        <thead>
                                            <tr>
                                                <th className="col-date">Date Created</th>
                                                <th className="col-task">Task</th>
                                                <th className="col-employee">Employee</th>
                                                <th className="col-status">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allPendingTasks.map((task) => (
                                                <tr key={task.taskId}>
                                                    <td className="col-date">
                                                        {formatDate(task.createdAt)}
                                                    </td>
                                                    <td className="col-task">
                                                        <div className="task-text" title={task.task}>
                                                            {task.task}
                                                        </div>
                                                        <small className="task-admin">
                                                            <FiUser size={10} /> {task.createdByName || "Admin"}
                                                        </small>
                                                    </td>
                                                    <td className="col-employee">
                                                        <div className="employee-cell">
                                                            <div className="employee-avatar-small">
                                                                {getInitials(task.employeeName)}
                                                            </div>
                                                            <span>{task.employeeName || "Unknown"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="col-status">{getStatusBadge(task.status)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="admin-pending-modal-footer">
                            <button
                                className="modal-close-btn"
                                onClick={() => setShowAllModal(false)}
                            >
                                Close
                            </button>
                            <button
                                className="modal-refresh-btn"
                                onClick={fetchAllPendingTasks}
                                disabled={modalLoading}
                            >
                                <FiRefreshCw className={modalLoading ? "spinning" : ""} size={16} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGeneralTasksWidget;