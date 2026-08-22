import React, { useState, useEffect } from "react";
import { getConsent, saveConsent } from "./consentManager";
import "./CookieConsent.scss"
const CookieConsent = ({ onConsentChange }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existingConsent = getConsent();

    if (!existingConsent) {
      // no valid choice saved (or it expired) - ask again
      setVisible(true);
    } else {
      // valid choice already exists - don't show banner,
      // just let the parent know what the current status is
      if (onConsentChange) {
        onConsentChange(existingConsent.status);
      }
    }
  }, [onConsentChange]);

  const handleAccept = () => {
    saveConsent("accepted");
    setVisible(false);
    if (onConsentChange) {
      onConsentChange("accepted");
    }
  };

  const handleReject = () => {
    saveConsent("rejected");
    setVisible(false);
    if (onConsentChange) {
      onConsentChange("rejected");
    }
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent">
      <div className="cookie-consent__text">
        <p>
          We use cookies to improve your experience and, with your permission,
          to measure site performance and show relevant ads. You can accept
          or reject non-essential cookies at any time.
        </p>
      </div>

      <div className="cookie-consent__actions">
        <button
          className="cookie-consent__btn cookie-consent__btn--reject"
          onClick={handleReject}
        >
          Reject
        </button>
        <button
          className="cookie-consent__btn cookie-consent__btn--accept"
          onClick={handleAccept}
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;