import React from 'react'
import { motion } from 'framer-motion';
import "./AboutCredence.scss";

const AboutCredence = () => {
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

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
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

  const underlineVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.2
      }
    }
  };

  const paragraphVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const quoteVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 15,
        delay: 0.5
      }
    }
  };

  const decorVariants = {
    hidden: { 
      scale: 0.8, 
      opacity: 0,
      rotate: 0
    },
    visible: {
      scale: 1,
      opacity: 0.1,
      rotate: [15, 15], // Keep the rotation as in CSS
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: 0.3
      }
    }
  };

  const decorRightVariants = {
    hidden: { 
      scale: 0.8, 
      opacity: 0,
      rotate: 0
    },
    visible: {
      scale: 1,
      opacity: 0.1,
      rotate: [-15, -15], // Keep the rotation as in CSS
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: 0.3
      }
    }
  };

  return (
    <motion.section 
      className="about-credence"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      {/* Left decoration circle with animation */}
      <motion.span 
        className="decor-left"
        variants={decorVariants}
      ></motion.span>
      
      {/* Right decoration circle with animation */}
      <motion.span 
        className="decor-right"
        variants={decorRightVariants}
      ></motion.span>

      <motion.div 
        className="about-container"
        variants={containerVariants}
      >
        {/* Main heading with animation */}
        <motion.h2 
          variants={titleVariants}
          custom={0}
        >
          About Credence
        </motion.h2>
        
        {/* Animated underline */}
        <motion.div 
          className="underline"
          variants={underlineVariants}
        ></motion.div>

        {/* Subheading with staggered animation */}
        <motion.h3 
          variants={itemVariants}
          custom={1}
        >
          Your Trusted Partner in Bookkeeping & Financial Management
        </motion.h3>

        {/* FIRST PARAGRAPH - NO underline effect, just plain text */}
        <motion.p 
          className="no-underline-paragraph"
          variants={paragraphVariants}
          custom={2}
        >
          Launching or expanding a business in Finland requires local expertise, regulatory compliance, and reliable financial management. Our Finland-based specialists provide end-to-end business support tailored to both local and foreign entrepreneurs.
        </motion.p>

        {/* SECOND PARAGRAPH - KEEP underline effect with bold words */}
        <motion.p 
          className="underline-paragraph"
          variants={paragraphVariants}
          custom={3}
        >
          With deep knowledge of <b>Finnish laws</b>, <b>tax systems</b>, and reporting requirements, we ensure your company operates smoothly from day one.
        </motion.p>

        {/* Quote with special animation */}
        <motion.em 
          variants={quoteVariants}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          "Keeping your finance in balance"
        </motion.em>
      </motion.div>
    </motion.section>
  );
};

export default AboutCredence;