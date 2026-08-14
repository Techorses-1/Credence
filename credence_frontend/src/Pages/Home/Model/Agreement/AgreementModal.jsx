import React, { useState } from 'react';
import { useModal } from '../ModalProvider';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../ModalStyles.scss';

const AgreementModal = () => {
  const { closeAgreementModal, openRegistrationModal } = useModal();
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [showCheckbox2, setShowCheckbox2] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (downloading) return;

    const toastId = toast.loading("Downloading agreement...", {
      position: "top-center",
    });

    try {
      setDownloading(true);

      // First, get the PDF info (which one is active)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/pdf/public/current`);

      if (!res.ok) {
        toast.dismiss(toastId);
        toast.error(`Failed to fetch agreement information. Status: ${res.status}`, {
          position: "top-center",
          autoClose: 4000,
        });
        return;
      }

      const data = await res.json();

      if (!data.success || !data.pdf) {
        toast.dismiss(toastId);
        toast.error("Agreement PDF not available. Please contact support.", {
          position: "top-center",
          autoClose: 4000,
        });
        return;
      }

      // Download the actual PDF file
      let fileResponse;
      try {
        fileResponse = await fetch(data.pdf.fileUrl);
      } catch (networkError) {
        toast.dismiss(toastId);
        // Check if it's a network error
        if (networkError.message === 'Failed to fetch' || networkError.name === 'TypeError') {
          toast.error("📡 Network error! Please check your internet connection and try again.", {
            position: "top-center",
            autoClose: 4000,
          });
        } else {
          toast.error("Failed to connect to server. Please try again.", {
            position: "top-center",
            autoClose: 4000,
          });
        }
        return;
      }

      if (!fileResponse.ok) {
        toast.dismiss(toastId);
        toast.error(`Failed to download file. Status: ${fileResponse.status}`, {
          position: "top-center",
          autoClose: 4000,
        });
        return;
      }

      const contentType = fileResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        toast.dismiss(toastId);
        toast.error("Invalid file format. Expected PDF.", {
          position: "top-center",
          autoClose: 4000,
        });
        return;
      }

      const blob = await fileResponse.blob();

      if (blob.size === 0) {
        toast.dismiss(toastId);
        toast.error("Downloaded file is empty. Please try again.", {
          position: "top-center",
          autoClose: 4000,
        });
        return;
      }

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Agreement_v${data.pdf.version || 1}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

      // Success
      toast.dismiss(toastId);
      toast.success(`✓ Agreement downloaded successfully! (${(blob.size / 1024).toFixed(2)} KB)`, {
        position: "top-center",
        autoClose: 3000,
      });

      setPdfDownloaded(true);
      setShowCheckbox2(true);

    } catch (error) {
      console.error("Download error:", error);
      toast.dismiss(toastId);

      // 🔥 IMPROVED ERROR DETECTION 🔥
      // Check for network errors (no internet)
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        toast.error("📡 No internet connection! Please check your network and try again.", {
          position: "top-center",
          autoClose: 4000,
        });
      }
      // Check for abort errors
      else if (error.name === 'AbortError') {
        toast.error("⏱️ Request timed out. Please check your connection and try again.", {
          position: "top-center",
          autoClose: 4000,
        });
      }
      // Check for other network related errors
      else if (error.message === 'NetworkError' || error.message.includes('network')) {
        toast.error("🌐 Network error! Please check your internet connection.", {
          position: "top-center",
          autoClose: 4000,
        });
      }
      // Generic error
      else {
        toast.error("Something went wrong. Please try again later.", {
          position: "top-center",
          autoClose: 4000,
        });
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleProceed = () => {
    if (agree1 && agree2) {
      openRegistrationModal();
    } else {
      if (!agree1) {
        toast.warning("⚠️ Please accept the terms and conditions first.", {
          position: "top-center",
          autoClose: 3000,
        });
      } else if (!agree2) {
        toast.warning("📄 Please download and accept the PDF agreement first.", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={closeAgreementModal}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={closeAgreementModal}>
            ×
          </button>

          <h2 className="modal-heading">Agreement & Terms</h2>

          <div className="agreement-content">
            <div className="agreement-list">
              <p><strong>Important Guidelines:</strong></p>
              <ol>
                <li>Please do not share your any details on any number other than mentioned in form.</li>
                <li>Please do not share photographs of RP card or social security number or any Eu id's.</li>
                <li>Make sure you have at least 75 euros balance in your bank account.</li>
                <li>Every Entrepreneur must take Pension Insurance if their income exceeds 9010 Euros in the respective financial Year.</li>
                <li>While doing application you need to be online for strong identification and answering query while processing.</li>
                <li>The service provider may share the client details (Company Name and/or Business ID) for the purpose of marketing, if needed. No other information will be shared by the service provider without prior consent from the client.</li>
                <li>Important note: you must check your email every day and see if there is any query from prh. If you fail to inform us about the query, you will lose your 70-euro trademark fees(trade register).</li>
                <li>You will receive follow-up from our back-office team for data uploads, VAT reporting, and any additional information required during monthly VAT compliance.</li>
              </ol>
            </div>

            {/* First Checkbox */}
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="agree1"
                checked={agree1}
                onChange={(e) => setAgree1(e.target.checked)}
                className="checkbox-input"
              />
              <label htmlFor="agree1" className="checkbox-label">
                I confirm that I have read and understood all the details and agree to follow all the rules and provide all required information and materials as needed.
              </label>
            </div>

            {/* Download Button - Only enabled when agree1 is checked */}
            <button
              className={`download-btn ${(!agree1 || downloading) ? 'disabled' : ''}`}
              onClick={handleDownloadPDF}
              disabled={!agree1 || downloading}
            >
              {downloading ? "Downloading..." : "Download Terms & Conditions PDF"}
            </button>

            {/* Second Checkbox - Only shown AFTER download */}
            {showCheckbox2 && (
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="agree2"
                  checked={agree2}
                  onChange={(e) => setAgree2(e.target.checked)}
                  className="checkbox-input"
                />
                <label htmlFor="agree2" className="checkbox-label">
                  I have downloaded, read, and understood the Terms & Conditions and information provided in the PDF, and I agree to them.
                </label>
              </div>
            )}

            {/* Proceed Button - Only enabled when both checkboxes are checked */}
            <button
              className={`proceed-btn ${!(agree1 && agree2) ? 'disabled' : ''}`}
              onClick={handleProceed}
              disabled={!(agree1 && agree2)}
            >
              Proceed to Registration
            </button>

            {/* Validation Message - Optional now since we have toasts */}
            {!(agree1 && agree2) && (
              <p className="validation-msg">
                {!agree1 ? 'Please tick the first checkbox.' :
                  !agree2 ? 'Please download the PDF and tick the second checkbox.' : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Toast Container for this modal */}
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default AgreementModal;