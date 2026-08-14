import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import "./AdminEmployeeTasks.scss";

const AdminEmployeeTasks = () => {
    const [employees, setEmployees] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeMap, setEmployeeMap] = useState({}); // Map email to employeeId

    useEffect(() => {
        fetchEmployeeTasks();
    }, []);

    const fetchEmployeeTasks = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin/employee-work-tracker`,
                { withCredentials: true }
            );
            
            if (response.data.success) {
                setEmployees(response.data.data.employees || []);
                setAssignments(response.data.data.workAssignments || []);
                
                // Create a map of email to employeeId from assignments
                const map = {};
                response.data.data.workAssignments.forEach(assignment => {
                    // Find the employee by name to get their email
                    const employee = response.data.data.employees.find(
                        emp => emp.name === assignment.employeeName
                    );
                    if (employee) {
                        map[employee.email] = assignment.employeeEmail;
                    }
                });
                setEmployeeMap(map);
                
                // Select first employee by default
                if (response.data.data.employees && response.data.data.employees.length > 0) {
                    setSelectedEmployee(response.data.data.employees[0].email);
                }
            } else {
                setError("Failed to fetch data");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error fetching employee tasks");
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Filter assignments by selected employee
    const filteredAssignments = selectedEmployee 
        ? assignments.filter(assignment => {
            const employeeId = employeeMap[selectedEmployee];
            return assignment.employeeEmail === employeeId;
        })
        : assignments;

    // Format month number to name
    const formatMonth = (month) => {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return months[month - 1] || month;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    return (
        <AdminLayout>
            <div className="admin-employee-tasks-module">
                <div className="admin-tasks-sidebar">
                    <div className="admin-sidebar-header">
                        <h3>Employees</h3>
                        <div className="admin-total-employees">{employees.length} Employees</div>
                    </div>
                    
                    <div className="admin-employee-list">
                        {employees.map((employee, index) => (
                            <div 
                                key={index}
                                className={`admin-employee-item ${selectedEmployee === employee.email ? 'admin-active' : ''}`}
                                onClick={() => setSelectedEmployee(employee.email)}
                            >
                                <div className="admin-employee-name">{employee.name}</div>
                                <div className="admin-employee-email">{employee.email}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="admin-tasks-main">
                    <div className="admin-content-header">
                        <h2>Employee Work Assignments</h2>
                        <div className="admin-header-actions">
                            <button 
                                className="admin-refresh-btn"
                                onClick={fetchEmployeeTasks}
                                disabled={loading}
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="admin-loading-spinner">Loading...</div>
                    ) : error ? (
                        <div className="admin-error-message">{error}</div>
                    ) : (
                        <>
                            <div className="admin-employee-info">
                                {selectedEmployee && (
                                    <>
                                        <h3>
                                            {employees.find(e => e.email === selectedEmployee)?.name || selectedEmployee}
                                        </h3>
                                        <div className="admin-assignment-count">
                                            {filteredAssignments.length} assignment(s)
                                        </div>
                                    </>
                                )}
                            </div>

                            {filteredAssignments.length === 0 ? (
                                <div className="admin-no-data">No assignments found for selected employee</div>
                            ) : (
                                <div className="admin-assignments-container">
                                    <table className="admin-assignments-table">
                                        <thead>
                                            <tr>
                                                <th>Client Name</th>
                                                <th>Month-Year</th>
                                                <th>Task</th>
                                                <th>Status</th>
                                                <th>Assigned Date</th>
                                                <th>Completed Date</th>
                                                <th>Assigned By</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAssignments.map((assignment, index) => (
                                                <tr key={index}>
                                                    <td className="admin-client-name">{assignment.clientName}</td>
                                                    <td className="admin-month-year">
                                                        {formatMonth(assignment.month)} {assignment.year}
                                                    </td>
                                                    <td className="admin-task">{assignment.task || "Not specified"}</td>
                                                    <td className="admin-status">
                                                        <span className={`admin-status-badge ${assignment.status === 'DONE' ? 'admin-done' : 'admin-pending'}`}>
                                                            {assignment.status}
                                                        </span>
                                                    </td>
                                                    <td className="admin-assigned-date">{formatDate(assignment.assignedDate)}</td>
                                                    <td className="admin-completed-date">{formatDate(assignment.completedDate)}</td>
                                                    <td className="admin-assigned-by">{assignment.assignedBy || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminEmployeeTasks;