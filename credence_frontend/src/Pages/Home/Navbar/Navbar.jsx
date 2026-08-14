import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useModal } from "../Model/ModalProvider";
import "./Navbar.scss";

import logoImage from "../../../assets/Images/home/logo.png";

const Navbar = () => {
  const { openAgreementModal } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  const handleEnrollClick = (e) => {
    e.preventDefault();
    openAgreementModal();
  };

  const handleSignInClick = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  const handleCasesClick = (e) => {
    e.preventDefault();
    navigate("/cases");
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate("/");
  };

  const isCasesActive = location.pathname === "/cases" || location.pathname.startsWith("/cases/");

  const navbarVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.6
      }
    }
  };

  return (
    <motion.div
      className="navbar-wrapper"
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
    >
      <div className="navbar">
        <div className="navbar-left">
          <motion.div
            className="navbar-logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={logoImage}
              alt="Credence Logo"
              className="navbar-logo-image"
            />
          </motion.div>
          <motion.span
            className={`navbar-cases-link ${isCasesActive ? "active" : ""}`}
            onClick={handleCasesClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="desktop-text">Appeals & Residence Permits</span>
            <span className="mobile-text">
              Residence Permits<br />& Appeals
            </span>
          </motion.span>
        </div>

        <div className="navbar-buttons">
          <motion.span
            className="navbar-nav-link"
            onClick={handleEnrollClick}
            style={{ cursor: 'pointer' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Enroll Now</span>
          </motion.span>
          <motion.span
            className="navbar-nav-link"
            onClick={handleSignInClick}
            style={{ cursor: 'pointer' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign in
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;