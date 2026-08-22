import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Home from "../Home/Home";
import "./HomeGate.scss";

import { FaCalculator, FaBalanceScale, FaArrowRight } from "react-icons/fa";

const HomeGate = () => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);

    const handleAccountingClick = () => {
        setSelected("accounting");
    };

    const handleAppealsClick = () => {
        navigate("/appeals");
    };

    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
    };

    const fadeUpVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring", stiffness: 140, damping: 16 },
        },
    };

    const gateExitVariants = {
        exit: {
            opacity: 0,
            transition: { duration: 0.5, ease: "easeInOut" },
        },
    };

    // Once "Accounting" is chosen, reveal the real Home page on this same route
    if (selected === "accounting") {
        return <Home />;
    }

    return (
        <AnimatePresence>
            <motion.div
                className="home-gate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit="exit"
                variants={gateExitVariants}
            >
                <motion.div
                    className="home-gate__container"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.span className="home-gate__eyebrow" variants={fadeUpVariants}>
                        Welcome
                    </motion.span>

                    <motion.h1 className="home-gate__heading" variants={fadeUpVariants}>
                        What Can We Help You With Today?
                    </motion.h1>

                    <motion.p className="home-gate__subtitle" variants={fadeUpVariants}>
                        Choose an option below to continue to the right service for you.
                    </motion.p>

                    <motion.div className="home-gate__cards" variants={containerVariants}>
                        {/* ===== ACCOUNTING CARD ===== */}
                        <motion.button
                            className="home-gate__card"
                            variants={cardVariants}
                            whileHover={{ y: -8 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAccountingClick}
                        >
                            <span className="home-gate__card-icon">
                                <FaCalculator />
                            </span>
                            <h2 className="home-gate__card-title">Accounting</h2>
                            <p className="home-gate__card-desc">
                                Business formation, bookkeeping, tax filing, and financial
                                management services.
                            </p>
                            <span className="home-gate__card-cta">
                                Continue <FaArrowRight />
                            </span>
                        </motion.button>

                        {/* ===== APPEALS CARD ===== */}
                        <motion.button
                            className="home-gate__card"
                            variants={cardVariants}
                            whileHover={{ y: -8 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAppealsClick}
                        >
                            <span className="home-gate__card-icon">
                                <FaBalanceScale />
                            </span>
                            <h2 className="home-gate__card-title">Appeals</h2>
                            <p className="home-gate__card-desc">
                                Residence permits, appeals, and case support with dedicated
                                legal guidance.
                            </p>
                            <span className="home-gate__card-cta">
                                Continue <FaArrowRight />
                            </span>
                        </motion.button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default HomeGate;