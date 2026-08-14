import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { FiUpload, FiDownload, FiRefreshCw, FiEye, FiClock, FiFileText, FiX, FiInfo } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AgreementPdf.scss";

const AgreementPdf = () => {
    // State
    const [currentPdf, setCurrentPdf] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Modal states
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    // Upload form
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadDescription, setUploadDescription] = useState("");
    const [dragActive, setDragActive] = useState(false);

    // ============================================
    // FETCH CURRENT PDF
    // ============================================
    const fetchCurrentPdf = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/pdf/current`,
                {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
                    },
                    credentials: "include"
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCurrentPdf(data.pdf);
                }
            }
        } catch (error) {
            console.error("Error fetching current PDF:", error);
            toast.error("Failed to load current PDF");
        } finally {
            setLoading(false);
        }
    }, []);

    // ============================================
    // FETCH HISTORY
    // ============================================
    const fetchHistory = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/pdf/history`,
                {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
                    },
                    credentials: "include"
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setHistory(data.history);
                }
            }
        } catch (error) {
            console.error("Error fetching history:", error);
            toast.error("Failed to load history");
        }
    };

    // ============================================
    // UPLOAD NEW PDF
    // ============================================
    const handleUpload = async (e) => {
        e.preventDefault();

        if (!uploadFile) {
            toast.error("Please select a PDF file");
            return;
        }

        const formData = new FormData();
        formData.append("pdf", uploadFile);
        formData.append("description", uploadDescription);

        setUploading(true);
        const toastId = toast.loading("Uploading PDF...");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/pdf/upload`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
                    },
                    credentials: "include",
                    body: formData
                }
            );

            const data = await response.json();

            if (response.ok) {
                toast.update(toastId, {
                    render: "✅ PDF uploaded successfully!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000
                });

                // Reset and close
                setUploadFile(null);
                setUploadDescription("");
                setShowUploadModal(false);

                // Refresh data
                fetchCurrentPdf();
                fetchHistory();
            } else {
                toast.update(toastId, {
                    render: `❌ ${data.message || "Upload failed"}`,
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.update(toastId, {
                render: `❌ Upload error: ${error.message}`,
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        } finally {
            setUploading(false);
        }
    };

    // ============================================
    // DOWNLOAD PDF (FORCES DOWNLOAD VIA BLOB)
    // ============================================
    const handleDownload = async (pdf) => {
        const toastId = toast.loading("Preparing download...");
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/pdf/download/${pdf.pdfId}${pdf.version ? `?version=${pdf.version}` : ''}`,
                {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
                    },
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!data.success) {
                toast.update(toastId, {
                    render: "❌ Failed to get download URL",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000
                });
                return;
            }

            // Fetch the actual file as a blob so browser can't open it in a tab
            const fileResponse = await fetch(data.fileUrl);
            const blob = await fileResponse.blob();

            // Force download using blob URL
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = data.fileName || "Agreement.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up blob URL from memory
            setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

            toast.update(toastId, {
                render: `✅ Downloading ${data.fileName}`,
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

        } catch (error) {
            console.error("Download error:", error);
            toast.update(toastId, {
                render: "❌ Download failed",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        }
    };
    // ============================================
    // VIEW PDF (OPENS IN NEW TAB)
    // ============================================
    const handleView = (pdf) => {
        window.open(pdf.fileUrl, '_blank');
    };

    // ============================================
    // OPEN HISTORY MODAL
    // ============================================
    const openHistoryModal = async () => {
        await fetchHistory();
        setShowHistoryModal(true);
    };

    // ============================================
    // DRAG & DROP HANDLERS
    // ============================================
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf') {
                setUploadFile(file);
            } else {
                toast.error("Only PDF files are allowed");
            }
        }
    };

    // Format helpers
    const formatFileSize = (bytes) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Europe/Helsinki'
            });
        } catch (e) {
            return dateString;
        }
    };

    // Load on mount
    useEffect(() => {
        fetchCurrentPdf();
    }, []);

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

            <div className="agreement-pdf-container">
                {/* Header */}
                <div className="pdf-header">
                    <h1>
                        <FiFileText className="header-icon" />
                        Agreement PDF
                    </h1>
                    <div className="header-actions">
                        <button
                            className="btn-history"
                            onClick={openHistoryModal}
                        >
                            <FiClock />
                            Version History
                        </button>
                        <button
                            className="btn-upload"
                            onClick={() => setShowUploadModal(true)}
                        >
                            <FiUpload />
                            Upload New Version
                        </button>
                        <button
                            className="btn-refresh"
                            onClick={fetchCurrentPdf}
                            disabled={loading}
                        >
                            <FiRefreshCw className={loading ? "spinning" : ""} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Current PDF Card */}
                <div className="current-pdf-card">
                    <div className="card-header">
                        <div className="title-section">
                            <FiFileText className="card-icon" />
                            <h2>Current Active PDF</h2>
                        </div>
                        {currentPdf && (
                            <span className="version-badge">
                                Version {currentPdf.version}
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="loading-state">Loading current PDF...</div>
                    ) : !currentPdf ? (
                        <div className="empty-state">
                            <FiInfo className="empty-icon" />
                            <p>No PDF uploaded yet. Click "Upload New Version" to add the first agreement PDF.</p>
                        </div>
                    ) : (
                        <div className="pdf-details">
                            <div className="detail-row">
                                <span className="label">File Name:</span>
                                <span className="value">{currentPdf.fileName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Uploaded By:</span>
                                <span className="value">{currentPdf.uploadedByName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Uploaded At:</span>
                                <span className="value">{formatDate(currentPdf.uploadedAt)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">File Size:</span>
                                <span className="value">{formatFileSize(currentPdf.fileSize)}</span>
                            </div>
                            {currentPdf.description && (
                                <div className="detail-row description">
                                    <span className="label">Description:</span>
                                    <span className="value">{currentPdf.description}</span>
                                </div>
                            )}
                            <div className="action-buttons">
                                <button
                                    className="action-btn view"
                                    onClick={() => handleView(currentPdf)}
                                >
                                    <FiEye />
                                    View PDF
                                </button>
                                <button
                                    className="action-btn download"
                                    onClick={() => handleDownload(currentPdf)}
                                >
                                    <FiDownload />
                                    Download
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Note */}
                <div className="info-note">
                    <FiInfo className="info-icon" />
                    <p>
                        Uploading a new PDF will automatically archive the current version to history.
                        Only one PDF remains active at a time.
                    </p>
                </div>
            </div>

            {/* ========== UPLOAD MODAL ========== */}
            {showUploadModal && (
                <div className="agr-modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="agr-modal-content agr-upload-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="agr-modal-header">
                            <h2>Upload New Agreement PDF</h2>
                            <button className="agr-modal-close-btn" onClick={() => setShowUploadModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleUpload}>
                            <div className="agr-modal-body">
                                {/* Current Version Info */}
                                {currentPdf && (
                                    <div className="agr-version-info">
                                        <FiInfo className="info-icon" />
                                        <div className="info-text">
                                            <span>Current Version: <strong>v{currentPdf.version}</strong></span>
                                            <span>New version will be: <strong>v{currentPdf.version + 1}</strong></span>
                                        </div>
                                    </div>
                                )}

                                {/* Drag & Drop */}
                                <div
                                    className={`drag-drop-area ${dragActive ? 'active' : ''}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        id="file-upload"
                                        accept=".pdf"
                                        onChange={(e) => setUploadFile(e.target.files[0])}
                                        style={{ display: 'none' }}
                                    />

                                    {uploadFile ? (
                                        <div className="selected-file">
                                            <FiFileText className="file-icon-large" />
                                            <div className="file-info">
                                                <span className="file-name">{uploadFile.name}</span>
                                                <span className="file-size">{formatFileSize(uploadFile.size)}</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="remove-file"
                                                onClick={() => setUploadFile(null)}
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                    ) : (
                                        <label htmlFor="file-upload" className="drag-drop-label">
                                            <FiUpload className="upload-icon" />
                                            <span>Drag & drop your PDF here or <span className="browse-text">browse</span></span>
                                            <span className="file-limit">Max file size: 20MB</span>
                                        </label>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="agr-form-group">
                                    <label htmlFor="description">Description (Optional)</label>
                                    <textarea
                                        id="description"
                                        rows="3"
                                        placeholder="Enter a description for this version..."
                                        value={uploadDescription}
                                        onChange={(e) => setUploadDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="agr-modal-footer">
                                <button
                                    type="button"
                                    className="agr-btn-cancel"
                                    onClick={() => setShowUploadModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="agr-btn-submit"
                                    disabled={!uploadFile || uploading}
                                >
                                    {uploading ? "Uploading..." : "Upload New Version"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========== HISTORY MODAL ========== */}
            {showHistoryModal && (
                <div className="agr-modal-overlay" onClick={() => setShowHistoryModal(false)}>
                    <div className="agr-modal-content agr-history-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="agr-modal-header">
                            <h2>Version History</h2>
                            <button className="agr-modal-close-btn" onClick={() => setShowHistoryModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="agr-modal-body">
                            {history.length === 0 ? (
                                <div className="agr-no-history">No version history available</div>
                            ) : (
                                <div className="agr-history-list">
                                    {history.map(group => (
                                        <div key={group.pdfId} className="agr-history-group">
                                            <h3>PDF Document</h3>
                                            <div className="agr-versions">
                                                {group.versions.map((version, index) => (
                                                    <div
                                                        key={version.version}
                                                        className={`agr-version-item ${version.isActive ? 'active' : ''}`}
                                                    >
                                                        <div className="agr-version-header">
                                                            <span className="agr-version-badge-large">
                                                                Version {version.version}
                                                                {version.isActive && " (Current)"}
                                                            </span>
                                                            <span className="agr-version-date">
                                                                {formatDate(version.uploadedAt)}
                                                            </span>
                                                        </div>
                                                        <div className="agr-version-details">
                                                            <p><strong>File:</strong> {version.fileName}</p>
                                                            <p><strong>Uploaded By:</strong> {version.uploadedByName}</p>
                                                            <p><strong>Size:</strong> {formatFileSize(version.fileSize)}</p>
                                                            {version.description && (
                                                                <p><strong>Description:</strong> {version.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="agr-version-actions">
                                                            <button
                                                                className="agr-version-action-btn"
                                                                onClick={() => handleView(version)}
                                                            >
                                                                <FiEye /> View
                                                            </button>
                                                            <button
                                                                className="agr-version-action-btn"
                                                                onClick={() => handleDownload({ ...version, pdfId: group.pdfId })}
                                                            >
                                                                <FiDownload /> Download
                                                            </button>
                                                        </div>
                                                        {index < group.versions.length - 1 && (
                                                            <div className="agr-version-separator"></div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="agr-modal-footer">
                            <button
                                className="agr-btn-cancel"
                                onClick={() => setShowHistoryModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AgreementPdf;