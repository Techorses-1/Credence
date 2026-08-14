import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FiCheckCircle,
    FiXCircle,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
    FiEye,
    FiSend,
    FiCalendar,
    FiMail,
    FiUser,
    FiDollarSign,
    FiClock,
    FiAlertCircle,
    FiFileMinus,
    FiEdit,
    FiX,
    FiCheck,
    FiFilter
} from 'react-icons/fi';
import { AiOutlineSearch } from 'react-icons/ai';
import './EmployeeFinanceRequests.scss';
import EmployeeLayout from '../Layout/EmployeeLayout';

const EmployeeFinanceRequests = () => {
    // ========== State ==========
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [employee, setEmployee] = useState(null);

    // ========== Pagination States ==========
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [totalPages, setTotalPages] = useState(1);

    // ========== Modal States ==========
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewModalData, setViewModalData] = useState(null);
    const [showDoneModal, setShowDoneModal] = useState(false);
    const [doneRequestId, setDoneRequestId] = useState(null);
    const [doneClientName, setDoneClientName] = useState("");
    const [employeeNotes, setEmployeeNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // ========== Toast function ==========
    const showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = 'employee-toast';
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

    // ========== Fetch Employee Data ==========
    const fetchEmployee = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/employee/me`,
                { withCredentials: true }
            );
            setEmployee(res.data);
            return res.data;
        } catch (error) {
            console.error("Error fetching employee:", error);
            showToast("Failed to fetch employee data", "error");
            return null;
        }
    };

    // ========== Fetch Finance Requests ==========
    const fetchRequests = async () => {
        try {
            setRefreshing(true);
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/employee/finance-requests?page=1&limit=100`,
                { withCredentials: true }
            );

            if (res.data.success) {
                setRequests(res.data.data || []);
                setCurrentPage(1);
                // Calculate total pages for frontend pagination
                setTotalPages(Math.ceil((res.data.data || []).length / itemsPerPage));
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
            showToast("Failed to fetch requests", "error");
            setRequests([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // ========== Load data on mount ==========
    useEffect(() => {
        const loadData = async () => {
            await fetchEmployee();
            await fetchRequests();
        };
        loadData();
    }, []);

    // ========== Filter requests based on search and status ==========
    useEffect(() => {
        let filtered = requests;

        // Apply status filter
        if (statusFilter === 'in_progress') {
            filtered = filtered.filter(req => req.status === 'in_progress');
        } else if (statusFilter === 'completed') {
            filtered = filtered.filter(req => req.status === 'sent' || req.status === 'completed');
        }

        // Apply search filter
        if (searchTerm.trim() !== '') {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(req =>
                req.clientName?.toLowerCase().includes(searchLower) ||
                req.clientEmail?.toLowerCase().includes(searchLower) ||
                req.requestId?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredRequests(filtered);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, requests]);

    // ========== Update total pages when filtered requests change ==========
    useEffect(() => {
        setTotalPages(Math.ceil(filteredRequests.length / itemsPerPage));
    }, [filteredRequests, itemsPerPage]);

    // ========== Get current page items ==========
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredRequests.slice(startIndex, endIndex);
    };

    // ========== Pagination handlers ==========
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

    // ========== Format date ==========
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // ========== Get status badge ==========
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="status-badge pending"><FiClock /> Pending</span>;
            case 'in_progress':
                return <span className="status-badge in-progress"><FiRefreshCw /> In Progress</span>;
            case 'sent':
                return <span className="status-badge sent"><FiCheckCircle /> Sent</span>;
            case 'completed':
                return <span className="status-badge completed"><FiCheckCircle /> Completed</span>;
            case 'rejected':
                return <span className="status-badge rejected"><FiXCircle /> Rejected</span>;
            default:
                return <span className="status-badge pending">{status}</span>;
        }
    };

    // ========== Open View Modal ==========
    const openViewModal = (request) => {
        setViewModalData(request);
        setShowViewModal(true);
    };

    // ========== Close View Modal ==========
    const closeViewModal = () => {
        setShowViewModal(false);
        setViewModalData(null);
    };

    // ========== Open Done Modal ==========
    const openDoneModal = (requestId, clientName) => {
        setDoneRequestId(requestId);
        setDoneClientName(clientName);
        setEmployeeNotes("");
        setShowDoneModal(true);
    };

    // ========== Close Done Modal ==========
    const closeDoneModal = () => {
        setShowDoneModal(false);
        setDoneRequestId(null);
        setDoneClientName("");
        setEmployeeNotes("");
    };

    // ========== Mark as Done ==========
    const handleMarkAsDone = async () => {
        if (!doneRequestId) return;

        try {
            setSubmitting(true);

            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/employee/finance-done/${doneRequestId}`,
                {
                    employeeNotes: employeeNotes.trim() || ""
                },
                { withCredentials: true }
            );

            if (res.data.success) {
                showToast(`Request marked as sent! Email sent to client.`, "success");
                closeDoneModal();
                await fetchRequests();
            }
        } catch (error) {
            console.error("Error marking as done:", error);
            showToast(error.response?.data?.message || "Failed to mark as done", "error");
        } finally {
            setSubmitting(false);
        }
    };

    // ========== Get status counts ==========
    const getStatusCounts = () => {
        const total = requests.length;
        const inProgress = requests.filter(r => r.status === 'in_progress').length;
        const completed = requests.filter(r => r.status === 'sent' || r.status === 'completed').length;
        const rejected = requests.filter(r => r.status === 'rejected').length;
        return { total, inProgress, completed, rejected };
    };

    // ========== RENDER: View Modal ==========
    const renderViewModal = () => {
        if (!showViewModal || !viewModalData) return null;

        const request = viewModalData;
        const isDone = request.status === 'sent' || request.status === 'completed';

        return (
            <div className="view-modal-overlay">
                <div className="view-modal finance-view-modal">
                    <div className="view-modal-header">
                        <h3>
                            <FiEye size={20} />
                            Request Details
                        </h3>
                        <button className="modal-close-btn" onClick={closeViewModal}>
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="view-modal-body">
                        <div className="client-summary">
                            <div className="summary-header">
                                <div className="client-avatar">
                                    {request.clientName?.charAt(0).toUpperCase() || 'C'}
                                </div>
                                <div className="client-info">
                                    <h4>{request.clientName}</h4>
                                    <div className="client-meta">
                                        <span className="email">
                                            <FiMail size={14} /> {request.clientEmail}
                                        </span>
                                        {getStatusBadge(request.status)}
                                        {request.isPaid && (
                                            <span className="status-badge paid-badge">💰 PAID</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="details-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Request ID</span>
                                    <span className="detail-value">{request.requestId}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Period</span>
                                    <span className="detail-value highlight">
                                        <FiCalendar size={14} />
                                        {request.dateRangeDisplay || 'N/A'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Requested On</span>
                                    <span className="detail-value">
                                        {formatDate(request.requestedAt)}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Payment</span>
                                    <span className={`detail-value ${request.isPaid ? 'paid-text' : 'free-text'}`}>
                                        {request.isPaid ? '💰 PAID' : '✅ FREE'}
                                    </span>
                                </div>
                                {request.adminNotes && (
                                    <div className="detail-item full-width">
                                        <span className="detail-label">Admin Notes</span>
                                        <div className="detail-value notes-box admin">
                                            {request.adminNotes}
                                        </div>
                                    </div>
                                )}
                                {request.assignedEmployeeName && (
                                    <div className="detail-item">
                                        <span className="detail-label">Assigned To</span>
                                        <span className="detail-value assigned-value">
                                            <FiUser size={14} /> {request.assignedEmployeeName}
                                        </span>
                                    </div>
                                )}
                                {request.assignedAt && (
                                    <div className="detail-item">
                                        <span className="detail-label">Assigned On</span>
                                        <span className="detail-value">
                                            {formatDate(request.assignedAt)}
                                        </span>
                                    </div>
                                )}
                                {request.sentDate && (
                                    <div className="detail-item">
                                        <span className="detail-label">Sent On</span>
                                        <span className="detail-value">
                                            {formatDate(request.sentDate)}
                                        </span>
                                    </div>
                                )}
                                {request.employeeNotes && (
                                    <div className="detail-item full-width">
                                        <span className="detail-label">Your Notes</span>
                                        <div className="detail-value notes-box employee">
                                            {request.employeeNotes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="view-modal-footer">
                        <button className="modal-btn close-btn" onClick={closeViewModal}>
                            Close
                        </button>
                        {!isDone && (
                            <button
                                className="modal-btn done-btn"
                                onClick={() => {
                                    closeViewModal();
                                    openDoneModal(request.requestId, request.clientName);
                                }}
                            >
                                <FiSend size={16} />
                                Mark as Done
                            </button>
                        )}
                        {isDone && (
                            <span className="already-done-badge">
                                <FiCheckCircle size={16} />
                                Already Sent
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ========== RENDER: Done Modal ==========
    const renderDoneModal = () => {
        if (!showDoneModal) return null;

        return (
            <div className="confirmation-modal-overlay">
                <div className="confirmation-modal done-confirm-modal">
                    <div className="modal-header">
                        <h3>
                            <FiSend size={20} />
                            Mark as Done
                        </h3>
                        <button className="modal-close-btn" onClick={closeDoneModal} disabled={submitting}>
                            <FiX size={24} />
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="modal-icon">
                            <FiCheckCircle className="modal-icon-approve" />
                        </div>
                        <p className="modal-message">
                            Are you sure you want to mark this request as <strong>Done</strong>?
                        </p>
                        <p className="modal-details">
                            <strong>Client:</strong> {doneClientName}
                        </p>

                        {/* ========== NOTES TEXTAREA ========== */}
                        <div className="notes-section">
                            <label className="notes-label">
                                <FiEdit size={14} />
                                Notes to Client <span className="optional">(Optional)</span>
                            </label>
                            <textarea
                                className="notes-textarea"
                                value={employeeNotes}
                                onChange={(e) => setEmployeeNotes(e.target.value)}
                                placeholder="Add any notes for the client... (optional)"
                                rows={3}
                                disabled={submitting}
                            />
                            <small className="notes-hint">
                                These notes will be included in the email to the client.
                            </small>
                        </div>

                        <p className="modal-warning">
                            <FiAlertCircle size={16} />
                            This will send an email to the client and mark the request as "Sent".
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="modal-btn modal-cancel-btn"
                            onClick={closeDoneModal}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            className="modal-btn modal-done-btn"
                            onClick={handleMarkAsDone}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <div className="modal-btn-spinner"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <FiSend size={18} />
                                    Mark as Done & Send Email
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ========== MAIN RENDER ==========
    const counts = getStatusCounts();

    return (
        <EmployeeLayout>
            <div className="employee-finance-requests">
                {/* Header */}
                <div className="finance-header">
                    <div className="header-left">
                        <h2>My Assigned Requests</h2>
                        <p className="subtitle">
                            View and manage financial statement requests assigned to you
                        </p>
                    </div>
                    <button
                        className="refresh-btn"
                        onClick={fetchRequests}
                        disabled={refreshing}
                    >
                        <FiRefreshCw className={refreshing ? "spinning" : ""} />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {/* Filters */}
                <div className="filters-container">
                    <div className="search-box">
                        <AiOutlineSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by client name, email or request ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="total-badge">
                        <span>{filteredRequests.length} Request{filteredRequests.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* ========== STATUS FILTER TABS ========== */}
                <div className="status-filter-tabs">
                    <button
                        className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        All ({counts.total})
                    </button>
                    <button
                        className={`filter-tab ${statusFilter === 'in_progress' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('in_progress')}
                    >
                        <FiClock size={14} />
                        In Progress ({counts.inProgress})
                    </button>
                    <button
                        className={`filter-tab ${statusFilter === 'completed' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('completed')}
                    >
                        <FiCheckCircle size={14} />
                        Completed ({counts.completed})
                    </button>
                    {counts.rejected > 0 && (
                        <button
                            className={`filter-tab ${statusFilter === 'rejected' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('rejected')}
                        >
                            <FiXCircle size={14} />
                            Rejected ({counts.rejected})
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="table-container">
                    <table className="finance-table">
                        <thead>
                            <tr>
                                <th>Client Name</th>
                                <th>Email</th>
                                <th>Period</th>
                                <th>Requested</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="loading-cell">
                                        <div className="loading-spinner"></div>
                                        <p>Loading requests...</p>
                                    </td>
                                </tr>
                            ) : getCurrentPageItems().length === 0 ? (
                                <tr className="no-data">
                                    <td colSpan="6">
                                        <div className="empty-state">
                                            <FiFileMinus size={40} />
                                            <p>No requests found</p>
                                            {searchTerm && <small>Try adjusting your search</small>}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                getCurrentPageItems().map((request) => {
                                    const isDone = request.status === 'sent' || request.status === 'completed';
                                    return (
                                        <tr key={request.requestId} className="request-row">
                                            <td className="name-cell">
                                                <div className="client-name">
                                                    <strong>{request.clientName}</strong>
                                                    {request.isPaid && (
                                                        <span className="paid-badge-small">💰</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="email-cell">
                                                <a href={`mailto:${request.clientEmail}`}>{request.clientEmail}</a>
                                            </td>
                                            <td className="period-cell">
                                                <div className="period-info">
                                                    <FiCalendar size={14} />
                                                    <span>{request.dateRangeDisplay || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="date-cell">
                                                {formatDate(request.requestedAt)}
                                            </td>
                                            <td className="status-cell">
                                                {getStatusBadge(request.status)}
                                            </td>
                                            <td className="actions-cell">
                                                <div className="action-buttons">
                                                    <button
                                                        className="action-btn view-btn"
                                                        onClick={() => openViewModal(request)}
                                                        title="View Details"
                                                    >
                                                        <FiEye size={16} />
                                                        <span>View</span>
                                                    </button>
                                                    {!isDone && (
                                                        <button
                                                            className="action-btn done-btn"
                                                            onClick={() => openDoneModal(request.requestId, request.clientName)}
                                                            title="Mark as Done"
                                                        >
                                                            <FiSend size={16} />
                                                            <span>Done</span>
                                                        </button>
                                                    )}
                                                    {isDone && (
                                                        <span className="done-badge">
                                                            <FiCheckCircle size={14} />
                                                            Done
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

                {/* Pagination Footer */}
                {!loading && filteredRequests.length > 0 && (
                    <div className="table-footer">
                        <div className="footer-info">
                            <div className="total-count">
                                <span className="count-label">Total Requests:</span>
                                <span className="count-value">{filteredRequests.length}</span>
                            </div>
                            <div className="pagination-info">
                                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredRequests.length)} -{' '}
                                {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of{' '}
                                {filteredRequests.length}
                            </div>
                        </div>

                        <div className="pagination-controls">
                            <button
                                className="pagination-btn"
                                onClick={goToFirstPage}
                                disabled={currentPage === 1}
                                title="First Page"
                            >
                                <FiChevronsLeft />
                            </button>
                            <button
                                className="pagination-btn"
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                title="Previous Page"
                            >
                                <FiChevronLeft />
                            </button>

                            <span className="page-indicator">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                className="pagination-btn"
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                title="Next Page"
                            >
                                <FiChevronRight />
                            </button>
                            <button
                                className="pagination-btn"
                                onClick={goToLastPage}
                                disabled={currentPage === totalPages}
                                title="Last Page"
                            >
                                <FiChevronsRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {renderViewModal()}
            {renderDoneModal()}
        </EmployeeLayout>
    );
};

export default EmployeeFinanceRequests;