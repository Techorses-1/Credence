import React from "react";
import { motion, useInView, animate } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import "./TrustStatSplit.scss";

import {
    FaCertificate,
    FaFileInvoiceDollar,
    FaCommentDots,
    FaUserShield,
} from "react-icons/fa";

// ===== TRUST REASONS (replace with your real reasons) =====
const trustData = [
    {
        icon: <FaCertificate />,
        title: "Licensed & Certified Experts",
        desc: "Professionals who know appeals and permit law inside out.",
    },
    {
        icon: <FaFileInvoiceDollar />,
        title: "Transparent Pricing",
        desc: "No hidden fees — you know what you're paying for.",
    },
    {
        icon: <FaCommentDots />,
        title: "Free Initial Consultation",
        desc: "Talk through your case with us before committing.",
    },
    {
        icon: <FaUserShield />,
        title: "Dedicated Case Manager",
        desc: "One point of contact who knows your case fully.",
    },
];

const TrustStatSplit = () => {
    const statRef = useRef(null);
    const isInView = useInView(statRef, { once: true, amount: 0.6 });
    const [statValue, setStatValue] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        const controls = animate(0, 98, {
            duration: 1.8,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (latest) => setStatValue(Math.round(latest)),
        });
        return () => controls.stop();
    }, [isInView]);

    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
    };

    const fadeUpVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const rowVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <section className="trust-stat-split-section">
            <div className="trust-stat-split__container">
                {/* ===== LEFT: BIG STAT ===== */}
                <motion.div
                    ref={statRef}
                    className="trust-stat-split__stat-block"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={containerVariants}
                >
                    <motion.span className="trust-stat-split__eyebrow" variants={fadeUpVariants}>
                        Why Trust Us
                    </motion.span>
                    <motion.div className="trust-stat-split__big-number" variants={fadeUpVariants}>
                        {statValue}
                        <span className="trust-stat-split__percent">%</span>
                    </motion.div>
                    <motion.p className="trust-stat-split__stat-label" variants={fadeUpVariants}>
                        Client Satisfaction Across Every Case We Handle
                    </motion.p>
                </motion.div>

                {/* ===== RIGHT: REASONS ===== */}
                <motion.div
                    className="trust-stat-split__reasons"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={containerVariants}
                >
                    {trustData.map((item, index) => (
                        <motion.div key={index} className="trust-stat-split__reason" variants={rowVariants}>
                            <span className="trust-stat-split__reason-icon">{item.icon}</span>
                            <div className="trust-stat-split__reason-text">
                                <h3 className="trust-stat-split__reason-title">{item.title}</h3>
                                <p className="trust-stat-split__reason-desc">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default TrustStatSplit;