import { useEffect, useState } from "react";
import axios from "axios";
import EmployeeLayout from "../Layout/EmployeeLayout";
import {
    FiFileText,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiUser,
    FiCalendar,
    FiSearch,
    FiRefreshCw,
    FiFilter,
    FiX,
    FiCheck,
    FiAlertCircle,
    FiInfo,
    FiChevronRight
} from "react-icons/fi";
import "./EmployeeGeneralTask.scss";

const EmployeeGeneralTask = () => {
    // ================= STATE =================
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Modal states
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [completeNotes, setCompleteNotes] = useState("");
    const [completing, setCompleting] = useState(false);

    // ================= STATS =================
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0
    });

    // ================= LOAD TASKS =================
    const loadTasks = async () => {
        try {
            setRefreshing(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/employee/general-tasks`,
                { withCredentials: true }
            );

            if (response.data.success) {
                const tasksData = response.data.data.tasks || [];
                setTasks(tasksData);
                setFilteredTasks(tasksData);

                // Update stats
                const pending = tasksData.filter(t => t.status === "pending").length;
                const completed = tasksData.filter(t => t.status === "completed").length;
                const cancelled = tasksData.filter(t => t.status === "cancelled").length;

                setStats({
                    total: tasksData.length,
                    pending,
                    completed,
                    cancelled
                });
            }
        } catch (error) {
            console.error("Error loading general tasks:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    // ================= FILTER TASKS =================
    useEffect(() => {
        let filtered = tasks;

        // Filter by search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(task =>
                task.task.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter(task => task.status === statusFilter);
        }

        // Sort by createdAt (newest first)
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setFilteredTasks(filtered);
    }, [searchTerm, statusFilter, tasks]);

    // ================= OPEN DETAIL MODAL =================
    const openDetailModal = (task) => {
        setSelectedTask(task);
        setCompleteNotes("");
        setShowDetailModal(true);
    };

    // ================= CLOSE DETAIL MODAL =================
    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedTask(null);
        setCompleteNotes("");
    };

    // ================= HANDLE COMPLETE TASK =================
    const handleCompleteTask = async () => {
        if (!selectedTask) return;

        try {
            setCompleting(true);

            const payload = {
                employeeNotes: completeNotes.trim() || undefined
            };

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/employee/general-task/complete/${selectedTask.taskId}`,
                payload,
                { withCredentials: true }
            );

            if (response.data.success) {
                // Reload tasks
                await loadTasks();
                closeDetailModal();
            }
        } catch (error) {
            console.error("Error completing task:", error);
        } finally {
            setCompleting(false);
        }
    };

    // ================= FORMAT DATE =================
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatDateShort = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    // ================= GET STATUS BADGE =================
    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <span className="task-status-badge pending">
                        <FiClock size={14} /> Pending
                    </span>
                );
            case "completed":
                return (
                    <span className="task-status-badge completed">
                        <FiCheckCircle size={14} /> Completed
                    </span>
                );
            case "cancelled":
                return (
                    <span className="task-status-badge cancelled">
                        <FiXCircle size={14} /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className="task-status-badge unknown">
                        <FiAlertCircle size={14} /> {status}
                    </span>
                );
        }
    };

    // ================= RENDER DETAIL MODAL =================
    const renderDetailModal = () => {
        if (!showDetailModal || !selectedTask) return null;

        const isPending = selectedTask.status === "pending";
        const isCompleted = selectedTask.status === "completed";
        const isCancelled = selectedTask.status === "cancelled";

        return (
            <div className="task-detail-modal-overlay" onClick={closeDetailModal}>
                <div className="task-detail-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="task-detail-modal-header">
                        <h3>
                            <FiFileText size={24} className="modal-icon" />
                            Task Details
                        </h3>
                        <button
                            className="modal-close-btn"
                            onClick={closeDetailModal}
                            disabled={completing}
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="task-detail-modal-body">
                        {/* Task Text */}
                        <div className="detail-task-text">{selectedTask.task}</div>

                        {/* Task Meta Info */}
                        <div className="detail-meta-grid">
                            <div className="detail-meta-item">
                                <div className="meta-label">
                                    <FiCalendar size={14} /> Created
                                </div>
                                <div className="meta-value">{formatDate(selectedTask.createdAt)}</div>
                            </div>
                            <div className="detail-meta-item">
                                <div className="meta-label">
                                    <FiUser size={14} /> Created By
                                </div>
                                <div className="meta-value">{selectedTask.createdByName || "Admin"}</div>
                            </div>
                            <div className="detail-meta-item">
                                <div className="meta-label">
                                    <FiClock size={14} /> Status
                                </div>
                                <div className="meta-value">
                                    {getStatusBadge(selectedTask.status)}
                                </div>
                            </div>
                            {isCompleted && selectedTask.completedAt && (
                                <div className="detail-meta-item">
                                    <div className="meta-label">
                                        <FiCheckCircle size={14} /> Completed On
                                    </div>
                                    <div className="meta-value completed-text">
                                        {formatDate(selectedTask.completedAt)}
                                    </div>
                                </div>
                            )}
                            {isCancelled && selectedTask.cancelledAt && (
                                <div className="detail-meta-item">
                                    <div className="meta-label">
                                        <FiXCircle size={14} /> Cancelled On
                                    </div>
                                    <div className="meta-value cancelled-text">
                                        {formatDate(selectedTask.cancelledAt)}
                                    </div>
                                </div>
                            )}
                            {isCancelled && selectedTask.cancelledByName && (
                                <div className="detail-meta-item">
                                    <div className="meta-label">
                                        <FiUser size={14} /> Cancelled By
                                    </div>
                                    <div className="meta-value">{selectedTask.cancelledByName}</div>
                                </div>
                            )}
                        </div>

                        {/* Employee Notes (if completed) */}
                        {isCompleted && selectedTask.employeeNotes && (
                            <div className="detail-notes-section">
                                <div className="detail-notes-label">
                                    <FiInfo size={14} /> Your Notes
                                </div>
                                <div className="detail-notes-content">
                                    {selectedTask.employeeNotes}
                                </div>
                            </div>
                        )}

                        {/* Cancellation Reason (if cancelled) */}
                        {isCancelled && selectedTask.cancellationReason && (
                            <div className="detail-cancel-section">
                                <div className="detail-cancel-label">
                                    <FiInfo size={14} /> Cancellation Reason
                                </div>
                                <div className="detail-cancel-content">
                                    {selectedTask.cancellationReason}
                                </div>
                            </div>
                        )}

                        {/* Complete Action (only for pending) */}
                        {isPending && (
                            <>
                                <div className="detail-divider"></div>
                                <div className="detail-complete-section">
                                    <div className="detail-notes-input">
                                        <label htmlFor="completeNotes">Notes (Optional):</label>
                                        <textarea
                                            id="completeNotes"
                                            value={completeNotes}
                                            onChange={(e) => setCompleteNotes(e.target.value)}
                                            placeholder="Add any notes about this task (optional)..."
                                            rows={3}
                                            disabled={completing}
                                        />
                                        <div className="notes-hint">
                                            <FiInfo size={14} />
                                            <span>These notes will be visible to admin</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="task-detail-modal-footer">
                        <button
                            className="secondary-btn"
                            onClick={closeDetailModal}
                            disabled={completing}
                        >
                            Close
                        </button>
                        {isPending && (
                            <button
                                className="success-btn"
                                onClick={handleCompleteTask}
                                disabled={completing}
                            >
                                {completing ? (
                                    <>
                                        <span className="spinner"></span>
                                        Completing...
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle size={18} />
                                        Complete Task
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ================= LOADING STATE =================
    if (loading) {
        return (
            <EmployeeLayout>
                <div className="general-task-page">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading your general tasks...</p>
                    </div>
                </div>
            </EmployeeLayout>
        );
    }

    // ================= MAIN RENDER =================
    return (
        <EmployeeLayout>
            <div className="general-task-page">
                {/* HEADER SECTION */}
                <div className="page-header">
                    <div className="header-content">
                        <div className="header-left">
                            <h2>
                                <FiFileText size={28} /> My General Tasks
                            </h2>
                            <p className="subtitle">
                                View and manage your general tasks assigned by admin
                            </p>
                        </div>
                        <div className="header-right">
                            <button
                                className="refresh-btn"
                                onClick={loadTasks}
                                disabled={refreshing}
                            >
                                <FiRefreshCw className={refreshing ? "spinning" : ""} />
                                {refreshing ? "Refreshing..." : "Refresh"}
                            </button>
                        </div>
                    </div>

                    {/* STATS CARDS */}
                    <div className="header-stats">
                        <div className="stat-card">
                            <div className="stat-icon total">
                                <FiFileText />
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{stats.total}</span>
                                <span className="stat-label">Total Tasks</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon pending">
                                <FiClock />
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{stats.pending}</span>
                                <span className="stat-label">Pending</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon completed">
                                <FiCheckCircle />
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{stats.completed}</span>
                                <span className="stat-label">Completed</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon cancelled">
                                <FiXCircle />
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{stats.cancelled}</span>
                                <span className="stat-label">Cancelled</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FILTERS SECTION */}
                <div className="filters-section">
                    <div className="search-box">
                        <FiSearch size={18} />
                        <input
                            type="text"
                            placeholder="Search tasks by text..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-controls">
                        <div className="filter-group">
                            <FiFilter size={16} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {(searchTerm || statusFilter !== "all") && (
                            <button
                                className="clear-filters"
                                onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                }}
                            >
                                <FiX size={14} />
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* TASKS TABLE */}
                <div className="tasks-table-section">
                    {filteredTasks.length === 0 ? (
                        <div className="empty-state">
                            {tasks.length === 0 ? (
                                <>
                                    <FiFileText size={48} className="empty-icon" />
                                    <h4>No General Tasks Assigned</h4>
                                    <p>You don't have any general tasks assigned yet.</p>
                                    <p className="hint-text">General tasks are created by admin when needed.</p>
                                </>
                            ) : (
                                <>
                                    <FiSearch size={48} className="empty-icon" />
                                    <h4>No Tasks Found</h4>
                                    <p>No tasks match your current filters.</p>
                                    <button
                                        className="clear-filters-btn"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setStatusFilter("all");
                                        }}
                                    >
                                        Clear all filters
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="tasks-table">
                                <thead>
                                    <tr>
                                        <th className="col-date">Date</th>
                                        <th className="col-task">Task</th>
                                        <th className="col-admin">Admin</th>
                                        <th className="col-status">Status</th>
                                        <th className="col-action">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTasks.map((task) => (
                                        <tr
                                            key={task.taskId}
                                            className="task-row"
                                            onClick={() => openDetailModal(task)}
                                        >
                                            <td className="col-date">
                                                <div className="date-cell">
                                                    <FiCalendar size={14} />
                                                    <span>{formatDateShort(task.createdAt)}</span>
                                                </div>
                                            </td>
                                            <td className="col-task">
                                                <div className="task-cell" title={task.task}>
                                                    {task.task}
                                                </div>
                                            </td>
                                            <td className="col-admin">
                                                <div className="admin-cell">
                                                    <FiUser size={14} />
                                                    <span>{task.createdByName || "Admin"}</span>
                                                </div>
                                            </td>
                                            <td className="col-status">
                                                {getStatusBadge(task.status)}
                                            </td>
                                            <td className="col-action">
                                                {task.status === "pending" ? (
                                                    <button
                                                        className="complete-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openDetailModal(task);
                                                        }}
                                                    >
                                                        <FiCheck size={16} />
                                                        Complete
                                                    </button>
                                                ) : (
                                                    <span className="no-action">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* TASKS FOOTER */}
                {filteredTasks.length > 0 && (
                    <div className="tasks-footer">
                        <span>
                            Showing {filteredTasks.length} of {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                        </span>
                        {searchTerm && (
                            <span className="filter-badge">
                                <FiSearch size={12} /> "{searchTerm}"
                            </span>
                        )}
                        {statusFilter !== "all" && (
                            <span className="filter-badge">
                                <FiFilter size={12} /> {statusFilter}
                            </span>
                        )}
                    </div>
                )}

                {/* DETAIL MODAL */}
                {renderDetailModal()}
            </div>
        </EmployeeLayout>
    );
};

export default EmployeeGeneralTask;