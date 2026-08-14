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
    FiUsers,
    FiAlertCircle
} from 'react-icons/fi';
import { AiOutlineSearch } from 'react-icons/ai';
import './ClientPaymentInfo.scss';
import EmployeeLayout from '../Layout/EmployeeLayout';

const ClientPaymentInfo = () => {
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [months, setMonths] = useState([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [totalPages, setTotalPages] = useState(1);

    // Helper function to get status display info
    const getStatusInfo = (status) => {
        switch (status) {
            case 'paid':
                return {
                    text: 'Paid',
                    icon: <FiCheckCircle className="status-icon" />,
                    className: 'paid'
                };
            case 'pending':
                return {
                    text: 'Pending',
                    icon: <FiAlertCircle className="status-icon" />,
                    className: 'pending'
                };
            case 'not_credited':
                return {
                    text: 'Not Credited',
                    icon: <FiXCircle className="status-icon" />,
                    className: 'not-credited'
                };
            default:
                return {
                    text: 'Pending',
                    icon: <FiAlertCircle className="status-icon" />,
                    className: 'pending'
                };
        }
    };

    // Fetch payment status data
    const fetchPaymentStatus = async () => {
        try {
            setRefreshing(true);
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/employee/all-clients-payment-status`,
                { withCredentials: true }
            );

            if (res.data.success) {
                setClients(res.data.data);
                setFilteredClients(res.data.data);
                setMonths(res.data.meta.months || []);

                // Reset to first page when new data arrives
                setCurrentPage(1);
            }
        } catch (error) {
            console.error("Error fetching payment status:", error);
            showToast("Failed to fetch payment status", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPaymentStatus();
    }, []);

    // Filter clients based on search
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredClients(clients);
        } else {
            const searchLower = searchTerm.toLowerCase();
            const filtered = clients.filter(client =>
                client.name?.toLowerCase().includes(searchLower) ||
                client.email?.toLowerCase().includes(searchLower) ||
                client.clientId?.toLowerCase().includes(searchLower)
            );
            setFilteredClients(filtered);
        }
        setCurrentPage(1); // Reset to first page on search
    }, [searchTerm, clients]);

    // Update total pages when filtered clients change
    useEffect(() => {
        setTotalPages(Math.ceil(filteredClients.length / itemsPerPage));
    }, [filteredClients, itemsPerPage]);

    // Get current page items
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredClients.slice(startIndex, endIndex);
    };

    // Pagination handlers
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

    // Format month for display
    const formatMonthDisplay = (year, month) => {
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    };

    // Get month key (YYYY-M)
    const getMonthKey = (year, month) => `${year}-${month}`;

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

    return (
        <EmployeeLayout>
            <div className="client-payment-info">
                {/* Header */}
                <div className="payment-header">
                    <div className="header-left">
                        <h2>Client Payment Status</h2>
                        <p className="subtitle">View payment status for last 6 months</p>
                    </div>
                    <button
                        className="refresh-btn"
                        onClick={fetchPaymentStatus}
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
                            placeholder="Search by name, email or client ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="months-indicator">
                        <span>Last 6 Months</span>
                    </div>
                </div>

                {/* Table */}
                <div className="table-container">
                    <table className="payment-table">
                        <thead>
                            <tr>
                                <th>Client Name</th>
                                <th>Email</th>
                                {months.map((month, index) => (
                                    <th key={index} className="month-header">
                                        {formatMonthDisplay(month.year, month.month)}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={2 + months.length} className="loading-cell">
                                        <div className="loading-spinner"></div>
                                        <p>Loading payment status...</p>
                                    </td>
                                </tr>
                            ) : getCurrentPageItems().length === 0 ? (
                                <tr className="no-data">
                                    <td colSpan={2 + months.length}>
                                        <div className="empty-state">
                                            <FiUsers size={40} />
                                            <p>No clients found</p>
                                            {searchTerm && <small>Try adjusting your search</small>}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                getCurrentPageItems().map((client) => (
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
                                        {months.map((month, index) => {
                                            const monthKey = getMonthKey(month.year, month.month);
                                            const status = client.paymentStatus?.[monthKey] || 'pending';
                                            const statusInfo = getStatusInfo(status);

                                            return (
                                                <td key={index} className="status-cell">
                                                    <div className={`payment-status ${statusInfo.className}`}>
                                                        {statusInfo.icon}
                                                        <span>{statusInfo.text}</span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!loading && filteredClients.length > 0 && (
                    <div className="table-footer">
                        <div className="footer-info">
                            <div className="total-count">
                                <span className="count-label">Total Clients:</span>
                                <span className="count-value">{filteredClients.length}</span>
                            </div>
                            <div className="pagination-info">
                                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredClients.length)} -{' '}
                                {Math.min(currentPage * itemsPerPage, filteredClients.length)} of{' '}
                                {filteredClients.length}
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
        </EmployeeLayout>
    );
};

export default ClientPaymentInfo;