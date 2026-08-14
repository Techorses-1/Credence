import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "../Layout/AdminLayout";
import {
  FiEdit2,
  FiX,
  FiUsers,
  FiCalendar,
  FiBriefcase,
  FiUser,
  FiMail,
  FiPhone,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiPlus,
  FiTrash2,
  FiUserCheck,
  FiUserX,
  FiCheck,
  FiAlertTriangle,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiArchive,
  FiFileText,
  FiInfo,
  FiChevronDown
} from "react-icons/fi";
import "./AdminEmployees.scss";
// Validation schemas
const employeeSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^\d{10}$/, "Phone must be 10 digits")
    .required("Phone is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .optional()
});
const assignSchema = Yup.object().shape({
  clientId: Yup.string().required("Client is required"),
  year: Yup.number()
    .min(2020, "Year must be 2020 or later")
    .max(2100, "Year must be reasonable")
    .required("Year is required"),
  month: Yup.number()
    .min(1, "Month must be between 1-12")
    .max(12, "Month must be between 1-12")
    .required("Month is required"),
  tasks: Yup.array()
    .min(1, "Select at least one task")
    .required("Select at least one task")
});
const AdminEmployees = () => {
  // State declarations
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);
  // Selected items
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [assigningEmployee, setAssigningEmployee] = useState(null);
  const [employeeToConfirm, setEmployeeToConfirm] = useState(null);
  const [confirmAction, setConfirmAction] = useState(""); // "deactivate" or "activate"
  const [confirmMessage, setConfirmMessage] = useState("");
  const [assignmentToRemove, setAssignmentToRemove] = useState(null);
  // Client task status state
  const [clientTaskStatus, setClientTaskStatus] = useState(null);
  const [loadingTaskStatus, setLoadingTaskStatus] = useState(false);
  // Mobile search states for client dropdown
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const dropdownRef = useRef(null);
  // Task options
  const taskOptions = [
    { value: "Bookkeeping", label: "Bookkeeping" },
    { value: "VAT Filing Computation", label: "VAT Filing Computation" },
    { value: "VAT Filing", label: "VAT Filing" },
    { value: "Financial Statement Generation", label: "Financial Statement Generation" },
    { value: "Audit", label: "Audit" }
  ];
  // Current month/year
  const currentMonth = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  };
  // Formik for Add/Edit Employee
  const employeeFormik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: ""
    },
    validationSchema: employeeSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const payload = {
          name: values.name,
          email: values.email,
          phone: values.phone
        };
        // Only include password if provided
        if (values.password && values.password.trim() !== "") {
          payload.password = values.password;
        }
        // For new employees, check if password exists
        if (!selectedEmployee && !values.password) {
          toast.error("Password is required for new employees");
          setLoading(false);
          return;
        }
        if (selectedEmployee) {
          // Update existing employee
          const response = await axios.put(
            `${import.meta.env.VITE_API_URL}/admin-employee/update/${selectedEmployee.employeeId}`,
            payload,
            { withCredentials: true }
          );
          toast.success(response.data.message || "Employee updated successfully!", {
            position: "top-right",
            autoClose: 3000,
            theme: "dark"
          });
        } else {
          // Create new employee
          if (!values.password) {
            toast.error("Password is required for new employees", {
              position: "top-right",
              autoClose: 3000,
              theme: "dark"
            });
            setLoading(false);
            return;
          }
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/admin-employee/create`,
            payload,
            { withCredentials: true }
          );
          toast.success(response.data.message || "Employee created successfully!", {
            position: "top-right",
            autoClose: 3000,
            theme: "dark"
          });
        }
        resetEmployeeForm();
        loadEmployees();
      } catch (error) {
        console.error("Error saving employee:", error);
        toast.error(error.response?.data?.message || "An error occurred", {
          position: "top-right",
          autoClose: 5000,
          theme: "dark"
        });
      } finally {
        setLoading(false);
      }
    }
  });
  // Formik for Assign Client (UPDATED WITH MULTIPLE TASKS - DOCUMENT CHECK REMOVED)
  const assignFormik = useFormik({
    initialValues: {
      clientId: "",
      year: currentMonth.year,
      month: currentMonth.month,
      tasks: []  // Changed from single task to array
    },
    validationSchema: assignSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        // ===== DOCUMENT CHECK REMOVED - Proceed directly with assignment =====

        // Proceed with multiple tasks assignment
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin-employee/assign-client`,
          {
            employeeId: assigningEmployee.employeeId,
            clientId: values.clientId,
            year: Number(values.year),
            month: Number(values.month),
            tasks: values.tasks  // Send array of tasks
          },
          { withCredentials: true }
        );
        toast.success(response.data.message || "Tasks assigned successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark"
        });
        resetAssignForm();
        loadEmployees();
        // Refresh client task status after assignment
        if (values.clientId && values.year && values.month) {
          loadClientTaskStatus(values.clientId, values.year, values.month);
        }
      } catch (error) {
        console.error("Error assigning tasks:", error);
        toast.error(error.response?.data?.message || "An error occurred", {
          position: "top-right",
          autoClose: 5000,
          theme: "dark"
        });
      } finally {
        setLoading(false);
      }
    }
  });
  // ✅ FIXED: loadEmployees now returns fresh data so handleRemoveAssignment
  // can use it directly instead of reading from stale state
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin-employee/all`,
        { withCredentials: true }
      );
      setEmployees(res.data);
      return res.data; // ← CHANGED: return fresh data
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Failed to load employees", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
      return null; // ← CHANGED: return null on error
    } finally {
      setLoading(false);
    }
  };
  const loadClients = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin-employee/all-clients`,
        { withCredentials: true }
      );
      setClients(res.data);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };
  const loadClientTaskStatus = async (clientId, year, month) => {
    try {
      setLoadingTaskStatus(true);
      setClientTaskStatus(null);
      console.log("📡 Loading task status for:", { clientId, year, month });
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin-employee/client-tasks-status/${clientId}?year=${year}&month=${month}`,
        { withCredentials: true }
      );
      console.log("✅ Task status received:", res.data);
      const expectedYear = Number(year);
      const expectedMonth = Number(month);
      const receivedYear = Number(res.data.year);
      const receivedMonth = Number(res.data.month);
      if (res.data.clientId === clientId &&
        receivedYear === expectedYear &&
        receivedMonth === expectedMonth) {
        setClientTaskStatus(res.data);
        console.log("✅ Task status SET in state");
      } else {
        console.warn("⚠️ Response doesn't match current selection", {
          expected: { clientId, year: expectedYear, month: expectedMonth },
          received: {
            clientId: res.data.clientId,
            year: receivedYear,
            month: receivedMonth
          }
        });
        setClientTaskStatus(res.data);
      }
    } catch (error) {
      console.error("❌ Error loading client task status:", error);
      setClientTaskStatus(null);
    } finally {
      setLoadingTaskStatus(false);
    }
  };
  useEffect(() => {
    loadEmployees();
    loadClients();
  }, []);
  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // Load task status when client/date changes
  useEffect(() => {
    if (!showAssignModal) return;
    setClientTaskStatus(null);
    const { clientId, year, month } = assignFormik.values;
    if (!clientId || !year || !month) {
      return;
    }
    const timer = setTimeout(() => {
      loadClientTaskStatus(clientId, year, month);
    }, 300);
    return () => clearTimeout(timer);
  }, [showAssignModal, assignFormik.values.clientId, assignFormik.values.year, assignFormik.values.month]);
  // Open Edit Modal
  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    employeeFormik.setValues({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      password: ""
    });
    setShowEditModal(true);
  };
  // Open Assign Modal (UPDATED)
  const openAssignModal = (employee) => {
    setAssigningEmployee(employee);
    assignFormik.setValues({
      clientId: "",
      year: currentMonth.year,
      month: currentMonth.month,
      tasks: []  // Initialize empty array
    });
    setClientTaskStatus(null);
    setClientSearchTerm(""); // Reset client search
    setShowClientDropdown(false);
    setShowAssignModal(true);
  };
  // Open Confirm Modal for Deactivate
  const openDeactivateConfirm = (employee) => {
    setEmployeeToConfirm(employee);
    setConfirmAction("deactivate");
    setConfirmMessage(`Are you sure you want to deactivate "${employee.name}"? This will remove their current month task assignments from clients.`);
    setShowConfirmModal(true);
  };
  // Open Confirm Modal for Activate
  const openActivateConfirm = (employee) => {
    setEmployeeToConfirm(employee);
    setConfirmAction("activate");
    setConfirmMessage(`Activate "${employee.name}"? Employee will be available for new task assignments.`);
    setShowConfirmModal(true);
  };
  // Open Remove Assignment Confirmation
  const openRemoveAssignmentConfirm = (assignment) => {
    setAssignmentToRemove(assignment);
    setShowRemoveConfirmModal(true);
  };
  // ✅ FIXED: Use freshEmployees returned from loadEmployees() instead of
  // reading stale employees state (which hasn't re-rendered yet at that point)
  const handleRemoveAssignment = async () => {
    if (!assignmentToRemove || !assigningEmployee) return;
    try {
      setLoading(true);
      // Store these values before they get cleared
      const clientId = assignmentToRemove.clientId;
      const year = assignmentToRemove.year;
      const month = assignmentToRemove.month;
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin-employee/remove-assignment`,
        {
          data: {
            clientId: assignmentToRemove.clientId,
            employeeId: assigningEmployee.employeeId,
            year: assignmentToRemove.year,
            month: assignmentToRemove.month,
            task: assignmentToRemove.task
          },
          withCredentials: true
        }
      );
      toast.success(response.data.message || "Task assignment removed successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
      // Close modal first
      closeRemoveConfirmModal();
      // ✅ CHANGED: use returned fresh data directly instead of stale state
      const freshEmployees = await loadEmployees();
      if (freshEmployees) {
        const updatedEmployee = freshEmployees.find(
          emp => emp.employeeId === assigningEmployee.employeeId
        );
        if (updatedEmployee) {
          setAssigningEmployee(updatedEmployee);
        }
      }
      // Refresh task status with the stored values
      if (clientId && year && month) {
        await loadClientTaskStatus(clientId, year, month);
      }
    } catch (error) {
      console.error("Error removing assignment:", error);
      toast.error(error.response?.data?.message || "Failed to remove assignment", {
        position: "top-right",
        autoClose: 5000,
        theme: "dark"
      });
    } finally {
      setLoading(false);
    }
  };
  // Handle Confirm Action (Deactivate/Activate)
  const handleConfirmAction = async () => {
    if (!employeeToConfirm) return;
    try {
      setLoading(true);
      if (confirmAction === "deactivate") {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin-employee/deactivate/${employeeToConfirm.employeeId}`,
          {},
          { withCredentials: true }
        );
        toast.success(response.data.message || "Employee deactivated successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark"
        });
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin-employee/activate/${employeeToConfirm.employeeId}`,
          {},
          { withCredentials: true }
        );
        toast.success(response.data.message || "Employee activated successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark"
        });
      }
      loadEmployees();
      closeConfirmModal();
    } catch (error) {
      console.error(`Error ${confirmAction}ing employee:`, error);
      toast.error(error.response?.data?.message || `Failed to ${confirmAction} employee`, {
        position: "top-right",
        autoClose: 5000,
        theme: "dark"
      });
    } finally {
      setLoading(false);
    }
  };
  // Handle task selection (checkbox)
  const handleTaskToggle = (taskValue) => {
    const currentTasks = assignFormik.values.tasks;
    let newTasks;
    if (currentTasks.includes(taskValue)) {
      // Remove task if already selected
      newTasks = currentTasks.filter(t => t !== taskValue);
    } else {
      // Add task if not selected
      newTasks = [...currentTasks, taskValue];
    }
    assignFormik.setFieldValue('tasks', newTasks);
  };
  // Handle select all tasks
  const handleSelectAllTasks = () => {
    const availableTasks = getAvailableTasks().map(t => t.value);
    assignFormik.setFieldValue('tasks', availableTasks);
  };
  // Handle clear all tasks
  const handleClearAllTasks = () => {
    assignFormik.setFieldValue('tasks', []);
  };
  // Handle client selection from dropdown
  const handleClientSelect = (clientId) => {
    assignFormik.setFieldValue('clientId', clientId);
    setShowClientDropdown(false);
    setClientSearchTerm("");
  };
  // Close modals
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setEmployeeToConfirm(null);
    setConfirmAction("");
    setConfirmMessage("");
  };
  const closeRemoveConfirmModal = () => {
    setShowRemoveConfirmModal(false);
    setAssignmentToRemove(null);
  };
  // Reset forms
  const resetEmployeeForm = () => {
    employeeFormik.resetForm();
    setSelectedEmployee(null);
    setShowAddModal(false);
    setShowEditModal(false);
    setShowPassword(false);
  };
  const resetAssignForm = () => {
    assignFormik.resetForm({
      values: {
        clientId: "",
        year: currentMonth.year,
        month: currentMonth.month,
        tasks: []
      }
    });
    setAssigningEmployee(null);
    setClientTaskStatus(null);
    setClientSearchTerm("");
    setShowClientDropdown(false);
    setShowAssignModal(false);
  };
  // Format month name
  const getMonthName = (month) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "";
  };
  // Format month-year string
  const getMonthYear = (month, year) => {
    return `${getMonthName(month)} ${year}`;
  };
  // Format phone number
  const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };
  // Get assigned tasks count
  const getAssignedCount = (employee) => {
    return employee.assignedClients?.filter(ac => !ac.isRemoved).length || 0;
  };
  // Filtered employees based on search
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Filtered clients based on search (for mobile dropdown)
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()))
  );
  // Get current month assignments
  const getCurrentMonthAssignments = (employee) => {
    const currentYear = new Date().getFullYear();
    const currentMonthNum = new Date().getMonth() + 1;
    return employee.assignedClients?.filter(
      assignment => assignment.year === currentYear &&
        assignment.month === currentMonthNum &&
        !assignment.isRemoved
    ) || [];
  };
  // Get past assignments for display
  const getPastAssignments = (employee) => {
    if (!employee?.assignedClients) return [];
    return [...employee.assignedClients]
      .filter(assignment => !assignment.isRemoved)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  };
  // Get available tasks (filter out already assigned tasks)
  const getAvailableTasks = () => {
    if (!clientTaskStatus || !clientTaskStatus.taskStatus) {
      return taskOptions;
    }
    const assignedTasks = clientTaskStatus.taskStatus
      .filter(task => task.isAssigned)
      .map(task => task.task);
    return taskOptions.filter(taskOption =>
      !assignedTasks.includes(taskOption.value)
    );
  };
  // Check if task is already assigned
  const isTaskAlreadyAssigned = (task) => {
    if (!clientTaskStatus || !clientTaskStatus.taskStatus) return false;
    const taskStatus = clientTaskStatus.taskStatus.find(t => t.task === task);
    return taskStatus ? taskStatus.isAssigned : false;
  };
  // Get selected client name
  const getSelectedClientName = () => {
    if (!assignFormik.values.clientId) return "Select a client";
    const client = clients.find(c => c.clientId === assignFormik.values.clientId);
    return client ? client.name : "Select a client";
  };
  return (
    <AdminLayout>
      <ToastContainer />
      <div className="admin-employees">
        {/* Header Section */}
        <div className="header-section">
          <div className="title-section">
            <h1 className="page-title">
              <FiUsers size={28} /> Employee Management
            </h1>
            <p className="page-subtitle">
              Manage employees and assign tasks month-wise to clients
            </p>
          </div>
          <div className="action-section">
            <button
              className="add-btn"
              onClick={() => setShowAddModal(true)}
              disabled={loading}
            >
              <FiPlus size={18} /> Add Employee
            </button>
          </div>
        </div>
        {/* Employees Table */}
        <div className="table-container">
          <div className="table-header">
            <div className="table-title">
              <h3>
                <FiUsers /> All Employees
              </h3>
              <div className="table-stats">
                <span className="count-badge">
                  {employees.filter(e => e.isActive).length} active
                </span>
                <span className="assignments-badge">
                  {employees.reduce((total, emp) => total + getAssignedCount(emp), 0)} total task assignments
                </span>
              </div>
            </div>
            <div className="table-controls">
              <div className="search-box">
                <FiSearch size={18} />
                <input
                  type="text"
                  placeholder="Search employees by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
          {loading && filteredEmployees.length === 0 ? (
            <div className="empty-state">
              <div className="loading-spinner"></div>
              <p>Loading employees...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h4>No employees found</h4>
              <p>{searchTerm ? "Try a different search term" : "Add your first employee to get started"}</p>
              <button
                className="empty-action-btn"
                onClick={() => setShowAddModal(true)}
                disabled={loading}
              >
                <FiPlus size={16} /> Add Employee
              </button>
            </div>
          ) : (
            <div className="responsive-table">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Contact</th>
                    <th>Task Assignments</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => {
                    const currentAssignments = getCurrentMonthAssignments(employee);
                    const hasCurrentAssignments = currentAssignments.length > 0;
                    return (
                      <tr key={employee.employeeId} className="employee-row">
                        <td className="employee-info">
                          <div className="avatar">
                            {employee.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="employee-details">
                            <div className="employee-name">{employee.name}</div>
                            <div className="employee-role">Employee</div>
                          </div>
                        </td>
                        <td className="contact-info-column">
                          <div className="contact-info">
                            <div className="email">
                              <FiMail size={14} /> {employee.email}
                            </div>
                            <div className="phone">
                              <FiPhone size={14} /> {formatPhone(employee.phone)}
                            </div>
                          </div>
                        </td>
                        <td className="assignments-info-column">
                          <div className="assignments-info">
                            <div className="assignments-count">
                              <FiBriefcase size={16} />
                              <span>{getAssignedCount(employee)} tasks assigned</span>
                            </div>
                            {hasCurrentAssignments && (
                              <div className="recent-assignment">
                                {currentAssignments.length} current month tasks
                              </div>
                            )}
                            {getPastAssignments(employee).length > 0 && (
                              <div className="recent-assignment">
                                Latest: {getMonthName(
                                  getPastAssignments(employee)[0].month
                                )} {getPastAssignments(employee)[0].year}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="status-column">
                          {employee.isActive ? (
                            <span className="status-badge active">
                              <FiUserCheck size={12} /> Active
                            </span>
                          ) : (
                            <span className="status-badge inactive">
                              <FiUserX size={12} /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="actions-column">
                          <div className="action-buttons">
                            {employee.isActive ? (
                              <>
                                <button
                                  className="edit-btn"
                                  onClick={() => openEditModal(employee)}
                                  title="Edit employee"
                                  disabled={loading}
                                >
                                  <FiEdit2 size={16} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  className="assign-btn"
                                  onClick={() => openAssignModal(employee)}
                                  title="Assign tasks to client"
                                  disabled={loading}
                                >
                                  <FiBriefcase size={16} />
                                  <span>Assign Tasks</span>
                                </button>
                                <button
                                  className="delete-btn"
                                  onClick={() => openDeactivateConfirm(employee)}
                                  title="Deactivate employee"
                                  disabled={loading}
                                >
                                  <FiTrash2 size={16} />
                                  <span>Deactivate</span>
                                </button>
                              </>
                            ) : (
                              <button
                                className="activate-btn"
                                onClick={() => openActivateConfirm(employee)}
                                title="Activate employee"
                                disabled={loading}
                              >
                                <FiUserCheck size={16} />
                                <span>Activate</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Add/Edit Employee Modal */}
        {(showAddModal || showEditModal) && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>
                  {selectedEmployee ? (
                    <>
                      <FiEdit2 /> Edit Employee
                    </>
                  ) : (
                    <>
                      <FiUser /> Add New Employee
                    </>
                  )}
                </h3>
                <button
                  className="close-modal"
                  onClick={resetEmployeeForm}
                  disabled={loading}
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={employeeFormik.handleSubmit} className="modal-form">
                  <div className="form-group">
                    <label htmlFor="name">
                      <FiUser size={16} /> Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter full name"
                      value={employeeFormik.values.name}
                      onChange={employeeFormik.handleChange}
                      onBlur={employeeFormik.handleBlur}
                      className={
                        employeeFormik.touched.name && employeeFormik.errors.name
                          ? "error"
                          : ""
                      }
                      disabled={loading}
                    />
                    {employeeFormik.touched.name && employeeFormik.errors.name && (
                      <div className="error-text">{employeeFormik.errors.name}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">
                      <FiMail size={16} /> Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="employee@company.com"
                      value={employeeFormik.values.email}
                      onChange={employeeFormik.handleChange}
                      onBlur={employeeFormik.handleBlur}
                      className={
                        employeeFormik.touched.email && employeeFormik.errors.email
                          ? "error"
                          : ""
                      }
                      disabled={loading}
                    />
                    {employeeFormik.touched.email && employeeFormik.errors.email && (
                      <div className="error-text">{employeeFormik.errors.email}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">
                      <FiPhone size={16} /> Phone Number *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="1234567890"
                      value={employeeFormik.values.phone}
                      onChange={employeeFormik.handleChange}
                      onBlur={employeeFormik.handleBlur}
                      className={
                        employeeFormik.touched.phone && employeeFormik.errors.phone
                          ? "error"
                          : ""
                      }
                      disabled={loading}
                      maxLength="10"
                    />
                    {employeeFormik.touched.phone && employeeFormik.errors.phone && (
                      <div className="error-text">{employeeFormik.errors.phone}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <div className="password-header">
                      <label htmlFor="password">
                        <FiEye size={16} /> Password{" "}
                        {!selectedEmployee && "*"}
                      </label>
                      <button
                        type="button"
                        className="show-password-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? (
                          <>
                            <FiEyeOff size={14} /> Hide
                          </>
                        ) : (
                          <>
                            <FiEye size={14} /> Show
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        selectedEmployee
                          ? "Enter new password (leave blank to keep current)"
                          : "Create a strong password"
                      }
                      value={employeeFormik.values.password}
                      onChange={employeeFormik.handleChange}
                      onBlur={employeeFormik.handleBlur}
                      className={
                        employeeFormik.touched.password && employeeFormik.errors.password
                          ? "error"
                          : ""
                      }
                      disabled={loading}
                    />
                    {employeeFormik.touched.password && employeeFormik.errors.password && (
                      <div className="error-text">{employeeFormik.errors.password}</div>
                    )}
                    {selectedEmployee && (
                      <small className="hint">
                        Only enter if you want to change the password
                      </small>
                    )}
                  </div>
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={resetEmployeeForm}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="primary-btn"
                      disabled={loading || !employeeFormik.isValid}
                    >
                      {loading ? (
                        <span className="spinner"></span>
                      ) : selectedEmployee ? (
                        "Update Employee"
                      ) : (
                        "Create Employee"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Assign Tasks Modal - UPDATED WITH MULTIPLE TASKS AND MOBILE SEARCH - DOCUMENT CHECK REMOVED */}
        {showAssignModal && assigningEmployee && (
          <div className="modal-overlay">
            <div className="modal assign-modal">
              <div className="modal-header">
                <h3>
                  <FiBriefcase size={24} />
                  Assign Tasks to {assigningEmployee.name}
                </h3>
                <button
                  className="close-modal"
                  onClick={resetAssignForm}
                  disabled={loading}
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="modal-body">
                <div className="employee-info-card">
                  <div className="employee-avatar">
                    {assigningEmployee.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4>{assigningEmployee.name}</h4>
                    <p>{assigningEmployee.email}</p>
                    <small className="current-assignments">
                      Currently assigned to {getAssignedCount(assigningEmployee)} tasks
                    </small>
                  </div>
                </div>
                <form onSubmit={assignFormik.handleSubmit} className="modal-form">
                  {/* Client Selection with Mobile Search */}
                  <div className="form-group">
                    <label htmlFor="clientId">
                      <FiBriefcase size={16} /> Select Client *
                    </label>
                    {/* Custom dropdown with search for all devices */}
                    <div className="custom-dropdown" ref={dropdownRef}>
                      <div
                        className={`dropdown-selected ${assignFormik.touched.clientId && assignFormik.errors.clientId ? 'error' : ''}`}
                        onClick={() => setShowClientDropdown(!showClientDropdown)}
                      >
                        <span>{getSelectedClientName()}</span>
                        <FiChevronDown size={18} />
                      </div>
                      {showClientDropdown && (
                        <div className="dropdown-options">
                          <div className="dropdown-search">
                            <FiSearch size={16} />
                            <input
                              type="text"
                              placeholder="Search clients by name or email..."
                              value={clientSearchTerm}
                              onChange={(e) => setClientSearchTerm(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <div className="dropdown-list">
                            {filteredClients.length === 0 ? (
                              <div className="dropdown-no-results">
                                No clients found
                              </div>
                            ) : (
                              filteredClients.map((client) => (
                                <div
                                  key={client.clientId}
                                  className={`dropdown-item ${assignFormik.values.clientId === client.clientId ? 'selected' : ''}`}
                                  onClick={() => handleClientSelect(client.clientId)}
                                >
                                  <div className="client-name">{client.name}</div>
                                  <div className="client-email">{client.email}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {assignFormik.touched.clientId && assignFormik.errors.clientId && (
                      <div className="error-text">{assignFormik.errors.clientId}</div>
                    )}
                  </div>
                  {/* Date Selection */}
                  <div className="date-selection">
                    <div className="form-group">
                      <label htmlFor="year">
                        <FiCalendar size={16} /> Year *
                      </label>
                      <input
                        id="year"
                        name="year"
                        type="number"
                        placeholder="e.g., 2024"
                        value={assignFormik.values.year}
                        onChange={assignFormik.handleChange}
                        onBlur={assignFormik.handleBlur}
                        className={
                          assignFormik.touched.year && assignFormik.errors.year
                            ? "error"
                            : ""
                        }
                        disabled={loading}
                        min="2020"
                        max="2100"
                      />
                      {assignFormik.touched.year && assignFormik.errors.year && (
                        <div className="error-text">{assignFormik.errors.year}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="month">
                        <FiCalendar size={16} /> Month *
                      </label>
                      <select
                        id="month"
                        name="month"
                        value={assignFormik.values.month}
                        onChange={assignFormik.handleChange}
                        onBlur={assignFormik.handleBlur}
                        className={
                          assignFormik.touched.month && assignFormik.errors.month
                            ? "error"
                            : ""
                        }
                        disabled={loading}
                      >
                        <option value="">-- Select month --</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <option key={month} value={month}>
                            {getMonthName(month)}
                          </option>
                        ))}
                      </select>
                      {assignFormik.touched.month && assignFormik.errors.month && (
                        <div className="error-text">{assignFormik.errors.month}</div>
                      )}
                    </div>
                  </div>
                  {/* Multiple Tasks Selection with Checkboxes */}
                  <div className="form-group tasks-selection">
                    <div className="task-selection-header">
                      <label>
                        <FiFileText size={16} /> Select Tasks *
                      </label>
                      {clientTaskStatus && (
                        <div className="task-status-info">
                          <FiInfo size={14} />
                          <span>{clientTaskStatus.totalAssigned}/5 tasks assigned</span>
                        </div>
                      )}
                    </div>
                    {/* Bulk Actions */}
                    {getAvailableTasks().length > 0 && (
                      <div className="bulk-actions">
                        <button
                          type="button"
                          className="bulk-btn"
                          onClick={handleSelectAllTasks}
                          disabled={loading || loadingTaskStatus}
                        >
                          Select All Available
                        </button>
                        <button
                          type="button"
                          className="bulk-btn"
                          onClick={handleClearAllTasks}
                          disabled={loading || loadingTaskStatus || assignFormik.values.tasks.length === 0}
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                    {/* Tasks Checkbox List */}
                    <div className="tasks-checkbox-list">
                      {loadingTaskStatus ? (
                        <div className="tasks-loading">
                          <span className="spinner-small"></span>
                          <span>Loading task status...</span>
                        </div>
                      ) : getAvailableTasks().length === 0 ? (
                        <div className="no-tasks-available">
                          <FiInfo size={20} />
                          <p>No tasks available for assignment. All tasks are already assigned for this period.</p>
                        </div>
                      ) : (
                        getAvailableTasks().map((task) => (
                          <div key={task.value} className="task-checkbox-item">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={assignFormik.values.tasks.includes(task.value)}
                                onChange={() => handleTaskToggle(task.value)}
                                disabled={loading}
                              />
                              <span className="task-label">{task.label}</span>
                            </label>
                            {isTaskAlreadyAssigned(task.value) && (
                              <span className="task-already-assigned">Already assigned</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    {/* Selected Tasks Summary */}
                    {assignFormik.values.tasks.length > 0 && (
                      <div className="selected-tasks-summary">
                        <strong>Selected ({assignFormik.values.tasks.length}):</strong>
                        <div className="selected-tasks-list">
                          {assignFormik.values.tasks.map(task => (
                            <span key={task} className="selected-task-tag">
                              {task}
                              <button
                                type="button"
                                onClick={() => handleTaskToggle(task)}
                                className="remove-task-tag"
                              >
                                <FiX size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {assignFormik.touched.tasks && assignFormik.errors.tasks && (
                      <div className="error-text">{assignFormik.errors.tasks}</div>
                    )}
                    {/* Task Status Display */}
                    {clientTaskStatus && clientTaskStatus.taskStatus && (
                      <div className="task-status-display">
                        <h5>Current Task Status for {getMonthName(assignFormik.values.month)} {assignFormik.values.year}:</h5>
                        <div className="task-status-grid">
                          {clientTaskStatus.taskStatus.map((task) => (
                            <div key={task.task} className={`task-status-item ${task.isAssigned ? 'assigned' : 'unassigned'}`}>
                              <div className="task-name">{task.task}</div>
                              <div className="task-details">
                                {task.isAssigned ? (
                                  <>
                                    <span className="assigned-to">
                                      {task.accountingDone ? '✓ Completed' : '🔄 In Progress'} by {task.assignedTo?.employeeName}
                                    </span>
                                  </>
                                ) : (
                                  <span className="unassigned">Not assigned</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Assignment Summary */}
                  <div className="assignment-summary">
                    <h4>Task Assignment Summary</h4>
                    <div className="summary-details">
                      <p>
                        <strong>Employee:</strong> {assigningEmployee.name}
                      </p>
                      <p>
                        <strong>Period:</strong>{" "}
                        {assignFormik.values.month && assignFormik.values.year
                          ? `${getMonthName(assignFormik.values.month)} ${assignFormik.values.year}`
                          : "Select month and year"
                        }
                      </p>
                      {assignFormik.values.tasks.length > 0 && (
                        <p>
                          <strong>Tasks ({assignFormik.values.tasks.length}):</strong>{" "}
                          {assignFormik.values.tasks.join(', ')}
                        </p>
                      )}
                      {assignFormik.values.clientId && (
                        <p>
                          <strong>Client:</strong>{" "}
                          {
                            clients.find(
                              (c) => c.clientId === assignFormik.values.clientId
                            )?.name
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Document Status Check Section - REMOVED */}
                  {/* Buttons */}
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={resetAssignForm}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="primary-btn"
                      disabled={
                        loading ||
                        loadingTaskStatus ||
                        !assignFormik.isValid ||
                        assignFormik.values.tasks.length === 0
                      }
                    >
                      {loading || loadingTaskStatus ? (
                        <span className="spinner"></span>
                      ) : (
                        <>
                          <FiBriefcase size={18} />
                          Assign {assignFormik.values.tasks.length} Task{assignFormik.values.tasks.length !== 1 ? 's' : ''}
                        </>
                      )}
                    </button>
                  </div>
                  {/* Past Assignments Table */}
                  {getPastAssignments(assigningEmployee).length > 0 && (
                    <div className="past-assignments">
                      <h4>
                        <FiClock size={18} /> Past Task Assignments
                        <span className="count-badge">{getPastAssignments(assigningEmployee).length}</span>
                      </h4>
                      <div className="assignments-table-container">
                        <table className="past-assignments-table">
                          <thead>
                            <tr>
                              <th>Client Name</th>
                              <th>Period</th>
                              <th>Task</th>
                              <th>Accounting Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPastAssignments(assigningEmployee).map((assignment, index) => (
                              <tr key={index}>
                                <td className="client-name">
                                  <div className="client-name-cell">
                                    {assignment.clientName}
                                  </div>
                                </td>
                                <td className="period">
                                  {getMonthYear(assignment.month, assignment.year)}
                                </td>
                                <td className="task">
                                  <span className="task-badge">
                                    {assignment.task}
                                  </span>
                                </td>
                                <td className="accounting-status">
                                  {assignment.accountingDone ? (
                                    <span className="status-done">
                                      <FiCheckCircle size={14} /> Done
                                    </span>
                                  ) : (
                                    <span className="status-pending">
                                      <FiClock size={14} /> Pending
                                    </span>
                                  )}
                                </td>
                                <td className="assignment-actions">
                                  {!assignment.accountingDone && (
                                    <button
                                      className="remove-assignment-btn"
                                      onClick={() => openRemoveAssignmentConfirm(assignment)}
                                      title="Remove this task assignment"
                                      disabled={loading}
                                    >
                                      <FiTrash2 size={14} />
                                      <span>Remove</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Confirmation Modal for Deactivate/Activate */}
        {showConfirmModal && employeeToConfirm && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <div className="modal-header">
                <h3>
                  <FiAlertTriangle size={24} />
                  {confirmAction === "deactivate" ? "Deactivate Employee" : "Activate Employee"}
                </h3>
                <button
                  className="close-modal"
                  onClick={closeConfirmModal}
                  disabled={loading}
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="modal-body">
                <div className="confirmation-content">
                  <div className="confirmation-icon">
                    {confirmAction === "deactivate" ? (
                      <div className="icon-deactivate">
                        <FiUserX size={48} />
                      </div>
                    ) : (
                      <div className="icon-activate">
                        <FiUserCheck size={48} />
                      </div>
                    )}
                  </div>
                  <div className="confirmation-details">
                    <h4>{employeeToConfirm.name}</h4>
                    <p className="employee-email">{employeeToConfirm.email}</p>
                    <p className="confirmation-message">{confirmMessage}</p>
                    {confirmAction === "deactivate" && (
                      <div className="warning-note">
                        <FiAlertTriangle size={16} />
                        <span>
                          <strong>Note:</strong> This will remove all current month task assignments from clients.
                          Other employees' tasks for the same clients will not be affected.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={closeConfirmModal}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={confirmAction === "deactivate" ? "danger-btn" : "success-btn"}
                    onClick={handleConfirmAction}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner"></span>
                    ) : confirmAction === "deactivate" ? (
                      <>
                        <FiCheck size={18} /> Yes, Deactivate
                      </>
                    ) : (
                      <>
                        <FiCheck size={18} /> Yes, Activate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Remove Assignment Confirmation Modal */}
        {showRemoveConfirmModal && assignmentToRemove && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <div className="modal-header">
                <h3>
                  <FiArchive size={24} />
                  Remove Task Assignment
                </h3>
                <button
                  className="close-modal"
                  onClick={closeRemoveConfirmModal}
                  disabled={loading}
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="modal-body">
                <div className="confirmation-content">
                  <div className="confirmation-icon">
                    <div className="icon-remove">
                      <FiArchive size={48} />
                    </div>
                  </div>
                  <div className="confirmation-details">
                    <h4>Remove Task Assignment</h4>
                    <div className="assignment-details">
                      <p><strong>Employee:</strong> {assigningEmployee?.name}</p>
                      <p><strong>Client:</strong> {assignmentToRemove.clientName}</p>
                      <p><strong>Task:</strong> {assignmentToRemove.task}</p>
                      <p><strong>Period:</strong> {getMonthYear(assignmentToRemove.month, assignmentToRemove.year)}</p>
                      <p><strong>Status:</strong> <span className="status-pending">Pending (Accounting not done)</span></p>
                    </div>
                    <div className="warning-note">
                      <FiAlertTriangle size={16} />
                      <span>
                        <strong>Note:</strong> This will remove ONLY this specific task assignment.
                        Other tasks for the same client-month will not be affected.
                      </span>
                    </div>
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={closeRemoveConfirmModal}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={handleRemoveAssignment}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner"></span>
                    ) : (
                      <>
                        <FiTrash2 size={18} /> Yes, Remove Task Assignment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
export default AdminEmployees;