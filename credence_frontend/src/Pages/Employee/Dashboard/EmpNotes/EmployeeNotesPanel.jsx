import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EmployeeNotesPanel.scss'; // We'll create this CSS file
import {
    FiBell,
    FiMessageSquare,
    FiEye,
    FiFilter,
    FiChevronRight,
    FiX,
    FiClock,
    FiUser,
    FiFolder,
    FiChevronLeft,
    FiFileText,
    FiCheck,
    FiCalendar
} from 'react-icons/fi';

const EmployeeNotesPanel = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUnread: 0
    });
    const [activeModal, setActiveModal] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [assignedClients, setAssignedClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientNotes, setClientNotes] = useState({
        all: [],
        byMonth: [],
        statistics: {}
    });

    // Month filter for Notes
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [availableMonths, setAvailableMonths] = useState([]);

    // Fetch unread count on component mount
    useEffect(() => {
        fetchUnreadCount();
    }, []);

    // Auto-apply month filter when it changes
    useEffect(() => {
        if (selectedClient && selectedMonth) {
            fetchClientNotes(selectedClient.clientId, selectedMonth.year, selectedMonth.month);
        }
    }, [selectedMonth]);

    const fetchUnreadCount = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/employee/notes/unread-count`, {
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

    const fetchAssignedClients = async () => {
        try {
            setModalLoading(true);
            setActiveModal('clientsList');

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/employee/notes/assigned-clients`, {
                withCredentials: true
            });

            console.log("🔍 DEBUG: Assigned clients data:", response.data);
            console.log("🔍 DEBUG: First client unread count:",
                response.data.clients[0]?.unreadCount);

            setAssignedClients(response.data.clients);
            setModalData(response.data);

        } catch (error) {
            console.error('Error fetching assigned clients:', error);
            showToast('Error loading assigned clients', 'error');
        } finally {
            setModalLoading(false);
        }
    };

    const fetchClientNotes = async (clientId, year = null, month = null) => {
        try {
            setModalLoading(true);

            const params = {};
            if (year && month) {
                params.year = year;
                params.month = month;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/employee/notes/client/${clientId}/notes`,
                {
                    params,
                    withCredentials: true
                }
            );

            setClientNotes(response.data.notes);

            // Set available months from response
            if (response.data.filters && response.data.filters.assignedMonths) {
                setAvailableMonths(response.data.filters.assignedMonths);

                // Auto-select latest month if not already selected
                if (!selectedMonth && response.data.filters.latestAssignedMonth) {
                    setSelectedMonth(response.data.filters.latestAssignedMonth);
                }
            }

        } catch (error) {
            console.error('Error fetching client notes:', error);
            showToast('Error fetching client notes', 'error');
        } finally {
            setModalLoading(false);
        }
    };

    const handleOpenClientsModal = () => {
        fetchAssignedClients();
    };

    const handleClientClick = (client) => {
        setSelectedClient(client);
        setActiveModal('clientNotes');
        setSelectedMonth(null); // Reset month selection
        setAvailableMonths([]);

        // Fetch notes will be triggered by useEffect when selectedMonth is set
        // First, we need to get the client data to know assigned months
        fetchClientNotes(client.clientId);
    };

    const handleMarkAllAsRead = async () => {
        if (!selectedClient) return;

        // if (!window.confirm('Are you sure you want to mark ALL unread notes as read for this client?')) {
        //     return;
        // }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/employee/notes/mark-as-viewed`,
                {
                    clientId: selectedClient.clientId,
                    filter: selectedMonth ? {
                        year: selectedMonth.year,
                        month: selectedMonth.month
                    } : {}
                },
                { withCredentials: true }
            );

            if (response.data.success) {
                showToast(`Marked ${response.data.markedCount} notes as read`, 'success');
                // Refresh the notes
                fetchClientNotes(selectedClient.clientId,
                    selectedMonth?.year,
                    selectedMonth?.month);
                // Refresh unread count
                fetchUnreadCount();
                // Refresh clients list to update badges
                fetchAssignedClients();
            }
        } catch (error) {
            console.error('Error marking notes as read:', error);
            showToast('Error marking notes as read', 'error');
        }
    };

    const handleMarkSingleAsRead = async (noteId) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/employee/notes/mark-as-viewed`,
                {
                    clientId: selectedClient.clientId,
                    noteIds: [noteId]
                },
                { withCredentials: true }
            );

            if (response.data.success) {
                showToast('Note marked as read', 'success');
                // Refresh the notes
                fetchClientNotes(selectedClient.clientId,
                    selectedMonth?.year,
                    selectedMonth?.month);
                // Refresh unread count
                fetchUnreadCount();
                // Refresh clients list
                fetchAssignedClients();
            }
        } catch (error) {
            console.error('Error marking note as read:', error);
            showToast('Error marking note as read', 'error');
        }
    };

    const handleMonthChange = (e) => {
        const [year, month] = e.target.value.split('-');
        const selected = availableMonths.find(m =>
            m.year === parseInt(year) && m.month === parseInt(month)
        );
        setSelectedMonth(selected);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
        setSelectedMonth(null);
        setAvailableMonths([]);
    };

    const handleBackToClientList = () => {
        setActiveModal('clientsList');
        setSelectedClient(null);
        setSelectedMonth(null);
    };

    // ==================== MODAL RENDER FUNCTIONS ====================

    // Render Clients List Modal
    const renderClientsListModal = () => {
        return (
            <div className="modal-overlay">
                <div className="modal notes-modal">
                    <div className="modal-header">
                        <div className="modal-title">
                            <FiMessageSquare size={24} color="#000" />
                            <h3>
                                My Assigned Clients
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
                                <p>Loading assigned clients...</p>
                            </div>
                        ) : assignedClients.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📋</div>
                                <h4>No assigned clients</h4>
                                <p>You haven't been assigned to any clients yet</p>
                            </div>
                        ) : (
                            <div className="responsive-table">
                                <table className="dashboard-table">
                                    <thead>
                                        <tr>
                                            <th>Client</th>
                                            <th>Contact</th>
                                            <th>Unread Notes</th>
                                            <th>Assigned Months</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignedClients.map((client, index) => (
                                            <tr key={index} className="clickable-row">
                                                <td>
                                                    <div className="client-cell">
                                                        <div className="client-avatar-small">
                                                            {getInitials(client.clientName)}
                                                        </div>
                                                        <div>
                                                            <span className="client-name">{client.clientName}</span>
                                                            <br />
                                                            {/* <small className="client-id">ID: {client.clientId}</small> */}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="contact-info">
                                                        <div className="contact-email">{client.email}</div>
                                                        {client.phone && (
                                                            <div className="contact-phone">{client.phone}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="notes-count-cell">
                                                        {client.unreadCount > 0 ? (
                                                            <span className="notes-count-big has-unread">
                                                                {client.unreadCount} NEW
                                                            </span>
                                                        ) : (
                                                            <span className="notes-count-big">
                                                                {client.unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="months-list">
                                                        {client.assignedMonths && client.assignedMonths.slice(0, 3).map(month => (
                                                            <span key={`${month.year}-${month.month}`} className="month-chip">
                                                                {month.monthName} {month.year}
                                                            </span>
                                                        ))}
                                                        {client.assignedMonths && client.assignedMonths.length > 3 && (
                                                            <span className="month-chip-more">
                                                                +{client.assignedMonths.length - 3} more
                                                            </span>
                                                        )}
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

    // Render Client Notes Modal
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
                            <FiMessageSquare size={24} color="#000" />
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
                        {/* Month Filter Section */}
                        <div className="filters-section">
                            <div className="filter-row">
                                <div className="filter-group">
                                    <label>
                                        <FiFilter size={16} /> Assigned Month:
                                    </label>
                                    <select
                                        value={selectedMonth ? `${selectedMonth.year}-${selectedMonth.month}` : ""}
                                        onChange={handleMonthChange}
                                        disabled={modalLoading || availableMonths.length === 0}
                                    >
                                        <option value="">Select Month</option>
                                        {availableMonths.map(month => (
                                            <option
                                                key={`${month.year}-${month.month}`}
                                                value={`${month.year}-${month.month}`}
                                            >
                                                {month.monthName} {month.year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Show warning if no month selected */}
                        {!selectedMonth && availableMonths.length > 0 && (
                            <div className="info-banner">
                                <FiCalendar size={20} />
                                <p>Please select a month to view notes</p>
                            </div>
                        )}

                        {/* Action Bar - Only show when month is selected */}
                        {selectedMonth && (
                            <>
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
                                        <div className="stat-item">
                                            <div className="stat-label">Source</div>
                                            <div className="stat-value source">
                                                C: {clientNotes.statistics?.clientNotes || 0} |
                                                E: {clientNotes.statistics?.ownNotes || 0}
                                            </div>
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

                                {/* Notes List */}
                                <div className="notes-list-container">
                                    {modalLoading ? (
                                        <div className="loading-state">
                                            <div className="spinner"></div>
                                            <p>Loading notes...</p>
                                        </div>
                                    ) : clientNotes.byMonth.length === 0 ? (
                                        <div className="empty-state">
                                            <div className="empty-icon">📝</div>
                                            <h4>No notes found</h4>
                                            <p>No notes available for {selectedMonth.monthName} {selectedMonth.year}</p>
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
                                                            // Determine badge type
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
                                                            }

                                                            // Determine note source
                                                            const isClientNote = note.noteSource === 'client';
                                                            const isOwnNote = note.noteSource === 'employee';

                                                            return (
                                                                <div
                                                                    key={noteIndex}
                                                                    className={`note-item ${note.isViewedByEmployee ? 'read' : 'unread'}`}
                                                                >
                                                                    <div className="note-header">
                                                                        <div className="note-meta-left">
                                                                            <span className={`note-level ${badgeClass}`}>
                                                                                {badgeText}
                                                                            </span>

                                                                            <span className={`note-source ${isClientNote ? 'client' : 'employee'}`}>
                                                                                {isClientNote ? '👤 Client' : '👨‍💼 Employee'}
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
                                                                                You: {note.isViewedByEmployee ? 'Viewed' : 'Not viewed'}
                                                                            </span>
                                                                            <span className={`status-badge ${note.isViewedByAdmin ? 'viewed' : 'not-viewed'}`}>
                                                                                Admin: {note.isViewedByAdmin ? 'Viewed' : 'Not viewed'}
                                                                            </span>
                                                                        </div>

                                                                        {/* <div className="note-actions">
                                                                            {!note.isViewedByEmployee && (
                                                                                <button
                                                                                    className="mark-read-btn"
                                                                                    onClick={() => handleMarkSingleAsRead(note.noteId)}
                                                                                    disabled={modalLoading}
                                                                                >
                                                                                    <FiCheck size={14} /> Mark as Read
                                                                                </button>
                                                                            )}
                                                                        </div> */}
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Render Modal based on activeModal state
    const renderModal = () => {
        if (!activeModal) return null;

        switch (activeModal) {
            case 'clientsList':
                return renderClientsListModal();
            case 'clientNotes':
                return renderClientNotesModal();
            default:
                return null;
        }
    };

    // ==================== MAIN RENDER ====================
    return (
        <>
            <ToastContainer />
            <div className="employee-notes-panel">
                <div className="employee-header">
                    <div className="title-section">
                        <h1 className="page-title">
                            <FiMessageSquare size={28} /> Notes & Alerts
                        </h1>
                        <p className="page-subtitle">
                            Review notes from your assigned clients
                        </p>
                    </div>
                </div>

                {/* Single Card - as per your request */}
                <div className="notes-cards-grid">
                    <div
                        className="summary-card clickable"
                        onClick={handleOpenClientsModal}
                        style={{ borderTopColor: "#3B82F6" }}
                    >
                        <div className="card-icon" style={{ background: "#3B82F615" }}>
                            <FiBell size={32} style={{ color: "#3B82F6" }} />
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
                                    <div className="stat-value">View</div>
                                    <div className="stat-label">Assigned Clients</div>
                                </div>
                            </div>
                            <p className="card-subtitle">
                                Click to view unread notes from your assigned clients
                            </p>
                        </div>
                        <div className="card-action">
                            <FiChevronRight size={24} style={{ color: "#3B82F6" }} />
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {renderModal()}
            </div>
        </>
    );
};

export default EmployeeNotesPanel;