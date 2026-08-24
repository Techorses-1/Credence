// services/usePageTracking.js

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView as trackMetaPageView } from "./metaPixel";
import { trackPageView as trackGooglePageView } from "./googleAds";

/**
 * Fires a PageView event (Meta + Google) every time the route changes -
 * but ONLY for routes under /appeals. All other routes (Home, Admin,
 * Client, Employee, Terms, Login, etc.) are intentionally skipped -
 * they're internal/tool pages, not public marketing pages.
 */
const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        const isAppealsRoute = location.pathname.startsWith("/appeals");

        if (!isAppealsRoute) return;

        trackMetaPageView();
        trackGooglePageView(location.pathname);
    }, [location.pathname]);
};

export default usePageTracking;