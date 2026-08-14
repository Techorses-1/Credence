import React from "react";
import "./Hero.scss";
import { useModal } from "../Model/ModalProvider";
import heroImage from "../../../assets/Images/hero.png";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Import Framer Motion

const Hero = () => {
  const { openAgreementModal } = useModal();
  const navigate = useNavigate();

  const handleEnrollClick = (e) => {
    e.preventDefault();
    openAgreementModal();
  };

  const handleSignInClick = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  // Animation variants
  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
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

  const contentVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        duration: 0.8,
        delay: 0.2
      }
    }
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ 
      opacity: 1, 
      y: 0,
      transition: {
        delay: i * 0.1 + 0.4,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  };

  const paragraphVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.8,
        duration: 0.6
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        delay: 1,
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    hover: {
      scale: 1.05,
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

  return (
    <section className="hero">
      {/* Background Image */}
      <div className="hero-background">
        <img 
          src={heroImage} 
          alt="Background" 
          className="hero-bg-image"
        />
      </div>
      
      {/* HERO NAVBAR - Animated */}
      <motion.div 
        className="hero-navbar-wrapper"
        initial="hidden"
        animate="visible"
        variants={navbarVariants}
      >
        <div className="hero-navbar">
          <motion.span
            className="nav-link"
            onClick={handleEnrollClick}
            style={{ cursor: 'pointer' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Enroll Now
          </motion.span>
          <motion.span 
            className="logo"
            whileHover={{ scale: 1.05 }}
          >
            CREDENCE
          </motion.span>
          <motion.span 
            className="nav-link"
            onClick={handleSignInClick}
            style={{ cursor: 'pointer' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign in
          </motion.span>
        </div>
      </motion.div>

      {/* HERO CONTENT - Animated */}
      <motion.div 
        className="hero-content"
        initial="hidden"
        animate="visible"
        variants={contentVariants}
      >
        <h1>
          <motion.span 
            className="light"
            variants={headingVariants}
            custom={0}
          >
            Clarity in
          </motion.span>
          <motion.span 
            className="dark"
            variants={headingVariants}
            custom={1}
          >
            Numbers.
          </motion.span>
          <motion.span 
            className="light"
            variants={headingVariants}
            custom={2}
          >
            Confidence in
          </motion.span>
          <motion.span 
            className="dark"
            variants={headingVariants}
            custom={3}
          >
            Decisions.
          </motion.span>
        </h1>

        <motion.p 
          className="tagline"
          variants={paragraphVariants}
        >
          Smart Bookkeeping & Financial Support for Growing Businesses!
        </motion.p>

        <motion.p 
          className="desc"
          variants={paragraphVariants}
        >
          At <b>Credence</b>, we handle your day-to-day bookkeeping and financial
          planning with accuracy and care – so you can focus on running and
          scaling your business without financial stress.
        </motion.p>

        {/* SINGLE COMBINED BUTTON - Animated */}
        <motion.div 
          className="cta-button"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <span className="left">GET A FREE</span>
          <span className="right">CONSULTATION</span>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;