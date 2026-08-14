import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminNotesPanel.scss';
import {
    FiBell,
    FiUsers,
    FiMessageSquare,
    FiFileText,
    FiCalendar,
    FiCheck,
    FiEye,
    FiFilter,
    FiChevronRight,
    FiX,
    FiClock,
    FiUser,
    FiFolder,
    FiChevronLeft,
    FiLock,
    FiAlertCircle
} from 'react-icons/fi';

const AdminNotesPanel = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUnread: 0,
        clientsWithUnread: [],
        totalClients: 0
    });
    const [activeModal, setActiveModal] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientNotes, setClientNotes] = useState({
        all: [],
        byMonth: [],
        statistics: {}
    });

    // Add new state for docs summary data (for the card)
    const [docsSummary, setDocsSummary] = useState({
        count: 0,
        monthsCount: 0
    });

    // Time filter for Docs Details modal
    const [timeFilter, setTimeFilter] = useState("this_month");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    // Default filter for Notes: This Month
    const [filters, setFilters] = useState({
        monthFilter: 'current',
        customStartDate: '',
        customEndDate: '',
    });

    // Time filter options for Docs Details
    const timeFilterOptions = [
        { value: "today", label: "Today", icon: "📅" },
        { value: "this_week", label: "This Week", icon: "📅" },
        { value: "this_month", label: "This Month", icon: "📅" },
        { value: "last_month", label: "Last Month", icon: "📅" },
        { value: "last_3_months", label: "Last 3 Months", icon: "📅" },
        { value: "custom", label: "Custom Range", icon: "📅" }
    ];

    // Set default custom dates to current month for Docs Details
    useEffect(() => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        setCustomStartDate(firstDay.toISOString().split('T')[0]);
        setCustomEndDate(lastDay.toISOString().split('T')[0]);
    }, []);

    // Fetch unread count on component mount
    useEffect(() => {
        fetchUnreadCount();
        fetchDocsSummary(); // Also fetch docs summary on mount
    }, []);

    const fetchDocsSummary = async () => {
        try {
            const params = { timeFilter: "this_month" };
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin/dashboard/uploaded-but-locked`,
                {
                    params,
                    withCredentials: true
                }
            );

            console.log(" FULL API RESPONSE:", response);
            console.log(" RESPONSE DATA:", response.data);
            console.log(" RESPONSE DATA TOTALCLIENTS:", response.data?.totalClients);

            if (response.data.success) {
                setDocsSummary({
                    count: response.data.totalClients || 0,
                    monthsCount: response.data.monthsData?.length || 0
                });
            }
        } catch (error) {
            console.error('Error fetching docs summary:', error);
        }
    };

    // Auto-apply filters when they change for Notes
    useEffect(() => {
        if (selectedClient) {
            fetchClientNotes(selectedClient.clientId);
        }
    }, [filters, selectedClient]);

    const fetchUnreadCount = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/notes/unread-count`, {
                withCredentials: true
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching unread count:', error);
            showToast('Error loading unread count', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchClientsSummary = async () => {
        try {
            setModalLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/notes/clients-summary`, {
                withCredentials: true
            });
            setClients(response.data.clients);
            setModalData(response.data);
        } catch (error) {
            console.error('Error fetching clients summary:', error);
            showToast('Error loading clients summary', 'error');
        } finally {
            setModalLoading(false);
        }
    };

    // ==================== DOCS DETAILS API - FIXED ====================
    const fetchDocsDetailsData = async (filterValue = null) => {
        try {
            // Use passed filter value or fallback to state
            const currentFilter = filterValue !== null ? filterValue : timeFilter;

            console.log("📅 Fetching docs with filter:", currentFilter);

            const params = { timeFilter: currentFilter };
            if (currentFilter === "custom" && customStartDate && customEndDate) {
                params.customStart = customStartDate;
                params.customEnd = customEndDate;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin/dashboard/uploaded-but-locked`,
                {
                    params,
                    withCredentials: true
                }
            );

            console.log("📊 API Response:", response.data);

            if (response.data.success) {
                setModalData(response.data);
            }
        } catch (error) {
            console.error(`Error fetching uploaded locked data:`, error);
            showToast(`Error loading uploaded documents data`, "error");
        } finally {
            setModalLoading(false);
        }
    };

    // FIXED: Handle time filter change with direct parameter passing
    const handleTimeFilterChange = async (newFilter) => {
        console.log("🔄 Filter changed to:", newFilter);

        // Update state
        setTimeFilter(newFilter);

        // If modal is open, fetch data with the NEW filter directly
        if (activeModal === 'uploadedLocked') {
            setModalLoading(true);
            await fetchDocsDetailsData(newFilter); // Pass the new filter directly!
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getFilterDisplayText = () => {
        const filter = timeFilterOptions.find(f => f.value === timeFilter);
        if (timeFilter === "custom" && customStartDate && customEndDate) {
            return `${formatDate(customStartDate)} to ${formatDate(customEndDate)}`;
        }
        return filter?.label || "This Month";
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };
    // ==================== END DOCS DETAILS API ====================

    const fetchClientNotes = async (clientId) => {
        try {
            setModalLoading(true);

            const params = {};

            if (filters.monthFilter === 'current') {
                const now = new Date();
                params.year = now.getFullYear();
                params.month = now.getMonth() + 1;
            } else if (filters.monthFilter === 'last') {
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                params.year = lastMonth.getFullYear();
                params.month = lastMonth.getMonth() + 1;
            } else if (filters.monthFilter === 'custom') {
                if (filters.customStartDate && filters.customEndDate) {
                    const start = new Date(filters.customStartDate);
                    const end = new Date(filters.customEndDate);

                    if (start <= end) {
                        params.startDate = filters.customStartDate;
                        params.endDate = filters.customEndDate;
                    } else {
                        showToast('End date must be after start date', 'error');
                        return;
                    }
                } else {
                    showToast('Please select both start and end dates', 'error');
                    return;
                }
            }

            console.log("Fetching notes with params:", params);

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin/notes/client/${clientId}/notes`,
                {
                    params,
                    withCredentials: true
                }
            );

            setClientNotes(response.data.notes);

        } catch (error) {
            console.error('Error fetching client notes:', error);
            showToast('Error fetching client notes', 'error');
        } finally {
            setModalLoading(false);
        }
    };

    const handleOpenClientsModal = () => {
        setActiveModal('clientsSummary');
        fetchClientsSummary();
    };

    const handleClientClick = (client) => {
        setSelectedClient(client);
        setActiveModal('clientNotes');
        setFilters({
            monthFilter: 'current',
            customStartDate: '',
            customEndDate: '',
        });
    };

    const handleMarkAllAsRead = async () => {
        if (!selectedClient) return;

        try {
            const filterParams = {};

            if (filters.monthFilter === 'current') {
                const now = new Date();
                filterParams.year = now.getFullYear();
                filterParams.month = now.getMonth() + 1;
            } else if (filters.monthFilter === 'last') {
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                filterParams.year = lastMonth.getFullYear();
                filterParams.month = lastMonth.getMonth() + 1;
            } else if (filters.monthFilter === 'custom') {
                if (filters.customStartDate && filters.customEndDate) {
                    const start = new Date(filters.customStartDate);
                    const end = new Date(filters.customEndDate);

                    if (start <= end) {
                        filterParams.startDate = filters.customStartDate;
                        filterParams.endDate = filters.customEndDate;
                    } else {
                        showToast('Invalid date range', 'error');
                        return;
                    }
                } else {
                    showToast('Please select both start and end dates', 'error');
                    return;
                }
            }

            console.log("Marking notes with filter:", filterParams);

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/admin/notes/mark-as-viewed`,
                {
                    clientId: selectedClient.clientId,
                    filter: filterParams
                },
                { withCredentials: true }
            );

            if (response.data.success) {
                showToast(`Marked ${response.data.markedCount} notes as read for the selected period`, 'success');
                fetchClientNotes(selectedClient.clientId);
                fetchUnreadCount();
                fetchClientsSummary();
            }
        } catch (error) {
            console.error('Error marking notes as read:', error);
            showToast('Error marking notes as read', 'error');
        }
    };

    const handleMarkSingleAsRead = async (noteId) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/admin/notes/mark-as-viewed`,
                {
                    clientId: selectedClient.clientId,
                    noteIds: [noteId]
                },
                { withCredentials: true }
            );

            if (response.data.success) {
                showToast('Note marked as read', 'success');
                fetchClientNotes(selectedClient.clientId);
                fetchUnreadCount();
                fetchClientsSummary();
            }
        } catch (error) {
            console.error('Error marking note as read:', error);
            showToast('Error marking note as read', 'error');
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getMonthName = (year, month) => {
        return new Date(year, month - 1).toLocaleString('default', { month: 'long' });
    };

    const showToast = (message, type = "success") => {
        toast[type](message, {
            position: "top-right",
            autoClose: 3000,
            theme: "dark"
        });
    };

    const closeModal = () => {
        setActiveModal(null);
        setModalData(null);
        setSelectedClient(null);
        setClientNotes({
            all: [],
            byMonth: [],
            statistics: {}
        });
    };

    const handleBackToClientList = () => {
        setActiveModal('clientsSummary');
        setSelectedClient(null);
    };

    // FIXED: Function to open Docs Details modal
    const openDocsDetailsModal = async () => {
        console.log("🚀 Opening Docs Details Modal with current filter:", timeFilter);
        setModalLoading(true);
        setActiveModal('uploadedLocked');
        await fetchDocsDetailsData(timeFilter); // Pass current filter
    };

    // ==================== MODAL RENDER FUNCTIONS ====================

    const renderDocsDetailsModal = () => {
        if (activeModal !== 'uploadedLocked') return null;

        return (
            <div className="modal-overlay">
                <div className="modal">
                    <div className="modal-header">
                        <h3>
                            <FiLock /> Clients with Uploaded Documents For This Month
                            {modalData?.totalClients !== undefined && (
                                <span className="count-badge">{modalData.totalClients}</span>
                            )}
                        </h3>
                        <button className="close-modal" onClick={closeModal}>
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="modal-filter-section">
                            <div className="filter-header">
                                <h4>
                                    <FiFilter size={18} /> Time Period: <span className="current-filter">{getFilterDisplayText()}</span>
                                </h4>
                            </div>
                            <div className="filter-buttons">
                                {timeFilterOptions.map(filter => (
                                    <button
                                        key={filter.value}
                                        className={`filter-btn ${timeFilter === filter.value ? 'active' : ''}`}
                                        onClick={() => handleTimeFilterChange(filter.value)}
                                        disabled={modalLoading}
                                    >
                                        <span className="filter-icon">{filter.icon}</span>
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {modalLoading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading data...</p>
                            </div>
                        ) : !modalData ? (
                            <div className="empty-state">
                                <div className="empty-icon">📁</div>
                                <h4>No data available</h4>
                                <p>Unable to load data. Please try again.</p>
                            </div>
                        ) : modalData.monthsData && modalData.monthsData.length > 0 ? (
                            <div className="uploaded-locked-modal-content">
                                <div className="modal-summary">
                                    <div className="summary-stats">
                                        <div className="stat-item">
                                            <div className="stat-label">Total Clients</div>
                                            <div className="stat-value">{modalData.totalClients}</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-label">Total Months</div>
                                            <div className="stat-value">{modalData.monthsData.length}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="months-list">
                                    {modalData.monthsData.map((month, index) => (
                                        <div key={index} className="month-section">
                                            <div className="month-header">
                                                <h4>
                                                    <FiCalendar size={20} /> {month.monthName}
                                                </h4>
                                                <span className="month-status locked">
                                                    🔒 {month.count} client{month.count !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="month-clients">
                                                <div className="responsive-table">
                                                    <table className="dashboard-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Client</th>
                                                                <th>Contact</th>
                                                                <th>Uploaded Files</th>
                                                                <th>Locked By</th>
                                                                <th>Locked Date</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {month.clients.map((client, clientIndex) => (
                                                                <tr key={clientIndex}>
                                                                    <td>
                                                                        <div className="client-cell">
                                                                            <span>{client.name}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="contact-info">
                                                                            <div>{client.email}</div>
                                                                            {client.phone && client.phone !== "N/A" && (
                                                                                <small>{client.phone}</small>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span className="file-count-badge">
                                                                            {client.totalFiles} file{client.totalFiles !== 1 ? 's' : ''}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="locked-by">{client.lockedBy}</span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="locked-date">
                                                                            {client.lockedAt ? formatDate(client.lockedAt) : "Unknown"}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📁</div>
                                <h4>No locked months with uploaded files</h4>
                                <p>All good! No clients have uploaded documents in locked months.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderClientsSummaryModal = () => {
        return (
            <div className="modal-overlay">
                <div className="modal notes-modal">
                    <div className="modal-header">
                        <div className="modal-title">
                            <FiMessageSquare size={24} color='black' />
                            <h3>
                                Clients with Unread Notes
                                {modalData && (
                                    <span className="notes-summary-badge">
                                        {modalData.clients.length} clients
                                    </span>
                                )}
                            </h3>
                        </div>
                        <button className="close-modal" onClick={closeModal}>
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="modal-body">
                        {modalLoading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading clients...</p>
                            </div>
                        ) : modalData?.clients?.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🎉</div>
                                <h4>No unread notes</h4>
                                <p>All notes have been reviewed</p>
                            </div>
                        ) : (
                            <div className="responsive-table">
                                <table className="dashboard-table">
                                    <thead>
                                        <tr>
                                            <th>Client</th>
                                            <th>Contact</th>
                                            <th>Unread Notes</th>
                                            <th>Months</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modalData?.clients?.map((client, index) => (
                                            <tr key={index} className="clickable-row">
                                                <td>
                                                    <div className="client-cell">
                                                        <div className="client-avatar-small">
                                                            {getInitials(client.clientName)}
                                                        </div>
                                                        <div>
                                                            <span className="client-name">{client.clientName}</span>
                                                            <br />
                                                            <small className="client-id">ID: {client.clientId}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="contact-info">
                                                        <div className="contact-email">{client.email}</div>
                                                        {client.phone && client.phone !== "N/A" && (
                                                            <div className="contact-phone">{client.phone}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="notes-count-cell">
                                                        <span className={`notes-count-big ${client.unreadCount > 0 ? 'has-unread' : ''}`}>
                                                            {client.unreadCount}
                                                        </span>
                                                        <span className="notes-label">unread notes</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="months-list">
                                                        {client.unreadByMonth && client.unreadByMonth.map(month => (
                                                            <span key={`${month.year}-${month.month}`} className="month-chip">
                                                                {getMonthName(month.year, month.month)} ({month.count})
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        className="view-client-notes-btn"
                                                        onClick={() => handleClientClick(client)}
                                                    >
                                                        <FiEye size={14} /> View Notes
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderClientNotesModal = () => {
        if (!selectedClient) return null;

        return (
            <div className="modal-overlay">
                <div className="modal notes-modal">
                    <div className="modal-header">
                        <button
                            className="back-button"
                            onClick={handleBackToClientList}
                            disabled={modalLoading}
                        >
                            <FiChevronLeft size={20} /> Back to Clients
                        </button>
                        <div className="modal-title">
                            <FiMessageSquare size={24} color='#000' />
                            <h3>
                                {selectedClient.clientName} - Notes
                                <span className="notes-count-badge">
                                    {clientNotes.statistics?.unread || 0} unread
                                </span>
                            </h3>
                        </div>
                        <button className="close-modal" onClick={closeModal}>
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="filters-section">
                            <div className="filter-row">
                                <div className="filter-group">
                                    <label>
                                        <FiFilter size={16} /> Time Period:
                                    </label>
                                    <select
                                        name="monthFilter"
                                        value={filters.monthFilter}
                                        onChange={handleFilterChange}
                                        disabled={modalLoading}
                                    >
                                        <option value="current">This Month</option>
                                        <option value="last">Last Month</option>
                                        <option value="all">All Time</option>
                                    </select>
                                </div>
                                {filters.monthFilter === 'custom' && (
                                    <>
                                        <div className="date-input-group">
                                            <label>
                                                <FiCalendar size={16} /> Start Date
                                            </label>
                                            <input
                                                type="date"
                                                name="customStartDate"
                                                value={filters.customStartDate}
                                                onChange={handleFilterChange}
                                                disabled={modalLoading}
                                                className="date-input"
                                                max={filters.customEndDate || new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        <div className="date-input-group">
                                            <label>
                                                <FiCalendar size={16} /> End Date
                                            </label>
                                            <input
                                                type="date"
                                                name="customEndDate"
                                                value={filters.customEndDate}
                                                onChange={handleFilterChange}
                                                disabled={modalLoading}
                                                className="date-input"
                                                min={filters.customStartDate}
                                                max={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="action-bar">
                            <div className="notes-stats">
                                <div className="stat-item">
                                    <div className="stat-label">Total</div>
                                    <div className="stat-value">{clientNotes.statistics?.total || 0}</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label">Unread</div>
                                    <div className="stat-value unread">{clientNotes.statistics?.unread || 0}</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label">Read</div>
                                    <div className="stat-value">{clientNotes.statistics?.read || 0}</div>
                                </div>
                            </div>

                            {clientNotes.statistics?.unread > 0 && (
                                <button
                                    className="mark-all-read-btn"
                                    onClick={handleMarkAllAsRead}
                                    disabled={modalLoading}
                                >
                                    <FiCheck size={16} /> Mark All as Read
                                </button>
                            )}
                        </div>

                        <div className="notes-list-container">
                            {modalLoading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Loading notes...</p>
                                </div>
                            ) : clientNotes.byMonth?.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📝</div>
                                    <h4>No notes found</h4>
                                    <p>No notes available with current filters</p>
                                </div>
                            ) : (
                                <div className="client-notes-list">
                                    {clientNotes.byMonth.map((month, monthIndex) => (
                                        <div key={monthIndex} className="month-notes-section">
                                            <div className="month-header">
                                                <h4>
                                                    <FiCalendar size={18} /> {month.monthName} {month.year}
                                                    <span className="month-notes-count">
                                                        ({month.notes.length} notes)
                                                    </span>
                                                    {month.unreadCount > 0 && (
                                                        <span className="month-unread-badge">
                                                            {month.unreadCount} NEW
                                                        </span>
                                                    )}
                                                </h4>
                                            </div>

                                            <div className="notes-list">
                                                {month.notes.map((note, noteIndex) => {
                                                    let badgeText = '';
                                                    let badgeClass = '';

                                                    if (note.noteLevel === 'month') {
                                                        badgeText = '📅 Month';
                                                        badgeClass = 'badge-month';
                                                    } else if (note.noteLevel === 'category') {
                                                        badgeText = '📁 Category';
                                                        badgeClass = 'badge-category';
                                                    } else if (note.noteLevel === 'file') {
                                                        badgeText = '📄 File';
                                                        badgeClass = 'badge-file';
                                                    } else {
                                                        badgeText = note.noteLevel || 'Note';
                                                        badgeClass = 'badge-default';
                                                    }

                                                    return (
                                                        <div
                                                            key={noteIndex}
                                                            className={`note-item ${note.isViewedByAdmin ? 'read' : 'unread'}`}
                                                        >
                                                            <div className="note-header">
                                                                <div className="note-meta-left">
                                                                    <span className={`note-level ${badgeClass}`}>
                                                                        {badgeText}
                                                                    </span>

                                                                    {note.categoryType && note.noteLevel !== 'month' && (
                                                                        <span className="note-category">
                                                                            <FiFolder size={12} /> {note.categoryType}
                                                                        </span>
                                                                    )}

                                                                    {note.fileName && note.noteLevel === 'file' && (
                                                                        <span className="note-file">
                                                                            <FiFileText size={12} /> {note.fileName}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="note-meta-right">
                                                                    {note.noteLevel === 'file' && note.addedBy && (
                                                                        <span className="note-added-by">
                                                                            <FiUser size={12} /> Added by Employee: {note.addedBy}
                                                                        </span>
                                                                    )}
                                                                    <span className="note-date">
                                                                        <FiClock size={12} /> {formatDate(note.addedAt)}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="note-content">
                                                                <p>{note.note}</p>
                                                            </div>

                                                            <div className="note-footer">
                                                                <div className="view-status">
                                                                    <span className={`status-badge ${note.isViewedByClient ? 'viewed' : 'not-viewed'}`}>
                                                                        Client: {note.isViewedByClient ? 'Viewed' : 'Not viewed'}
                                                                    </span>
                                                                    <span className={`status-badge ${note.isViewedByEmployee ? 'viewed' : 'not-viewed'}`}>
                                                                        Employee: {note.isViewedByEmployee ? 'Viewed' : 'Not viewed'}
                                                                    </span>
                                                                    <span className={`status-badge ${note.isViewedByAdmin ? 'viewed' : 'not-viewed'}`}>
                                                                        Admin: {note.isViewedByAdmin ? 'Viewed' : 'Not viewed'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderModal = () => {
        if (!activeModal) return null;

        switch (activeModal) {
            case 'clientsSummary':
                return renderClientsSummaryModal();
            case 'clientNotes':
                return renderClientNotesModal();
            case 'uploadedLocked':
                return renderDocsDetailsModal();
            default:
                return null;
        }
    };

    // ==================== MAIN RENDER ====================
    return (
        <>
            <ToastContainer />
            <div className="admin-notes-panel">
                <div className="admin-header">
                    <div className="title-section">
                        <h1 className="page-title">
                            <FiMessageSquare size={28} /> Notes & Alerts Panel
                        </h1>
                        <p className="page-subtitle">
                            Review and manage client notes and alerts
                        </p>
                    </div>
                </div>

                <div className="notes-cards-grid">
                    {/* Card 1: Unread Notes */}
                    <div
                        className="summary-card clickable"
                        onClick={handleOpenClientsModal}
                    >
                        <div className="card-icon">
                            <FiBell size={32} />
                            {stats.totalUnread > 0 && (
                                <span className="unread-badge">{stats.totalUnread}</span>
                            )}
                        </div>
                        <div className="card-content">
                            <h3>Unread Notes</h3>
                            <div className="stats-row">
                                <div className="stat-item">
                                    <div className="stat-value">{stats.totalUnread}</div>
                                    <div className="stat-label">Total Unread</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">{stats.clientsWithUnread.length}</div>
                                    <div className="stat-label">Clients</div>
                                </div>
                            </div>
                            <p className="card-subtitle">
                                Click to view clients with unread notes
                            </p>
                        </div>
                        <div className="card-action">
                            <FiChevronRight size={24} />
                        </div>
                    </div>

                    {/* Card 2: Docs Details - FIXED: Uses openDocsDetailsModal function */}
                    <div
                        className="summary-card clickable"
                        onClick={openDocsDetailsModal}
                        style={{ borderTopColor: "#8B5CF6" }}
                    >
                        <div className="card-icon" style={{ background: "#8B5CF615", position: "relative" }}>
                            <FiLock size={32} style={{ color: "#8B5CF6" }} />
                            {docsSummary.count > 0 && (
                                <span className="docs-badge">{docsSummary.count}</span>
                            )}
                        </div>
                        <div className="card-content">
                            <h3>Client Documents Update</h3>
                            <div className="stats-row">
                                <div className="stat-item">
                                    <div className="stat-value" style={{ color: "#8B5CF6" }}>
                                        {docsSummary.count}
                                    </div>
                                    <div className="stat-label">Clients with Updates</div>
                                </div>
                            </div>
                            <p className="card-subtitle">
                                Clients with uploaded documents for this month
                            </p>
                        </div>
                        <div className="card-action">
                            <FiChevronRight size={24} style={{ color: "#8B5CF6" }} />
                        </div>
                    </div>
                </div>

                {renderModal()}
            </div>
        </>
    );
};

export default AdminNotesPanel;