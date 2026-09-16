// utils/consentManager.js

const CONSENT_KEY = "cookie_consent";

/**
 * Saves the user's consent choice for THIS browser session only.
 * sessionStorage is automatically wiped when the tab/browser closes -
 * no expiry logic needed, the browser handles that for us.
 * status: "accepted" | "rejected"
 */
export const saveConsent = (status) => {
    const data = { status };
    sessionStorage.setItem(CONSENT_KEY, JSON.stringify(data));
};

/**
 * Reads the saved consent from sessionStorage.
 * Returns null if nothing saved yet in THIS session (i.e. fresh visit,
 * or tab/browser was closed and reopened).
 * Returns { status } if already chosen this session.
 */
export const getConsent = () => {
    const raw = sessionStorage.getItem(CONSENT_KEY);

    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (err) {
        // corrupted data, treat as no consent
        sessionStorage.removeItem(CONSENT_KEY);
        return null;
    }
};

/**
 * Simple boolean check - has the user accepted marketing cookies
 * in THIS session? Use this before initializing Meta Pixel / Google Ads tag.
 */
export const hasAcceptedConsent = () => {
    const consent = getConsent();
    return consent?.status === "accepted";
};

/**
 * Clears the saved consent for this session - useful for a
 * "Cookie Settings" link if you want users to be able to change
 * their mind mid-session.
 */
export const clearConsent = () => {
    sessionStorage.removeItem(CONSENT_KEY);
};