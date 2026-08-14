import { useState, useEffect, useRef } from "react";
import { FiFileText, FiDownload, FiCheckCircle, FiShield, FiAlertTriangle } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./ConsentUpdateModal.scss";

const ConsentUpdateModal = () => {
    const [show, setShow] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [pdfDownloaded, setPdfDownloaded] = useState(false);
    const [checkingConsent, setCheckingConsent] = useState(true);

    // Use ref to track toast ID
    const toastIdRef = useRef(null);

    // ============================================
    // CHECK IF CLIENT NEEDS CONSENT UPDATE
    // ============================================
    useEffect(() => {
        const checkConsent = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/client-consent/check`,
                    { credentials: "include" }
                );
                const data = await res.json();

                if (data.success && data.requiresConsentUpdate) {
                    setShow(true);
                }
            } catch (error) {
                console.error("Consent check failed:", error);
                toast.error("Failed to check consent status. Please refresh the page.", {
                    position: "top-center",
                    autoClose: 4000,
                });
            } finally {
                setCheckingConsent(false);
            }
        };

        checkConsent();
    }, []);

    const handleDownload = async () => {
        if (downloading) return;

        // Clear any existing toast first
        if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = null;
        }

        // Show loading toast
        toastIdRef.current = toast.loading("Downloading agreement...", {
            position: "top-center",
            closeButton: true,
            closeOnClick: true,
        });

        try {
            setDownloading(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/pdf/public/download-current`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        'Accept': 'application/pdf',
                    }
                }
            );

            if (!response.ok) {
                let errorMessage = "Failed to download agreement";
                let errorType = "UNKNOWN_ERROR";

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                    errorType = errorData.error || errorType;
                } catch (e) {
                    const errorText = await response.text();
                    console.error("Download error response:", errorText);
                }

                // Dismiss loading toast
                toast.dismiss(toastIdRef.current);
                toastIdRef.current = null;

                // Show error toast
                toast.error(getErrorMessage(errorType, errorMessage), {
                    position: "top-center",
                    autoClose: 4000,
                    closeButton: true,
                    closeOnClick: true,
                });
                return; // Stop execution
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/pdf')) {
                toast.dismiss(toastIdRef.current);
                toastIdRef.current = null;
                toast.error("Invalid file format. Expected PDF.", {
                    position: "top-center",
                    autoClose: 4000,
                    closeButton: true,
                    closeOnClick: true,
                });
                return;
            }

            const blob = await response.blob();

            if (blob.size === 0) {
                toast.dismiss(toastIdRef.current);
                toastIdRef.current = null;
                toast.error("Downloaded file is empty. Please try again.", {
                    position: "top-center",
                    autoClose: 4000,
                    closeButton: true,
                    closeOnClick: true,
                });
                return;
            }

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers.get('content-disposition');
            let filename = "Agreement.pdf";
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch) filename = filenameMatch[1];
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            // Dismiss loading toast
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = null;

            // Show success toast
            toast.success("✓ Agreement downloaded successfully! Please read carefully.", {
                position: "top-center",
                autoClose: 3000,
                closeButton: true,
                closeOnClick: true,
            });

            setPdfDownloaded(true);

        } catch (error) {
            // 🔥 NETWORK ERROR or any other exception
            console.error("Download error:", error);

            // Dismiss loading toast if it exists
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
                toastIdRef.current = null;
            }

            // Show network error toast
            toast.error("Network error. Please check your internet connection and try again.", {
                position: "top-center",
                autoClose: 4000,
                closeButton: true,
                closeOnClick: true,
            });
        } finally {
            setDownloading(false);
        }
    };

    const getErrorMessage = (errorType, defaultMessage) => {
        switch (errorType) {
            case "NO_PDF_FOUND":
                return "No agreement available. Please contact support.";
            case "DOWNLOAD_TIMEOUT":
                return "Download timed out. Check your connection and try again.";
            case "S3_FETCH_FAILED":
                return "Unable to retrieve file. Please try again later.";
            case "NETWORK_ERROR":
                return "Network error. Please check your internet connection.";
            case "BUFFER_CREATION_FAILED":
                return "Failed to process the file. Please try again.";
            default:
                return defaultMessage || "Failed to download agreement. Please try again.";
        }
    };

    // ============================================
    // SUBMIT CONSENT - FIXED
    // ============================================
    const handleSubmit = async () => {
        if (!agreed || submitting) return;

        // Clear any existing toast
        if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = null;
        }

        toastIdRef.current = toast.loading("Submitting your consent...", {
            position: "top-center",
        });

        try {
            setSubmitting(true);

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/client-consent/accept`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" }
                }
            );

            const data = await res.json();

            if (data.success) {
                toast.dismiss(toastIdRef.current);
                toastIdRef.current = null;

                toast.success("✓ Agreement accepted! Redirecting...", {
                    position: "top-center",
                    autoClose: 2000,
                    closeButton: true,
                    closeOnClick: true,
                });

                setTimeout(() => {
                    setShow(false);
                    setAgreed(false);
                    setPdfDownloaded(false);
                    window.location.reload();
                }, 1500);
            } else {
                toast.dismiss(toastIdRef.current);
                toastIdRef.current = null;

                toast.error(data.message || "Failed to save consent. Please try again.", {
                    position: "top-center",
                    autoClose: 4000,
                    closeButton: true,
                    closeOnClick: true,
                });
            }
        } catch (error) {
            console.error("Consent submit error:", error);
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = null;

            toast.error("Network error. Please check your connection.", {
                position: "top-center",
                autoClose: 4000,
                closeButton: true,
                closeOnClick: true,
            });
        } finally {
            setSubmitting(false);
            toastIdRef.current = null;
        }
    };

    // Don't render anything if still checking or not needed
    if (checkingConsent || !show) return null;

    return (
        <>
            <div className="consent-modal-overlay">
                <div className="consent-modal">
                    {/* Header */}
                    <div className="consent-modal-header">
                        <div className="consent-header-icon">
                            <FiShield size={28} />
                        </div>
                        <div className="consent-header-text">
                            <h2>Agreement Updated</h2>
                            <p>Our Terms & Conditions have been updated</p>
                        </div>
                    </div>

                    {/* Alert Banner */}
                    <div className="consent-alert-banner">
                        <FiAlertTriangle size={18} />
                        <span>
                            Please review and accept the updated agreement to continue using the portal.
                            This popup cannot be dismissed until you accept.
                        </span>
                    </div>

                    {/* Body */}
                    <div className="consent-modal-body">
                        {/* Step 1 — Download */}
                        <div className={`consent-step ${pdfDownloaded ? "done" : ""}`}>
                            <div className="consent-step-number">
                                {pdfDownloaded ? <FiCheckCircle size={20} /> : "1"}
                            </div>
                            <div className="consent-step-content">
                                <h4>Download & Read the Agreement</h4>
                                <p>Download the updated Terms & Conditions PDF and read it carefully.</p>
                                <button
                                    className={`consent-download-btn ${downloading ? "loading" : ""} ${pdfDownloaded ? "downloaded" : ""}`}
                                    onClick={handleDownload}
                                    disabled={downloading}
                                >
                                    <FiDownload size={16} />
                                    {downloading
                                        ? "Downloading..."
                                        : pdfDownloaded
                                            ? "Downloaded ✓"
                                            : "Download Agreement PDF"
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Step 2 — Agree */}
                        <div className={`consent-step ${agreed ? "done" : ""} ${!pdfDownloaded ? "disabled" : ""}`}>
                            <div className="consent-step-number">
                                {agreed ? <FiCheckCircle size={20} /> : "2"}
                            </div>
                            <div className="consent-step-content">
                                <h4>Accept the Agreement</h4>
                                <p>Confirm that you have read and agree to the updated terms.</p>
                                <div
                                    className={`consent-checkbox-row ${!pdfDownloaded ? "locked" : ""}`}
                                    onClick={() => pdfDownloaded && setAgreed(!agreed)}
                                >
                                    <div className={`consent-checkbox ${agreed ? "checked" : ""}`}>
                                        {agreed && <FiCheckCircle size={14} />}
                                    </div>
                                    <label>
                                        I have downloaded, read, and understood the updated Terms &amp; Conditions
                                        and I agree to be bound by them.
                                    </label>
                                </div>
                                {!pdfDownloaded && (
                                    <p className="consent-locked-hint">
                                        Please download the PDF first to enable this step.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="consent-modal-footer">
                        <button
                            className={`consent-submit-btn ${!agreed || submitting ? "disabled" : ""}`}
                            onClick={handleSubmit}
                            disabled={!agreed || submitting}
                        >
                            {submitting ? "Saving..." : "Confirm & Continue"}
                        </button>
                        <p className="consent-footer-note">
                            <FiFileText size={13} />
                            Your acceptance is recorded with date, time, and IP address for compliance purposes.
                        </p>
                    </div>
                </div>
            </div>


        </>
    );
};

export default ConsentUpdateModal;