// components/AdminEmployees/components/AssignGeneralTaskModal.jsx
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
    FiX,
    FiFileText,
    FiAlertCircle,
    FiCheckCircle,
    FiClock,
    FiUser,
    FiInfo
} from "react-icons/fi";

const AssignGeneralTaskModal = ({
    isOpen,
    onClose,
    employee,
    onTaskCreated
}) => {
    const [taskText, setTaskText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!taskText.trim()) {
            setError("Please enter a task description");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/admin-employee/general-task/create`,
                {
                    employeeId: employee.employeeId,
                    task: taskText.trim()
                },
                { withCredentials: true }
            );

            toast.success(response.data.message || "General task created successfully!", {
                position: "top-right",
                autoClose: 3000,
                theme: "dark"
            });

            if (onTaskCreated) {
                await onTaskCreated();
            }

            setTaskText("");
            setError("");
            onClose();

        } catch (error) {
            console.error("Error creating general task:", error);

            toast.error(error.response?.data?.message || "Failed to create general task", {
                position: "top-right",
                autoClose: 5000,
                theme: "dark"
            });

            setError(error.response?.data?.message || "An error occurred while creating the task");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setTaskText("");
            setError("");
            onClose();
        }
    };

    const handleTextChange = (e) => {
        setTaskText(e.target.value);
        if (error) setError("");
    };

    if (!isOpen) return null;

    return (
        <div className="assign-general-task-overlay" onClick={handleClose}>
            <div className="assign-general-task-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="assign-general-task-header">
                    <h3>
                        <FiFileText size={24} className="header-icon" />
                        Assign General Task
                    </h3>
                    <button
                        className="assign-general-task-close"
                        onClick={handleClose}
                        disabled={loading}
                        aria-label="Close modal"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="assign-general-task-body">
                    {/* Employee Info Card */}
                    <div className="assign-general-task-employee-card">
                        <div className="assign-general-task-avatar">
                            {employee?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="assign-general-task-employee-info">
                            <h4>{employee?.name || "Unknown Employee"}</h4>
                            <p>
                                <FiUser size={14} />
                                {employee?.email || "No email"}
                            </p>
                            <small className="assign-general-task-hint">
                                <FiClock size={12} />
                                This task will appear in employee's dashboard
                            </small>
                        </div>
                    </div>

                    {/* Task Form */}
                    <form onSubmit={handleSubmit} className="assign-general-task-form">
                        <div className="assign-general-task-group">
                            <label htmlFor="generalTask">
                                <FiFileText size={16} /> Task Description *
                            </label>
                            <textarea
                                id="generalTask"
                                value={taskText}
                                onChange={handleTextChange}
                                placeholder="Enter any task description (e.g., Review Q1 financial reports, Prepare annual summary, etc.)"
                                rows={5}
                                className={error ? "assign-general-task-error" : ""}
                                disabled={loading}
                                autoFocus
                            />
                            {error && (
                                <div className="assign-general-task-error-text">
                                    <FiAlertCircle size={14} /> {error}
                                </div>
                            )}
                            <div className="assign-general-task-hint-text">
                                <FiInfo size={14} />
                                <span>
                                    This is a general task not associated with any specific client.
                                    Employee can mark it as completed from their dashboard.
                                </span>
                            </div>
                        </div>

                        {/* Task Info Box */}
                        <div className="assign-general-task-info-box">
                            <div className="assign-general-task-info-row">
                                <FiCheckCircle size={16} className="info-icon" />
                                <span>Status will be <strong>PENDING</strong> initially</span>
                            </div>
                            <div className="assign-general-task-info-row">
                                <FiUser size={16} className="info-icon" />
                                <span>Created by: <strong>{employee?.createdBy || "You"}</strong></span>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="assign-general-task-actions">
                            <button
                                type="button"
                                className="assign-general-task-secondary"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="assign-general-task-primary"
                                disabled={loading || !taskText.trim()}
                            >
                                {loading ? (
                                    <>
                                        <span className="assign-general-task-spinner"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FiFileText size={18} />
                                        Create General Task
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignGeneralTaskModal;