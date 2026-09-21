// services/googleAds.js
// No npm package needed - Google's gtag.js is loaded dynamically via script injection

const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID;

let isInitialized = false;

/**
 * Dynamically injects Google's gtag.js script into the page.
 * Only called internally, once, from initGoogleAds().
 */
const loadGtagScript = () => {
    return new Promise((resolve, reject) => {
        if (document.getElementById("gtag-script")) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.id = "gtag-script";
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

/**
 * Initializes Google Ads tag. Call this ONLY after user accepts cookie consent.
 * Safe to call multiple times - will not re-init if already done.
 */
export const initGoogleAds = async () => {
    if (isInitialized) return;

    if (!GOOGLE_ADS_ID) {
        console.warn("Google Ads ID is missing in .env (REACT_APP_GOOGLE_ADS_ID)");
        return;
    }

    await loadGtagScript();

    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", GOOGLE_ADS_ID);

    isInitialized = true;
};

/**
 * Call this on every route change (from your route-tracking hook).
 * Does nothing if Google Ads was never initialized (i.e. consent not given).
 */
export const trackPageView = (pagePath) => {
    if (!isInitialized || !window.gtag) return;

    window.gtag("event", "page_view", {
        page_path: pagePath,
    });
};

/**
 * Track a conversion event (e.g. form submit, consultation booked).
 * conversionLabel is the specific label Google gives per conversion action,
 * usually found in Google Ads under Conversions.
 */
export const trackConversion = (conversionLabel, data = {}) => {
    if (!isInitialized || !window.gtag) return;

    window.gtag("event", "conversion", {
        send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
        ...data,
    });
};

/**
 * Track a plain custom event - no conversion label needed.
 * Useful for building remarketing audiences (e.g. "people who submitted
 * a form") without needing the client to pre-create a Conversion Action
 * in Google Ads first. Won't count toward Google's automatic bid
 * optimization, but is enough for audience-building/targeting.
 */
export const trackCustomEvent = (eventName, data = {}) => {
    if (!isInitialized || !window.gtag) return;

    window.gtag("event", eventName, data);
};

/**
 * Lets other files check if Google Ads is currently active
 * (useful if you need conditional UI/logic based on consent).
 */
export const isGoogleAdsActive = () => isInitialized;