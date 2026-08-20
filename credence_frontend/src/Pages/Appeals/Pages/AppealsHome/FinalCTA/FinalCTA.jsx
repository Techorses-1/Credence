import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./FinalCTA.scss";

const FinalCTA = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
    };

    const fadeUpVariants = {
        hidden: { opacity: 0, y: 26 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: "easeOut" },
        },
    };

    const ctaVariants = {
        hidden: { opacity: 0, y: 18, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring", stiffness: 180, damping: 16, delay: 0.1 },
        },
    };

    const shapeLeftVariants = {
        hidden: { x: -80, opacity: 0 },
        visible: {
            x: 0,
            opacity: 0.12,
            transition: { type: "spring", stiffness: 50, damping: 16, duration: 1 },
        },
    };

    const shapeRightVariants = {
        hidden: { x: 80, opacity: 0 },
        visible: {
            x: 0,
            opacity: 0.12,
            transition: { type: "spring", stiffness: 50, damping: 16, duration: 1, delay: 0.1 },
        },
    };

    return (
        <motion.section
            className="final-cta-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
        >
            {/* ===== DECORATIVE SHAPES ===== */}
            <motion.span className="final-cta__shape final-cta__shape--left" variants={shapeLeftVariants}></motion.span>
            <motion.span className="final-cta__shape final-cta__shape--right" variants={shapeRightVariants}></motion.span>

            <motion.div className="final-cta__container" variants={containerVariants}>
                <motion.span className="final-cta__eyebrow" variants={fadeUpVariants}>
                    Get Started Today
                </motion.span>

                <motion.h2 className="final-cta__heading" variants={fadeUpVariants}>
                    Ready to Move Your <span className="final-cta__heading-accent">Case Forward?</span>
                </motion.h2>

                <motion.p className="final-cta__subtitle" variants={fadeUpVariants}>
                    Talk to our team today and get clear, honest guidance on your
                    next step - no pressure, no obligation.
                </motion.p>

                <motion.div className="final-cta__btn-group" variants={ctaVariants}>
                    <motion.button
                        className="final-cta__btn final-cta__btn--primary"
                        onClick={() => navigate("/cases")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Book Free Consultation
                    </motion.button>
                    <motion.button
                        className="final-cta__btn final-cta__btn--secondary"
                        onClick={() => navigate("/services")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Explore Services
                    </motion.button>
                </motion.div>
            </motion.div>
        </motion.section>
    );
};

export default FinalCTA;