// pages/admin/ActivityLogs.jsx
import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../Layout/AdminLayout";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiDownload, FiFilter, FiRefreshCw, FiSearch } from "react-icons/fi";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ActivityLogs.scss";

const ActivityLogs = () => {
    // State for filters
    const [filters, setFilters] = useState({
        role: "ALL",
        userId: "all",
        timeRange: "TODAY",
        customStartDate: null,
        customEndDate: null,
        search: ""
    });

    // State for data
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState({
        clients: [],
        employees: [],
        admins: []
    });
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [totalLogs, setTotalLogs] = useState(0); // Just for showing count

    // Time presets
    const timePresets = [
        { value: "TODAY", label: "Today" },
        { value: "THIS_WEEK", label: "This Week" },
        { value: "THIS_MONTH", label: "This Month" },
        { value: "LAST_MONTH", label: "Last Month" },
        { value: "CUSTOM", label: "Custom Range" }
    ];

    // Role options
    const roleOptions = [
        { value: "ALL", label: "All Roles" },
        { value: "CLIENT", label: "Clients" },
        { value: "EMPLOYEE", label: "Employees" },
        { value: "ADMIN", label: "Admins" }
    ];

    // Fetch users for dropdowns
    const fetchUsers = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/activity-logs/get-users`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
                },
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUsers(data.data);
                }
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users list");
        }
    }, []);

    // Fetch logs based on filters - ONLY 10 LATEST, NO PAGINATION
    const fetchLogs = useCallback(async () => {
        setLoading(true);

        try {
            // Prepare query parameters
            const params = new URLSearchParams();

            if (filters.role) params.append("role", filters.role);
            if (filters.userId && filters.userId !== "all") {
                params.append("userId", filters.userId);
            }
            if (filters.search) params.append("search", filters.search);

            // ALWAYS FETCH ONLY 10 LOGS, NO PAGINATION
            params.append("limit", "10");
            params.append("noPagination", "true");

            // Handle time range
            let timeRangeData = {};

            if (filters.timeRange === "CUSTOM") {
                if (filters.customStartDate && filters.customEndDate) {
                    timeRangeData = {
                        startDate: filters.customStartDate.toISOString(),
                        endDate: filters.customEndDate.toISOString()
                    };
                }
            } else {
                // Get preset dates from API or calculate
                const today = new Date();

                switch (filters.timeRange) {
                    case "TODAY": {
                        const todayStart = new Date(today);
                        todayStart.setHours(0, 0, 0, 0);

                        const todayEnd = new Date(today);
                        todayEnd.setHours(23, 59, 59, 999);

                        timeRangeData = {
                            startDate: todayStart.toISOString(),
                            endDate: todayEnd.toISOString()
                        };
                        break;
                    }

                    case "THIS_WEEK": {
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        weekStart.setHours(0, 0, 0, 0);

                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);
                        weekEnd.setHours(23, 59, 59, 999);

                        timeRangeData = {
                            startDate: weekStart.toISOString(),
                            endDate: weekEnd.toISOString()
                        };
                        break;
                    }

                    case "THIS_MONTH": {
                        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        monthEnd.setHours(23, 59, 59, 999);

                        timeRangeData = {
                            startDate: monthStart.toISOString(),
                            endDate: monthEnd.toISOString()
                        };
                        break;
                    }

                    case "LAST_MONTH": {
                        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                        lastMonthEnd.setHours(23, 59, 59, 999);

                        timeRangeData = {
                            startDate: lastMonthStart.toISOString(),
                            endDate: lastMonthEnd.toISOString()
                        };
                        break;
                    }

                    default: {
                        const defaultStart = new Date(today);
                        defaultStart.setHours(0, 0, 0, 0);

                        const defaultEnd = new Date(today);
                        defaultEnd.setHours(23, 59, 59, 999);

                        timeRangeData = {
                            startDate: defaultStart.toISOString(),
                            endDate: defaultEnd.toISOString()
                        };
                        break;
                    }
                }

            }

            if (Object.keys(timeRangeData).length > 0) {
                params.append("timeRange", JSON.stringify(timeRangeData));
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/activity-logs/get-logs?${params}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
                },
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setLogs(data.data || []);
                    setTotalLogs(data.totalLogs || 0);
                } else {
                    toast.error(data.message || "Failed to fetch logs");
                }
            } else {
                toast.error("Failed to fetch logs from server");
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
            toast.error("Error loading logs. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Get user options based on selected role
    const getUserOptions = () => {
        const allOption = { value: "all", label: `All ${filters.role.toLowerCase()}s` };

        switch (filters.role) {
            case "CLIENT":
                return [allOption, ...users.clients.map(client => ({
                    value: client.id,
                    label: `${client.name} (${client.email})`
                }))];

            case "EMPLOYEE":
                return [allOption, ...users.employees.map(emp => ({
                    value: emp.id,
                    label: `${emp.name} (${emp.email})`
                }))];

            case "ADMIN":
                return [allOption, ...users.admins.map(admin => ({
                    value: admin.id,
                    label: `${admin.name} (${admin.email})`
                }))];

            default:
                return [allOption];
        }
    };

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            // Reset userId when role changes
            ...(key === "role" && { userId: "all" })
        }));
    };

    // Handle search
    const handleSearch = () => {
        fetchLogs();
    };

    // Reset filters
    const handleReset = () => {
        setFilters({
            role: "ALL",
            userId: "all",
            timeRange: "TODAY",
            customStartDate: null,
            customEndDate: null,
            search: ""
        });
    };

    // Export to Excel - FETCH ALL FILTERED DATA
    const handleExport = async () => {
        setExporting(true);
        const toastId = toast.loading("Preparing export...");

        try {
            // Prepare params similar to fetchLogs BUT NO LIMIT FOR EXPORT
            const params = new URLSearchParams();

            if (filters.role && filters.role !== "ALL") {
                params.append("role", filters.role);
            }
            if (filters.userId && filters.userId !== "all") {
                params.append("userId", filters.userId);
            }
            if (filters.search) params.append("search", filters.search);

            // FOR EXPORT: NO LIMIT, GET ALL DATA
            params.append("export", "true");

            // Add time range
            let timeRangeData = {};

            if (filters.timeRange === "CUSTOM") {
                if (filters.customStartDate && filters.customEndDate) {
                    timeRangeData = {
                        startDate: filters.customStartDate.toISOString(),
                        endDate: filters.customEndDate.toISOString()
                    };
                }
            } else {
                // Get preset dates
                const today = new Date();

                switch (filters.timeRange) {
                    case "TODAY": {
                        const todayStart = new Date(today);
                        todayStart.setHours(0, 0, 0, 0);
                        const todayEnd = new Date(today);
                        todayEnd.setHours(23, 59, 59, 999);
                        timeRangeData = {
                            startDate: todayStart.toISOString(),
                            endDate: todayEnd.toISOString()
                        };
                        break;
                    }

                    case "THIS_WEEK": {
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        weekStart.setHours(0, 0, 0, 0);
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);
                        weekEnd.setHours(23, 59, 59, 999);
                        timeRangeData = {
                            startDate: weekStart.toISOString(),
                            endDate: weekEnd.toISOString()
                        };
                        break;
                    }

                    case "THIS_MONTH": {
                        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        monthEnd.setHours(23, 59, 59, 999);
                        timeRangeData = {
                            startDate: monthStart.toISOString(),
                            endDate: monthEnd.toISOString()
                        };
                        break;
                    }

                    case "LAST_MONTH": {
                        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                        lastMonthEnd.setHours(23, 59, 59, 999);
                        timeRangeData = {
                            startDate: lastMonthStart.toISOString(),
                            endDate: lastMonthEnd.toISOString()
                        };
                        break;
                    }

                    default: {
                        // TODAY
                        const todayStart = new Date(today);
                        todayStart.setHours(0, 0, 0, 0);
                        const todayEnd = new Date(today);
                        todayEnd.setHours(23, 59, 59, 999);
                        timeRangeData = {
                            startDate: todayStart.toISOString(),
                            endDate: todayEnd.toISOString()
                        };
                    }
                }
            }

            if (Object.keys(timeRangeData).length > 0) {
                params.append("timeRange", JSON.stringify(timeRangeData));
            }

            toast.update(toastId, {
                render: "Exporting data...",
                type: "info",
                isLoading: true
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/activity-logs/export-logs?${params}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
                },
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    // Convert to Excel
                    const ws = XLSX.utils.json_to_sheet(data.data);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Activity Logs");

                    // Generate file name with filter info
                    const fileName = `activity-logs-${new Date().toISOString().split('T')[0]}.xlsx`;
                    XLSX.writeFile(wb, fileName);

                    toast.update(toastId, {
                        render: `✅ Exported ${data.data.length} logs successfully!`,
                        type: "success",
                        isLoading: false,
                        autoClose: 3000
                    });
                } else {
                    toast.update(toastId, {
                        render: `❌ Export failed: ${data.message || "Unknown error"}`,
                        type: "error",
                        isLoading: false,
                        autoClose: 3000
                    });
                }
            } else {
                const errorText = await response.text();
                toast.update(toastId, {
                    render: `❌ Export failed: ${errorText || "Server error"}`,
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
            }
        } catch (error) {
            console.error("Export error:", error);
            toast.update(toastId, {
                render: `❌ Export error: ${error.message}`,
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        } finally {
            setExporting(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchUsers();
        fetchLogs();
    }, [fetchUsers]);

    // Fetch logs when filters change
    useEffect(() => {
        fetchLogs();
    }, [filters.role, filters.userId, filters.timeRange, filters.search]);

    // Handle Enter key in search
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Europe/Helsinki'   // 👈 add this line
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <AdminLayout>
            <ToastContainer
                position="top-center"
                autoClose={3500}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            <div className="activity-logs-container">
                {/* Header */}
                <div className="logs-header">
                    <h1>Activity Logs</h1>
                    <div className="header-actions">
                        <button
                            className="btn-export"
                            onClick={handleExport}
                            disabled={exporting || loading}
                        >
                            <FiDownload />
                            {exporting ? "Exporting..." : "Export Excel"}
                        </button>
                        <button
                            className="btn-refresh"
                            onClick={fetchLogs}
                            disabled={loading}
                        >
                            <FiRefreshCw className={loading ? "spinning" : ""} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="filters-section">
                    <div className="filter-group">
                        <label>Role</label>
                        <Select
                            options={roleOptions}
                            value={roleOptions.find(opt => opt.value === filters.role)}
                            onChange={(opt) => handleFilterChange("role", opt.value)}
                            className="react-select"
                            classNamePrefix="select"
                        />
                    </div>

                    <div className="filter-group">
                        <label>User</label>
                        <Select
                            options={getUserOptions()}
                            value={getUserOptions().find(opt => opt.value === filters.userId)}
                            onChange={(opt) => handleFilterChange("userId", opt.value)}
                            className="react-select"
                            classNamePrefix="select"
                            isDisabled={filters.role === "ALL"}
                            isSearchable
                        />
                    </div>

                    <div className="filter-group">
                        <label>Time Period</label>
                        <Select
                            options={timePresets}
                            value={timePresets.find(opt => opt.value === filters.timeRange)}
                            onChange={(opt) => handleFilterChange("timeRange", opt.value)}
                            className="react-select"
                            classNamePrefix="select"
                        />
                    </div>

                    {filters.timeRange === "CUSTOM" && (
                        <div className="filter-group date-range">
                            <label>Custom Date Range</label>
                            <div className="date-inputs">
                                <DatePicker
                                    selected={filters.customStartDate}
                                    onChange={(date) => handleFilterChange("customStartDate", date)}
                                    selectsStart
                                    startDate={filters.customStartDate}
                                    endDate={filters.customEndDate}
                                    placeholderText="Start Date"
                                    className="date-picker"
                                    dateFormat="dd/MM/yyyy"
                                />
                                <span className="date-separator">to</span>
                                <DatePicker
                                    selected={filters.customEndDate}
                                    onChange={(date) => handleFilterChange("customEndDate", date)}
                                    selectsEnd
                                    startDate={filters.customStartDate}
                                    endDate={filters.customEndDate}
                                    minDate={filters.customStartDate}
                                    placeholderText="End Date"
                                    className="date-picker"
                                    dateFormat="dd/MM/yyyy"
                                />
                            </div>
                        </div>
                    )}

                    <div className="filter-group search-group">
                        <label>Search</label>
                        <div className="search-input">
                            <input
                                type="text"
                                placeholder="Search in actions or details..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange("search", e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button onClick={handleSearch} disabled={loading}>
                                <FiSearch />
                            </button>
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button className="btn-apply" onClick={handleSearch} disabled={loading}>
                            <FiFilter />
                            {loading ? "Applying..." : "Apply Filters"}
                        </button>
                        <button className="btn-reset" onClick={handleReset} disabled={loading}>
                            Reset
                        </button>
                    </div>
                </div>

                {/* Results Info */}
                <div className="results-info">
                    <span className="log-count">
                        📊 Total Logs: <strong>{totalLogs}</strong> | Showing: <strong>{logs.length}</strong> latest
                    </span>
                    {filters.timeRange !== "CUSTOM" && filters.timeRange && (
                        <span className="time-info">
                            Period: {timePresets.find(t => t.value === filters.timeRange)?.label}
                        </span>
                    )}
                    {totalLogs > 10 && (
                        <span className="show-latest">
                            📋 Showing only 10 latest logs. Use Export for complete data.
                        </span>
                    )}
                </div>

                {/* Logs Table - ALWAYS SHOWS MAX 10 LOGS */}
                <div className="logs-table-container">
                    {loading ? (
                        <div className="loading-spinner">Loading latest logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="no-data">
                            <div className="no-data-icon">📋</div>
                            <h4>No Activity Logs Found</h4>
                            <p>Try changing your filters or check back later.</p>
                        </div>
                    ) : (
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Date & Time</th>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, index) => (
                                    <tr key={log._id || index}>
                                        <td>{index + 1}</td>
                                        <td>{formatDate(log.dateTime)}</td>
                                        <td>
                                            <div className="user-cell">
                                                <span className="user-name">{log.userName || "N/A"}</span>
                                                {log.role === "CLIENT" && log.clientId && (
                                                    <span className="user-id">ID: {log.clientId.substring(0, 8)}...</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`role-badge role-${log.role ? log.role.toLowerCase() : 'unknown'}`}>
                                                {log.role || "Unknown"}
                                            </span>
                                        </td>
                                        <td className="action-cell">{log.action || "N/A"}</td>
                                        <td className="details-cell">{log.details || "No details provided"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* NO PAGINATION SECTION - REMOVED COMPLETELY */}

                {/* Export Notice */}
                {totalLogs > 10 && (
                    <div className="export-notice">
                        <div className="notice-icon">📥</div>
                        <div className="notice-content">
                            <h4>Want to see all {totalLogs} logs?</h4>
                            <p>Use the <strong>"Export Excel"</strong> button to download all filtered data.</p>
                        </div>
                        <button
                            className="notice-export-btn"
                            onClick={handleExport}
                            disabled={exporting}
                        >
                            <FiDownload />
                            {exporting ? "Exporting..." : "Export All Data"}
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ActivityLogs;