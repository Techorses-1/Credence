// MaintenanceComponent.jsx
import React from "react";
import { motion } from "framer-motion";
import "./MaintenanceComponent.scss";

// Import your logo (same path as your Navbar)
import logoImage from "../../assets/Images/home/logo.png";

const MaintenanceComponent = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    }
  };

  const titleVariants = {
    hidden: { y: -30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 10,
        duration: 0.7
      }
    }
  };

  const timerVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 12,
        delay: 0.3
      }
    }
  };

  const messageVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.5
      }
    }
  };

  const buttonVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.7
      }
    },
    hover: {
      scale: 1.05,
      backgroundColor: "#7cd64b",
      color: "#ffffff",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95
    }
  };

  const decorVariants = {
    hidden: { scale: 0.8, opacity: 0, rotate: 0 },
    visible: {
      scale: 1,
      opacity: 0.08,
      rotate: [15, 15],
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: 0.2
      }
    }
  };

  const decorRightVariants = {
    hidden: { scale: 0.8, opacity: 0, rotate: 0 },
    visible: {
      scale: 1,
      opacity: 0.08,
      rotate: [-15, -15],
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: 0.2
      }
    }
  };

  // Handle refresh / retry
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <motion.section
      className="maintenance-wrapper"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Decoration circles (same as AboutCredence) */}
      <motion.span
        className="maintenance-decor-left"
        variants={decorVariants}
      ></motion.span>
      <motion.span
        className="maintenance-decor-right"
        variants={decorRightVariants}
      ></motion.span>

      <div className="maintenance-container">
        {/* Logo with animation */}
        <motion.div
          className="maintenance-logo"
          variants={logoVariants}
        >
          <img
            src={logoImage}
            alt="Credence Logo"
            className="maintenance-logo-image"
          />
        </motion.div>

        {/* Main Title */}
        <motion.h1
          className="maintenance-title"
          variants={titleVariants}
        >
          Site Under Maintenance
        </motion.h1>

        {/* Underline (same as AboutCredence) */}
        <motion.div
          className="maintenance-underline"
          variants={titleVariants}
        ></motion.div>

        {/* Timer / Duration Message */}
        <motion.div
          className="maintenance-timer"
          variants={timerVariants}
        >
          <span className="timer-icon">⏳</span>
          <span className="timer-text">We'll be back in</span>
          <span className="timer-hours">2 Hour</span>
        </motion.div>

        {/* Thank You Message */}
        <motion.p
          className="maintenance-message"
          variants={messageVariants}
        >
          Thank you for your cooperation and understanding.
          <br />
          Our team is working hard to bring the site back online.
        </motion.p>

        {/* Optional Refresh Button */}
        <motion.button
          className="maintenance-button"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={handleRefresh}
        >
          Check Again
        </motion.button>
      </div>
    </motion.section>
  );
};

export default MaintenanceComponent;