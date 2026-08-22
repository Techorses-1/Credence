// services/metaPixel.js
// npm install react-facebook-pixel

import ReactPixel from "react-facebook-pixel";

const PIXEL_ID = process.env.REACT_APP_META_PIXEL_ID;

let isInitialized = false;

/**
 * Initializes Meta Pixel. Call this ONLY after user accepts cookie consent.
 * Safe to call multiple times - will not re-init if already done.
 */
export const initMetaPixel = () => {
    if (isInitialized) return;

    if (!PIXEL_ID) {
        console.warn("Meta Pixel ID is missing in .env (REACT_APP_META_PIXEL_ID)");
        return;
    }

    const options = {
        autoConfig: true,
        debug: false,
    };

    ReactPixel.init(PIXEL_ID, undefined, options);
    isInitialized = true;

    // fire the first PageView immediately after init
    ReactPixel.pageView();
};

/**
 * Call this on every route change (from your route-tracking hook).
 * Does nothing if Pixel was never initialized (i.e. consent not given).
 */
export const trackPageView = () => {
    if (!isInitialized) return;
    ReactPixel.pageView();
};

/**
 * Standard Meta events - use these when the action matches
 * a Facebook-recognized event type.
 * name examples: "Lead", "Contact", "ViewContent", "Schedule",
 *                "CompleteRegistration", "Purchase"
 */
export const trackStandardEvent = (name, data = {}) => {
    if (!isInitialized) return;
    ReactPixel.track(name, data);
};

/**
 * Custom events - use these for anything Facebook doesn't have
 * a predefined name for.
 * name examples: "WhatsAppClick", "Read5Minutes", "Read90Percent"
 */
export const trackCustomEvent = (name, data = {}) => {
    if (!isInitialized) return;
    ReactPixel.trackCustom(name, data);
};

/**
 * Lets other files check if Pixel is currently active
 * (useful if you need conditional UI/logic based on consent).
 */
export const isPixelActive = () => isInitialized;