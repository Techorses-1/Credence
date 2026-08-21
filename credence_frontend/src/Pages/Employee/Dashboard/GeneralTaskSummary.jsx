// components/Employee/GeneralTaskSummary.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiChevronRight,
  FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import './GeneralTaskSummary.scss';

const GeneralTaskSummary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0
  });

  // Fetch general tasks summary
  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee/general-tasks`,
        { withCredentials: true }
      );

      if (response.data.success) {
        const data = response.data.data;
        setStats({
          total: data.totalTasks || 0,
          pending: data.pendingTasks || 0,
          completed: data.completedTasks || 0,
          cancelled: data.cancelledTasks || 0
        });
      }
    } catch (error) {
      console.error('Error fetching general tasks summary:', error);
      toast.error('Failed to load general tasks summary', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'dark'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Navigate to General Tasks page
  const handleViewAll = () => {
    navigate('/employee/general-tasks');
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchSummary();
  };

  // Loading state
  if (loading) {
    return (
      <div className="general-task-summary loading">
        <div className="summary-card">
          <div className="card-header">
            <div className="header-left">
              <FiFileText size={24} />
              <h3>General Tasks</h3>
            </div>
          </div>
          <div className="loading-spinner-small"></div>
          <p className="loading-text">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="general-task-summary">
      <div className="summary-card">
        {/* Card Header */}
        <div className="card-header">
          <div className="header-left">
            <FiFileText size={24} className="header-icon" />
            <h3>General Tasks</h3>
          </div>
          <button
            className="refresh-btn-small"
            onClick={handleRefresh}
            title="Refresh"
          >
            <FiRefreshCw size={16} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-item total">
            <div className="stat-icon">
              <FiFileText size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>

          <div className="stat-item pending">
            <div className="stat-icon">
              <FiClock size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>

          <div className="stat-item completed">
            <div className="stat-icon">
              <FiCheckCircle size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>

          <div className="stat-item cancelled">
            <div className="stat-icon">
              <FiXCircle size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.cancelled}</span>
              <span className="stat-label">Cancelled</span>
            </div>
          </div>
        </div>

        {/* View All Button */}
        <button
          className="view-all-btn"
          onClick={handleViewAll}
          disabled={stats.total === 0}
        >
          <span>
            {stats.total === 0
              ? 'No tasks assigned'
              : `View All ${stats.total} Task${stats.total !== 1 ? 's' : ''}`
            }
          </span>
          <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default GeneralTaskSummary;