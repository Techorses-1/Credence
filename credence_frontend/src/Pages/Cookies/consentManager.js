// utils/consentManager.js

const CONSENT_KEY = "cookie_consent";
const CONSENT_EXPIRY_DAYS = 180; // 6 months - same duration for accept AND reject

/**
 * Saves the user's consent choice with a timestamp.
 * status: "accepted" | "rejected"
 */
export const saveConsent = (status) => {
    const data = {
        status,
        timestamp: Date.now(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
};

/**
 * Reads the saved consent from localStorage.
 * Returns null if nothing saved, or if the saved consent has expired.
 * Returns { status, timestamp } if still valid.
 */
export const getConsent = () => {
    const raw = localStorage.getItem(CONSENT_KEY);

    if (!raw) return null;

    let data;
    try {
        data = JSON.parse(raw);
    } catch (err) {
        // corrupted data, treat as no consent
        localStorage.removeItem(CONSENT_KEY);
        return null;
    }

    const ageInMs = Date.now() - data.timestamp;
    const expiryInMs = CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    if (ageInMs > expiryInMs) {
        // expired - remove it so a fresh choice is asked
        localStorage.removeItem(CONSENT_KEY);
        return null;
    }

    return data;
};

/**
 * Simple boolean check - has the user accepted marketing cookies right now?
 * Use this before initializing Meta Pixel / Google Ads tag.
 */
export const hasAcceptedConsent = () => {
    const consent = getConsent();
    return consent?.status === "accepted";
};

/**
 * Clears the saved consent - useful for a "Cookie Settings" link
 * in the footer that lets users change their mind anytime.
 */
export const clearConsent = () => {
    localStorage.removeItem(CONSENT_KEY);
};