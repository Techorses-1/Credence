import React, { useState, useEffect } from "react";
import { getConsent, saveConsent } from "./consentManager";
import "./CookieConsent.scss";

const CookieConsent = ({ onConsentChange }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existingConsent = getConsent();

    if (!existingConsent) {
      // no choice made yet THIS session - show modal, block scroll
      setVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      // already chosen this session - don't show modal again,
      // just let the parent know the current status
      if (onConsentChange) {
        onConsentChange(existingConsent.status);
      }
    }

    // safety cleanup - restore scroll if component ever unmounts
    // while modal was still open
    return () => {
      document.body.style.overflow = "";
    };
  }, [onConsentChange]);

  const handleAccept = () => {
    saveConsent("accepted");
    setVisible(false);
    document.body.style.overflow = "";
    if (onConsentChange) {
      onConsentChange("accepted");
    }
  };

  const handleReject = () => {
    saveConsent("rejected");
    setVisible(false);
    document.body.style.overflow = "";
    if (onConsentChange) {
      onConsentChange("rejected");
    }
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-modal">
        <div className="cookie-consent-modal__text">
          <p>
            We use cookies to improve your experience and, with your permission,
            to measure site performance and show relevant ads. Please choose
            below to continue.
          </p>
        </div>

        <div className="cookie-consent-modal__actions">
          <button
            className="cookie-consent-modal__btn cookie-consent-modal__btn--reject"
            onClick={handleReject}
          >
            Reject
          </button>
          <button
            className="cookie-consent-modal__btn cookie-consent-modal__btn--accept"
            onClick={handleAccept}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;