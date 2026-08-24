// services/PageTracker.jsx

import usePageTracking from "./usePageTracking";

/**
 * Renders nothing. Its only job is to sit INSIDE <BrowserRouter>
 * so usePageTracking() has access to route context (useLocation),
 * since App.jsx's top level sits above BrowserRouter.
 */
const PageTracker = () => {
    usePageTracking();
    return null;
};

export default PageTracker;