import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiEye,
    FiCheck,
    FiAlertCircle,
    FiFileMinus,
    FiCalendar,
    FiMail,
    FiDollarSign,
    FiChevronLeft,
    FiChevronRight,
    FiRefreshCw,
    FiEdit,
    FiSave,
    FiUserCheck,
    FiUserX,
    FiUsers,
    FiFileText,
    FiDatabase,
    FiTrendingUp,
    FiList,
    FiPieChart,
    FiSquare,
    FiCheckSquare,
    FiBriefcase,
    FiUser,
    FiChevronDown,
    FiSearch,
    FiX,
} from "react-icons/fi";
import { AiOutlineSearch } from "react-icons/ai";
import { MdDateRange } from "react-icons/md";
import { BiTask, BiTimeFive } from "react-icons/bi";

const AdminFinanceRequests = () => {
    // ========== State for Finance Requests with Pagination ==========
    const [financialRequests, setFinancialRequests] = useState([]);
    const [financeLoading, setFinanceLoading] = useState(false);
    const [financeSearchTerm, setFinanceSearchTerm] = useState("");
    const [financeStatusFilter, setFinanceStatusFilter] = useState("all");
    const [showFinanceModal, setShowFinanceModal] = useState(false);
    const [financeModalData, setFinanceModalData] = useState(null);
    const [approvingRequest, setApprovingRequest] = useState(false);
    const [approvingRequestId, setApprovingRequestId] = useState(null);
    const [showFinanceConfirmModal, setShowFinanceConfirmModal] = useState(false);
    const [financeConfirmData, setFinanceConfirmData] = useState({
        requestId: null,
        clientName: "",
        monthYear: "",
        fromDate: null,
        toDate: null,
        action: "approve"
    });

    // ========== NEW: Notes state for approve/reject ==========
    const [adminNotes, setAdminNotes] = useState("");

    // ========== NEW: Assign Employee States ==========
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignRequestId, setAssignRequestId] = useState(null);
    const [assignClientName, setAssignClientName] = useState("");
    const [employees, setEmployees] = useState([]);
    const [employeesLoading, setEmployeesLoading] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
    const [assigningEmployee, setAssigningEmployee] = useState(false);
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    // ========== Pagination State ==========
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(20);

    // ========== Toast function ==========
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

    // ========== Fetch financial requests with search and pagination ==========
    const fetchFinancialRequests = async (page = 1, search = '', status = 'all') => {
        try {
            setFinanceLoading(true);

            let url = `${import.meta.env.VITE_API_URL}/client-management/all-requests?page=${page}&limit=${itemsPerPage}`;

            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }

            if (status && status !== 'all') {
                url += `&status=${status}`;
            }

            const res = await axios.get(url, { withCredentials: true });

            if (res.data.success) {
                setFinancialRequests(res.data.data || []);
                setCurrentPage(res.data.pagination.page || 1);
                setTotalPages(res.data.pagination.pages || 1);
                setTotalItems(res.data.pagination.total || 0);
            } else {
                setFinancialRequests([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Error fetching financial requests:", error);
            showToast("Failed to fetch financial requests", "error");
            setFinancialRequests([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setFinanceLoading(false);
        }
    };

    // ========== Fetch active employees for dropdown ==========
    const fetchActiveEmployees = async () => {
        try {
            setEmployeesLoading(true);
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin-employee/all`,
                { withCredentials: true }
            );
            // Filter only active employees
            const activeEmployees = res.data.filter(emp => emp.isActive === true);
            setEmployees(activeEmployees);
        } catch (error) {
            console.error("Error fetching employees:", error);
            showToast("Failed to fetch employees", "error");
        } finally {
            setEmployeesLoading(false);
        }
    };

    // ========== Handle search ==========
    const handleFinanceSearch = (value) => {
        setFinanceSearchTerm(value);
        fetchFinancialRequests(1, value, financeStatusFilter);
    };

    // ========== Handle status filter change ==========
    const handleFinanceStatusFilter = (status) => {
        setFinanceStatusFilter(status);
        setCurrentPage(1);
        fetchFinancialRequests(1, financeSearchTerm, status);
    };

    // ========== Handle page change ==========
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchFinancialRequests(newPage, financeSearchTerm, financeStatusFilter);
        }
    };

    // ========== Open finance request details modal ==========
    const openFinanceModal = async (requestId) => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/client-management/request/${requestId}`,
                { withCredentials: true }
            );
            setFinanceModalData(res.data.data);
            setShowFinanceModal(true);
        } catch (error) {
            console.error("Error fetching finance request details:", error);
            showToast("Failed to fetch request details", "error");
        }
    };

    // ========== Open Assign Employee Modal ==========
    const openAssignModal = async (requestId, clientName) => {
        setAssignRequestId(requestId);
        setAssignClientName(clientName);
        setSelectedEmployeeId("");
        setSelectedEmployeeName("");
        setEmployeeSearchTerm("");
        setShowEmployeeDropdown(false);
        setShowAssignModal(true);
        await fetchActiveEmployees();
    };

    // ========== Handle Employee Selection ==========
    const handleEmployeeSelect = (employeeId, employeeName) => {
        setSelectedEmployeeId(employeeId);
        setSelectedEmployeeName(employeeName);
        setShowEmployeeDropdown(false);
        setEmployeeSearchTerm("");
    };

    // ========== Assign Employee to Request ==========
    const assignEmployeeToRequest = async () => {
        if (!selectedEmployeeId || !selectedEmployeeName) {
            showToast("Please select an employee", "error");
            return;
        }

        try {
            setAssigningEmployee(true);

            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/client-management/assign-employee/${assignRequestId}`,
                {
                    employeeId: selectedEmployeeId,
                    employeeName: selectedEmployeeName
                },
                { withCredentials: true }
            );

            if (res.data.success) {
                showToast(`Employee "${selectedEmployeeName}" assigned successfully!`, "success");
                setShowAssignModal(false);
                // Refresh the list
                fetchFinancialRequests(currentPage, financeSearchTerm, financeStatusFilter);
            }
        } catch (error) {
            console.error("Error assigning employee:", error);
            showToast(error.response?.data?.message || "Failed to assign employee", "error");
        } finally {
            setAssigningEmployee(false);
        }
    };

    // ========== Open finance confirmation modal (Approve or Reject) ==========
    const openFinanceConfirmation = (requestId, clientName, fromDate, toDate, action) => {
        setFinanceConfirmData({
            requestId,
            clientName,
            fromDate,
            toDate,
            monthYear: `${new Date(fromDate).toLocaleDateString('en-GB', { month: 'short' })} ${new Date(fromDate).getFullYear()}`,
            action: action
        });
        setAdminNotes("");
        setShowFinanceConfirmModal(true);
    };

    // ========== Approve financial request with notes ==========
    const approveFinancialRequest = async () => {
        const { requestId } = financeConfirmData;

        try {
            setApprovingRequest(true);
            setApprovingRequestId(requestId);

            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/client-management/approve/${requestId}`,
                {
                    adminNotes: adminNotes.trim() || ""
                },
                { withCredentials: true }
            );

            setFinancialRequests(prev => prev.map(req =>
                req.requestId === requestId
                    ? { ...req, ...res.data.data, status: 'in_progress' }
                    : req
            ));

            showToast("Request approved! Client notified. Please assign an employee.", "success");
            setShowFinanceConfirmModal(false);
            setAdminNotes("");
        } catch (error) {
            console.error("Error approving financial request:", error);
            showToast("Failed to approve request", "error");
        } finally {
            setApprovingRequest(false);
            setApprovingRequestId(null);
        }
    };

    // ========== Reject financial request with notes ==========
    const rejectFinancialRequest = async () => {
        const { requestId } = financeConfirmData;

        try {
            setApprovingRequest(true);
            setApprovingRequestId(requestId);

            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/client-management/reject/${requestId}`,
                {
                    adminNotes: adminNotes.trim() || ""
                },
                { withCredentials: true }
            );

            setFinancialRequests(prev => prev.map(req =>
                req.requestId === requestId
                    ? { ...req, ...res.data.data, status: 'rejected' }
                    : req
            ));

            showToast("Financial request rejected. Email sent to client!", "success");
            setShowFinanceConfirmModal(false);
            setAdminNotes("");
        } catch (error) {
            console.error("Error rejecting financial request:", error);
            showToast("Failed to reject request", "error");
        } finally {
            setApprovingRequest(false);
            setApprovingRequestId(null);
        }
    };

    // ========== Close finance modal ==========
    const closeFinanceModal = () => {
        setShowFinanceModal(false);
        setFinanceModalData(null);
    };

    // ========== Close finance confirmation modal ==========
    const closeFinanceConfirmModal = () => {
        setShowFinanceConfirmModal(false);
        setFinanceConfirmData({
            requestId: null,
            clientName: "",
            monthYear: "",
            fromDate: null,
            toDate: null,
            action: "approve"
        });
        setAdminNotes("");
    };

    // ========== Close assign modal ==========
    const closeAssignModal = () => {
        setShowAssignModal(false);
        setAssignRequestId(null);
        setAssignClientName("");
        setSelectedEmployeeId("");
        setSelectedEmployeeName("");
        setEmployeeSearchTerm("");
        setShowEmployeeDropdown(false);
    };

    // ========== Handle click outside dropdown ==========
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowEmployeeDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // ========== Get financial status icon ==========
    const getFinanceStatusIcon = (status) => {
        switch (status) {
            case "approved":
                return <FiCheckCircle className="status-icon approved" />;
            case "in_progress":
                return <FiClock className="status-icon in-progress" />;
            case "sent":
                return <FiCheckCircle className="status-icon sent" />;
            case "completed":
                return <FiCheckCircle className="status-icon completed" />;
            case "rejected":
                return <FiXCircle className="status-icon rejected" />;
            case "cancelled":
                return <FiXCircle className="status-icon cancelled" />;
            case "pending":
            default:
                return <FiClock className="status-icon pending" />;
        }
    };

    // ========== Get financial status text ==========
    const getFinanceStatusText = (status) => {
        switch (status) {
            case "pending": return "Pending";
            case "in_progress": return "In Progress";
            case "approved": return "Approved";
            case "sent": return "Sent";
            case "completed": return "Completed";
            case "rejected": return "Rejected";
            case "cancelled": return "Cancelled";
            default: return status;
        }
    };

    // ========== Filter employees based on search ==========
    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(employeeSearchTerm.toLowerCase())
    );

    // ========== Load data on mount ==========
    useEffect(() => {
        fetchFinancialRequests(1, '', 'all');
    }, []);

    const renderAssignModal = () => {
        if (!showAssignModal) return null;

        return (
            <div className="assign-employee-overlay">
                <div className="assign-employee-modal">
                    <div className="assign-employee-header">
                        <h3>
                            <FiUser size={20} />
                            Assign Employee to Request
                        </h3>
                        <button
                            className="assign-employee-close-btn"
                            onClick={closeAssignModal}
                            disabled={assigningEmployee}
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                    <div className="assign-employee-body">
                        <div className="assign-info">
                            <p><strong>Request ID:</strong> {assignRequestId}</p>
                            <p><strong>Client:</strong> {assignClientName}</p>
                            <p className="assign-hint">
                                <FiAlertCircle size={14} />
                                Select an active employee to assign this request
                            </p>
                        </div>

                        {/* Employee Dropdown */}
                        <div className="assign-form-group">
                            <label className="assign-form-label">
                                <FiUsers size={16} /> Select Employee *
                            </label>
                            <div className="assign-custom-dropdown" ref={dropdownRef}>
                                <div
                                    className={`assign-dropdown-selected ${!selectedEmployeeId ? 'placeholder' : ''}`}
                                    onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                                >
                                    <span>
                                        {selectedEmployeeName || "Select an employee..."}
                                    </span>
                                    <FiChevronDown size={18} className={showEmployeeDropdown ? 'rotated' : ''} />
                                </div>
                                {showEmployeeDropdown && (
                                    <div className="assign-dropdown-options">
                                        <div className="assign-dropdown-search">
                                            <FiSearch size={16} />
                                            <input
                                                type="text"
                                                placeholder="Search employees..."
                                                value={employeeSearchTerm}
                                                onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="assign-dropdown-list">
                                            {employeesLoading ? (
                                                <div className="assign-dropdown-loading">
                                                    <div className="spinner-small"></div>
                                                    Loading employees...
                                                </div>
                                            ) : filteredEmployees.length === 0 ? (
                                                <div className="assign-dropdown-no-results">
                                                    {employeeSearchTerm ? 'No employees found' : 'No active employees available'}
                                                </div>
                                            ) : (
                                                filteredEmployees.map((emp) => (
                                                    <div
                                                        key={emp.employeeId}
                                                        className={`assign-dropdown-item ${selectedEmployeeId === emp.employeeId ? 'selected' : ''}`}
                                                        onClick={() => handleEmployeeSelect(emp.employeeId, emp.name)}
                                                    >
                                                        <div className="assign-employee-name">{emp.name}</div>
                                                        <div className="assign-employee-email">{emp.email}</div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {!selectedEmployeeId && (
                                <small className="assign-hint-text">Please select an employee to assign</small>
                            )}
                        </div>

                        {/* Selected Employee Summary */}
                        {selectedEmployeeId && (
                            <div className="assign-selected-summary">
                                <FiUserCheck size={16} />
                                <span>
                                    <strong>Selected:</strong> {selectedEmployeeName}
                                </span>
                            </div>
                        )}

                        <div className="assign-modal-actions">
                            <button
                                type="button"
                                className="assign-secondary-btn"
                                onClick={closeAssignModal}
                                disabled={assigningEmployee}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="assign-primary-btn"
                                onClick={assignEmployeeToRequest}
                                disabled={assigningEmployee || !selectedEmployeeId}
                            >
                                {assigningEmployee ? (
                                    <>
                                        <div className="spinner-small"></div>
                                        Assigning...
                                    </>
                                ) : (
                                    <>
                                        <FiUserCheck size={18} />
                                        Assign Employee
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ========== RENDER: Finance Confirmation Modal ==========
    const renderFinanceConfirmModal = () => {
        if (!showFinanceConfirmModal) return null;

        const { clientName, fromDate, toDate, action } = financeConfirmData;
        const isApprove = action === "approve";

        return (
            <div className="confirmation-modal-overlay">
                <div className="confirmation-modal finance-confirm-modal">
                    <div className="modal-header">
                        <h3>{isApprove ? 'Approve' : 'Reject'} Financial Statements</h3>
                        <button className="modal-close-btn" onClick={closeFinanceConfirmModal} disabled={approvingRequest}>
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="modal-icon">
                            {isApprove ? (
                                <FiCheckCircle className="modal-icon-approve" />
                            ) : (
                                <FiXCircle className="modal-icon-reject" />
                            )}
                        </div>
                        <p className="modal-message">
                            Are you sure you want to <strong>{isApprove ? 'approve' : 'reject'}</strong> the financial statement request for
                            <strong> "{clientName}"</strong>?
                        </p>
                        <p className="modal-details">
                            <FiCalendar size={16} /> <strong>Period:</strong>
                            {fromDate && toDate ? (
                                <>
                                    {new Date(fromDate).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })} - {new Date(toDate).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </>
                            ) : (
                                'N/A'
                            )}
                        </p>

                        <div className="notes-section">
                            <label className="notes-label">
                                <FiEdit size={14} />
                                Admin Notes <span className="optional">(Optional)</span>
                            </label>
                            <textarea
                                className="notes-textarea"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add any notes for the client... (optional)"
                                rows={3}
                                disabled={approvingRequest}
                            />
                            <small className="notes-hint">
                                {isApprove
                                    ? "These notes will be included in the approval email to the client."
                                    : "These notes will be included in the rejection email to the client."}
                            </small>
                        </div>

                        <p className="modal-warning">
                            <FiAlertCircle size={16} />
                            {isApprove
                                ? "This will send an email to the client and mark the request as 'In Progress'. You will then need to assign an employee."
                                : "This will send an email to the client and mark the request as rejected."}
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="modal-btn modal-cancel-btn"
                            onClick={closeFinanceConfirmModal}
                            disabled={approvingRequest}
                        >
                            Cancel
                        </button>
                        <button
                            className={`modal-btn ${isApprove ? 'modal-approve-btn' : 'modal-reject-btn'}`}
                            onClick={isApprove ? approveFinancialRequest : rejectFinancialRequest}
                            disabled={approvingRequest}
                        >
                            {approvingRequest ? (
                                <>
                                    <div className="modal-btn-spinner"></div>
                                    Processing...
                                </>
                            ) : (
                                isApprove ? "Approve & Notify Client" : "Reject & Send Email"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ========== RENDER: Finance Request Modal (View Details) ==========
    const renderFinanceModal = () => {
        if (!showFinanceModal || !financeModalData) return null;

        const request = financeModalData;
        const isAssigned = request.assignedEmployeeId !== null && request.assignedEmployeeId !== undefined && request.assignedEmployeeId !== "";

        return (
            <div className="view-modal-overlay">
                <div className="view-modal finance-modal">
                    <div className="view-modal-header">
                        <h3>Financial Statement Request Details</h3>
                        <button className="modal-close-btn" onClick={closeFinanceModal}>
                            &times;
                        </button>
                    </div>

                    <div className="view-modal-body">
                        <div className="client-summary">
                            <div className="summary-header">
                                <div className="client-avatar">
                                    <FiDollarSign size={24} />
                                </div>
                                <div className="client-info">
                                    <h4>{request.clientName}</h4>
                                    <div className="client-meta">
                                        <span className="email">
                                            <FiMail size={14} /> {request.clientEmail}
                                        </span>
                                        <span className={`status-badge ${request.status}`}>
                                            {getFinanceStatusText(request.status)}
                                        </span>
                                        {request.isPaid && (
                                            <span className="status-badge paid-badge">💰 PAID</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="enrollment-details-grid">
                                <div className="details-section">
                                    <h5 className="section-title">Request Information</h5>
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Request ID</span>
                                            <span className="detail-value">{request.requestId}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Payment</span>
                                            <span className={`detail-value ${request.isPaid ? 'paid-text' : 'free-text'}`}>
                                                {request.isPaid ? '💰 PAID' : '✅ FREE'}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Period</span>
                                            <span className="detail-value highlight">
                                                <FiCalendar size={14} />
                                                {request.fromDate && request.toDate ? (
                                                    <>
                                                        {new Date(request.fromDate).toLocaleDateString('en-GB', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })} - {new Date(request.toDate).toLocaleDateString('en-GB', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Client ID</span>
                                            <span className="detail-value">{request.clientId}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Requested Date</span>
                                            <span className="detail-value">
                                                {new Date(request.requestedAt).toLocaleString('en-GB')}
                                            </span>
                                        </div>
                                        {request.sentDate && (
                                            <div className="detail-item">
                                                <span className="detail-label">Sent Date</span>
                                                <span className="detail-value">
                                                    {new Date(request.sentDate).toLocaleString('en-GB')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ========== Employee Assignment Section ========== */}
                                <div className="details-section">
                                    <h5 className="section-title">Employee Assignment</h5>
                                    <div className="details-grid">
                                        {request.status === 'rejected' ? (
                                            <div className="detail-item full-width">
                                                <span className="detail-label">Status</span>
                                                <span className="rejected-value">
                                                    <FiXCircle size={14} /> Request Rejected
                                                </span>
                                            </div>
                                        ) : isAssigned ? (
                                            <>
                                                <div className="detail-item">
                                                    <span className="detail-label">Assigned Employee</span>
                                                    <span className="assigned-employee-value">
                                                        <FiUserCheck size={14} /> {request.assignedEmployeeName}
                                                    </span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Employee ID</span>
                                                    <span className="detail-value">{request.assignedEmployeeId}</span>
                                                </div>
                                                {request.assignedAt && (
                                                    <div className="detail-item">
                                                        <span className="detail-label">Assigned On</span>
                                                        <span className="detail-value">
                                                            {new Date(request.assignedAt).toLocaleString('en-GB')}
                                                        </span>
                                                    </div>
                                                )}
                                                {request.assignedBy?.adminName && (
                                                    <div className="detail-item">
                                                        <span className="detail-label">Assigned By</span>
                                                        <span className="detail-value">{request.assignedBy.adminName}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : request.status === 'pending' ? (
                                            <div className="detail-item full-width">
                                                <span className="detail-label">Status</span>
                                                <span className="pending-value">
                                                    <FiClock size={14} /> Awaiting Approval
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="detail-item full-width">
                                                <span className="detail-label">Status</span>
                                                <span className="not-assigned-value">
                                                    <FiAlertCircle size={14} /> Not assigned yet
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Additional Information */}
                                <div className="details-section">
                                    <h5 className="section-title">Additional Information</h5>
                                    <div className="details-grid">
                                        {request.adminNotes ? (
                                            <div className="detail-item full-width">
                                                <span className="detail-label">Admin Notes</span>
                                                <div className="detail-value notes-box admin">
                                                    {request.adminNotes}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="detail-item">
                                                <span className="detail-label">Admin Notes</span>
                                                <span className="detail-value">No admin notes</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Processing Information */}
                                {request.processedBy && (
                                    <div className="details-section">
                                        <h5 className="section-title">Processing Information</h5>
                                        <div className="details-grid">
                                            <div className="detail-item">
                                                <span className="detail-label">Processed By</span>
                                                <span className="detail-value">{request.processedBy.adminName}</span>
                                            </div>
                                            {request.processedAt && (
                                                <div className="detail-item">
                                                    <span className="detail-label">Processed Date</span>
                                                    <span className="detail-value">
                                                        {new Date(request.processedAt).toLocaleString('en-GB')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="view-modal-footer">
                        <div className="action-buttons">
                            <button
                                className="modal-btn close-btn"
                                onClick={closeFinanceModal}
                            >
                                Close
                            </button>
                            {request.status === 'pending' && (
                                <>
                                    <button
                                        className="modal-btn reject-btn"
                                        onClick={() => openFinanceConfirmation(
                                            request.requestId,
                                            request.clientName,
                                            request.fromDate,
                                            request.toDate,
                                            "reject"
                                        )}
                                    >
                                        <FiXCircle />
                                        Reject
                                    </button>
                                    <button
                                        className="modal-btn approve-btn"
                                        onClick={() => openFinanceConfirmation(
                                            request.requestId,
                                            request.clientName,
                                            request.fromDate,
                                            request.toDate,
                                            "approve"
                                        )}
                                    >
                                        <FiCheck />
                                        Approve
                                    </button>
                                </>
                            )}
                            {/* ========== NEW: Assign Button - Only for in_progress and not assigned ========== */}
                            {request.status === 'in_progress' && !isAssigned && (
                                <button
                                    className="modal-btn assign-btn"
                                    onClick={() => openAssignModal(request.requestId, request.clientName)}
                                >
                                    <FiUser size={16} />
                                    Assign Employee
                                </button>
                            )}
                            {/* ========== Show assigned employee name if assigned ========== */}
                            {request.status === 'in_progress' && isAssigned && (
                                <span className="assigned-info">
                                    <FiUserCheck size={16} />
                                    Assigned to: {request.assignedEmployeeName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ========== RENDER: Main Finance Requests Table ==========
    return (
        <div className="finance-requests-container">
            {/* Filters */}
            <div className="filters-container">
                <div className="search-box">
                    <AiOutlineSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by client name, email, or request ID..."
                        value={financeSearchTerm}
                        onChange={(e) => handleFinanceSearch(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${financeStatusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => handleFinanceStatusFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${financeStatusFilter === 'pending' ? 'active' : ''}`}
                        onClick={() => handleFinanceStatusFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`filter-btn ${financeStatusFilter === 'in_progress' ? 'active' : ''}`}
                        onClick={() => handleFinanceStatusFilter('in_progress')}
                    >
                        In Progress
                    </button>
                    <button
                        className={`filter-btn ${financeStatusFilter === 'sent' ? 'active' : ''}`}
                        onClick={() => handleFinanceStatusFilter('sent')}
                    >
                        Sent
                    </button>
                    <button
                        className={`filter-btn ${financeStatusFilter === 'rejected' ? 'active' : ''}`}
                        onClick={() => handleFinanceStatusFilter('rejected')}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="enrollments-table">
                    <thead>
                        <tr>
                            <th>Client Name</th>
                            <th>Email</th>
                            <th>Period</th>
                            <th>Requested</th>
                            <th>Status</th>
                            <th>Assigned To</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {financeLoading ? (
                            <tr>
                                <td colSpan="7" className="loading-cell">
                                    <div className="loading-spinner"></div>
                                    Loading finance requests...
                                </td>
                            </tr>
                        ) : financialRequests.length === 0 ? (
                            <tr className="no-data">
                                <td colSpan="7">
                                    <div className="empty-state">
                                        <FiFileMinus size={40} />
                                        <p>No finance requests found</p>
                                        <small>
                                            {financeSearchTerm || financeStatusFilter !== 'all'
                                                ? 'Try adjusting your search or filters'
                                                : 'No requests available'}
                                        </small>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            financialRequests.map((request) => {
                                const isAssigned = request.assignedEmployeeId !== null &&
                                    request.assignedEmployeeId !== undefined &&
                                    request.assignedEmployeeId !== "";

                                return (
                                    <tr key={request.requestId} className="finance-row">
                                        <td className="name-cell">
                                            <div className="client-name">
                                                <strong>{request.clientName}</strong>
                                                {request.isPaid && (
                                                    <span className="status-badge paid-badge client-paid-badge">💰 PAID</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="email-cell">
                                            <a href={`mailto:${request.clientEmail}`}>{request.clientEmail}</a>
                                        </td>
                                        <td className="period-cell">
                                            <div className="period-info">
                                                <FiCalendar className="period-icon" />
                                                <span className="period-text">
                                                    {request.fromDate && request.toDate ? (
                                                        <>
                                                            {new Date(request.fromDate).toLocaleDateString('en-GB', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })} - {new Date(request.toDate).toLocaleDateString('en-GB', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </>
                                                    ) : (
                                                        'Invalid date range'
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="date-cell">
                                            {new Date(request.requestedAt).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="status-cell">
                                            <div className="status-wrapper">
                                                {/* {getFinanceStatusIcon(request.status)} */}
                                                <span className={`status-badge ${request.status}`}>
                                                    {getFinanceStatusText(request.status)}
                                                </span>
                                                {request.isPaid && (
                                                    <span className="status-badge paid-badge">💰 PAID</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="assigned-cell">
                                            {request.status === 'rejected' ? (
                                                <span className="rejected-status">
                                                    <FiXCircle size={14} />
                                                    Rejected
                                                </span>
                                            ) : request.status === 'pending' ? (
                                                <span className="not-assigned">
                                                    <FiClock size={14} />
                                                    Pending
                                                </span>
                                            ) : isAssigned ? (
                                                <span className="assigned-employee">
                                                    <FiUserCheck size={14} />
                                                    {request.assignedEmployeeName}
                                                </span>
                                            ) : (
                                                <span className="not-assigned">
                                                    <FiAlertCircle size={14} />
                                                    Not assigned
                                                </span>
                                            )}
                                        </td>
                                        <td className="actions-cell">
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn view-btn"
                                                    onClick={() => openFinanceModal(request.requestId)}
                                                >
                                                    <FiEye />
                                                    <span>View</span>
                                                </button>

                                                {request.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="action-btn reject-btn finance-reject"
                                                            onClick={() => openFinanceConfirmation(
                                                                request.requestId,
                                                                request.clientName,
                                                                request.fromDate,
                                                                request.toDate,
                                                                "reject"
                                                            )}
                                                            disabled={approvingRequest && approvingRequestId === request.requestId}
                                                        >
                                                            {approvingRequest && approvingRequestId === request.requestId ? (
                                                                <div className="spinner-small"></div>
                                                            ) : (
                                                                <>
                                                                    <FiXCircle />
                                                                    <span>Reject</span>
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            className="action-btn approve-btn finance-approve"
                                                            onClick={() => openFinanceConfirmation(
                                                                request.requestId,
                                                                request.clientName,
                                                                request.fromDate,
                                                                request.toDate,
                                                                "approve"
                                                            )}
                                                            disabled={approvingRequest && approvingRequestId === request.requestId}
                                                        >
                                                            {approvingRequest && approvingRequestId === request.requestId ? (
                                                                <div className="spinner-small"></div>
                                                            ) : (
                                                                <>
                                                                    <FiCheck />
                                                                    <span>Approve</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </>
                                                )}

                                                {/* ========== NEW: Assign Button in Table ========== */}
                                                {request.status === 'in_progress' && !isAssigned && (
                                                    <button
                                                        className="action-btn assign-btn"
                                                        onClick={() => openAssignModal(request.requestId, request.clientName)}
                                                    >
                                                        <FiUser size={14} />
                                                        <span>Assign</span>
                                                    </button>
                                                )}

                                                {request.status === 'in_progress' && isAssigned && (
                                                    <span className="assigned-badge">
                                                        <FiUserCheck size={14} />
                                                        Assigned
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!financeLoading && totalItems > 0 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        <span>
                            Showing {((currentPage - 1) * itemsPerPage) + 1} -
                            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} requests
                        </span>
                    </div>

                    <div className="pagination-controls">
                        <button
                            className={`pagination-btn prev-btn ${currentPage === 1 ? 'disabled' : ''}`}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || financeLoading}
                        >
                            <FiChevronLeft size={16} />
                            Previous
                        </button>

                        <div className="pagination-pages">
                            {[...Array(totalPages)].map((_, index) => {
                                const pageNum = index + 1;
                                if (
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`pagination-page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                            onClick={() => handlePageChange(pageNum)}
                                            disabled={financeLoading}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                } else if (
                                    (pageNum === 2 && currentPage > 3) ||
                                    (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                                ) {
                                    return <span key={pageNum} className="pagination-ellipsis">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            className={`pagination-btn next-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || financeLoading}
                        >
                            Next
                            <FiChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="table-footer">
                <div className="footer-info">
                    <div className="total-count">
                        <span className="count-label">Total Requests:</span>
                        <span className="count-value">{totalItems}</span>
                    </div>
                    <div className="status-summary">
                        <span className="pending-count">
                            Pending: {financialRequests.filter(r => r.status === 'pending').length}
                        </span>
                        <span className="approved-count">
                            In Progress: {financialRequests.filter(r => r.status === 'in_progress').length}
                        </span>
                        <span className="sent-count">
                            Sent: {financialRequests.filter(r => r.status === 'sent').length}
                        </span>
                        <span className="rejected-count">
                            Rejected: {financialRequests.filter(r => r.status === 'rejected').length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {renderFinanceModal()}
            {renderFinanceConfirmModal()}
            {renderAssignModal()}
        </div>
    );
};

export default AdminFinanceRequests;