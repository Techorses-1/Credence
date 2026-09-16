import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import "./AppealsNavbar.scss";

import logoImage from "../../../assets/Images/home/logo.png";

// ===== SERVICES DATA =====
const servicesData = [
    { name: "Residence Permit Applications", path: "/appeals/services/residence-permit-applications" },
    { name: "Residence Permit Extensions & Renewals", path: "/appeals/services/residence-permit-extensions-renewals" },
    { name: "Residence Permit Appeals (Administrative Court)", path: "/appeals/services/residence-administrative-court" },
    { name: "Residence Permit Appeals (Supreme Court)", path: "/appeals/services/residence-supreme-court" },
    { name: "Support For Rejected Applications", path: "/appeals/services/support-rejected-applications" },
    { name: "Immigration Documentation & Consultation", path: "/appeals/services/immigration-documentation-consultation" },
];

const AppealsNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
    const [isDesktopServicesOpen, setIsDesktopServicesOpen] = useState(false);

    const desktopServicesRef = useRef(null);

    // ---- close desktop dropdown on outside click ----
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                desktopServicesRef.current &&
                !desktopServicesRef.current.contains(e.target)
            ) {
                setIsDesktopServicesOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ---- lock body scroll when mobile menu is open ----
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileMenuOpen]);

    // ---- close mobile menu whenever route changes ----
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsMobileServicesOpen(false);
    }, [location.pathname]);

    // ---- close desktop dropdown when route changes ----
    useEffect(() => {
        setIsDesktopServicesOpen(false);
    }, [location.pathname]);

    const isActive = (path) => {
        if (path === "/appeals") return location.pathname === "/appeals";
        return location.pathname === path || location.pathname.startsWith(path + "/");
    };

    const isServicesActive = servicesData.some((s) => isActive(s.path));

    const handleLogoClick = () => navigate("/appeals");
    const handleNavClick = (path) => {
        navigate(path);
        setIsDesktopServicesOpen(false); // Close dropdown after navigation
    };

    // ---- DESKTOP: click toggle only (NO HOVER) ----
    const handleDesktopServicesClick = (e) => {
        e.stopPropagation();
        setIsDesktopServicesOpen((prev) => !prev);
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
    const toggleMobileServices = () => setIsMobileServicesOpen((prev) => !prev);

    // ===== ANIMATION VARIANTS =====
    const navbarVariants = {
        hidden: { y: -50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 20, duration: 0.6 },
        },
    };

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.2, ease: "easeOut" },
        },
        exit: {
            opacity: 0,
            y: -10,
            scale: 0.98,
            transition: { duration: 0.15, ease: "easeIn" },
        },
    };

    const mobileMenuVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: {
            opacity: 1,
            height: "auto",
            transition: { duration: 0.3, ease: "easeOut" },
        },
        exit: {
            opacity: 0,
            height: 0,
            transition: { duration: 0.25, ease: "easeIn" },
        },
    };

    const mobileServicesVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: {
            opacity: 1,
            height: "auto",
            transition: { duration: 0.25, ease: "easeOut" },
        },
        exit: {
            opacity: 0,
            height: 0,
            transition: { duration: 0.2, ease: "easeIn" },
        },
    };

    return (
        <motion.div
            className="appeals-navbar-wrapper"
            initial="hidden"
            animate="visible"
            variants={navbarVariants}
        >
            <div className="appeals-navbar">
                {/* ===== LOGO ===== */}
                <motion.div
                    className="appeals-navbar-logo"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogoClick}
                >
                    <img src={logoImage} alt="Logo" className="appeals-navbar-logo-image" />
                </motion.div>

                {/* ===== DESKTOP NAV LINKS ===== */}
                <div className="appeals-navbar-links-desktop">
                    <motion.span
                        className={`appeals-navbar-nav-link ${isActive("/appeals") ? "active" : ""}`}
                        onClick={() => handleNavClick("/appeals")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Home
                    </motion.span>

                    {/* SERVICES DROPDOWN (desktop, click only) */}
                    <div
                        className="appeals-navbar-services-wrapper"
                        ref={desktopServicesRef}
                    >
                        <motion.span
                            className={`appeals-navbar-nav-link ${isServicesActive || isDesktopServicesOpen ? "active" : ""
                                } ${isDesktopServicesOpen ? "open" : ""}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDesktopServicesClick}
                        >
                            Services
                            <motion.span
                                className="appeals-navbar-caret"
                                animate={{ rotate: isDesktopServicesOpen ? 180 : 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <FaChevronDown />
                            </motion.span>
                        </motion.span>

                        <AnimatePresence>
                            {isDesktopServicesOpen && (
                                <motion.div
                                    className="appeals-navbar-services-dropdown"
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    variants={dropdownVariants}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {servicesData.map((service, index) => (
                                        <motion.span
                                            key={index}
                                            className={`appeals-navbar-services-item ${isActive(service.path) ? "active" : ""}`}
                                            onClick={() => handleNavClick(service.path)}
                                            whileHover={{ x: 4 }}
                                        >
                                            {service.name}
                                        </motion.span>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.span
                        className={`appeals-navbar-nav-link ${isActive("/appeals/cases") ? "active" : ""}`}
                        onClick={() => handleNavClick("/appeals/cases")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Appeals &amp; Cases
                    </motion.span>
                </div>

                {/* ===== HAMBURGER (mobile/tablet only) ===== */}
                <button
                    className={`appeals-navbar-hamburger ${isMobileMenuOpen ? "open" : ""}`}
                    onClick={toggleMobileMenu}
                    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isMobileMenuOpen}
                >
                    <span className="hamburger-line line-1"></span>
                    <span className="hamburger-line line-2"></span>
                    <span className="hamburger-line line-3"></span>
                </button>
            </div>

            {/* ===== MOBILE MENU ===== */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="appeals-navbar-mobile-menu"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={mobileMenuVariants}
                    >
                        <div className="appeals-navbar-mobile-menu-inner">
                            <span
                                className={`appeals-navbar-mobile-link ${isActive("/appeals") ? "active" : ""}`}
                                onClick={() => handleNavClick("/appeals")}
                            >
                                Home
                            </span>

                            {/* SERVICES (mobile, click to expand) */}
                            <div className="appeals-navbar-mobile-services">
                                <span
                                    className={`appeals-navbar-mobile-link ${isServicesActive ? "active" : ""}`}
                                    onClick={toggleMobileServices}
                                >
                                    Services
                                    <motion.span
                                        className="appeals-navbar-caret"
                                        animate={{ rotate: isMobileServicesOpen ? 180 : 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <FaChevronDown />
                                    </motion.span>
                                </span>

                                <AnimatePresence>
                                    {isMobileServicesOpen && (
                                        <motion.div
                                            className="appeals-navbar-mobile-services-list"
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            variants={mobileServicesVariants}
                                        >
                                            {servicesData.map((service, index) => (
                                                <span
                                                    key={index}
                                                    className={`appeals-navbar-mobile-services-item ${isActive(service.path) ? "active" : ""}`}
                                                    onClick={() => handleNavClick(service.path)}
                                                >
                                                    {service.name}
                                                </span>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <span
                                className={`appeals-navbar-mobile-link ${isActive("/appeals/cases") ? "active" : ""}`}
                                onClick={() => handleNavClick("/appeals/cases")}
                            >
                                Appeals &amp; Cases
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AppealsNavbar;