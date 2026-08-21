import React from "react";
import { motion } from "framer-motion";
import "./ServiceHero.scss";

const ServiceHero = ({
    title = "Service Name Placeholder",
    subtitle = "A short one-line description of this service goes here.",
    bgImage,
}) => {
    return (
        <motion.section
            className="service-hero"
            style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div className="service-hero-overlay"></div>
            <div className="service-hero-content">
                <motion.h1
                    className="service-hero-title"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {title}
                </motion.h1>
                <motion.p
                    className="service-hero-subtitle"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    {subtitle}
                </motion.p>
            </div>
        </motion.section>
    );
};

export default ServiceHero;