import { useState, useEffect } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import EmployeeLayout from "../Layout/EmployeeLayout";
import {
  FiClock,
  FiCalendar,
  FiBriefcase,
  FiFileText,
  FiPlay,
  FiStopCircle,
  FiCheckCircle,
  FiAlertCircle,
  FiPlus,
  FiFilter,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiWatch,
  FiUser,
  FiTrendingUp
} from "react-icons/fi";
import "./EmployeeTaskLogs.scss";

const EmployeeTaskLogs = () => {
  // State declarations
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [completingTask, setCompletingTask] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Formik for new task
  const taskFormik = useFormik({
    initialValues: {
      date: new Date().toISOString().split("T")[0], // Today's date
      projectName: "",
      description: "",
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    validationSchema: Yup.object().shape({
      date: Yup.date().required("Date is required"),
      projectName: Yup.string().required("Project name is required"),
      description: Yup.string().required("Description is required"),
      startTime: Yup.string().required("Start time is required")
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/employee-task/create`,
          values,
          { withCredentials: true }
        );

        setSuccessMessage("Task started successfully!");
        resetForm();
        setShowTaskForm(false);
        loadTasks();

        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error("Error creating task:", error);
        setErrorMessage(error.response?.data?.message || "Failed to start task");
      } finally {
        setLoading(false);
      }
    }
  });

  // Formik for complete task
  const completeFormik = useFormik({
    initialValues: {
      endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    validationSchema: Yup.object().shape({
      endTime: Yup.string().required("End time is required")
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        setErrorMessage("");

        await axios.put(
          `${import.meta.env.VITE_API_URL}/employee-task/complete/${completingTask._id}`,
          values,
          { withCredentials: true }
        );

        setSuccessMessage("Task completed successfully!");
        resetForm();
        setCompletingTask(null);
        loadTasks();

        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error("Error completing task:", error);
        setErrorMessage(error.response?.data?.message || "Failed to complete task");
      } finally {
        setLoading(false);
      }
    }
  });

  // Load tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee-task/my-tasks`,
        { withCredentials: true }
      );
      setTasks(response.data);
      setFilteredTasks(response.data);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setErrorMessage("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Filter tasks
  useEffect(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(task => task.date === dateFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, dateFilter, statusFilter]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate duration
  const calculateDuration = (startTime, endTime) => {
    if (!endTime) return "In Progress";

    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      
      hours = parseInt(hours);
      minutes = parseInt(minutes);

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      return { hours, minutes };
    };

    const start = parseTime(startTime);
    const end = parseTime(endTime);

    let totalMinutes = (end.hours * 60 + end.minutes) - (start.hours * 60 + start.minutes);
    
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight tasks
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get today's date for default
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Get unique dates for filter
  const getUniqueDates = () => {
    const dates = [...new Set(tasks.map(task => task.date))];
    return dates.sort((a, b) => new Date(b) - new Date(a));
  };

  // Get task statistics
  const getTaskStats = () => {
    const completed = tasks.filter(task => task.status === "COMPLETED").length;
    const inProgress = tasks.filter(task => task.status === "IN_PROGRESS").length;
    const totalHours = tasks.reduce((total, task) => {
      if (task.endTime) {
        const duration = calculateDuration(task.startTime, task.endTime);
        const hoursMatch = duration.match(/(\d+)h/);
        if (hoursMatch) total += parseInt(hoursMatch[1]);
      }
      return total;
    }, 0);

    return { completed, inProgress, totalHours };
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      setLoading(true);
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/employee-task/delete/${taskId}`,
        { withCredentials: true }
      );

      setSuccessMessage("Task deleted successfully!");
      loadTasks();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting task:", error);
      setErrorMessage("Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const stats = getTaskStats();

  return (
    <EmployeeLayout>
      <div className="employee-task-logs">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>
              <FiClock size={32} /> Task Logs
            </h1>
            <p className="subtitle">
              Track your daily tasks and work hours
            </p>
          </div>
          
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FiCheckCircle size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stats.completed}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiPlay size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stats.inProgress}</span>
                <span className="stat-label">In Progress</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiWatch size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stats.totalHours}h</span>
                <span className="stat-label">Total Hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="success-message">
            <FiCheckCircle size={20} /> {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="error-message">
            <FiAlertCircle size={20} /> {errorMessage}
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <FiSearch size={20} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Dates</option>
              {getUniqueDates().map(date => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
            
            <button
              className="clear-filters"
              onClick={() => {
                setSearchTerm("");
                setDateFilter("");
                setStatusFilter("");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="action-bar">
          <button
            className="new-task-btn"
            onClick={() => {
              setShowTaskForm(true);
              taskFormik.resetForm({
                values: {
                  date: getTodayDate(),
                  projectName: "",
                  description: "",
                  startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              });
            }}
            disabled={loading}
          >
            <FiPlus size={18} /> Start New Task
          </button>
          
          <button
            className="refresh-btn"
            onClick={loadTasks}
            disabled={loading}
          >
            <FiRefreshCw size={18} /> Refresh
          </button>
        </div>

        {/* New Task Form */}
        {showTaskForm && (
          <div className="task-form-container">
            <div className="form-header">
              <h3>
                <FiPlay size={20} /> Start New Task
              </h3>
              <button
                className="close-form"
                onClick={() => setShowTaskForm(false)}
                disabled={loading}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={taskFormik.handleSubmit} className="task-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="date">
                    <FiCalendar size={16} /> Date *
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={taskFormik.values.date}
                    onChange={taskFormik.handleChange}
                    onBlur={taskFormik.handleBlur}
                    className={taskFormik.touched.date && taskFormik.errors.date ? 'error' : ''}
                    disabled={loading}
                    max={getTodayDate()}
                  />
                  {taskFormik.touched.date && taskFormik.errors.date && (
                    <div className="error-text">{taskFormik.errors.date}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="startTime">
                    <FiClock size={16} /> Start Time *
                  </label>
                  <input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={taskFormik.values.startTime}
                    onChange={taskFormik.handleChange}
                    onBlur={taskFormik.handleBlur}
                    className={taskFormik.touched.startTime && taskFormik.errors.startTime ? 'error' : ''}
                    disabled={loading}
                  />
                  {taskFormik.touched.startTime && taskFormik.errors.startTime && (
                    <div className="error-text">{taskFormik.errors.startTime}</div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="projectName">
                    <FiBriefcase size={16} /> Project Name *
                  </label>
                  <input
                    id="projectName"
                    name="projectName"
                    type="text"
                    placeholder="Enter project name"
                    value={taskFormik.values.projectName}
                    onChange={taskFormik.handleChange}
                    onBlur={taskFormik.handleBlur}
                    className={taskFormik.touched.projectName && taskFormik.errors.projectName ? 'error' : ''}
                    disabled={loading}
                  />
                  {taskFormik.touched.projectName && taskFormik.errors.projectName && (
                    <div className="error-text">{taskFormik.errors.projectName}</div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">
                    <FiFileText size={16} /> Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe the task..."
                    rows="3"
                    value={taskFormik.values.description}
                    onChange={taskFormik.handleChange}
                    onBlur={taskFormik.handleBlur}
                    className={taskFormik.touched.description && taskFormik.errors.description ? 'error' : ''}
                    disabled={loading}
                  />
                  {taskFormik.touched.description && taskFormik.errors.description && (
                    <div className="error-text">{taskFormik.errors.description}</div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowTaskForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={loading || !taskFormik.isValid}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span> Starting...
                    </>
                  ) : (
                    <>
                      <FiPlay size={16} /> Start Task
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        <div className="tasks-container">
          <div className="tasks-header">
            <h3>
              <FiClock size={20} /> My Tasks ({filteredTasks.length})
            </h3>
            {loading && <span className="loading-text">Loading...</span>}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="empty-tasks">
              <FiClock size={48} />
              <h4>No Tasks Found</h4>
              <p>{tasks.length === 0 ? "Start your first task to begin tracking" : "No tasks match your filters"}</p>
              {tasks.length === 0 && (
                <button
                  className="start-first-btn"
                  onClick={() => setShowTaskForm(true)}
                >
                  <FiPlay size={16} /> Start Your First Task
                </button>
              )}
            </div>
          ) : (
            <div className="tasks-list">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className={`task-card ${task.status === "IN_PROGRESS" ? "in-progress" : "completed"}`}
                >
                  <div className="task-header">
                    <div className="task-title-section">
                      <h4 className="project-name">
                        {task.projectName}
                      </h4>
                      <div className="task-meta">
                        <span className="date">
                          <FiCalendar size={12} />
                          {formatDate(task.date)}
                        </span>
                        <span className={`status-badge ${task.status.toLowerCase()}`}>
                          {task.status === "IN_PROGRESS" ? (
                            <>
                              <FiPlay size={12} /> In Progress
                            </>
                          ) : (
                            <>
                              <FiCheckCircle size={12} /> Completed
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="task-actions">
                      {task.status === "IN_PROGRESS" ? (
                        <button
                          className="complete-btn"
                          onClick={() => setCompletingTask(task)}
                          disabled={loading}
                          title="Complete Task"
                        >
                          <FiStopCircle size={16} /> Complete
                        </button>
                      ) : (
                        <span className="duration">
                          <FiWatch size={14} />
                          {calculateDuration(task.startTime, task.endTime)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="task-body">
                    <p className="description">{task.description}</p>
                    
                    <div className="time-info">
                      <div className="time-row">
                        <span className="label">Started:</span>
                        <span className="value">{task.startTime}</span>
                      </div>
                      {task.endTime && (
                        <div className="time-row">
                          <span className="label">Completed:</span>
                          <span className="value">{task.endTime}</span>
                        </div>
                      )}
                    </div>

                    <div className="task-footer">
                      <div className="created-info">
                        <span className="created-at">
                          Created: {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {task.status === "COMPLETED" && (
                        <button
                          className="delete-btn"
                          onClick={() => deleteTask(task._id)}
                          disabled={loading}
                          title="Delete Task"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complete Task Modal */}
        {completingTask && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>
                  <FiStopCircle size={24} /> Complete Task
                </h3>
                <button
                  className="close-modal"
                  onClick={() => {
                    setCompletingTask(null);
                    completeFormik.resetForm();
                  }}
                  disabled={loading}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="task-info-card">
                  <h4>{completingTask.projectName}</h4>
                  <p className="description">{completingTask.description}</p>
                  <div className="info-row">
                    <span className="label">Started at:</span>
                    <span className="value">{completingTask.startTime}</span>
                  </div>
                </div>

                <form onSubmit={completeFormik.handleSubmit} className="complete-form">
                  <div className="form-group">
                    <label htmlFor="endTime">
                      <FiClock size={16} /> End Time *
                    </label>
                    <input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={completeFormik.values.endTime}
                      onChange={completeFormik.handleChange}
                      onBlur={completeFormik.handleBlur}
                      className={completeFormik.touched.endTime && completeFormik.errors.endTime ? 'error' : ''}
                      disabled={loading}
                    />
                    {completeFormik.touched.endTime && completeFormik.errors.endTime && (
                      <div className="error-text">{completeFormik.errors.endTime}</div>
                    )}
                  </div>

                  <div className="duration-preview">
                    <span className="label">Duration:</span>
                    <span className="value">
                      {calculateDuration(completingTask.startTime, completeFormik.values.endTime)}
                    </span>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => {
                        setCompletingTask(null);
                        completeFormik.resetForm();
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="primary-btn"
                      disabled={loading || !completeFormik.isValid}
                    >
                      {loading ? (
                        <>
                          <span className="spinner"></span> Completing...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle size={16} /> Complete Task
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeTaskLogs;