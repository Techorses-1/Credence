import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./TrustAccordion.scss";

import {
    FaCertificate,
    FaFileInvoiceDollar,
    FaCommentDots,
    FaLock,
    FaUserShield,
    FaChevronDown,  // 👈 ADD THIS
} from "react-icons/fa";

// ===== TRUST REASONS (replace with your real reasons) =====
const trustData = [
    {
        icon: <FaCertificate />,
        title: "Licensed & Certified Experts",
        desc: "Every case is handled by professionals with deep, verified experience in appeals and residence permit law — not generalists.",
    },
    {
        icon: <FaFileInvoiceDollar />,
        title: "Transparent Pricing",
        desc: "You'll know the full cost upfront. No hidden fees, no surprise charges added midway through your case.",
    },
    {
        icon: <FaCommentDots />,
        title: "Free Initial Consultation",
        desc: "Before committing to anything, you can talk through your situation with us — completely free of charge.",
    },
    {
        icon: <FaLock />,
        title: "100% Confidential",
        desc: "Your documents and personal information are stored securely and handled with strict confidentiality at every step.",
    },
    {
        icon: <FaUserShield />,
        title: "Dedicated Case Manager",
        desc: "One consistent point of contact who knows your case in full — no repeating your story to someone new each time.",
    },
];

const TrustAccordion = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const toggle = (index) => {
        setOpenIndex((prev) => (prev === index ? -1 : index));
    };

    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
    };

    const headerVariants = {
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 18 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
    };

    const panelVariants = {
        hidden: { height: 0, opacity: 0 },
        visible: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { height: 0, opacity: 0, transition: { duration: 0.25, ease: "easeIn" } },
    };

    return (
        <section className="trust-accordion-section">
            <div className="trust-accordion__container">
                <motion.div
                    className="trust-accordion__header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={headerVariants}
                >
                    <span className="trust-accordion__eyebrow">Why Trust Us</span>
                    <h2 className="trust-accordion__heading">Every Reason To Choose Us</h2>
                </motion.div>

                <motion.div
                    className="trust-accordion__list"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={containerVariants}
                >
                    {trustData.map((item, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <motion.div
                                key={index}
                                className={`trust-accordion__row ${isOpen ? "open" : ""}`}
                                variants={rowVariants}
                            >
                                <button
                                    className="trust-accordion__row-header"
                                    onClick={() => toggle(index)}
                                    aria-expanded={isOpen}
                                >
                                    <span className="trust-accordion__row-icon">{item.icon}</span>
                                    <span className="trust-accordion__row-title">{item.title}</span>
                                    <motion.span
                                        className="trust-accordion__row-caret"
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <FaChevronDown />  {/* 👈 REPLACED ▾ WITH ICON */}
                                    </motion.span>
                                </button>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            className="trust-accordion__row-panel"
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            variants={panelVariants}
                                        >
                                            <p className="trust-accordion__row-desc">{item.desc}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};

export default TrustAccordion;