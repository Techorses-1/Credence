import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import {
  FiUsers,
  FiUser,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiLock,
  FiUnlock,
  FiCalendar,
  FiFile,
  FiFileText,
  FiFolder,
  FiEye,
  FiChevronRight,
  FiClock,
  FiTrendingUp,
  FiPackage,
  FiCreditCard,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiUserCheck,
  FiAlertCircle,
  FiInfo,
  FiClipboard,
  FiUpload,
  FiCloud,
  FiMessageSquare,
  FiUserPlus,
  FiEdit,
  FiMapPin,
  FiBriefcase,
  FiCreditCard as FiCard,
  FiGlobe,
  FiShield,
  FiDollarSign,
  FiFilePlus,
  FiBook,
  FiExternalLink,
  FiBell,
  FiList,
  FiImage,
  FiGrid,
  FiX,
  FiDollarSign as FiPayment,
  FiZoomIn,
  FiZoomOut,
  FiMaximize
} from "react-icons/fi";
import { Snackbar, Alert, Modal, Box, Typography } from "@mui/material";
import "./AdminClients.scss";

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedFiles, setExpandedFiles] = useState({});
  const [expandedInfo, setExpandedInfo] = useState({});
  const [expandedNotes, setExpandedNotes] = useState({});

  // Month dropdown states
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonthNum, setSelectedMonthNum] = useState(new Date().getMonth() + 1);

  // Document Preview States
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewRef = useRef(null);
  const imageScrollRef = useRef(null);

  // Zoom and Pan States
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // NEW: CSV states
  const [csvData, setCsvData] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvZoomLevel, setCsvZoomLevel] = useState(1);

  // Client Details Modal
  const [clientDetailsModal, setClientDetailsModal] = useState(false);

  // Alert tracking states
  const [clientAlerts, setClientAlerts] = useState({});
  const [monthAlerts, setMonthAlerts] = useState({});
  const [categoryAlerts, setCategoryAlerts] = useState({});

  // Snackbar states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // NEW STATES FOR MULTIPLE EMPLOYEE ASSIGNMENTS
  const [employeeAssignments, setEmployeeAssignments] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  // Add these states near other state declarations
  const [monthLockLoading, setMonthLockLoading] = useState(false);
  const [categoryLockLoading, setCategoryLockLoading] = useState({});

  // UPDATED: Payment status states - now using string status
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [showPaymentNotes, setShowPaymentNotes] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Years array
  const years = [currentYear, currentYear - 1, currentYear - 2, currentYear + 1];

  // Months array
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  // Helper function for status display names
  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'paid': return 'PAID';
      case 'pending': return 'PENDING';
      case 'not_credited': return 'CREDIT NOTE';
      default: return 'PENDING';
    }
  };

  // Helper function for status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'paid': return 'paid';
      case 'pending': return 'pending';
      case 'not_credited': return 'not-credited';
      default: return 'pending';
    }
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Pan functions for images
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Helper to escape HTML for CSV
  const escapeHtmlForCSV = (str) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  // Parse CSV and convert to HTML table
  const parseCSVAndDisplay = async (csvUrl) => {
    try {
      setCsvLoading(true);
      const response = await fetch(csvUrl);
      const csvText = await response.text();

      const rows = [];
      const lines = csvText.split(/\r?\n/);

      for (const line of lines) {
        if (!line.trim()) continue;

        const row = [];
        let inQuote = false;
        let currentCell = '';

        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"') {
            inQuote = !inQuote;
          } else if (char === ',' && !inQuote) {
            row.push(currentCell);
            currentCell = '';
          } else {
            currentCell += char;
          }
        }
        row.push(currentCell);
        rows.push(row);
      }

      if (rows.length === 0) {
        setCsvData('<div class="csv-error">No data found in CSV file</div>');
        return;
      }

      let html = '<div class="csv-table-wrapper"><table class="csv-preview-table">';

      if (rows[0]) {
        html += '<thead><tr>';
        rows[0].forEach(cell => {
          html += `<th>${escapeHtmlForCSV(cell)}</th>`;
        });
        html += '</tr></thead>';
      }

      html += '<tbody>';
      for (let i = 1; i < rows.length; i++) {
        html += '<tr>';
        rows[i].forEach(cell => {
          html += `<td>${escapeHtmlForCSV(cell)}</td>`;
        });
        html += '</tr>';
      }
      html += '</tbody></table></div>';

      setCsvData(html);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      setCsvData('<div class="csv-error">Error loading CSV file</div>');
    } finally {
      setCsvLoading(false);
    }
  };

  const getFileType = (file) => {
    if (file.fileType) {
      const fileTypeLower = file.fileType.toLowerCase();

      if (fileTypeLower.includes('pdf')) {
        return 'pdf';
      }

      if (fileTypeLower.includes('jpeg') ||
        fileTypeLower.includes('jpg') ||
        fileTypeLower.includes('png') ||
        fileTypeLower.includes('gif') ||
        fileTypeLower.includes('webp') ||
        fileTypeLower.includes('heic') ||
        fileTypeLower.includes('heif') ||
        fileTypeLower.includes('image')) {
        return 'image';
      }

      if (fileTypeLower.includes('csv')) {
        return 'csv';
      }

      if (fileTypeLower.includes('sheet') ||
        fileTypeLower.includes('excel') ||
        fileTypeLower.includes('spreadsheetml')) {
        return 'excel';
      }
    }

    if (file.url) {
      const urlLower = file.url.toLowerCase();
      if (urlLower.includes('.pdf')) return 'pdf';
      if (urlLower.includes('.csv')) return 'csv';
      if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') ||
        urlLower.includes('.png') || urlLower.includes('.gif') ||
        urlLower.includes('.webp')) return 'image';
      if (urlLower.includes('.xls') || urlLower.includes('.xlsx')) return 'excel';
    }

    if (file.fileName) {
      const ext = file.fileName.split('.').pop().toLowerCase();
      if (ext === 'pdf') return 'pdf';
      if (ext === 'csv') return 'csv';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
      if (['xls', 'xlsx', 'xlsm'].includes(ext)) return 'excel';
    }

    return 'other';
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const applyProtection = () => {
    if (!previewRef.current) return;

    const disableRightClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const disableDragStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const iframe = previewRef.current.querySelector('iframe');
    if (iframe) {
      iframe.addEventListener('contextmenu', disableRightClick);
      iframe.addEventListener('dragstart', disableDragStart);
      iframe.setAttribute('draggable', 'false');
    }

    const images = previewRef.current.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('contextmenu', disableRightClick);
      img.addEventListener('dragstart', disableDragStart);
      img.setAttribute('draggable', 'false');
      img.style.pointerEvents = 'none';
      img.style.userSelect = 'none';
      img.style.webkitUserSelect = 'none';
    });

    previewRef.current.addEventListener('contextmenu', disableRightClick);
    previewRef.current.addEventListener('dragstart', disableDragStart);
  };

  const cleanupProtection = () => {
    if (!previewRef.current) return;

    const iframe = previewRef.current.querySelector('iframe');
    if (iframe) {
      iframe.removeEventListener('contextmenu', () => { });
      iframe.removeEventListener('dragstart', () => { });
    }

    const images = previewRef.current.querySelectorAll('img');
    images.forEach(img => {
      img.removeEventListener('contextmenu', () => { });
      img.removeEventListener('dragstart', () => { });
    });

    previewRef.current.removeEventListener('contextmenu', () => { });
    previewRef.current.removeEventListener('dragstart', () => { });
  };

  const openDocumentPreview = (document) => {
    if (!document || !document.url) {
      showSnackbar("No document available to preview", "warning");
      return;
    }

    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setIsDragging(false);
    setCsvData(null);
    setCsvZoomLevel(1);

    const fileType = getFileType(document);
    setPreviewDoc({ ...document, fileType });
    setIsPreviewOpen(true);

    if (fileType === 'csv') {
      parseCSVAndDisplay(document.url);
    }

    setTimeout(() => {
      applyProtection();
    }, 100);
  };

  const closeDocumentPreview = () => {
    cleanupProtection();
    setIsPreviewOpen(false);
    setPreviewDoc(null);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setIsDragging(false);
    setCsvData(null);
    setCsvLoading(false);
  };

  useEffect(() => {
    const el = imageScrollRef.current;
    if (!el || !isPreviewOpen) return;

    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.5), 3));
    };

    const blockPinch = (e) => {
      if (e.ctrlKey || e.touches?.length > 1) {
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchmove', blockPinch, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchmove', blockPinch);
    };
  }, [isPreviewOpen]);

  const renderDocumentPreview = () => {
    if (!previewDoc || !isPreviewOpen) return null;

    const fileType = previewDoc.fileType || getFileType(previewDoc);

    const handleOverlayClick = (e) => {
      if (e.target === e.currentTarget) {
        closeDocumentPreview();
      }
    };

    return (
      <div
        className={`document-preview-modal ${isPreviewOpen ? 'open' : ''}`}
        onClick={handleOverlayClick}
      >
        <div className="preview-modal-overlay"></div>
        <div
          className="preview-modal-content"
          ref={previewRef}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
        >
          <div className="preview-modal-header">
            <h3 className="preview-title">
              <span className="file-icon">
                {fileType === 'pdf' && <FiFileText size={18} />}
                {fileType === 'image' && <FiImage size={18} />}
                {fileType === 'excel' && <FiGrid size={18} />}
                {fileType === 'csv' && <FiGrid size={18} />}
                {fileType === 'other' && <FiFile size={18} />}
              </span>
              {previewDoc.fileName}
              <span className="file-type-badge">
                {fileType.toUpperCase()}
              </span>
            </h3>
            <button
              className="close-preview-btn"
              onClick={closeDocumentPreview}
              title="Close Preview"
            >
              <FiX size={20} />
            </button>
          </div>

          <div
            className="preview-modal-body"
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
          >
            <div className="protection-note">
              <FiLock size={16} />
              <span className="protection-text">
                SECURE VIEW: Downloading and right-click disabled
              </span>
              <span className="zoom-hint">
                <FiZoomIn size={14} /> Use zoom controls or Mouse Wheel to zoom
              </span>
            </div>

            {fileType === 'pdf' && (
              <div className="protected-view-container pdf-viewer-container">
                <iframe
                  src={`${previewDoc.url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                  title="Protected PDF Viewer"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  className="pdf-iframe"
                  scrolling="yes"
                  style={{
                    display: 'block',
                    border: 'none'
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }}
                />
              </div>
            )}

            {fileType === 'image' && (
              <div className="image-viewer-wrapper">
                <div className="zoom-controls">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 0.5}
                    className="zoom-btn"
                    title="Zoom Out"
                  >
                    <FiZoomOut size={18} />
                  </button>
                  <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3}
                    className="zoom-btn"
                    title="Zoom In"
                  >
                    <FiZoomIn size={18} />
                  </button>
                  <button
                    onClick={handleZoomReset}
                    className="zoom-btn reset"
                    title="Reset Zoom"
                  >
                    <FiMaximize size={16} />
                    <span>Reset</span>
                  </button>
                </div>

                <div
                  className="image-scroll-container"
                  ref={imageScrollRef}
                  onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); return false; }}
                  onMouseDown={(e) => {
                    if (zoomLevel > 1) {
                      setIsDragging(true);
                      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
                    }
                  }}
                  onMouseMove={(e) => {
                    if (isDragging && zoomLevel > 1) {
                      setImagePosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
                    }
                  }}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                >
                  <div
                    className="image-transform-wrapper"
                    style={{
                      transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                      cursor: isDragging ? 'grabbing' : (zoomLevel > 1 ? 'grab' : 'default'),
                    }}
                  >
                    <img
                      src={previewDoc.url}
                      alt={previewDoc.fileName}
                      draggable={false}
                      onContextMenu={(e) => { e.preventDefault(); return false; }}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </div>
                </div>
              </div>
            )}

            {fileType === 'csv' && (
              <div className="csv-viewer-wrapper">
                <div className="zoom-controls">
                  <button
                    onClick={() => setCsvZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
                    disabled={csvZoomLevel <= 0.5}
                    className="zoom-btn"
                    title="Zoom Out"
                  >
                    <FiZoomOut size={18} />
                  </button>
                  <span className="zoom-level">{Math.round(csvZoomLevel * 100)}%</span>
                  <button
                    onClick={() => setCsvZoomLevel(prev => Math.min(prev + 0.1, 3))}
                    disabled={csvZoomLevel >= 3}
                    className="zoom-btn"
                    title="Zoom In"
                  >
                    <FiZoomIn size={18} />
                  </button>
                  <button
                    onClick={() => setCsvZoomLevel(1)}
                    className="zoom-btn reset"
                    title="Reset Zoom"
                  >
                    <FiMaximize size={16} />
                    <span>Reset</span>
                  </button>
                </div>

                <div
                  className="csv-scroll-container"
                  style={{
                    flex: 1,
                    overflow: 'auto',
                    background: '#ffffff',
                    position: 'relative'
                  }}
                >
                  {csvLoading ? (
                    <div className="csv-loading">
                      <div className="loading-spinner-small"></div>
                      <p>Loading CSV data...</p>
                    </div>
                  ) : csvData ? (
                    <div
                      className="csv-table-container"
                      style={{
                        display: 'inline-block',
                        minWidth: '100%',
                      }}
                    >
                      <div
                        style={{
                          fontSize: `${csvZoomLevel * 100}%`,
                          transformOrigin: 'top left',
                          display: 'inline-block',
                          width: '100%'
                        }}
                      >
                        <div dangerouslySetInnerHTML={{ __html: csvData }} />
                      </div>
                    </div>
                  ) : (
                    <div className="csv-error">Unable to load CSV file</div>
                  )}
                </div>
                <div className="viewer-info">
                  <FiInfo size={12} />
                  <span style={{ marginLeft: '5px' }}>
                    CSV file displayed as table. Use zoom controls to adjust text size. Data is read-only.
                  </span>
                </div>
              </div>
            )}

            {fileType === 'excel' && (
              <div className="excel-viewer-wrapper">
                <div className="zoom-controls">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 0.5}
                    className="zoom-btn"
                    title="Zoom Out"
                  >
                    <FiZoomOut size={18} />
                  </button>
                  <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3}
                    className="zoom-btn"
                    title="Zoom In"
                  >
                    <FiZoomIn size={18} />
                  </button>
                  <button
                    onClick={handleZoomReset}
                    className="zoom-btn reset"
                    title="Reset Zoom"
                  >
                    <FiMaximize size={16} />
                    <span>Reset</span>
                  </button>
                </div>

                <div
                  className="protected-view-container excel-viewer-container"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }}
                  style={{
                    height: '70vh',
                    position: 'relative',
                    overflow: 'auto',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'top left',
                      transition: 'transform 0.1s ease',
                      width: `${100 / zoomLevel}%`,
                      height: `${100 / zoomLevel}%`,
                      minWidth: '100%',
                      minHeight: '100%'
                    }}
                  >
                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewDoc.url)}&wdStartOn=1`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      style={{
                        border: 'none',
                        display: 'block'
                      }}
                      title={`Excel Viewer - ${previewDoc.fileName}`}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                      }}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                    />
                  </div>
                </div>

                <div className="viewer-info" style={{
                  padding: '10px',
                  backgroundColor: '#f5f5f5',
                  fontSize: '12px',
                  borderTop: '1px solid #ddd'
                }}>
                  <FiInfo size={12} />
                  <span style={{ marginLeft: '5px' }}>
                    Using Microsoft Office Online Viewer. File cannot be downloaded from this view.
                  </span>
                </div>
              </div>
            )}

            {fileType === 'other' && (
              <div
                className="protected-view-container other-file-container"
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px'
                }}
              >
                <FiFile size={64} style={{ marginBottom: '20px', color: '#666' }} />
                <h4 style={{ marginBottom: '10px' }}>File Preview Not Available</h4>
                <p style={{ marginBottom: '20px', color: '#666' }}>
                  This file type cannot be previewed in the browser.
                </p>
                <div className="file-info-box" style={{
                  backgroundColor: '#fff',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}>
                  <p><strong>File Name:</strong> {previewDoc.fileName}</p>
                  <p><strong>File Size:</strong> {(previewDoc.fileSize / 1024).toFixed(1)} KB</p>
                  <p><strong>Security:</strong> File download is disabled</p>
                </div>
              </div>
            )}
          </div>

          <div className="preview-modal-footer">
            <div className="file-info">
              <span className="file-size">
                <FiFile size={14} /> Size: {(previewDoc.fileSize / 1024).toFixed(1)} KB
              </span>
              <span className="upload-date">
                <FiClock size={14} /> Uploaded: {previewDoc.uploadedAt ?
                  new Date(previewDoc.uploadedAt).toLocaleDateString() :
                  'N/A'}
              </span>
              <span className="file-type-indicator">
                Type: {fileType.toUpperCase()}
              </span>
            </div>

            <button
              className="btn-close-preview"
              onClick={closeDocumentPreview}
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setYearDropdownOpen(false);
    setSelectedMonth({
      year: year,
      month: selectedMonthNum
    });
    setPaymentStatus('pending');
    setPaymentHistory([]);
  };

  const handleMonthSelect = (month) => {
    setSelectedMonthNum(month);
    setMonthDropdownOpen(false);
    setSelectedMonth({
      year: selectedYear,
      month: month
    });
    setPaymentStatus('pending');
    setPaymentHistory([]);
  };

  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/clients`,
        { withCredentials: true }
      );

      const clientsList = res.data;
      console.log("📋 CLIENTS FROM LIST API:", clientsList);
      console.log("📊 Total clients loaded:", clientsList.length);

      setClients(clientsList);

    } catch (error) {
      console.error("Error loading clients:", error);
      showSnackbar("Error loading clients", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentStatus = async () => {
    if (!selectedClient || !selectedMonth) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/clients/${selectedClient.clientId}/payment-status`,
        {
          params: {
            year: selectedMonth.year,
            month: selectedMonth.month
          },
          withCredentials: true
        }
      );

      if (res.data.success) {
        let status = res.data.paymentStatus;
        if (typeof status === 'boolean') {
          status = status === true ? 'paid' : 'pending';
        }
        setPaymentStatus(status);
        setPaymentHistory(res.data.paymentHistory || []);
      }
    } catch (error) {
      console.error("Error loading payment status:", error);
    }
  };

  const updatePaymentStatus = async (newStatus) => {
    if (!selectedClient || !selectedMonth || paymentLoading) return;

    if (newStatus === paymentStatus) {
      showSnackbar(`Payment status is already ${getStatusDisplayName(newStatus)}`, "info");
      return;
    }

    try {
      setPaymentLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/clients/${selectedClient.clientId}/payment-status`,
        {
          year: selectedMonth.year,
          month: selectedMonth.month,
          status: newStatus,
          notes: `Payment marked as ${getStatusDisplayName(newStatus)}`
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setPaymentStatus(newStatus);
        setPaymentHistory(res.data.paymentHistory || []);
        showSnackbar(`Payment status updated to ${getStatusDisplayName(newStatus)}`, "success");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      showSnackbar(`Error: ${error.response?.data?.message || error.message}`, "error");
    } finally {
      setPaymentLoading(false);
    }
  };

  const checkForEmployeeNotes = (clientsData) => {
    const alerts = {};

    clientsData.forEach(client => {
      if (!client.documents) return;

      let hasNotes = false;

      Object.keys(client.documents).forEach(year => {
        Object.keys(client.documents[year]).forEach(month => {
          const monthData = client.documents[year][month];

          ['sales', 'purchase', 'bank'].forEach(category => {
            if (monthData[category]?.files) {
              monthData[category].files.forEach(file => {
                if (file.notes && file.notes.length > 0) {
                  hasNotes = true;
                }
              });
            }
          });

          if (monthData.other) {
            monthData.other.forEach(otherCat => {
              if (otherCat.document?.files) {
                otherCat.document.files.forEach(file => {
                  if (file.notes && file.notes.length > 0) {
                    hasNotes = true;
                  }
                });
              }
            });
          }
        });
      });

      if (hasNotes) {
        alerts[client.clientId] = true;
      }
    });

    setClientAlerts(alerts);
  };

  const checkMonthAlerts = (monthData) => {
    if (!monthData) return false;

    let hasNotes = false;

    ['sales', 'purchase', 'bank'].forEach(category => {
      if (monthData[category]?.files) {
        monthData[category].files.forEach(file => {
          if (file.notes && file.notes.length > 0) {
            hasNotes = true;
          }
        });
      }
    });

    if (monthData.other) {
      monthData.other.forEach(otherCat => {
        if (otherCat.document?.files) {
          otherCat.document.files.forEach(file => {
            if (file.notes && file.notes.length > 0) {
              hasNotes = true;
            }
          });
        }
      });
    }

    return hasNotes;
  };

  const checkCategoryAlerts = (monthData, category, categoryName = null) => {
    if (!monthData) return false;

    let hasNotes = false;

    if (category === 'other' && categoryName) {
      const otherCat = monthData.other?.find(o => o.categoryName === categoryName);
      if (otherCat?.document?.files) {
        otherCat.document.files.forEach(file => {
          if (file.notes && file.notes.length > 0) {
            hasNotes = true;
          }
        });
      }
    } else if (monthData[category]?.files) {
      monthData[category].files.forEach(file => {
        if (file.notes && file.notes.length > 0) {
          hasNotes = true;
        }
      });
    }

    return hasNotes;
  };

  const loadClientDetails = async (clientId) => {
    try {
      setLoading(true);
      console.log("🔍 Loading client details for:", clientId);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/clients/${clientId}`,
        { withCredentials: true }
      );

      let clientData;
      if (res.data.success && res.data.client) {
        clientData = res.data.client;
      } else if (res.data._id || res.data.clientId) {
        clientData = res.data;
      } else {
        throw new Error("Invalid response format from server");
      }

      setSelectedClient(clientData);

      const enrichedAssignments = clientData.employeeAssignments || [];
      setEmployeeAssignments(enrichedAssignments);

      setSelectedTask("");

      const newSelectedYear = currentYear;
      const newSelectedMonth = currentMonth;

      setSelectedYear(newSelectedYear);
      setSelectedMonthNum(newSelectedMonth);
      setSelectedMonth({
        year: newSelectedYear,
        month: newSelectedMonth
      });

      setTimeout(() => {
        loadPaymentStatus();
      }, 100);

      showSnackbar("Client data loaded successfully", "success");

    } catch (error) {
      console.error("Error loading client details:", error);
      showSnackbar("Error loading client details", "error");
    } finally {
      setLoading(false);
    }
  };

  const getMonthData = () => {
    if (!selectedClient || !selectedMonth) return null;

    const yearKey = String(selectedMonth.year);
    const monthKey = String(selectedMonth.month);

    return selectedClient.documents?.[yearKey]?.[monthKey] || null;
  };

  const getAssignmentsForCurrentMonth = () => {
    if (!employeeAssignments || !selectedMonth) return [];

    return employeeAssignments.filter(assignment =>
      assignment.year === selectedMonth.year &&
      assignment.month === selectedMonth.month
    );
  };

  const updateAlerts = useCallback(() => {
    if (!selectedClient || !selectedMonth) return;

    const monthData = getMonthData();

    if (monthData && selectedClient) {
      const hasMonthAlerts = checkMonthAlerts(monthData);
      const monthAlertKey = `${selectedClient.clientId}-${selectedMonth.year}-${selectedMonth.month}`;

      if (monthAlerts[monthAlertKey] !== hasMonthAlerts) {
        setMonthAlerts(prev => ({
          ...prev,
          [monthAlertKey]: hasMonthAlerts
        }));
      }

      const catAlerts = {};
      ['sales', 'purchase', 'bank'].forEach(cat => {
        catAlerts[cat] = checkCategoryAlerts(monthData, cat);
      });

      if (monthData.other) {
        monthData.other.forEach(otherCat => {
          catAlerts[`other-${otherCat.categoryName}`] = checkCategoryAlerts(monthData, 'other', otherCat.categoryName);
        });
      }

      if (JSON.stringify(catAlerts) !== JSON.stringify(categoryAlerts)) {
        setCategoryAlerts(catAlerts);
      }
    }
  }, [selectedClient, selectedMonth, categoryAlerts, monthAlerts]);

  const getDocumentUploadStatus = () => {
    if (!selectedMonth) return null;

    const monthData = getMonthData();
    if (!monthData) return "pending";

    const salesHasFiles = monthData.sales?.files?.length > 0;
    const purchaseHasFiles = monthData.purchase?.files?.length > 0;
    const bankHasFiles = monthData.bank?.files?.length > 0;

    if (salesHasFiles && purchaseHasFiles && bankHasFiles) {
      return "completed";
    }

    return "pending";
  };

  const toggleMonthLock = async (lock) => {
    if (monthLockLoading) return;

    try {
      setMonthLockLoading(true);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/clients/${selectedClient.clientId}/month-lock`,
        {
          year: selectedMonth.year,
          month: selectedMonth.month,
          lock
        },
        { withCredentials: true }
      );

      showSnackbar(`Month ${lock ? 'locked' : 'unlocked'} successfully!`, "success");
      loadClientDetails(selectedClient.clientId);
    } catch (error) {
      console.error("Error toggling month lock:", error);
      showSnackbar(`Error: ${error.response?.data?.message || error.message}`, "error");
    } finally {
      setMonthLockLoading(false);
    }
  };

  const toggleFileLock = async (type, lock, categoryName = null) => {
    const lockKey = categoryName ? `${type}-${categoryName}` : type;

    if (categoryLockLoading[lockKey]) return;

    try {
      setCategoryLockLoading(prev => ({
        ...prev,
        [lockKey]: true
      }));

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/clients/file-lock/${selectedClient.clientId}`,
        {
          year: selectedMonth.year,
          month: selectedMonth.month,
          type,
          categoryName,
          lock
        },
        { withCredentials: true }
      );

      showSnackbar(response.data.message || `File ${lock ? 'locked' : 'unlocked'} successfully!`, "success");
      loadClientDetails(selectedClient.clientId);
    } catch (error) {
      console.error("Error toggling file lock:", error);
      showSnackbar(`Error: ${error.response?.data?.message || error.message || "Please try again"}`, "error");
    } finally {
      setCategoryLockLoading(prev => ({
        ...prev,
        [lockKey]: false
      }));
    }
  };

  const formatMonthYear = (month, year) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'sales': return <FiTrendingUp />;
      case 'purchase': return <FiPackage />;
      case 'bank': return <FiCreditCard />;
      default: return <FiFileText />;
    }
  };

  const getStatusBadge = (isActive) => (
    <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
      {isActive ? (
        <>
          <FiCheckCircle /> Active
        </>
      ) : (
        <>
          <FiXCircle /> Inactive
        </>
      )}
    </span>
  );

  const getLockBadge = (isLocked) => (
    <span className={`lock-badge ${isLocked ? 'locked' : 'unlocked'}`}>
      {isLocked ? (
        <>
          <FiLock /> Locked
        </>
      ) : (
        <>
          <FiUnlock /> Unlocked
        </>
      )}
    </span>
  );

  const getDocumentUploadBadge = () => {
    const status = getDocumentUploadStatus();

    return (
      <span className={`document-upload-badge ${status}`}>
        {status === "completed" ? (
          <>
            <FiCheckCircle /> Documents Uploaded
          </>
        ) : (
          <>
            <FiAlertCircle /> Documents Pending
          </>
        )}
      </span>
    );
  };

  const getPaymentBadge = () => {
    let badgeClass = '';
    let icon = null;
    let text = '';

    switch (paymentStatus) {
      case 'paid':
        badgeClass = 'paid';
        icon = <FiCheckCircle />;
        text = 'Payment Done';
        break;
      case 'pending':
        badgeClass = 'pending';
        icon = <FiAlertCircle />;
        text = 'Payment Pending';
        break;
      case 'not_credited':
        badgeClass = 'not-credited';
        icon = <FiXCircle />;
        text = 'CREDIT NOTE';
        break;
      default:
        badgeClass = 'pending';
        icon = <FiAlertCircle />;
        text = 'Payment Pending';
    }

    return (
      <span className={`payment-badge ${badgeClass}`}>
        {icon} {text}
      </span>
    );
  };

  const renderNotesSection = (notes, title = "Notes", notesKey = "default") => {
    if (!notes || notes.length === 0) return null;

    const isExpanded = expandedNotes[notesKey];

    return (
      <div className="notes-section">
        <div className="notes-header" onClick={() => setExpandedNotes(prev => ({
          ...prev,
          [notesKey]: !prev[notesKey]
        }))}>
          <div className="notes-title">
            <FiMessageSquare size={16} />
            <span>{title} ({notes.length})</span>
          </div>
          <button className="notes-toggle-btn">
            {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>
        </div>

        {isExpanded && (
          <div className="notes-list">
            {notes.map((note, index) => (
              <div key={index} className="note-item">
                <div className="note-content">
                  <p className="note-text">{note.note}</p>
                  <div className="note-meta">
                    <span className="note-author">
                      <FiUser size={12} />
                      {note.employeeName || note.addedBy || 'Unknown'}
                    </span>
                    <span className="note-date">
                      <FiClock size={12} />
                      {new Date(note.addedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCategoryNotes = (categoryData, categoryType, categoryName = null) => {
    if (!categoryData || !categoryData.categoryNotes || categoryData.categoryNotes.length === 0) {
      return null;
    }

    const notesKey = `category-${categoryType}-${categoryName || 'main'}-${selectedMonth.year}-${selectedMonth.month}`;
    return renderNotesSection(categoryData.categoryNotes, "📝 Client Notes", notesKey);
  };

  const renderFileNotes = (file, fileIndex, categoryType, categoryName = null) => {
    if (!file || !file.notes || file.notes.length === 0) {
      return null;
    }

    const notesKey = `file-${categoryType}-${categoryName || 'main'}-${fileIndex}-${selectedMonth.year}-${selectedMonth.month}`;
    return renderNotesSection(file.notes, "👤 Employee Notes", notesKey);
  };

  const renderFilesInCategory = (files, categoryType, categoryName = null) => {
    if (!files || files.length === 0) {
      return (
        <div className="empty-files">
          <FiFileText size={20} />
          <p>No files uploaded</p>
        </div>
      );
    }

    return (
      <div className="files-list">
        {files.map((file, fileIndex) => {
          const fileId = `${categoryType}-${categoryName || 'main'}-${fileIndex}-${selectedMonth.year}-${selectedMonth.month}`;
          const isExpanded = expandedFiles[fileId];
          const hasNotes = file.notes && file.notes.length > 0;

          return (
            <div key={fileIndex} className="file-item">
              <div className="file-item-header">
                <div className="file-item-info">
                  <div className="file-icon-small">
                    <FiFileText size={16} />
                  </div>
                  <div>
                    <div className="file-name-row">
                      <p className="file-name">{file.fileName || 'Unnamed File'}</p>
                      {hasNotes && (
                        <span className="file-note-alert">
                          <FiBell size={12} color="#f59e0b" title="Has employee notes" />
                        </span>
                      )}
                    </div>
                    <div className="file-item-meta">
                      <span className="meta-item">
                        <FiClock size={12} />
                        {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="meta-item">
                        <FiUser size={12} />
                        {file.uploadedBy || 'Unknown'}
                      </span>
                      {file.fileSize && (
                        <span className="meta-item">
                          <FiFile size={12} />
                          {(file.fileSize / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="file-item-actions">
                  {file.url && (
                    <button
                      className="view-btn-small"
                      onClick={() => openDocumentPreview(file)}
                      title="Preview"
                    >
                      <FiEye size={14} />
                    </button>
                  )}
                  <button
                    className="expand-btn-small"
                    onClick={() => toggleFileExpansion(fileId)}
                  >
                    {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="file-item-details">
                  {renderFileNotes(file, fileIndex, categoryType, categoryName)}

                  <div className="file-detail-grid">
                    <div className="detail-item">
                      <span className="label">File Type:</span>
                      <span className="value">{file.fileType || 'Not specified'}</span>
                    </div>
                    {file.uploadedAt && (
                      <div className="detail-item">
                        <span className="label">Uploaded:</span>
                        <span className="value">
                          {new Date(file.uploadedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {file.uploadedBy && (
                      <div className="detail-item">
                        <span className="label">Uploaded By:</span>
                        <span className="value">{file.uploadedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const toggleFileExpansion = (fileId) => {
    setExpandedFiles(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };

  const toggleInfoExpansion = (infoId) => {
    setExpandedInfo(prev => ({
      ...prev,
      [infoId]: !prev[infoId]
    }));
  };

  const renderClientDetailsModal = () => {
    if (!selectedClient) return null;

    return (
      <Modal
        open={clientDetailsModal}
        onClose={() => setClientDetailsModal(false)}
        aria-labelledby="admin-client-details-modal"
        aria-describedby="admin-client-details-description"
      >
        <Box className="admin-client-details-modal">
          <div className="admin-modal-header">
            <h2 className="admin-modal-title">
              <FiUser size={24} />
              Client Details
            </h2>
            <button
              className="admin-modal-close-btn"
              onClick={() => setClientDetailsModal(false)}
            >
              ✕
            </button>
          </div>

          <div className="admin-modal-body">
            <div className="admin-info-grid">
              <div className="admin-info-card">
                <h3 className="admin-info-card-title">
                  <FiUser size={18} /> Personal Information
                </h3>
                <div className="admin-info-card-content">
                  <div className="admin-info-item">
                    <span className="admin-info-label">Full Name:</span>
                    <span className="admin-info-value">{selectedClient.name}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">First Name:</span>
                    <span className="admin-info-value">{selectedClient.firstName || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Last Name:</span>
                    <span className="admin-info-value">{selectedClient.lastName || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Email:</span>
                    <span className="admin-info-value">{selectedClient.email}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Phone:</span>
                    <span className="admin-info-value">{selectedClient.phone || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Address:</span>
                    <span className="admin-info-value">{selectedClient.address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="admin-info-card">
                <h3 className="admin-info-card-title">
                  <FiBriefcase size={18} /> Business Information
                </h3>
                <div className="admin-info-card-content">
                  <div className="admin-info-item">
                    <span className="admin-info-label">Business Name:</span>
                    <span className="admin-info-value">{selectedClient.businessName || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Business Address:</span>
                    <span className="admin-info-value">{selectedClient.businessAddress || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Business Nature:</span>
                    <span className="admin-info-value">{selectedClient.businessNature || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Registered Trade:</span>
                    <span className="admin-info-value">{selectedClient.registerTrade || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">VAT Period:</span>
                    <span className="admin-info-value">{selectedClient.vatPeriod || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="admin-info-card">
                <h3 className="admin-info-card-title">
                  <FiCard size={18} /> Financial Information
                </h3>
                <div className="admin-info-card-content">
                  <div className="admin-info-item">
                    <span className="admin-info-label">Bank Account:</span>
                    <span className="admin-info-value">{selectedClient.bankAccount || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">BIC Code:</span>
                    <span className="admin-info-value">{selectedClient.bicCode || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Plan Selected:</span>
                    <span className="admin-info-value">{selectedClient.planSelected || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="admin-info-card">
                <h3 className="admin-info-card-title">
                  <FiShield size={18} /> Legal Information
                </h3>
                <div className="admin-info-card-content">
                  <div className="admin-info-item">
                    <span className="admin-info-label">Visa Type:</span>
                    <span className="admin-info-value">{selectedClient.visaType || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Strong ID:</span>
                    <span className="admin-info-value">{selectedClient.hasStrongId || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Status:</span>
                    <span className="admin-info-value">
                      {selectedClient.isActive ? (
                        <span className="admin-status-badge admin-status-active">Active</span>
                      ) : (
                        <span className="admin-status-badge admin-status-inactive">Inactive</span>
                      )}
                    </span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Enrollment Date:</span>
                    <span className="admin-info-value">
                      {selectedClient.enrollmentDate ?
                        new Date(selectedClient.enrollmentDate).toLocaleDateString() :
                        new Date(selectedClient.createdAt).toLocaleDateString()
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              className="admin-modal-footer-btn"
              onClick={() => setClientDetailsModal(false)}
            >
              Close
            </button>
          </div>
        </Box>
      </Modal>
    );
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === '' ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && client.isActive) ||
      (statusFilter === 'inactive' && !client.isActive);

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    updateAlerts();
  }, [updateAlerts]);

  useEffect(() => {
    if (selectedClient && selectedMonth) {
      loadPaymentStatus();
    }
  }, [selectedClient, selectedMonth]);

  const monthData = getMonthData();
  const currentMonthAlert = monthAlerts[`${selectedClient?.clientId}-${selectedMonth?.year}-${selectedMonth?.month}`];

  return (
    <AdminLayout>
      <div className="admin-clients">
        <div className="enrollments-header">
          <div className="header-left">
            <h2>Client Management</h2>
            <p className="subtitle">
              Manage client documents, locks, and view accounting status
            </p>
          </div>
        </div>

        <div className="main-content">
          <div className="clients-sidebar">
            <div className="sidebar-header">
              <h3>Clients</h3>
              <span className="count-badge">{filteredClients.length}</span>
            </div>

            <div className="search-filter-section">
              <div className="search-box">
                <FiSearch size={18} />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-buttons">
                <button
                  className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('active')}
                >
                  Active
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('inactive')}
                >
                  Inactive
                </button>
              </div>
            </div>

            <div className="clients-list">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading clients...</p>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="empty-state">
                  <FiUsers size={32} />
                  <p>No clients found</p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client.clientId}
                    className={`client-card ${selectedClient?.clientId === client.clientId ? 'active' : ''}`}
                    onClick={() => loadClientDetails(client.clientId)}
                  >
                    <div className="client-avatar">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="client-info">
                      <div className="client-name-row">
                        <h4>{client.name}</h4>
                        {clientAlerts[client.clientId] && (
                          <span className="client-note-alert">
                            <FiBell size={12} color="#f59e0b" title="Has employee notes" />
                          </span>
                        )}
                      </div>
                      <p className="client-email">{client.email}</p>
                      <div className="client-meta">
                        {getStatusBadge(client.isActive)}
                        {client.isActive && client.planSelected && (
                          <span className="plan-badge-small">
                            {client.planSelected}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedClient?.clientId === client.clientId && (
                      <div className="active-indicator">
                        <FiChevronRight size={20} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="client-content">
            {selectedClient ? (
              <>
                <div className="client-header">
                  <div className="client-profile">
                    <div className="profile-avatar">
                      {selectedClient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                      <div className="profile-header-row">
                        <h2>{selectedClient.name}</h2>
                        <button
                          className="view-more-btn"
                          onClick={() => setClientDetailsModal(true)}
                        >
                          <FiExternalLink size={14} />
                          View Full Details
                        </button>
                      </div>
                      <p className="email">{selectedClient.email}</p>
                      <div className="profile-meta">
                        <span className="meta-item">
                          <FiPhone size={14} />
                          {selectedClient.phone || 'No phone'}
                        </span>
                        <span className="meta-item">
                          <FiCalendar size={14} />
                          Joined: {new Date(selectedClient.createdAt).toLocaleDateString()}
                        </span>
                        {getStatusBadge(selectedClient.isActive)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="month-selection-section">
                  <div className="section-header">
                    <h3>
                      <FiCalendar size={20} /> Select Month
                      {currentMonthAlert && (
                        <span className="month-alert-icon" title="This month has employee notes">
                          <FiBell size={16} color="#f59e0b" />
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="month-dropdowns">
                    <div className="dropdown-wrapper">
                      <button
                        className="dropdown-toggle"
                        onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                      >
                        <span>{selectedYear}</span>
                        <FiChevronDown size={16} />
                      </button>
                      {yearDropdownOpen && (
                        <div className="dropdown-menu">
                          {years.map(year => (
                            <button
                              key={year}
                              className="dropdown-item"
                              onClick={() => handleYearSelect(year)}
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="dropdown-wrapper">
                      <button
                        className="dropdown-toggle"
                        onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
                      >
                        <span>{months.find(m => m.value === selectedMonthNum)?.label}</span>
                        <FiChevronDown size={16} />
                      </button>
                      {monthDropdownOpen && (
                        <div className="dropdown-menu">
                          {months.map(month => (
                            <button
                              key={month.value}
                              className="dropdown-item"
                              onClick={() => handleMonthSelect(month.value)}
                            >
                              {month.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="selected-month-display">
                      <span className="current-month-text">
                        {formatMonthYear(selectedMonthNum, selectedYear)}
                      </span>
                      {currentMonthAlert && (
                        <span className="month-alert-badge" title="Has employee notes">
                          <FiBell size={12} /> Notes
                        </span>
                      )}
                      {monthData && monthData.isLocked && (
                        <span className="month-lock-indicator">
                          <FiLock size={12} /> Locked
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* UPDATED: Payment Status Section with 3 buttons */}
                <div className="payment-status-section">
                  <div className="section-header">
                    <h4>
                      <FiDollarSign size={18} /> Payment Status
                    </h4>
                    <div className="payment-status-display">
                      {getPaymentBadge()}
                    </div>
                  </div>

                  <div className="payment-content">
                    <div className="payment-info">
                      <div className="payment-info-item">
                        <span className="label">Month:</span>
                        <span className="value">{formatMonthYear(selectedMonthNum, selectedYear)}</span>
                      </div>
                      <div className="payment-info-item">
                        <span className="label">Current Status:</span>
                        <span className={`value status-text ${getStatusClass(paymentStatus)}`}>
                          {getStatusDisplayName(paymentStatus)}
                        </span>
                      </div>
                    </div>

                    <div className="payment-actions payment-actions-3">
                      <button
                        className={`payment-status-btn paid-btn ${paymentStatus === 'paid' ? 'active' : ''}`}
                        onClick={() => updatePaymentStatus('paid')}
                        disabled={paymentLoading || paymentStatus === 'paid'}
                      >
                        {paymentLoading && paymentStatus !== 'paid' ? (
                          <div className="spinner-tiny"></div>
                        ) : (
                          <>
                            <FiCheckCircle size={16} /> PAID
                          </>
                        )}
                      </button>

                      <button
                        className={`payment-status-btn pending-btn ${paymentStatus === 'pending' ? 'active' : ''}`}
                        onClick={() => updatePaymentStatus('pending')}
                        disabled={paymentLoading || paymentStatus === 'pending'}
                      >
                        {paymentLoading && paymentStatus !== 'pending' ? (
                          <div className="spinner-tiny"></div>
                        ) : (
                          <>
                            <FiAlertCircle size={16} /> PENDING
                          </>
                        )}
                      </button>

                      <button
                        className={`payment-status-btn credit-note-btn ${paymentStatus === 'not_credited' ? 'active' : ''}`}
                        onClick={() => updatePaymentStatus('not_credited')}
                        disabled={paymentLoading || paymentStatus === 'not_credited'}
                      >
                        {paymentLoading && paymentStatus !== 'not_credited' ? (
                          <div className="spinner-tiny"></div>
                        ) : (
                          <>
                            <FiFileText size={16} /> CREDIT NOTE
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {selectedMonth && (
                  <>
                    <div className="month-info-panel">
                      <div className="info-section">
                        <div className="info-header">
                          <h4>
                            <FiInfo size={18} /> Month Information
                          </h4>
                        </div>

                        <div className="info-details">
                          <div className="info-grid">
                            <div className="info-item">
                              <span className="label">Document Status:</span>
                              {getDocumentUploadBadge()}
                            </div>

                            <div className="info-item">
                              <span className="label">Month Status:</span>
                              {monthData?.isLocked ? (
                                <span className="value locked">
                                  <FiLock size={14} /> Locked
                                  {monthData?.lockedAt && (
                                    <span className="subtext">
                                      on {new Date(monthData.lockedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                  {monthData?.lockedBy && (
                                    <span className="subtext">
                                      by {monthData.lockedBy}
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="value unlocked">
                                  <FiUnlock size={14} /> Unlocked
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="task-selection-section">
                            <div className="dropdown-wrapper">
                              <label className="dropdown-label">
                                <FiList size={14} /> Select Task
                              </label>
                              <select
                                className="task-dropdown"
                                value={selectedTask || ""}
                                onChange={(e) => setSelectedTask(e.target.value)}
                              >
                                <option value="">All Tasks</option>
                                {Array.from(new Set(getAssignmentsForCurrentMonth().map(a => a.task)))
                                  .filter(task => task)
                                  .map(task => (
                                    <option key={task} value={task}>
                                      {task}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>

                          <div className="assignment-info">
                            <h5>
                              <FiUserCheck size={16} /> Employee Assignment Details
                            </h5>

                            {(() => {
                              const assignments = getAssignmentsForCurrentMonth();
                              const filteredAssignments = selectedTask
                                ? assignments.filter(a => a.task === selectedTask)
                                : assignments;

                              if (filteredAssignments.length === 0) {
                                return <div className="no-assignments">No employee assignments for selected task</div>;
                              }

                              return (
                                <div className="assignments-table-container">
                                  <table className="assignments-table">
                                    <thead>
                                      <tr>
                                        <th>Task</th>
                                        <th>Employee</th>
                                        <th>Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredAssignments.map((assignment, index) => (
                                        <tr key={index}>
                                          <td>
                                            <span className="task-cell">{assignment.task || "Not specified"}</span>
                                          </td>
                                          <td>
                                            <div className="employee-cell">
                                              <FiUser size={12} />
                                              <span>{assignment.employeeName || "Unknown"}</span>
                                            </div>
                                          </td>
                                          <td>
                                            <span className={`status-cell ${assignment.accountingDone ? 'completed' : 'pending'}`}>
                                              {assignment.accountingDone ? (
                                                <>
                                                  <FiCheckCircle size={12} /> Completed
                                                </>
                                              ) : (
                                                <>
                                                  <FiAlertCircle size={12} /> Pending
                                                </>
                                              )}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="month-actions-section">
                      <div className="section-header">
                        <h3>
                          <FiLock size={20} /> Month Controls
                        </h3>
                        <div className="month-status">
                          {monthData?.isLocked ? (
                            <span className="status-badge locked">
                              <FiLock size={14} /> Month Locked
                            </span>
                          ) : (
                            <span className="status-badge unlocked">
                              <FiUnlock size={14} /> Month Unlocked
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="action-buttons">
                        <button
                          className={`action-btn lock-btn ${monthLockLoading ? 'loading' : ''}`}
                          onClick={() => toggleMonthLock(true)}
                          disabled={monthData?.isLocked || monthLockLoading}
                        >
                          {monthLockLoading ? (
                            <>
                              <div className="spinner-small"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <FiLock size={16} /> Lock Entire Month
                            </>
                          )}
                        </button>
                        <button
                          className={`action-btn unlock-btn ${monthLockLoading ? 'loading' : ''}`}
                          onClick={() => toggleMonthLock(false)}
                          disabled={!monthData?.isLocked || monthLockLoading}
                        >
                          {monthLockLoading ? (
                            <>
                              <div className="spinner-small"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <FiUnlock size={16} /> Unlock Entire Month
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="files-section">
                      <div className="section-header">
                        <h3>
                          <FiFolder size={20} /> Documents
                        </h3>
                        <span className="count-badge">
                          {monthData ? (
                            (monthData.sales?.files?.length || 0) +
                            (monthData.purchase?.files?.length || 0) +
                            (monthData.bank?.files?.length || 0) +
                            (monthData.other?.reduce((acc, o) => acc + (o.document?.files?.length || 0), 0) || 0)
                          ) : 0} files
                        </span>
                      </div>

                      {['sales', 'purchase', 'bank'].map((category) => {
                        const categoryData = monthData?.[category];
                        const categoryId = `${category}-${selectedMonth.year}-${selectedMonth.month}`;
                        const isExpanded = expandedFiles[categoryId];
                        const hasAlerts = categoryAlerts[category];

                        const getContextLabel = (cat) => {
                          if (cat === 'sales') return '(Income)';
                          if (cat === 'purchase') return '(Expenses)';
                          return '';
                        };

                        const getDisplayName = (cat) => {
                          if (cat === 'sales') return 'Sales';
                          if (cat === 'purchase') return 'Purchase';
                          if (cat === 'bank') return 'Bank';
                          return cat.charAt(0).toUpperCase() + cat.slice(1);
                        };

                        return (
                          <div key={category} className="files-category">
                            <div className="category-header">
                              <div className="category-title">
                                <div className="category-icon">
                                  {getFileIcon(category)}
                                </div>
                                <div className="category-title-content">
                                  <h4>
                                    {getDisplayName(category)} Documents
                                    {getContextLabel(category) && (
                                      <span className="category-context-label">
                                        {' '}{getContextLabel(category)}
                                      </span>
                                    )}
                                  </h4>
                                  {hasAlerts && (
                                    <span className="category-alert-icon" title="Has employee notes">
                                      <FiBell size={12} color="#f59e0b" />
                                    </span>
                                  )}
                                </div>
                                <span className="file-count-badge">
                                  {categoryData?.files?.length || 0} files
                                </span>
                                {categoryData?.isLocked && (
                                  <span className="category-lock-badge">
                                    <FiLock size={12} /> Locked
                                  </span>
                                )}
                              </div>
                              <button
                                className="expand-category-btn"
                                onClick={() => toggleFileExpansion(categoryId)}
                              >
                                {isExpanded ? (
                                  <FiChevronUp size={16} />
                                ) : (
                                  <FiChevronDown size={16} />
                                )}
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="category-content">
                                {renderCategoryNotes(categoryData, category)}
                                {renderFilesInCategory(categoryData?.files, category)}

                                {categoryData && (
                                  <div className="category-controls">
                                    <button
                                      className={`control-btn lock ${categoryLockLoading[category] ? 'loading' : ''}`}
                                      onClick={() => toggleFileLock(category, true)}
                                      disabled={categoryData?.isLocked || categoryLockLoading[category]}
                                    >
                                      {categoryLockLoading[category] ? (
                                        <>
                                          <div className="spinner-tiny"></div>
                                          Processing...
                                        </>
                                      ) : (
                                        <>
                                          <FiLock size={14} /> {categoryData?.isLocked ? `${getDisplayName(category)} Already Locked` : `Lock ${getDisplayName(category)}`}
                                        </>
                                      )}
                                    </button>
                                    <button
                                      className={`control-btn unlock ${categoryLockLoading[category] ? 'loading' : ''}`}
                                      onClick={() => toggleFileLock(category, false)}
                                      disabled={!categoryData?.isLocked || categoryLockLoading[category]}
                                    >
                                      {categoryLockLoading[category] ? (
                                        <>
                                          <div className="spinner-tiny"></div>
                                          Processing...
                                        </>
                                      ) : (
                                        <>
                                          <FiUnlock size={14} /> {!categoryData?.isLocked ? `${getDisplayName(category)} Already Unlocked` : `Unlock ${getDisplayName(category)}`}
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <div className="files-category">
                        <div className="category-header">
                          <div className="category-title">
                            <div className="category-icon">
                              <FiFileText />
                            </div>
                            <h4>Other Documents</h4>
                            <span className="file-count-badge">
                              {monthData?.other?.reduce((acc, o) => acc + (o.document?.files?.length || 0), 0) || 0} files
                            </span>
                          </div>
                        </div>

                        {monthData?.other && monthData.other.length > 0 ? (
                          monthData.other.map((otherCategory, index) => {
                            const categoryId = `other-${otherCategory.categoryName}-${selectedMonth.year}-${selectedMonth.month}`;
                            const isExpanded = expandedFiles[categoryId];
                            const hasAlerts = categoryAlerts[`other-${otherCategory.categoryName}`];

                            return (
                              <div key={index} className="other-category-item">
                                <div className="other-category-header">
                                  <div className="other-category-title">
                                    <div className="other-category-title-content">
                                      <h5>{otherCategory.categoryName}</h5>
                                      {hasAlerts && (
                                        <span className="category-alert-icon" title="Has employee notes">
                                          <FiBell size={12} color="#f59e0b" />
                                        </span>
                                      )}
                                    </div>
                                    <span className="file-count-badge">
                                      {otherCategory.document?.files?.length || 0} files
                                    </span>
                                    {otherCategory.document?.isLocked && (
                                      <span className="category-lock-badge">
                                        <FiLock size={12} /> Locked
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    className="expand-category-btn"
                                    onClick={() => toggleFileExpansion(categoryId)}
                                  >
                                    {isExpanded ? (
                                      <FiChevronUp size={16} />
                                    ) : (
                                      <FiChevronDown size={16} />
                                    )}
                                  </button>
                                </div>

                                {isExpanded && (
                                  <div className="other-category-content">
                                    {renderCategoryNotes(otherCategory.document, 'other', otherCategory.categoryName)}
                                    {renderFilesInCategory(otherCategory.document?.files, 'other', otherCategory.categoryName)}

                                    {otherCategory.document && (
                                      <div className="category-controls">
                                        <button
                                          className={`control-btn lock ${categoryLockLoading[`other-${otherCategory.categoryName}`] ? 'loading' : ''}`}
                                          onClick={() => toggleFileLock("other", true, otherCategory.categoryName)}
                                          disabled={otherCategory.document?.isLocked || categoryLockLoading[`other-${otherCategory.categoryName}`]}
                                        >
                                          {categoryLockLoading[`other-${otherCategory.categoryName}`] ? (
                                            <>
                                              <div className="spinner-tiny"></div>
                                              Processing...
                                            </>
                                          ) : (
                                            <>
                                              <FiLock size={14} /> {otherCategory.document?.isLocked ? `${otherCategory.categoryName} Already Locked` : `Lock ${otherCategory.categoryName}`}
                                            </>
                                          )}
                                        </button>
                                        <button
                                          className={`control-btn unlock ${categoryLockLoading[`other-${otherCategory.categoryName}`] ? 'loading' : ''}`}
                                          onClick={() => toggleFileLock("other", false, otherCategory.categoryName)}
                                          disabled={!otherCategory.document?.isLocked || categoryLockLoading[`other-${otherCategory.categoryName}`]}
                                        >
                                          {categoryLockLoading[`other-${otherCategory.categoryName}`] ? (
                                            <>
                                              <div className="spinner-tiny"></div>
                                              Processing...
                                            </>
                                          ) : (
                                            <>
                                              <FiUnlock size={14} /> {!otherCategory.document?.isLocked ? `${otherCategory.categoryName} Already Unlocked` : `Unlock ${otherCategory.categoryName}`}
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="empty-state">
                            <FiFileText size={32} />
                            <p>No other documents for this month</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="no-client-selected">
                <FiUsers size={64} />
                <h3>Select a Client</h3>
                <p>Choose a client from the list to view their documents and accounting status</p>
              </div>
            )}
          </div>
        </div>

        {renderClientDetailsModal()}
        {renderDocumentPreview()}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </AdminLayout>
  );
};

export default AdminClients;