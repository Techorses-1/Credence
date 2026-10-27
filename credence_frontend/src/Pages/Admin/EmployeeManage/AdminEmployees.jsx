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
  FiChevronDown,
  FiLock
} from "react-icons/fi";
import "./AdminEmployees.scss";
// Import General Task Modal Components
import AssignGeneralTaskModal from "./GeneralTaskModal/AssignGeneralTaskModal";
import ViewGeneralTasksModal from "./GeneralTaskModal/ViewGeneralTasksModal";

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

// ===== Filter dropdown options =====
const employeeFilterOptions = [
  { value: "all", label: "All Employees" },
  { value: "active", label: "Active" },
  { value: "admin", label: "Admin Mode" },
  { value: "deleted", label: "Deleted" }
];

const AdminEmployees = () => {
  // State declarations
  const [employees, setEmployees] = useState([]);
  const [deletedEmployees, setDeletedEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter state
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);

  // Deactivate modal state
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateCheckLoading, setDeactivateCheckLoading] = useState(false);
  const [deactivateCheck, setDeactivateCheck] = useState(null);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [showDeactivatePassword, setShowDeactivatePassword] = useState(false);

  // Delete confirm modal state
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteCheckLoading, setDeleteCheckLoading] = useState(false);
  const [deleteCheck, setDeleteCheck] = useState(null);

  // General Task Modal states
  const [showGeneralTaskModal, setShowGeneralTaskModal] = useState(false);
  const [showViewGeneralTasksModal, setShowViewGeneralTasksModal] = useState(false);

  // Selected items
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [assigningEmployee, setAssigningEmployee] = useState(null);
  const [employeeToConfirm, setEmployeeToConfirm] = useState(null);
  const [confirmAction, setConfirmAction] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [assignmentToRemove, setAssignmentToRemove] = useState(null);

  // Client task status state
  const [clientTaskStatus, setClientTaskStatus] = useState(null);
  const [loadingTaskStatus, setLoadingTaskStatus] = useState(false);

  // Client dropdown state
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
        if (values.password && values.password.trim() !== "") {
          payload.password = values.password;
        }
        if (!selectedEmployee && !values.password) {
          toast.error("Password is required for new employees");
          setLoading(false);
          return;
        }
        if (selectedEmployee) {
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

  // Formik for Assign Client
  const assignFormik = useFormik({
    initialValues: {
      clientId: "",
      year: currentMonth.year,
      month: currentMonth.month,
      tasks: []
    },
    validationSchema: assignSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin-employee/assign-client`,
          {
            employeeId: assigningEmployee.employeeId,
            clientId: values.clientId,
            year: Number(values.year),
            month: Number(values.month),
            tasks: values.tasks
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

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin-employee/all`,
        { withCredentials: true }
      );
      setEmployees(res.data);
      return res.data;
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Failed to load employees", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadDeletedEmployees = async () => {
    try {
      setLoadingDeleted(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin-employee/all-deleted`,
        { withCredentials: true }
      );
      setDeletedEmployees(res.data || []);
      return res.data;
    } catch (error) {
      console.warn("Deleted employees route not yet available:", error.message);
      setDeletedEmployees([]);
      return [];
    } finally {
      setLoadingDeleted(false);
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
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin-employee/client-tasks-status/${clientId}?year=${year}&month=${month}`,
        { withCredentials: true }
      );
      setClientTaskStatus(res.data);
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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setShowFilterDropdown(false);
      }
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
    if (!clientId || !year || !month) return;
    const timer = setTimeout(() => {
      loadClientTaskStatus(clientId, year, month);
    }, 300);
    return () => clearTimeout(timer);
  }, [showAssignModal, assignFormik.values.clientId, assignFormik.values.year, assignFormik.values.month]);

  // Load deleted employees when filter changes
  useEffect(() => {
    if (employeeFilter === "deleted") {
      loadDeletedEmployees();
    }
  }, [employeeFilter]);

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

  const openAssignModal = (employee) => {
    setAssigningEmployee(employee);
    assignFormik.setValues({
      clientId: "",
      year: currentMonth.year,
      month: currentMonth.month,
      tasks: []
    });
    setClientTaskStatus(null);
    setClientSearchTerm("");
    setShowClientDropdown(false);
    setShowAssignModal(true);
  };

  const openGeneralTaskModal = (employee) => {
    setAssigningEmployee(employee);
    setShowGeneralTaskModal(true);
  };

  const openViewGeneralTasksModal = (employee) => {
    setAssigningEmployee(employee);
    setShowViewGeneralTasksModal(true);
  };

  const handleGeneralTaskCreated = async () => {
    await loadEmployees();
  };

  const handleViewGeneralTasksUpdated = async () => {
    await loadEmployees();
  };

  // ===== Deactivate modal (always goes to Admin Mode) =====
  const openDeactivateModal = async (employee) => {
    setEmployeeToConfirm(employee);
    setDeactivateCheck(null);
    setDeactivatePassword("");
    setShowDeactivatePassword(false);
    setShowDeactivateModal(true);
    setDeactivateCheckLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin-employee/deactivate-check/${employee.employeeId}`,
        { withCredentials: true }
      );
      setDeactivateCheck(res.data);
    } catch (error) {
      console.error("Error checking deactivate eligibility:", error);
      toast.error(
        error.response?.data?.message || "Failed to check employee status",
        {
          position: "top-right",
          autoClose: 5000,
          theme: "dark"
        }
      );
      closeDeactivateModal();
    } finally {
      setDeactivateCheckLoading(false);
    }
  };

  const closeDeactivateModal = () => {
    setShowDeactivateModal(false);
    setEmployeeToConfirm(null);
    setDeactivateCheck(null);
    setDeactivatePassword("");
    setShowDeactivatePassword(false);
  };

  const handleDeactivateSubmit = async () => {
    if (!employeeToConfirm || !deactivateCheck) return;

    // Password is ALWAYS required now
    if (!deactivatePassword || deactivatePassword.trim() === "") {
      toast.error("Password is required", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
      return;
    }
    if (deactivatePassword.length < 6) {
      toast.error("Password must be at least 6 characters", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin-employee/deactivate/${employeeToConfirm.employeeId}`,
        { password: deactivatePassword },
        { withCredentials: true }
      );
      toast.success(response.data.message || "Employee deactivated", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      });
      closeDeactivateModal();
      loadEmployees();
      if (employeeFilter === "deleted") {
        loadDeletedEmployees();
      }
    } catch (error) {
      console.error("Error deactivating employee:", error);
      toast.error(
        error.response?.data?.message || "Failed to deactivate employee",
        {
          position: "top-right",
          autoClose: 5000,
          theme: "dark"
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete confirm modal
  const openDeleteConfirm = async (employee) => {
    setEmployeeToConfirm(employee);
    setDeleteCheck(null);
    setShowDeleteConfirmModal(true);
    setDeleteCheckLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin-employee/deactivate-check/${employee.employeeId}`,
        { withCredentials: true }
      );
      setDeleteCheck(res.data);
    } catch (error) {
      console.error("Error checking delete status:", error);
      setDeleteCheck({ pendingCount: 0 });
    } finally {
      setDeleteCheckLoading(false);
    }
  };

  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
    setEmployeeToConfirm(null);
    setDeleteCheck(null);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToConfirm) return;
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin-employee/delete/${employeeToConfirm.employeeId}`,
        {},
        { withCredentials: true }
      );
      toast.success(
        response.data.message || "Employee deleted successfully!",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "dark"
        }
      );
      closeDeleteConfirmModal();
      loadEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete employee",
        {
          position: "top-right",
          autoClose: 5000,
          theme: "dark"
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const openActivateConfirm = (employee) => {
    setEmployeeToConfirm(employee);
    setConfirmAction("activate");
    setConfirmMessage(
      `Activate "${employee.name}"? Employee will be available for new task assignments. Password will stay as previously set.`
    );
    setShowConfirmModal(true);
  };

  const openRemoveAssignmentConfirm = (assignment) => {
    setAssignmentToRemove(assignment);
    setShowRemoveConfirmModal(true);
  };

  const handleRemoveAssignment = async () => {
    if (!assignmentToRemove || !assigningEmployee) return;
    try {
      setLoading(true);
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
      closeRemoveConfirmModal();
      const freshEmployees = await loadEmployees();
      if (freshEmployees) {
        const updatedEmployee = freshEmployees.find(
          emp => emp.employeeId === assigningEmployee.employeeId
        );
        if (updatedEmployee) {
          setAssigningEmployee(updatedEmployee);
        }
      }
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

  const handleConfirmAction = async () => {
    if (!employeeToConfirm) return;
    try {
      setLoading(true);
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
      loadEmployees();
      closeConfirmModal();
    } catch (error) {
      console.error("Error activating employee:", error);
      toast.error(error.response?.data?.message || "Failed to activate employee", {
        position: "top-right",
        autoClose: 5000,
        theme: "dark"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = (taskValue) => {
    const currentTasks = assignFormik.values.tasks;
    let newTasks;
    if (currentTasks.includes(taskValue)) {
      newTasks = currentTasks.filter(t => t !== taskValue);
    } else {
      newTasks = [...currentTasks, taskValue];
    }
    assignFormik.setFieldValue('tasks', newTasks);
  };

  const handleSelectAllTasks = () => {
    const availableTasks = getAvailableTasks().map(t => t.value);
    assignFormik.setFieldValue('tasks', availableTasks);
  };

  const handleClearAllTasks = () => {
    assignFormik.setFieldValue('tasks', []);
  };

  const handleClientSelect = (clientId) => {
    assignFormik.setFieldValue('clientId', clientId);
    setShowClientDropdown(false);
    setClientSearchTerm("");
  };

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

  const resetGeneralTaskModal = () => {
    setShowGeneralTaskModal(false);
    setAssigningEmployee(null);
  };

  const resetViewGeneralTasksModal = () => {
    setShowViewGeneralTasksModal(false);
    setAssigningEmployee(null);
  };

  const getMonthName = (month) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "";
  };

  const getMonthYear = (month, year) => {
    return `${getMonthName(month)} ${year}`;
  };

  const formatPhone = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getAssignedCount = (employee) => {
    return employee.assignedClients?.filter(ac => !ac.isRemoved).length || 0;
  };

  const getEmployeeMode = (employee) => {
    if (employee.mode === "deleted") return "deleted";
    if (employee.mode === "admin") return "admin";
    if (employee.isActive === true) return "normal";
    return employee.mode || "normal";
  };

  const getFilteredByMode = (list) => {
    if (employeeFilter === "active") {
      return list.filter(emp => getEmployeeMode(emp) === "normal");
    }
    if (employeeFilter === "admin") {
      return list.filter(emp => getEmployeeMode(emp) === "admin");
    }
    if (employeeFilter === "deleted") {
      return list.filter(emp => getEmployeeMode(emp) === "deleted");
    }
    return list;
  };

  const sourceEmployees =
    employeeFilter === "deleted" ? deletedEmployees : employees;

  const modeOrder = { normal: 0, admin: 1, deleted: 2 };

  const filteredEmployees = getFilteredByMode(sourceEmployees)
    .filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aMode = modeOrder[getEmployeeMode(a)] ?? 99;
      const bMode = modeOrder[getEmployeeMode(b)] ?? 99;
      if (aMode !== bMode) return aMode - bMode;
      return (a.name || "").localeCompare(b.name || "");
    });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()))
  );

  const getCurrentMonthAssignments = (employee) => {
    const currentYear = new Date().getFullYear();
    const currentMonthNum = new Date().getMonth() + 1;
    return employee.assignedClients?.filter(
      assignment => assignment.year === currentYear &&
        assignment.month === currentMonthNum &&
        !assignment.isRemoved
    ) || [];
  };

  const getPastAssignments = (employee) => {
    if (!employee?.assignedClients) return [];
    return [...employee.assignedClients]
      .filter(assignment => !assignment.isRemoved)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  };

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

  const isTaskAlreadyAssigned = (task) => {
    if (!clientTaskStatus || !clientTaskStatus.taskStatus) return false;
    const taskStatus = clientTaskStatus.taskStatus.find(t => t.task === task);
    return taskStatus ? taskStatus.isAssigned : false;
  };

  const getSelectedClientName = () => {
    if (!assignFormik.values.clientId) return "Select a client";
    const client = clients.find(c => c.clientId === assignFormik.values.clientId);
    return client ? client.name : "Select a client";
  };

  const getCurrentFilterLabel = () => {
    const found = employeeFilterOptions.find(o => o.value === employeeFilter);
    return found ? found.label : "All Employees";
  };

  const handleFilterSelect = (value) => {
    setEmployeeFilter(value);
    setShowFilterDropdown(false);
  };

  const isDeletedRow = (employee) => getEmployeeMode(employee) === "deleted";

  const isFetching =
    employeeFilter === "deleted"
      ? loadingDeleted
      : loading;

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
              <div className="search-filter-row">
                <div className="filter-dropdown" ref={filterDropdownRef}>
                  <div
                    className="filter-selected"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <span>{getCurrentFilterLabel()}</span>
                    <FiChevronDown size={16} />
                  </div>
                  {showFilterDropdown && (
                    <div className="filter-options">
                      {employeeFilterOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`filter-item ${employeeFilter === option.value ? "selected" : ""}`}
                          onClick={() => handleFilterSelect(option.value)}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="search-box">
                  <FiSearch size={18} />
                  <input
                    type="text"
                    name="employeeSearchFilter"
                    placeholder="Search employees by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    disabled={isFetching}
                  />
                </div>
              </div>
            </div>
          </div>

          {isFetching && filteredEmployees.length === 0 ? (
            <div className="empty-state">
              <div className="loading-spinner"></div>
              <p>Loading employees...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h4>
                {employeeFilter === "deleted"
                  ? "No deleted employees"
                  : "No employees found"}
              </h4>
              <p>
                {searchTerm
                  ? "Try a different search term"
                  : employeeFilter === "deleted"
                    ? "No deleted employees to display"
                    : employeeFilter === "active"
                      ? "No active employees"
                      : employeeFilter === "admin"
                        ? "No employees in Admin Mode"
                        : "Add your first employee to get started"}
              </p>
              {employeeFilter === "all" && (
                <button
                  className="empty-action-btn"
                  onClick={() => setShowAddModal(true)}
                  disabled={loading}
                >
                  <FiPlus size={16} /> Add Employee
                </button>
              )}
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
                    const empMode = getEmployeeMode(employee);
                    const isDeleted = isDeletedRow(employee);

                    return (
                      <tr
                        key={employee.employeeId}
                        className={`employee-row ${isDeleted ? "deleted-row" : ""}`}
                      >
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
                          {empMode === "normal" && (
                            <span className="status-badge active">
                              <FiUserCheck size={12} /> Active
                            </span>
                          )}
                          {empMode === "admin" && (
                            <span className="status-badge admin-mode">
                              <FiLock size={12} /> Admin Mode
                            </span>
                          )}
                          {empMode === "deleted" && (
                            <span className="status-badge inactive">
                              <FiUserX size={12} /> Deleted
                            </span>
                          )}
                        </td>
                        <td className="actions-column">
                          <div className="action-buttons">
                            {isDeleted ? (
                              <span className="readonly-tag">Read-only</span>
                            ) : empMode === "normal" ? (
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
                                  onClick={() => openDeactivateModal(employee)}
                                  title="Deactivate employee"
                                  disabled={loading}
                                >
                                  <FiTrash2 size={16} />
                                  <span>Deactivate</span>
                                </button>
                              </>
                            ) : empMode === "admin" ? (
                              <>
                                <button
                                  className="activate-btn"
                                  onClick={() => openActivateConfirm(employee)}
                                  title="Activate employee (back to normal)"
                                  disabled={loading}
                                >
                                  <FiUserCheck size={16} />
                                  <span>Activate</span>
                                </button>
                                <button
                                  className="delete-btn"
                                  onClick={() => openDeleteConfirm(employee)}
                                  title="Delete employee permanently"
                                  disabled={loading}
                                >
                                  <FiTrash2 size={16} />
                                  <span>Delete</span>
                                </button>
                              </>
                            ) : null}
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
                  className="modal-close-btn"
                  onClick={resetEmployeeForm}
                  disabled={loading}
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={employeeFormik.handleSubmit} className="modal-form" autoComplete="off">
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
                      autoComplete="off"
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
                      autoComplete="off"
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
                      autoComplete="off"
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
                      autoComplete="off"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute("readonly")}
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

        {/* Assign Tasks Modal */}
        {showAssignModal && assigningEmployee && (
          <div className="modal-overlay">
            <div className="modal assign-modal">
              <div className="modal-header">
                <h3>
                  <FiBriefcase size={24} />
                  Assign Tasks to {assigningEmployee.name}
                </h3>
                <button
                  className="modal-close-btn"
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

                <div className="general-task-actions">
                  <button
                    type="button"
                    className="action-btn add-task-btn"
                    onClick={() => {
                      const currentEmployee = assigningEmployee;
                      resetAssignForm();
                      openGeneralTaskModal(currentEmployee);
                    }}
                    disabled={loading}
                  >
                    <FiFileText size={16} />
                    Add General Task
                  </button>
                  <button
                    type="button"
                    className="action-btn view-task-btn"
                    onClick={() => {
                      const currentEmployee = assigningEmployee;
                      resetAssignForm();
                      openViewGeneralTasksModal(currentEmployee);
                    }}
                    disabled={loading}
                  >
                    <FiFileText size={16} />
                    View General Tasks
                  </button>
                </div>

                <form onSubmit={assignFormik.handleSubmit} className="modal-form">
                  <div className="form-group">
                    <label htmlFor="clientId">
                      <FiBriefcase size={16} /> Select Client *
                    </label>
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
                              autoComplete="off"
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

        {/* Deactivate Modal (always Admin Mode) */}
        {showDeactivateModal && employeeToConfirm && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <div className="modal-header">
                <h3>
                  <FiAlertTriangle size={24} />
                  Deactivate Employee
                </h3>
                <button
                  className="modal-close-btn"
                  onClick={closeDeactivateModal}
                  disabled={loading || deactivateCheckLoading}
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="modal-body">
                {deactivateCheckLoading ? (
                  <div className="empty-state">
                    <div className="loading-spinner"></div>
                    <p>Checking pending tasks...</p>
                  </div>
                ) : !deactivateCheck ? (
                  <div className="empty-state">
                    <p>Unable to load employee status.</p>
                  </div>
                ) : (
                  <>
                    <div className="confirmation-content">
                      <div className="confirmation-icon">
                        <div className="icon-deactivate">
                          <FiUserX size={48} />
                        </div>
                      </div>
                      <div className="confirmation-details">
                        <h4>{employeeToConfirm.name}</h4>
                        <p className="employee-email">{employeeToConfirm.email}</p>
                        <p className="confirmation-message">
                          This employee has{" "}
                          <strong>{deactivateCheck.pendingCount}</strong>{" "}
                          pending task
                          {deactivateCheck.pendingCount === 1 ? "" : "s"}{" "}
                          (across all months). They will be moved to{" "}
                          <strong>Admin Mode</strong>. You can log in with the new
                          password to finish their work.
                        </p>
                        <div className="warning-note">
                          <FiAlertTriangle size={16} />
                          <span>
                            <strong>Note:</strong> Password will be changed. No
                            email will be sent to the employee. Assignments will
                            NOT be removed. To permanently remove them later, use
                            the Delete button after deactivation.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="form-group deactivate-password-group">
                      <label htmlFor="deactivatePassword">
                        <FiLock size={16} /> New Password *
                      </label>
                      <div className="password-input-wrapper">
                        <input
                          id="deactivatePassword"
                          name="deactivatePassword"
                          type={showDeactivatePassword ? "text" : "password"}
                          placeholder="Enter new password (min 6 chars)"
                          value={deactivatePassword}
                          onChange={(e) => setDeactivatePassword(e.target.value)}
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          readOnly
                          onFocus={(e) => e.target.removeAttribute("readonly")}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="toggle-password-btn"
                          onClick={() =>
                            setShowDeactivatePassword(!showDeactivatePassword)
                          }
                          disabled={loading}
                          aria-label="Toggle password visibility"
                        >
                          {showDeactivatePassword ? (
                            <FiEyeOff size={16} />
                          ) : (
                            <FiEye size={16} />
                          )}
                        </button>
                      </div>
                      <small className="hint">
                        Admin will use this password to log in as the employee and
                        finish their pending work.
                      </small>
                    </div>

                    <div className="modal-actions">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={closeDeactivateModal}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={handleDeactivateSubmit}
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="spinner"></span>
                        ) : (
                          <>
                            <FiCheck size={18} /> Yes, Deactivate to Admin Mode
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {showDeleteConfirmModal && employeeToConfirm && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <div className="modal-header">
                <h3>
                  <FiTrash2 size={24} />
                  Delete Employee
                </h3>
                <button
                  className="modal-close-btn"
                  onClick={closeDeleteConfirmModal}
                  disabled={loading || deleteCheckLoading}
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="modal-body">
                {deleteCheckLoading ? (
                  <div className="empty-state">
                    <div className="loading-spinner"></div>
                    <p>Checking pending tasks...</p>
                  </div>
                ) : (
                  <>
                    <div className="confirmation-content">
                      <div className="confirmation-icon">
                        <div className="icon-deactivate">
                          <FiAlertTriangle size={48} />
                        </div>
                      </div>
                      <div className="confirmation-details">
                        <h4>{employeeToConfirm.name}</h4>
                        <p className="employee-email">{employeeToConfirm.email}</p>
                        <div className="warning-note">
                          <FiAlertTriangle size={16} />
                          <span>
                            <strong>This action cannot be undone.</strong> The
                            employee will be hidden from the list and will not be
                            able to log in.
                          </span>
                        </div>
                        {deleteCheck && (
                          <p className="confirmation-message">
                            There are{" "}
                            <strong>{deleteCheck.pendingCount}</strong> pending
                            accounting task
                            {deleteCheck.pendingCount === 1 ? "" : "s"} across all
                            months in both schemas. These assignments will{" "}
                            <strong>not</strong> be removed (kept for history).
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="modal-actions">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={closeDeleteConfirmModal}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={handleDeleteConfirm}
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="spinner"></span>
                        ) : (
                          <>
                            <FiTrash2 size={18} /> Yes, Delete Employee
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Activate confirm */}
        {showConfirmModal && employeeToConfirm && confirmAction === "activate" && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <div className="modal-header">
                <h3>
                  <FiAlertTriangle size={24} /> Activate Employee
                </h3>
                <button
                  className="modal-close-btn"
                  onClick={closeConfirmModal}
                  disabled={loading}
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="modal-body">
                <div className="confirmation-content">
                  <div className="confirmation-icon">
                    <div className="icon-activate">
                      <FiUserCheck size={48} />
                    </div>
                  </div>
                  <div className="confirmation-details">
                    <h4>{employeeToConfirm.name}</h4>
                    <p className="employee-email">{employeeToConfirm.email}</p>
                    <p className="confirmation-message">{confirmMessage}</p>
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
                    className="success-btn"
                    onClick={handleConfirmAction}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner"></span>
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
                  className="modal-close-btn"
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

        {/* General Task Modal */}
        {showGeneralTaskModal && assigningEmployee && (
          <AssignGeneralTaskModal
            isOpen={showGeneralTaskModal}
            onClose={resetGeneralTaskModal}
            employee={assigningEmployee}
            onTaskCreated={handleGeneralTaskCreated}
          />
        )}

        {/* View General Tasks Modal */}
        {showViewGeneralTasksModal && assigningEmployee && (
          <ViewGeneralTasksModal
            isOpen={showViewGeneralTasksModal}
            onClose={resetViewGeneralTasksModal}
            employee={assigningEmployee}
            onTaskCreated={handleViewGeneralTasksUpdated}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEmployees;