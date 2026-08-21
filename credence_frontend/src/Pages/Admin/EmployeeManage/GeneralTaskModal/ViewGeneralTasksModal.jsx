// components/AdminEmployees/components/ViewGeneralTasksModal.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
    FiX,
    FiFileText,
    FiClock,
    FiUser,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiTrash2,
    FiCalendar,
    FiInfo
} from "react-icons/fi";

const ViewGeneralTasksModal = ({
    isOpen,
    onClose,
    employee,
    onTaskUpdated
}) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [selectedTaskText, setSelectedTaskText] = useState("");
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (isOpen && employee) {
            loadTasks();
        }
    }, [isOpen, employee]);

    const loadTasks = async () => {
        if (!employee?.employeeId) return;

        try {
            setLoadingTasks(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin-employee/general-tasks/${employee.employeeId}`,
                { withCredentials: true }
            );

            if (response.data.success) {
                setTasks(response.data.data.tasks || []);
            }
        } catch (error) {
            console.error("Error loading tasks:", error);
            toast.error("Failed to load general tasks", {
                position: "top-right",
                autoClose: 3000,
                theme: "dark"
            });
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleCancelTask = async () => {
        if (!selectedTaskId) return;

        try {
            setCancelling(true);
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/admin-employee/general-task/cancel/${selectedTaskId}`,
                {
                    cancellationReason: "Cancelled by admin"
                },
                { withCredentials: true }
            );

            toast.success(response.data.message || "Task cancelled successfully!", {
                position: "top-right",
                autoClose: 3000,
                theme: "dark"
            });

            setShowCancelConfirm(false);
            setSelectedTaskId(null);
            setSelectedTaskText("");

            await loadTasks();

            if (onTaskUpdated) {
                onTaskUpdated();
            }

        } catch (error) {
            console.error("Error cancelling task:", error);
            toast.error(error.response?.data?.message || "Failed to cancel task", {
                position: "top-right",
                autoClose: 5000,
                theme: "dark"
            });
        } finally {
            setCancelling(false);
        }
    };

    const openCancelConfirm = (taskId, taskText) => {
        setSelectedTaskId(taskId);
        setSelectedTaskText(taskText);
        setShowCancelConfirm(true);
    };

    const closeCancelConfirm = () => {
        setShowCancelConfirm(false);
        setSelectedTaskId(null);
        setSelectedTaskText("");
    };

    const formatDate = (date) => {
        if (!date) return "—";
        const d = new Date(date);
        return d.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <span className="view-task-status pending">
                        <FiClock size={12} /> Pending
                    </span>
                );
            case "completed":
                return (
                    <span className="view-task-status completed">
                        <FiCheckCircle size={12} /> Completed
                    </span>
                );
            case "cancelled":
                return (
                    <span className="view-task-status cancelled">
                        <FiXCircle size={12} /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className="view-task-status unknown">
                        <FiAlertCircle size={12} /> {status}
                    </span>
                );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="view-general-tasks-overlay" onClick={onClose}>
            <div className="view-general-tasks-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="view-general-tasks-header">
                    <h3>
                        <FiFileText size={24} className="header-icon" />
                        General Tasks - {employee?.name || "Employee"}
                    </h3>
                    <button
                        className="view-general-tasks-close"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close modal"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="view-general-tasks-body">
                    {/* Employee Info */}
                    <div className="view-general-tasks-employee-card">
                        <div className="view-general-tasks-avatar">
                            {employee?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="view-general-tasks-employee-info">
                            <h4>{employee?.name || "Unknown Employee"}</h4>
                            <p>
                                <FiUser size={14} />
                                {employee?.email || "No email"}
                            </p>
                            <small className="view-general-tasks-count">
                                <FiFileText size={12} />
                                {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
                            </small>
                        </div>
                    </div>

                    {/* Tasks Table */}
                    {loadingTasks ? (
                        <div className="view-general-tasks-loading">
                            <div className="view-general-tasks-spinner"></div>
                            <p>Loading tasks...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="view-general-tasks-empty">
                            <FiFileText size={48} className="empty-icon" />
                            <h4>No General Tasks Found</h4>
                            <p>No general tasks have been assigned to this employee yet.</p>
                            <p className="view-general-tasks-hint">Use the "Add General Task" button to create one.</p>
                        </div>
                    ) : (
                        <div className="view-general-tasks-table-wrap">
                            <table className="view-general-tasks-table">
                                <thead>
                                    <tr>
                                        <th className="col-date">Date Created</th>
                                        <th className="col-task">Task</th>
                                        <th className="col-status">Status</th>
                                        <th className="col-complete">Complete Date</th>
                                        <th className="col-notes">Employee Notes</th>
                                        <th className="col-actions">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.map((task) => (
                                        <tr key={task.taskId}>
                                            <td className="col-date">{formatDate(task.createdAt)}</td>
                                            <td className="col-task">
                                                <div className="task-text">{task.task}</div>
                                                <small className="task-created-by">
                                                    <FiUser size={10} /> {task.createdByName || "Admin"}
                                                </small>
                                            </td>
                                            <td className="col-status">{getStatusBadge(task.status)}</td>
                                            <td className="col-complete">
                                                {task.status === "completed" ? (
                                                    <span className="complete-date">
                                                        <FiCheckCircle size={12} />
                                                        {formatDate(task.completedAt)}
                                                    </span>
                                                ) : (
                                                    <span className="not-completed">—</span>
                                                )}
                                            </td>
                                            <td className="col-notes">
                                                {task.employeeNotes ? (
                                                    <div className="note-text" title={task.employeeNotes}>
                                                        <FiInfo size={12} />
                                                        <span>{task.employeeNotes}</span>
                                                    </div>
                                                ) : (
                                                    <span className="no-notes">—</span>
                                                )}
                                            </td>
                                            <td className="col-actions">
                                                {task.status === "pending" && (
                                                    <button
                                                        className="view-task-cancel-btn"
                                                        onClick={() => openCancelConfirm(task.taskId, task.task)}
                                                        disabled={cancelling}
                                                        title="Cancel this task"
                                                    >
                                                        <FiTrash2 size={14} />
                                                        Cancel
                                                    </button>
                                                )}
                                                {task.status === "completed" && (
                                                    <span className="view-task-done">✅ Done</span>
                                                )}
                                                {task.status === "cancelled" && (
                                                    <span className="view-task-cancelled">🚫 Cancelled</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="view-task-confirm-overlay" onClick={closeCancelConfirm}>
                    <div className="view-task-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="view-task-confirm-header">
                            <h3>
                                <FiAlertCircle size={24} />
                                Cancel Task
                            </h3>
                            <button
                                className="view-task-confirm-close"
                                onClick={closeCancelConfirm}
                                disabled={cancelling}
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                        <div className="view-task-confirm-body">
                            <div className="view-task-confirm-content">
                                <div className="view-task-confirm-icon warning">
                                    <FiAlertCircle size={48} />
                                </div>
                                <div className="view-task-confirm-details">
                                    <h4>Are you sure you want to cancel this task?</h4>
                                    <p className="view-task-preview">
                                        <strong>Task:</strong> {selectedTaskText}
                                    </p>
                                    <p className="view-task-warning">
                                        This action cannot be undone. The task will be marked as <strong>CANCELLED</strong>.
                                    </p>
                                </div>
                                <div className="view-task-confirm-actions">
                                    <button
                                        type="button"
                                        className="view-task-confirm-secondary"
                                        onClick={closeCancelConfirm}
                                        disabled={cancelling}
                                    >
                                        No, Keep Task
                                    </button>
                                    <button
                                        type="button"
                                        className="view-task-confirm-danger"
                                        onClick={handleCancelTask}
                                        disabled={cancelling}
                                    >
                                        {cancelling ? (
                                            <span className="view-task-confirm-spinner"></span>
                                        ) : (
                                            <>
                                                <FiTrash2 size={18} /> Yes, Cancel Task
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewGeneralTasksModal;