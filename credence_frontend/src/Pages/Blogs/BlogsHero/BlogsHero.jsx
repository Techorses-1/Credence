import React from 'react';
import { motion } from 'framer-motion';
import './BlogsHero.scss';

const BlogsHero = () => {
    return (
        <motion.section
            className="blogs-hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div className="blogs-hero-overlay"></div>
            <div className="blogs-hero-content">
                <motion.h1
                    className="blogs-hero-title"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                Appeals & Residence Permits
                </motion.h1>
                <motion.p
                    className="blogs-hero-subtitle"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    Insights, case studies, and legal updates from our experts
                </motion.p>
            </div>
        </motion.section>
    );
};

export default BlogsHero;