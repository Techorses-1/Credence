import React from 'react';
import { motion } from 'framer-motion';
import './BlogIntro.scss';

const BlogIntro = () => {
  const fadeUp = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.section
      className="blog-intro"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeIn}
    >
      <div className="blog-intro-container">
        <motion.h2
          className="blog-intro-title"
          variants={fadeUp}
        >
          Successful Cases
        </motion.h2>

        <motion.div
          className="blog-intro-content"
          variants={fadeUp}
        >
          <p className="blog-intro-text">
            J. Lad Appeals & Residence Permits is dedicated to providing professional immigration and residence permit services, helping individuals and families achieve their residency goals with confidence.
          </p>
          <p className="blog-intro-text">
            With extensive experience in residence permits and immigration appeals, we offer personalized guidance, practical solutions, and reliable support tailored to each client's unique circumstances.
          </p>
          <p className="blog-intro-text">
            We are proud to assist our clients throughout their immigration journey and remain committed to achieving the best possible outcomes in every case.
          </p>
        </motion.div>

        <motion.div
          className="blog-intro-divider"
          variants={fadeUp}
        >
          <span className="divider-line"></span>
          <span className="divider-icon">✦</span>
          <span className="divider-line"></span>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default BlogIntro;