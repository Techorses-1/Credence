import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.scss";

import logoImage from "../../../assets/Images/home/logo.png";

// ===== SERVICES DATA (replace name + path with your real 6 services) =====
const servicesData = [
  { name: "Service One", path: "/services/service-one" },
  { name: "Service Two", path: "/services/service-two" },
  { name: "Service Three", path: "/services/service-three" },
  { name: "Service Four", path: "/services/service-four" },
  { name: "Service Five", path: "/services/service-five" },
  { name: "Service Six", path: "/services/service-six" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isDesktopServicesOpen, setIsDesktopServicesOpen] = useState(false);

  const desktopServicesRef = useRef(null);
  const closeTimeoutRef = useRef(null);

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

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const isServicesActive = servicesData.some((s) => isActive(s.path));

  const handleLogoClick = () => navigate("/");
  const handleNavClick = (path) => navigate(path);

  const handleDesktopServicesEnter = () => {
    clearTimeout(closeTimeoutRef.current);
    setIsDesktopServicesOpen(true);
  };
  const handleDesktopServicesLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsDesktopServicesOpen(false);
    }, 150);
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
      className="navbar-wrapper"
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
    >
      <div className="navbar">
        {/* ===== LOGO ===== */}
        <motion.div
          className="navbar-logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogoClick}
        >
          <img src={logoImage} alt="Logo" className="navbar-logo-image" />
        </motion.div>

        {/* ===== DESKTOP NAV LINKS ===== */}
        <div className="navbar-links-desktop">
          <motion.span
            className={`navbar-nav-link ${isActive("/") ? "active" : ""}`}
            onClick={() => handleNavClick("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Home
          </motion.span>

          {/* SERVICES DROPDOWN (desktop, hover) */}
          <div
            className="navbar-services-wrapper"
            ref={desktopServicesRef}
            onMouseEnter={handleDesktopServicesEnter}
            onMouseLeave={handleDesktopServicesLeave}
          >
            <motion.span
              className={`navbar-nav-link ${isServicesActive ? "active" : ""} ${isDesktopServicesOpen ? "open" : ""}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDesktopServicesOpen((prev) => !prev)}
            >
              Services
              <motion.span
                className="navbar-caret"
                animate={{ rotate: isDesktopServicesOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
              >
                ▾
              </motion.span>
            </motion.span>

            <AnimatePresence>
              {isDesktopServicesOpen && (
                <motion.div
                  className="navbar-services-dropdown"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownVariants}
                >
                  {servicesData.map((service, index) => (
                    <motion.span
                      key={index}
                      className={`navbar-services-item ${isActive(service.path) ? "active" : ""}`}
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
            className={`navbar-nav-link ${isActive("/appeals/cases") ? "active" : ""}`}
            onClick={() => handleNavClick("/appeals/cases")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Appeals &amp; Cases
          </motion.span>
        </div>

        {/* ===== HAMBURGER (mobile/tablet only) ===== */}
        <button
          className={`navbar-hamburger ${isMobileMenuOpen ? "open" : ""}`}
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
            className="navbar-mobile-menu"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
          >
            <div className="navbar-mobile-menu-inner">
              <span
                className={`navbar-mobile-link ${isActive("/") ? "active" : ""}`}
                onClick={() => handleNavClick("/")}
              >
                Home
              </span>

              {/* SERVICES (mobile, click to expand) */}
              <div className="navbar-mobile-services">
                <span
                  className={`navbar-mobile-link ${isServicesActive ? "active" : ""}`}
                  onClick={toggleMobileServices}
                >
                  Services
                  <motion.span
                    className="navbar-caret"
                    animate={{ rotate: isMobileServicesOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    ▾
                  </motion.span>
                </span>

                <AnimatePresence>
                  {isMobileServicesOpen && (
                    <motion.div
                      className="navbar-mobile-services-list"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={mobileServicesVariants}
                    >
                      {servicesData.map((service, index) => (
                        <span
                          key={index}
                          className={`navbar-mobile-services-item ${isActive(service.path) ? "active" : ""}`}
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
                className={`navbar-mobile-link ${isActive("/cases") ? "active" : ""}`}
                onClick={() => handleNavClick("/cases")}
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

export default Navbar;