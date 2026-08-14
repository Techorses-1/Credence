import React from 'react';
import { motion } from 'framer-motion';
import "./CTASection.scss";
import { useModal } from "../Model/ModalProvider";

const CTASection = () => {
  const { openAgreementModal } = useModal();

  const handleGetStartedClick = () => {
    openAgreementModal();
  };

  // ----- Splitted heading parts -----
  const part1 = "Finance.Freedom.";
  const part2 = "Fellows.";

  // ----- Animation variants -----
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

  const headingVariants = {
    hidden: { y: -30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.8
      }
    }
  };

  const textVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.3
      }
    }
  };

  const buttonVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.5,
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

  const shapeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 0.1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const leftShapeVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 0.1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 15,
        duration: 1
      }
    }
  };

  const rightShapeVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 0.1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 15,
        duration: 1,
        delay: 0.1
      }
    }
  };

  // ----- Letter animation with custom delay -----
  const letterVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: (custom) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: custom * 0.03,   // delay increases per letter
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  // Helper to render animated text with a starting delay offset
  const renderAnimatedText = (text, startDelay = 0) => {
    return text.split('').map((letter, index) => {
      const isGreen = letter === 'F';
      return (
        <motion.span
          key={index}
          className={isGreen ? 'cc-green' : 'cc-black'}
          variants={letterVariants}
          custom={startDelay + index}   // offset each letter's delay
          whileHover={{
            y: -5,
            transition: { type: "spring", stiffness: 300 }
          }}
        >
          {letter}
        </motion.span>
      );
    });
  };

  return (
    <motion.section 
      className="cta-credence-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Decorative shapes */}
      <motion.span 
        className="cc-shape cc-left"
        variants={leftShapeVariants}
        whileHover={{
          scale: 1.1,
          transition: { type: "spring", stiffness: 200 }
        }}
      ></motion.span>
      
      <motion.span 
        className="cc-shape cc-right"
        variants={rightShapeVariants}
        whileHover={{
          scale: 1.1,
          transition: { type: "spring", stiffness: 200, delay: 0.1 }
        }}
      ></motion.span>

      <motion.div 
        className="cc-container"
        variants={containerVariants}
      >
        {/* ---------- ANIMATED HEADING (SPLIT) ---------- */}
        <motion.h2 
          className="cc-heading"
          variants={headingVariants}
        >
          <span className="line-part line-part-1">
            {renderAnimatedText(part1, 0)}
          </span>
          <br className="mobile-break" />
          <span className="line-part line-part-2">
            {renderAnimatedText(part2, part1.length)}
          </span>
        </motion.h2>

        {/* Text */}
        <motion.p 
          className="cc-text"
          variants={textVariants}
          whileHover={{ 
            scale: 1.02,
            transition: { type: "spring", stiffness: 300 }
          }}
        >
          Stop worrying about bookkeeping errors and financial confusion.
          <br />
          Partner with Credence and experience stress‑free financial management.
        </motion.p>

        {/* Button */}
        <motion.button 
          className="cc-button" 
          onClick={handleGetStartedClick}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          GET STARTED TODAY
        </motion.button>
      </motion.div>
    </motion.section>
  );
};

export default CTASection;