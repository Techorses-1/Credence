import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import AdminFinanceRequests from "./AdminFinanceRequests"; // ← NEW IMPORT
import {
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiClock,
  FiEye,
  FiUserCheck,
  FiUserX,
  FiEdit,
  FiSave,
  FiUsers,
  FiFileText,
  FiDatabase,
  FiDollarSign,
  FiCalendar,
  FiMail,
  FiCheck,
  FiAlertCircle,
  FiFileMinus,
  FiBriefcase,
  FiCheckSquare,
  FiSquare,
  FiTrendingUp,
  FiList,
  FiPieChart,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import { MdOutlineFilterList, MdDateRange } from "react-icons/md";
import { AiOutlineSearch } from "react-icons/ai";
import { BiTask, BiTimeFive } from "react-icons/bi";
import { IoMdOptions } from "react-icons/io";
import "./AdminClientEnrollments.scss";

const AdminClientEnrollments = () => {
  // State for sections
  const [activeSection, setActiveSection] = useState("enrollments");

  // State for Enrollments
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalData, setModalData] = useState({
    enrollId: null,
    name: "",
    action: "",
    actionText: ""
  });
  const [viewModalData, setViewModalData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // State for Active Control & Clients Data
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // State for Clients Data Modal
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientModalData, setClientModalData] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatingClient, setUpdatingClient] = useState(false);

  // ========== REMOVED: All Finance States ==========
  // No more finance states here!

  // ========== State for Task Info Tab ==========
  const [taskInfoData, setTaskInfoData] = useState([]);
  const [taskInfoLoading, setTaskInfoLoading] = useState(false);
  const [taskInfoFilter, setTaskInfoFilter] = useState("thisMonth");
  const [customDateRange, setCustomDateRange] = useState({
    from: "",
    to: ""
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [showTaskInfoModal, setShowTaskInfoModal] = useState(false);
  const [selectedClientTasks, setSelectedClientTasks] = useState(null);
  const [activeTaskTab, setActiveTaskTab] = useState("assigned");
  const [taskInfoSearchTerm, setTaskInfoSearchTerm] = useState("");

  // Add this new state
  const [togglingClientId, setTogglingClientId] = useState(null);

  // ADD THIS HELPER FUNCTION after your other state declarations:
  const formatDateRange = (fromDate, toDate) => {
    if (!fromDate || !toDate) return 'Invalid date';

    const from = new Date(fromDate);
    const to = new Date(toDate);

    // Format: DD MMM YYYY - DD MMM YYYY
    return `${from.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })} - ${to.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })}`;
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Fetch enrollments
  const fetchEnrollments = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/client-enrollment/all`,
        { withCredentials: true }
      );
      setEnrollments(res.data.enrollments || res.data);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      showToast("Failed to fetch enrollments", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch all clients for Active Control and Clients Data
  const fetchClients = async () => {
    try {
      setClientsLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/client-management/all-clients`,
        { withCredentials: true }
      );
      setClients(res.data.clients || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      showToast("Failed to fetch clients", "error");
    } finally {
      setClientsLoading(false);
    }
  };

  const fetchTaskInfo = async () => {
    try {
      setTaskInfoLoading(true);

      let url = `${import.meta.env.VITE_API_URL}/client-management/task-info?filterType=${taskInfoFilter}`;

      if (taskInfoFilter === 'custom' && customDateRange.from && customDateRange.to) {
        url += `&fromDate=${customDateRange.from}&toDate=${customDateRange.to}`;
      }

      const res = await axios.get(url, { withCredentials: true });

      if (res.data.success) {
        setTaskInfoData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching task info:", error);
      showToast("Failed to fetch task information", "error");
    } finally {
      setTaskInfoLoading(false);
    }
  };

  // Handle task info filter change
  const handleTaskInfoFilterChange = (filter) => {
    setTaskInfoFilter(filter);
    if (filter !== 'custom') {
      setShowCustomDatePicker(false);
      fetchTaskInfo();
    } else {
      setShowCustomDatePicker(true);
    }
  };

  // Apply custom date filter
  const applyCustomDateFilter = () => {
    if (!customDateRange.from || !customDateRange.to) {
      showToast("Please select both from and to dates", "error");
      return;
    }
    setShowCustomDatePicker(false);
    fetchTaskInfo();
  };

  // Open task info modal for client
  const openTaskInfoModal = (client) => {
    setSelectedClientTasks(client);
    setActiveTaskTab("assigned");
    setShowTaskInfoModal(true);
  };

  // Toggle client active status
  const toggleClientStatus = async (clientId, currentStatus) => {
    try {
      setTogglingClientId(clientId);

      const newStatus = !currentStatus;
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/client-management/toggle-status/${clientId}`,
        { isActive: newStatus },
        { withCredentials: true }
      );

      setClients(prev => prev.map(client =>
        client.clientId === clientId
          ? { ...client, ...res.data.client }
          : client
      ));

      showToast(`Client ${newStatus ? 'activated' : 'deactivated'} successfully`, "success");
    } catch (error) {
      console.error("Error toggling client status:", error);
      showToast("Failed to update client status", "error");
    } finally {
      setTogglingClientId(null);
    }
  };

  // Fetch client details for modal
  const fetchClientDetails = async (clientId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/client-management/client/${clientId}`,
        { withCredentials: true }
      );
      return res.data.client;
    } catch (error) {
      console.error("Error fetching client details:", error);
      showToast("Failed to fetch client details", "error");
      return null;
    }
  };

  // Open client modal
  const openClientModal = async (clientId) => {
    const clientDetails = await fetchClientDetails(clientId);
    if (clientDetails) {
      setClientModalData(clientDetails);
      setShowClientModal(true);
      setEditingClient({ ...clientDetails });
      setIsEditing(false);
    }
  };

  // Update client details
  const updateClientDetails = async () => {
    if (!editingClient) return;

    try {
      setUpdatingClient(true);
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/client-management/update-client/${editingClient.clientId}`,
        {
          visaType: editingClient.visaType,
          hasStrongId: editingClient.hasStrongId,
          vatPeriod: editingClient.vatPeriod,
          businessNature: editingClient.businessNature,
          registerTrade: editingClient.registerTrade,
          planSelected: editingClient.planSelected
        },
        { withCredentials: true }
      );

      setClientModalData(res.data.client);
      setEditingClient(res.data.client);
      setIsEditing(false);

      setClients(prev => prev.map(client =>
        client.clientId === editingClient.clientId
          ? { ...client, ...res.data.client }
          : client
      ));

      showToast("Client updated successfully", "success");
    } catch (error) {
      console.error("Error updating client:", error);
      showToast("Failed to update client", "error");
    } finally {
      setUpdatingClient(false);
    }
  };

  // Filter clients
  const filteredClients = clients.filter(client => {
    if (activeFilter === "active" && !client.isActive) return false;
    if (activeFilter === "inactive" && client.isActive) return false;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        client.name?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.clientId?.toLowerCase().includes(searchLower) ||
        client.businessName?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Filter task info
  const filteredTaskInfo = taskInfoData.filter(client => {
    if (taskInfoSearchTerm) {
      const searchLower = taskInfoSearchTerm.toLowerCase();
      return (
        client.clientName?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.businessName?.toLowerCase().includes(searchLower) ||
        client.clientId?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Load data based on active section
  useEffect(() => {
    if (activeSection === "enrollments") {
      fetchEnrollments();
    } else if (activeSection === "activeControl" || activeSection === "clientsData") {
      fetchClients();
    } else if (activeSection === "taskInfo") {
      fetchTaskInfo();
    }
    // ========== REMOVED: financeRequests case ==========
  }, [activeSection]);

  // Fetch task info when filter changes (for non-custom filters)
  useEffect(() => {
    if (activeSection === "taskInfo" && taskInfoFilter !== 'custom') {
      fetchTaskInfo();
    }
  }, [taskInfoFilter, activeSection]);

  // Existing functions for enrollments
  const fetchEnrollmentDetails = async (enrollId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/client-enrollment/enrollment/${enrollId}`,
        { withCredentials: true }
      );
      return res.data.enrollment;
    } catch (error) {
      console.error("Error fetching enrollment details:", error);
      return null;
    }
  };

  const openViewModal = async (enrollId, name) => {
    const enrollmentDetails = await fetchEnrollmentDetails(enrollId);
    if (enrollmentDetails) {
      setViewModalData(enrollmentDetails);
      setShowViewModal(true);
    }
  };

  const openConfirmationFromView = (action) => {
    if (!viewModalData) return;

    setModalData({
      enrollId: viewModalData.enrollId,
      name: viewModalData.name,
      action: action,
      actionText: action === "APPROVE" ? "approve" : "reject"
    });
    setShowViewModal(false);
    setShowConfirmationModal(true);
  };

  const openConfirmationModal = (enrollId, action, name) => {
    setModalData({
      enrollId,
      name,
      action,
      actionText: action === "APPROVE" ? "approve" : "reject"
    });
    setShowConfirmationModal(true);
  };

  const handleAction = async () => {
    if (!modalData.enrollId || !modalData.action) return;

    setProcessing(true);
    setProcessingId(modalData.enrollId);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/client-enrollment/action`,
        { enrollId: modalData.enrollId, action: modalData.action },
        { withCredentials: true }
      );

      fetchEnrollments();
      setShowConfirmationModal(false);
      showToast(`Client enrollment ${modalData.actionText}d successfully!`, 'success');
    } catch (error) {
      showToast(`Failed to ${modalData.actionText} enrollment. Please try again.`, 'error');
      console.error("Action error:", error);
    } finally {
      setProcessing(false);
      setProcessingId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return <FiCheckCircle className="status-icon approved" />;
      case "REJECTED":
        return <FiXCircle className="status-icon rejected" />;
      case "PENDING":
      default:
        return <FiClock className="status-icon pending" />;
    }
  };

  const getPaymentStatusBadge = (paymentSummary) => {
    if (!paymentSummary) return <span className="status-badge pending">No Data</span>;

    const { paidMonths = 0, pendingMonths = 0, notCreditedMonths = 0, totalMonths = 0 } = paymentSummary;

    if (totalMonths === 0) {
      return <span className="status-badge pending">No Data</span>;
    }

    if (paidMonths === totalMonths) {
      return <span className="status-badge approved">All Paid</span>;
    }

    if (notCreditedMonths === totalMonths) {
      return <span className="status-badge not-credited">All Not Credited</span>;
    }

    if (pendingMonths === totalMonths) {
      return <span className="status-badge pending">All Pending</span>;
    }

    let parts = [];
    if (paidMonths > 0) parts.push(`${paidMonths} Paid`);
    if (pendingMonths > 0) parts.push(`${pendingMonths} Pending`);
    if (notCreditedMonths > 0) parts.push(`${notCreditedMonths} Not Credited`);

    return <span className="status-badge partial">{parts.join(', ')}</span>;
  };

  // Toast function
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  // Close view modal
  const closeViewModal = () => {
    setShowViewModal(false);
    setViewModalData(null);
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setModalData({
      enrollId: null,
      name: "",
      action: "",
      actionText: ""
    });
  };

  // Close task info modal
  const closeTaskInfoModal = () => {
    setShowTaskInfoModal(false);
    setSelectedClientTasks(null);
    setActiveTaskTab("assigned");
  };

  // ========== RENDER FUNCTIONS FOR EACH SECTION ==========

  // Render Enrollments Section
  const renderEnrollments = () => {
    if (loading) {
      return (
        <div className="section-content loading">
          <div className="loading-spinner"></div>
          <p>Loading enrollment requests...</p>
        </div>
      );
    }

    return (
      <div className="section-content">
        <div className="table-container">
          <table className="enrollments-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {(!enrollments || enrollments.length === 0) ? (
                <tr className="no-data">
                  <td colSpan="5">
                    <div className="empty-state">
                      <FiCheckCircle size={40} />
                      <p>No pending enrollment requests</p>
                      <small>All enrollments have been processed</small>
                    </div>
                  </td>
                </tr>
              ) : (
                enrollments.map((item) => (
                  <tr key={item.enrollId} className="enrollment-row">
                    <td className="name-cell">
                      <div className="client-name">
                        <strong>{item.firstName} {item.lastName}</strong>
                      </div>
                    </td>
                    <td className="email-cell">
                      <a href={`mailto:${item.email}`}>{item.email}</a>
                    </td>
                    <td className="phone-cell">
                      <a href={`tel:${item.mobile}`}>{item.mobile}</a>
                    </td>
                    <td className="status-cell">
                      <div className="status-wrapper">
                        {getStatusIcon(item.status)}
                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => openViewModal(item.enrollId, `${item.firstName} ${item.lastName}`)}
                        >
                          <FiEye />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="footer-info">
            <div className="total-count">
              <span className="count-label">Total Requests:</span>
              <span className="count-value">{enrollments?.length || 0}</span>
            </div>
            <div className="status-summary">
              <span className="pending-count">
                Pending: {enrollments?.filter(item => item.status === "PENDING").length || 0}
              </span>
              <span className="approved-count">
                Approved: {enrollments?.filter(item => item.status === "APPROVED").length || 0}
              </span>
              <span className="rejected-count">
                Rejected: {enrollments?.filter(item => item.status === "REJECTED").length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Active Control Section
  const renderActiveControl = () => {
    return (
      <div className="section-content">
        <div className="filters-container">
          <div className="search-box">
            <AiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
              onClick={() => setActiveFilter('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${activeFilter === 'inactive' ? 'active' : ''}`}
              onClick={() => setActiveFilter('inactive')}
            >
              Inactive
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="enrollments-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Business</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {clientsLoading ? (
                <tr>
                  <td colSpan="6" className="loading-cell">
                    <div className="loading-spinner"></div>
                    Loading clients...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr className="no-data">
                  <td colSpan="6">
                    <div className="empty-state">
                      <FiUsers size={40} />
                      <p>No clients found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.clientId} className="client-row">
                    <td className="name-cell">
                      <div className="client-name">
                        <strong>{client.name}</strong>
                        <small className="client-id">{client.clientId?.substring(0, 8)}...</small>
                      </div>
                    </td>
                    <td className="email-cell">
                      <a href={`mailto:${client.email}`}>{client.email}</a>
                    </td>
                    <td className="phone-cell">
                      <a href={`tel:${client.phone}`}>{client.phone}</a>
                    </td>
                    <td className="business-cell">
                      {client.businessName || 'N/A'}
                    </td>
                    <td className="status-cell">
                      <div className="status-wrapper">
                        {client.isActive ? (
                          <FiUserCheck className="status-icon active" />
                        ) : (
                          <FiUserX className="status-icon inactive" />
                        )}
                        <span className={`status-badge ${client.isActive ? 'active' : 'inactive'}`}>
                          {client.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className={`action-btn ${client.isActive ? 'deactivate-btn' : 'activate-btn'}`}
                          onClick={() => toggleClientStatus(client.clientId, client.isActive)}
                          disabled={togglingClientId === client.clientId}
                        >
                          {togglingClientId === client.clientId ? (
                            <>
                              <div className="spinner-small" style={{ marginRight: '6px' }}></div>
                              <span>{client.isActive ? 'Deactivating...' : 'Activating...'}</span>
                            </>
                          ) : (
                            <>
                              {client.isActive ? <FiUserX /> : <FiUserCheck />}
                              <span>{client.isActive ? 'Deactivate' : 'Activate'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="footer-info">
            <div className="total-count">
              <span className="count-label">Total Clients:</span>
              <span className="count-value">{filteredClients.length}</span>
            </div>
            <div className="status-summary">
              <span className="active-count">
                Active: {clients.filter(c => c.isActive).length}
              </span>
              <span className="inactive-count">
                Inactive: {clients.filter(c => !c.isActive).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Clients Data Section
  const renderClientsData = () => {
    return (
      <div className="section-content">
        <div className="filters-container">
          <div className="search-box">
            <AiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
              onClick={() => setActiveFilter('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${activeFilter === 'inactive' ? 'active' : ''}`}
              onClick={() => setActiveFilter('inactive')}
            >
              Inactive
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="enrollments-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Business</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {clientsLoading ? (
                <tr>
                  <td colSpan="7" className="loading-cell">
                    <div className="loading-spinner"></div>
                    Loading clients...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr className="no-data">
                  <td colSpan="7">
                    <div className="empty-state">
                      <FiDatabase size={40} />
                      <p>No clients found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.clientId} className="client-row">
                    <td className="name-cell">
                      <div className="client-name">
                        <strong>{client.name}</strong>
                      </div>
                    </td>
                    <td className="email-cell">
                      <a href={`mailto:${client.email}`}>{client.email}</a>
                    </td>
                    <td className="phone-cell">
                      <a href={`tel:${client.phone}`}>{client.phone}</a>
                    </td>
                    <td className="business-cell">
                      {client.businessName || 'N/A'}
                    </td>
                    <td className="plan-cell">
                      <span className={`plan-badge ${client.planSelected?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {client.planSelected || 'N/A'}
                      </span>
                    </td>
                    <td className="status-cell">
                      <div className="status-wrapper">
                        {client.isActive ? (
                          <FiUserCheck className="status-icon active" />
                        ) : (
                          <FiUserX className="status-icon inactive" />
                        )}
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => openClientModal(client.clientId)}
                        >
                          <FiEye />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="footer-info">
            <div className="total-count">
              <span className="count-label">Total Clients:</span>
              <span className="count-value">{filteredClients.length}</span>
            </div>
            <div className="status-summary">
              <span className="active-count">
                Active: {clients.filter(c => c.isActive).length}
              </span>
              <span className="inactive-count">
                Inactive: {clients.filter(c => !c.isActive).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== REMOVED: renderFinanceRequests() ==========
  // No more finance render function here!

  // ========== Render Task Info Section ==========
  const renderTaskInfo = () => {
    return (
      <div className="section-content">
        {/* Task Info Filters */}
        <div className="filters-container task-info-filters">
          <div className="search-box">
            <AiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search clients..."
              value={taskInfoSearchTerm}
              onChange={(e) => setTaskInfoSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons time-filters">
            <button
              className={`filter-btn ${taskInfoFilter === 'thisMonth' ? 'active' : ''}`}
              onClick={() => handleTaskInfoFilterChange('thisMonth')}
            >
              <BiTimeFive />
              <span>This Month</span>
            </button>
            <button
              className={`filter-btn ${taskInfoFilter === 'lastMonth' ? 'active' : ''}`}
              onClick={() => handleTaskInfoFilterChange('lastMonth')}
            >
              <BiTimeFive />
              <span>Last Month</span>
            </button>
            <button
              className={`filter-btn ${taskInfoFilter === 'custom' ? 'active' : ''}`}
              onClick={() => handleTaskInfoFilterChange('custom')}
            >
              <MdDateRange />
              <span>Custom</span>
            </button>
          </div>

          {/* Custom Date Picker */}
          {showCustomDatePicker && (
            <div className="custom-date-picker">
              <div className="date-inputs">
                <div className="date-field">
                  <label>From:</label>
                  <input
                    type="date"
                    value={customDateRange.from}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, from: e.target.value })}
                    max={customDateRange.to || undefined}
                  />
                </div>
                <div className="date-field">
                  <label>To:</label>
                  <input
                    type="date"
                    value={customDateRange.to}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, to: e.target.value })}
                    min={customDateRange.from || undefined}
                  />
                </div>
                <button
                  className="apply-date-btn"
                  onClick={applyCustomDateFilter}
                  disabled={!customDateRange.from || !customDateRange.to}
                >
                  <FiCheck /> Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Task Info Table */}
        <div className="table-container">
          <table className="enrollments-table task-info-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Business</th>
                <th>Assigned</th>
                <th>Pending</th>
                <th>Completed</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {taskInfoLoading ? (
                <tr>
                  <td colSpan="8" className="loading-cell">
                    <div className="loading-spinner"></div>
                    Loading task information...
                  </td>
                </tr>
              ) : filteredTaskInfo.length === 0 ? (
                <tr className="no-data">
                  <td colSpan="8">
                    <div className="empty-state">
                      <BiTask size={40} />
                      <p>No task data found</p>
                      <small>No clients with tasks in selected period</small>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTaskInfo.map((client) => (
                  <tr key={client.clientId} className="task-info-row">
                    <td className="name-cell">
                      <div className="client-name">
                        <strong>{client.clientName}</strong>
                      </div>
                    </td>
                    <td className="business-cell">
                      {client.businessName || 'N/A'}
                    </td>
                    <td className="number-cell assigned">
                      <span className="task-number">{client.tasksSummary?.assigned || 0}</span>
                    </td>
                    <td className="number-cell pending">
                      <span className="task-number pending">{client.tasksSummary?.pending || 0}</span>
                    </td>
                    <td className="number-cell completed">
                      <span className="task-number completed">{client.tasksSummary?.completed || 0}</span>
                    </td>
                    <td className="payment-cell">
                      {getPaymentStatusBadge(client.paymentSummary)}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => openTaskInfoModal(client)}
                        >
                          <FiEye />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Task Info Footer */}
        <div className="table-footer">
          <div className="footer-info">
            <div className="total-count">
              <span className="count-label">Active Clients:</span>
              <span className="count-value">{filteredTaskInfo.length}</span>
            </div>
            <div className="filter-indicator">
              <FiCalendar size={14} />
              <span>
                Showing: {taskInfoFilter === 'thisMonth' ? 'This Month' :
                  taskInfoFilter === 'lastMonth' ? 'Last Month' :
                    `Custom: ${formatDate(customDateRange.from)} - ${formatDate(customDateRange.to)}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== Render Task Info Modal ==========
  const renderTaskInfoModal = () => {
    if (!showTaskInfoModal || !selectedClientTasks) return null;

    const { clientName, monthlyBreakdown = [], email, businessName } = selectedClientTasks;

    // Get tasks based on active tab
    const getFilteredTasks = (monthData) => {
      if (!monthData.tasks) return [];

      switch (activeTaskTab) {
        case 'assigned':
          return monthData.tasks;
        case 'pending':
          return monthData.tasks.filter(task => !task.accountingDone);
        case 'completed':
          return monthData.tasks.filter(task => task.accountingDone);
        default:
          return [];
      }
    };

    return (
      <div className="view-modal-overlay task-info-modal-overlay">
        <div className="view-modal task-info-modal">
          <div className="view-modal-header">
            <h3>Task Details - {clientName}</h3>
            <button className="modal-close-btn" onClick={closeTaskInfoModal}>
              &times;
            </button>
          </div>

          <div className="view-modal-body">
            {/* Client Summary */}
            <div className="client-summary compact">
              <div className="summary-header">
                <div className="client-avatar">
                  {clientName?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="client-info">
                  <h4>{clientName}</h4>
                  <div className="client-meta">
                    <span className="email">{email}</span>
                    <span className="business">{businessName || 'No Business Name'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Tabs */}
            <div className="task-tabs">
              <button
                className={`task-tab ${activeTaskTab === 'assigned' ? 'active' : ''}`}
                onClick={() => setActiveTaskTab('assigned')}
              >
                <FiList />
                <span>Assigned</span>
                <span className="tab-count">
                  {monthlyBreakdown.reduce((sum, m) => sum + (m.tasks?.length || 0), 0)}
                </span>
              </button>
              <button
                className={`task-tab ${activeTaskTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTaskTab('pending')}
              >
                <FiClock />
                <span>Pending</span>
                <span className="tab-count">
                  {monthlyBreakdown.reduce((sum, m) => sum + (m.tasks?.filter(t => !t.accountingDone)?.length || 0), 0)}
                </span>
              </button>
              <button
                className={`task-tab ${activeTaskTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTaskTab('completed')}
              >
                <FiCheckCircle />
                <span>Completed</span>
                <span className="tab-count">
                  {monthlyBreakdown.reduce((sum, m) => sum + (m.tasks?.filter(t => t.accountingDone)?.length || 0), 0)}
                </span>
              </button>
              <button
                className={`task-tab ${activeTaskTab === 'payment' ? 'active' : ''}`}
                onClick={() => setActiveTaskTab('payment')}
              >
                <FiDollarSign />
                <span>Payment</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="task-tab-content">
              {activeTaskTab === 'payment' ? (
                // PAYMENT TAB - Show month by month payment status
                <div className="payment-monthly-view">
                  {monthlyBreakdown.map((month, index) => {
                    let paymentStatus = month.payment?.status;
                    let statusClass = 'pending';
                    let statusText = 'Pending';

                    if (typeof paymentStatus === 'boolean') {
                      statusClass = paymentStatus ? 'paid' : 'pending';
                      statusText = paymentStatus ? 'Paid' : 'Pending';
                    } else if (typeof paymentStatus === 'string') {
                      statusClass = paymentStatus;
                      if (paymentStatus === 'paid') statusText = 'Paid';
                      else if (paymentStatus === 'pending') statusText = 'Pending';
                      else if (paymentStatus === 'not_credited') statusText = 'Not Credited';
                    }

                    return (
                      <div key={`${month.month}-${month.year}-${index}`} className="payment-month-card">
                        <div className="payment-month-header">
                          <h4>
                            {month.month} {month.year}
                            {month.isPartial && (
                              <span className="partial-badge">
                                {formatDate(month.fromDate)} - {formatDate(month.toDate)}
                              </span>
                            )}
                          </h4>
                          <span className={`payment-status-badge ${statusClass}`}>
                            {statusText}
                          </span>
                        </div>

                        {statusClass === 'paid' && (
                          <div className="payment-details">
                            {month.payment?.updatedAt && (
                              <div className="payment-detail">
                                <span className="detail-label">Paid On:</span>
                                <span className="detail-value">{formatDate(month.payment.updatedAt)}</span>
                              </div>
                            )}
                            {month.payment?.updatedByName && (
                              <div className="payment-detail">
                                <span className="detail-label">Updated By:</span>
                                <span className="detail-value">{month.payment.updatedByName}</span>
                              </div>
                            )}
                            {month.payment?.notes && (
                              <div className="payment-detail notes">
                                <span className="detail-label">Notes:</span>
                                <span className="detail-value">{month.payment.notes}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {statusClass === 'pending' && (
                          <div className="payment-detail pending-message">
                            <FiAlertCircle size={16} />
                            <span>Payment pending for this period</span>
                          </div>
                        )}

                        {statusClass === 'not_credited' && (
                          <div className="payment-detail not-credited-message">
                            <FiXCircle size={16} />
                            <span>Payment not credited for this period</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {monthlyBreakdown.length === 0 && (
                    <div className="empty-state small">
                      <FiDollarSign size={30} />
                      <p>No payment data available</p>
                    </div>
                  )}
                </div>
              ) : (
                // TASKS TAB - Show tasks month by month
                <div className="tasks-monthly-view">
                  {monthlyBreakdown.map((month, monthIndex) => {
                    const filteredTasks = getFilteredTasks(month);

                    if (filteredTasks.length === 0) return null;

                    return (
                      <div key={`${month.month}-${month.year}-${monthIndex}`} className="month-tasks-section">
                        <div className="month-tasks-header">
                          <h4>
                            {month.month} {month.year}
                            {month.isPartial && (
                              <span className="partial-badge">
                                {formatDate(month.fromDate)} - {formatDate(month.toDate)}
                              </span>
                            )}
                          </h4>
                          <span className="task-count-badge">
                            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                          </span>
                        </div>

                        <div className="tasks-list">
                          {filteredTasks.map((task, taskIndex) => (
                            <div key={taskIndex} className="task-item">
                              <div className="task-icon">
                                {activeTaskTab === 'completed' ? (
                                  <FiCheckCircle className="completed-icon" />
                                ) : activeTaskTab === 'pending' ? (
                                  <FiClock className="pending-icon" />
                                ) : (
                                  <FiBriefcase className="assigned-icon" />
                                )}
                              </div>
                              <div className="task-details">
                                <div className="task-name">{task.taskName || 'Task'}</div>
                                <div className="task-meta">
                                  <span className="employee-name">
                                    <FiUserCheck size={12} />
                                    {task.employeeName || 'Unassigned'}
                                  </span>
                                  <span className="task-date">
                                    <FiCalendar size={12} />
                                    Assigned: {formatDate(task.assignedAt)}
                                  </span>
                                  {task.completedAt && (
                                    <span className="task-date completed">
                                      <FiCheck size={12} />
                                      Completed: {formatDate(task.completedAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Show message if no tasks in current tab */}
                  {monthlyBreakdown.every(month => getFilteredTasks(month).length === 0) && (
                    <div className="empty-state small">
                      {activeTaskTab === 'assigned' && <FiBriefcase size={30} />}
                      {activeTaskTab === 'pending' && <FiClock size={30} />}
                      {activeTaskTab === 'completed' && <FiCheckCircle size={30} />}
                      <p>No {activeTaskTab} tasks in this period</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="view-modal-footer">
            <div className="action-buttons">
              <button
                className="modal-btn close-btn"
                onClick={closeTaskInfoModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Client Modal
  const renderClientModal = () => {
    if (!showClientModal || !clientModalData) return null;

    return (
      <div className="view-modal-overlay">
        <div className="view-modal client-modal">
          <div className="view-modal-header">
            <h3>Client Details</h3>
            <button className="modal-close-btn" onClick={() => setShowClientModal(false)}>
              &times;
            </button>
          </div>

          <div className="view-modal-body">
            <div className="client-summary">
              <div className="summary-header">
                <div className="client-avatar">
                  {clientModalData.firstName?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="client-info">
                  <h4>{clientModalData.name}</h4>
                  <div className="client-meta">
                    <span className="email">{clientModalData.email}</span>
                    <span className="phone">{clientModalData.phone}</span>
                    <span className={`status-badge ${clientModalData.isActive ? 'active' : 'inactive'}`}>
                      {clientModalData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="enrollment-details-grid">
                {/* Personal Information Section */}
                <div className="details-section">
                  <div className="section-header">
                    <h5 className="section-title">Personal Information</h5>
                    {!isEditing && (
                      <button
                        className="edit-btn"
                        onClick={() => setIsEditing(true)}
                      >
                        <FiEdit /> Edit
                      </button>
                    )}
                  </div>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Full Name</span>
                      <span className="detail-value">{clientModalData.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Client ID</span>
                      <span className="detail-value">{clientModalData.clientId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{clientModalData.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{clientModalData.phone}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Address</span>
                      <span className="detail-value">{clientModalData.address || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Enrollment Date</span>
                      <span className="detail-value">
                        {new Date(clientModalData.enrollmentDate || clientModalData.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Editable Business Information Section */}
                <div className="details-section editable-section">
                  <div className="section-header">
                    <h5 className="section-title">Business Information</h5>
                    {isEditing && (
                      <button
                        className="save-btn"
                        onClick={updateClientDetails}
                        disabled={updatingClient}
                      >
                        {updatingClient ? (
                          <>
                            <div className="spinner-small"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FiSave /> Save Changes
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="edit-form">
                      {/* Visa Type */}
                      <div className="form-group">
                        <label className="form-label">Visa Type</label>
                        <div className="radio-options">
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="visaType"
                              value="A"
                              checked={editingClient.visaType === 'A'}
                              onChange={(e) => setEditingClient({ ...editingClient, visaType: e.target.value })}
                            />
                            <span>A</span>
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="visaType"
                              value="B"
                              checked={editingClient.visaType === 'B'}
                              onChange={(e) => setEditingClient({ ...editingClient, visaType: e.target.value })}
                            />
                            <span>B</span>
                          </label>
                        </div>
                      </div>

                      {/* Strong ID */}
                      <div className="form-group">
                        <label className="form-label">Strong ID Available</label>
                        <div className="radio-options">
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="hasStrongId"
                              value="yes"
                              checked={editingClient.hasStrongId === 'yes'}
                              onChange={(e) => setEditingClient({ ...editingClient, hasStrongId: e.target.value })}
                            />
                            <span>Yes</span>
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="hasStrongId"
                              value="no"
                              checked={editingClient.hasStrongId === 'no'}
                              onChange={(e) => setEditingClient({ ...editingClient, hasStrongId: e.target.value })}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>

                      {/* VAT Period */}
                      <div className="form-group">
                        <label className="form-label">VAT Period</label>
                        <div className="radio-options">
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="vatPeriod"
                              value="monthly"
                              checked={editingClient.vatPeriod === 'monthly'}
                              onChange={(e) => setEditingClient({ ...editingClient, vatPeriod: e.target.value })}
                            />
                            <span>Monthly</span>
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="vatPeriod"
                              value="quarterly"
                              checked={editingClient.vatPeriod === 'quarterly'}
                              onChange={(e) => setEditingClient({ ...editingClient, vatPeriod: e.target.value })}
                            />
                            <span>Quarterly</span>
                          </label>
                        </div>
                      </div>

                      {/* Business Nature */}
                      <div className="form-group">
                        <label className="form-label">Nature of Business</label>
                        <div className="radio-options">
                          {['posti', 'wolt', 'taxi', 'restaurant', 'other'].map((type) => (
                            <label key={type} className="radio-label">
                              <input
                                type="radio"
                                name="businessNature"
                                value={type}
                                checked={editingClient.businessNature === type}
                                onChange={(e) => setEditingClient({ ...editingClient, businessNature: e.target.value })}
                              />
                              <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Trade Register */}
                      <div className="form-group">
                        <label className="form-label">Trade Register</label>
                        <div className="radio-options">
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="registerTrade"
                              value="yes"
                              checked={editingClient.registerTrade === 'yes'}
                              onChange={(e) => setEditingClient({ ...editingClient, registerTrade: e.target.value })}
                            />
                            <span>Yes</span>
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="registerTrade"
                              value="no"
                              checked={editingClient.registerTrade === 'no'}
                              onChange={(e) => setEditingClient({ ...editingClient, registerTrade: e.target.value })}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>

                      {/* Plan Selection */}
                      <div className="form-group">
                        <label className="form-label">Plan Selection</label>
                        <div className="radio-options">
                          {['Lite', 'Taxi', 'Premium', 'Pro', 'Restaurant', 'Lite Oy', 'Premium Oy', 'Pro Oy'].map((plan) => (
                            <label key={plan} className="radio-label">
                              <input
                                type="radio"
                                name="planSelected"
                                value={plan}
                                checked={editingClient.planSelected === plan}
                                onChange={(e) => setEditingClient({ ...editingClient, planSelected: e.target.value })}
                              />
                              <span>{plan}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Business Name</span>
                        <span className="detail-value">{clientModalData.businessName || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Visa Type</span>
                        <span className="detail-value">{clientModalData.visaType || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Strong ID</span>
                        <span className="detail-value">{clientModalData.hasStrongId || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">VAT Period</span>
                        <span className="detail-value">{clientModalData.vatPeriod || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Business Nature</span>
                        <span className="detail-value">{clientModalData.businessNature || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Trade Register</span>
                        <span className="detail-value">{clientModalData.registerTrade || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Selected Plan</span>
                        <span className="detail-value plan-highlight">{clientModalData.planSelected || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="view-modal-footer">
            {isEditing ? (
              <div className="action-buttons">
                <button
                  className="modal-btn cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingClient({ ...clientModalData });
                  }}
                  disabled={updatingClient}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="modal-btn close-btn"
                onClick={() => setShowClientModal(false)}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="admin-client-management">
        {/* Section Tabs */}
        <div className="section-tabs">
          <button
            className={`section-tab ${activeSection === 'enrollments' ? 'active' : ''}`}
            onClick={() => setActiveSection('enrollments')}
          >
            <FiFileText />
            <span>Enrollments</span>
            {enrollments?.filter(e => e.status === "PENDING").length > 0 && (
              <span className="tab-badge">
                {enrollments.filter(e => e.status === "PENDING").length}
              </span>
            )}
          </button>

          <button
            className={`section-tab ${activeSection === 'activeControl' ? 'active' : ''}`}
            onClick={() => setActiveSection('activeControl')}
          >
            <FiUserCheck />
            <span>Active Control</span>
            {clients.length > 0 && (
              <span className="tab-badge">{clients.length}</span>
            )}
          </button>

          <button
            className={`section-tab ${activeSection === 'clientsData' ? 'active' : ''}`}
            onClick={() => setActiveSection('clientsData')}
          >
            <FiDatabase />
            <span>Clients Data</span>
            {clients.length > 0 && (
              <span className="tab-badge">{clients.length}</span>
            )}
          </button>

          {/* ========== UPDATED: Finance Tab - Now uses imported component ========== */}
          <button
            className={`section-tab ${activeSection === 'financeRequests' ? 'active' : ''}`}
            onClick={() => setActiveSection('financeRequests')}
          >
            <FiDollarSign />
            <span>Finance Requests</span>
          </button>

          {/* Task Info Tab */}
          <button
            className={`section-tab ${activeSection === 'taskInfo' ? 'active' : ''}`}
            onClick={() => setActiveSection('taskInfo')}
          >
            <BiTask />
            <span>Task Info</span>
            {taskInfoData.length > 0 && (
              <span className="tab-badge">{taskInfoData.length}</span>
            )}
          </button>
        </div>

        {/* Page Header */}
        <div className="enrollments-header">
          <div className="header-left">
            <h2>
              {activeSection === 'enrollments' && 'Client Enrollment Requests'}
              {activeSection === 'activeControl' && 'Client Active Control'}
              {activeSection === 'clientsData' && 'Clients Data Management'}
              {activeSection === 'financeRequests' && 'Financial Statement Requests'}
              {activeSection === 'taskInfo' && 'Client Task Information'}
            </h2>
            <p className="subtitle">
              {activeSection === 'enrollments' && 'Review and manage client enrollment submissions'}
              {activeSection === 'activeControl' && 'Activate or deactivate client accounts'}
              {activeSection === 'clientsData' && 'View and manage client information'}
              {activeSection === 'financeRequests' && 'Approve or reject financial statement requests with notes'}
              {activeSection === 'taskInfo' && 'Monitor client tasks, assignments, and payment status'}
            </p>
          </div>
          <button
            className="refresh-btn"
            onClick={() => {
              if (activeSection === 'enrollments') fetchEnrollments();
              else if (activeSection === 'activeControl' || activeSection === 'clientsData') fetchClients();
              else if (activeSection === 'taskInfo') fetchTaskInfo();
              // ========== REMOVED: financeRequests case ==========
            }}
            disabled={refreshing || clientsLoading || taskInfoLoading}
          >
            <FiRefreshCw className={refreshing || clientsLoading || taskInfoLoading ? "spinning" : ""} />
            {refreshing || clientsLoading || taskInfoLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Render Active Section */}
        {activeSection === 'enrollments' && renderEnrollments()}
        {activeSection === 'activeControl' && renderActiveControl()}
        {activeSection === 'clientsData' && renderClientsData()}

        {/* ========== UPDATED: Finance Requests - Now uses imported component ========== */}
        {activeSection === 'financeRequests' && <AdminFinanceRequests />}

        {activeSection === 'taskInfo' && renderTaskInfo()}

        {/* Existing Modals */}
        {showViewModal && viewModalData && (
          <div className="view-modal-overlay">
            <div className="view-modal">
              <div className="view-modal-header">
                <h3>Enrollment Details</h3>
                <button className="modal-close-btn" onClick={closeViewModal}>
                  &times;
                </button>
              </div>

              <div className="view-modal-body">
                <div className="client-summary">
                  <div className="summary-header">
                    <div className="client-avatar">
                      {viewModalData.firstName?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div className="client-info">
                      <h4>{viewModalData.name}</h4>
                      <div className="client-meta">
                        <span className="email">{viewModalData.email}</span>
                        <span className="phone">{viewModalData.mobile}</span>
                        <span className={`status-badge ${viewModalData.status.toLowerCase()}`}>
                          {viewModalData.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="enrollment-details-grid">
                    <div className="details-section">
                      <h5 className="section-title">Personal Information</h5>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Full Name</span>
                          <span className="detail-value">{viewModalData.name}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Visa Type</span>
                          <span className="detail-value">{viewModalData.visaType || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Strong ID</span>
                          <span className="detail-value">{viewModalData.hasStrongId || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Address</span>
                          <span className="detail-value">{viewModalData.address || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Phone</span>
                          <span className="detail-value">{viewModalData.mobile}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Email</span>
                          <span className="detail-value">{viewModalData.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="details-section">
                      <h5 className="section-title">Business Information</h5>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Business Name</span>
                          <span className="detail-value">{viewModalData.businessName || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Business Address</span>
                          <span className="detail-value">{viewModalData.businessAddress || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Bank Account</span>
                          <span className="detail-value">{viewModalData.bankAccount || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">BIC Code</span>
                          <span className="detail-value">{viewModalData.bicCode || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">VAT Period</span>
                          <span className="detail-value">{viewModalData.vatPeriod || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Business Nature</span>
                          <span className="detail-value">{viewModalData.businessNature || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Trade Register</span>
                          <span className="detail-value">{viewModalData.registerTrade || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="details-section">
                      <h5 className="section-title">Plan & Enrollment</h5>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Selected Plan</span>
                          <span className="detail-value plan-highlight">{viewModalData.planSelected || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Enrollment ID</span>
                          <span className="detail-value">{viewModalData.enrollId}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Submitted On</span>
                          <span className="detail-value">
                            {new Date(viewModalData.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Status</span>
                          <span className={`detail-value status-badge ${viewModalData.status.toLowerCase()}`}>
                            {viewModalData.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="view-modal-footer">
                {viewModalData.status === "PENDING" ? (
                  <div className="action-buttons">
                    <button
                      className="modal-btn reject-btn"
                      onClick={() => openConfirmationFromView("REJECT")}
                    >
                      <FiXCircle />
                      Reject Enrollment
                    </button>
                    <button
                      className="modal-btn approve-btn"
                      onClick={() => openConfirmationFromView("APPROVE")}
                    >
                      <FiCheckCircle />
                      Approve Enrollment
                    </button>
                  </div>
                ) : (
                  <div className="processed-message">
                    This enrollment has been {viewModalData.status.toLowerCase()}.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Client Details Modal */}
        {renderClientModal()}

        {/* ========== REMOVED: Finance Modals ========== */}
        {/* No more finance modals here! They are inside AdminFinanceRequests component */}

        {/* Task Info Modal */}
        {renderTaskInfoModal()}

        {showConfirmationModal && (
          <div className="confirmation-modal-overlay">
            <div className="confirmation-modal">
              <div className="modal-header">
                <h3>Confirm Action</h3>
                <button className="modal-close-btn" onClick={closeConfirmationModal} disabled={processing}>
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-icon">
                  {modalData.action === "APPROVE" ? (
                    <FiCheckCircle className="modal-icon-approve" />
                  ) : (
                    <FiXCircle className="modal-icon-reject" />
                  )}
                </div>
                <p className="modal-message">
                  Are you sure you want to {modalData.actionText} the enrollment request for
                  <strong> "{modalData.name}"</strong>?
                </p>
                <p className="modal-warning">
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="modal-btn modal-cancel-btn"
                  onClick={closeConfirmationModal}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  className={`modal-btn ${modalData.action === "APPROVE"
                    ? "modal-approve-btn"
                    : "modal-reject-btn"
                    }`}
                  onClick={handleAction}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <div className="modal-btn-spinner"></div>
                      Processing...
                    </>
                  ) : (
                    `${modalData.actionText.charAt(0).toUpperCase() + modalData.actionText.slice(1)}`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminClientEnrollments;