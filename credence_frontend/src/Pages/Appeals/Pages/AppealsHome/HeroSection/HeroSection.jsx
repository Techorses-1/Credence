import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./HeroSection.scss";

// Placeholder hero image (Unsplash, free license) — swap with your own asset later
const heroImage = "https://images.unsplash.com/photo-1767972159871-b9f5d320be2b?auto=format&fit=crop&w=1600&q=80";

const HeroSection = () => {
  const navigate = useNavigate();

  const headingLine1 = "We Fight For".split(" ");
  const headingLine2 = "Your Case.".split(" ");

  // ===== ANIMATION VARIANTS =====
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const eyebrowVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut", delay: 0.15 },
    },
  };

  const ctaVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 180, damping: 16, delay: 0.15 },
    },
  };

  const imageWrapperVariants = {
    hidden: { clipPath: "inset(0 0 100% 0)", opacity: 0.6 },
    visible: {
      clipPath: "inset(0 0 0% 0)",
      opacity: 1,
      transition: { duration: 1, ease: [0.65, 0, 0.35, 1], delay: 0.25 },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 16, delay: 1 },
    },
  };

  return (
    <section className="hero-section">
      <div className="hero-section__container">
        {/* ===== LEFT: TEXT ===== */}
        <motion.div
          className="hero-section__content"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.span className="hero-section__eyebrow" variants={eyebrowVariants}>
            Appeals &amp; Residence Permits
          </motion.span>

          <h1 className="hero-section__heading">
            <span className="hero-section__heading-line">
              {headingLine1.map((word, i) => (
                <motion.span
                  key={`l1-${i}`}
                  className="hero-section__word hero-section__word--light"
                  variants={wordVariants}
                >
                  {word}
                  {i !== headingLine1.length - 1 ? "\u00A0" : ""}
                </motion.span>
              ))}
            </span>
            <span className="hero-section__heading-line">
              {headingLine2.map((word, i) => (
                <motion.span
                  key={`l2-${i}`}
                  className="hero-section__word hero-section__word--dark"
                  variants={wordVariants}
                >
                  {word}
                  {i !== headingLine2.length - 1 ? "\u00A0" : ""}
                </motion.span>
              ))}
            </span>
          </h1>

          <motion.p className="hero-section__subtitle" variants={subtitleVariants}>
            From residence permit applications to complex appeal cases, our
            team guides you through every step with clear advice and
            dedicated representation - so you always know where your case
            stands.
          </motion.p>

          <motion.div className="hero-section__cta-group" variants={ctaVariants}>
            <motion.button
              className="hero-section__btn hero-section__btn--primary"
              onClick={() => navigate("/cases")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Case
            </motion.button>
            {/* <motion.button
              className="hero-section__btn hero-section__btn--secondary"
              onClick={() => navigate("/services")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Services
            </motion.button> */}
          </motion.div>
        </motion.div>

        {/* ===== RIGHT: IMAGE ===== */}
        <div className="hero-section__visual">
          <motion.div
            className="hero-section__image-wrapper"
            initial="hidden"
            animate="visible"
            variants={imageWrapperVariants}
          >
            <img
              src={heroImage}
              alt="Legal consultation"
              className="hero-section__image"
            />
          </motion.div>

          <motion.div
            className="hero-section__badge"
            initial="hidden"
            animate="visible"
            variants={badgeVariants}
          >
            <span className="hero-section__badge-dot"></span>
            <span className="hero-section__badge-text">
              Trusted case guidance, every step
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;