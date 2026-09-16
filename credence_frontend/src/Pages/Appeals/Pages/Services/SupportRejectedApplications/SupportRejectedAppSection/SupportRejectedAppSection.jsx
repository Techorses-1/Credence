import React from "react";
import { motion } from "framer-motion";
import "./SupportRejectedAppSection.scss";

import {
    FaClock,
    FaFileAlt,
    FaTag,
    FaCheckCircle,
    FaUserCheck,
    FaShieldAlt,
    FaHeadset,
    FaBalanceScale,
    FaInfoCircle,
    FaFileContract,
    FaExclamationTriangle,
    FaSignInAlt,
    FaLock,
    FaRoute,
    FaComments,
} from "react-icons/fa";

// ===== SUPPORT FOR REJECTED APPLICATIONS — CONTENT =====
// This is the immediate-response service for a fresh negative decision —
// distinct from the formal Administrative Court / Supreme Administrative
// Court appeal services. Focus: understanding the decision, catching the
// real deadline (not always 30 days), and choosing the right next step
// before time runs out. Sourced from Migri guidance on negative decisions,
// removal decisions, and the 6 May 2025 amendments. Verify current
// deadlines and fees before shipping.

const quickFacts = [
    { icon: <FaClock />, label: "Act Within", value: "Days, Not Weeks" },
    { icon: <FaFileAlt />, label: "First Step", value: "Decision Review" },
    { icon: <FaTag />, label: "Response Options", value: "Multiple Paths" },
];

const includedItems = [
    {
        icon: <FaCheckCircle />,
        title: "Full Decision Review",
        desc: "We read your negative decision in full — including any linked denial of stay or deportation decision — and explain in plain terms what it actually means.",
    },
    {
        icon: <FaUserCheck />,
        title: "Deadline Identification",
        desc: "We identify your real, case-specific deadline. Some cases carry the usual 30-day window; asylum, accelerated, or safe-country cases can be as short as 7 days.",
    },
    {
        icon: <FaShieldAlt />,
        title: "Path Selection",
        desc: "We assess whether an appeal, a corrected new application, or another route fits your situation best — and are honest when a path won't work.",
    },
    {
        icon: <FaHeadset />,
        title: "Rights & Status Protection",
        desc: "We act to protect your right to work and remain in Finland during the response window, including filing for prohibition of enforcement where relevant.",
    },
    {
        icon: <FaBalanceScale />,
        title: "Handover to Formal Appeal",
        desc: "If court appeal is the right route, we carry your case directly into that process without losing time or continuity.",
    },
];

const requirementItems = [
    "Migri's negative decision letter, in full",
    "Any linked denial of stay or deportation decision",
    "Your current residence permit status and expiry date",
    "Valid passport and current contact details",
    "Any correspondence with Migri since the decision",
    "Power of attorney, if we are to act or represent you",
];

// ===== PROCESS FLOW — the new "flow" section =====
const processSteps = [
    {
        icon: <FaFileContract />,
        step: "01",
        title: "Understand What Was Decided",
        desc: "We review the decision to confirm exactly what was rejected, on what grounds, and whether a separate removal decision was issued alongside it.",
    },
    {
        icon: <FaExclamationTriangle />,
        step: "02",
        title: "Pin Down Your Real Deadline",
        desc: "The appeal instructions attached to your specific decision override any general rule — we confirm the exact date, which can be far shorter than 30 days.",
    },
    {
        icon: <FaRoute />,
        step: "03",
        title: "Choose the Right Path",
        desc: "We weigh appeal versus a corrected new application versus other options. Note: since May 2025, a new application no longer legalises your stay after a negative decision.",
    },
    {
        icon: <FaLock />,
        step: "04",
        title: "Protect Your Status Meanwhile",
        desc: "Where possible, we act to keep your right to work and reside intact — including a prohibition of enforcement request if removal is a risk.",
    },
    {
        icon: <FaSignInAlt />,
        step: "05",
        title: "File the Chosen Response",
        desc: "Whether that's an appeal, supplementary evidence, or another formal step, we submit it correctly and within the confirmed deadline.",
    },
    {
        icon: <FaComments />,
        step: "06",
        title: "Ongoing Guidance",
        desc: "We stay with your case as it develops, explaining each notice from Migri or the court and what it means for your options going forward.",
    },
];

const SupportRejectedAppSection = () => {
    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
    };

    const fadeUpVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    const listItemVariants = {
        hidden: { opacity: 0, x: -16 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } },
    };

    const stepVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <section className="service-content-section">
            <div className="service-content__container">
                {/* ===== HEADER / OVERVIEW ===== */}
                <motion.div
                    className="service-content__header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={containerVariants}
                >
                    <motion.span className="service-content__eyebrow" variants={fadeUpVariants}>
                        Service Overview
                    </motion.span>
                    <motion.h2 className="service-content__heading" variants={fadeUpVariants}>
                        A Rejection Is a Starting Point, Not an End
                    </motion.h2>
                    <motion.p className="service-content__intro" variants={fadeUpVariants}>
                        The days right after a negative decision matter most — deadlines
                        are often shorter than people expect, and the wrong move can
                        close off options that were still open. We step in immediately
                        to make sense of the decision and act on the right path fast.
                    </motion.p>
                </motion.div>

                {/* ===== QUICK FACTS STRIP ===== */}
                <motion.div
                    className="service-content__facts-row"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={containerVariants}
                >
                    {quickFacts.map((fact, index) => (
                        <motion.div key={index} className="service-content__fact" variants={cardVariants}>
                            <span className="service-content__fact-icon">{fact.icon}</span>
                            <div className="service-content__fact-text">
                                <span className="service-content__fact-label">{fact.label}</span>
                                <span className="service-content__fact-value">{fact.value}</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
                <p className="service-content__facts-note">
                    *Deadlines depend entirely on your specific decision and case type —
                    contact us as soon as you receive it so nothing is missed.
                </p>

                {/* ===== PROCESS FLOW (NEW SECTION) ===== */}
                <motion.div
                    className="service-content__flow"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={containerVariants}
                >
                    <motion.h3 className="service-content__block-title" variants={fadeUpVariants}>
                        How The Process Works
                    </motion.h3>

                    <div className="service-content__flow-track">
                        {processSteps.map((step, index) => (
                            <motion.div
                                key={index}
                                className="service-content__flow-step"
                                variants={stepVariants}
                            >
                                <div className="service-content__flow-step-marker">
                                    <span className="service-content__flow-step-icon">{step.icon}</span>
                                    <span className="service-content__flow-step-number">{step.step}</span>
                                </div>
                                <div className="service-content__flow-step-content">
                                    <h4 className="service-content__flow-step-title">{step.title}</h4>
                                    <p className="service-content__flow-step-desc">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ===== TWO-COLUMN: WHAT'S INCLUDED + REQUIREMENTS ===== */}
                <div className="service-content__body">
                    {/* LEFT: WHAT'S INCLUDED */}
                    <motion.div
                        className="service-content__included"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.15 }}
                        variants={containerVariants}
                    >
                        <motion.h3 className="service-content__block-title" variants={fadeUpVariants}>
                            What's Included
                        </motion.h3>

                        <div className="service-content__included-list">
                            {includedItems.map((item, index) => (
                                <motion.div
                                    key={index}
                                    className="service-content__included-item"
                                    variants={cardVariants}
                                >
                                    <span className="service-content__included-icon">{item.icon}</span>
                                    <div>
                                        <h4 className="service-content__included-title">{item.title}</h4>
                                        <p className="service-content__included-desc">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* RIGHT: REQUIREMENTS CHECKLIST */}
                    <motion.div
                        className="service-content__requirements"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={containerVariants}
                    >
                        <motion.h3 className="service-content__block-title" variants={fadeUpVariants}>
                            Documents You'll Need
                        </motion.h3>

                        <motion.div className="service-content__req-card" variants={fadeUpVariants}>
                            <ul className="service-content__req-list">
                                {requirementItems.map((item, index) => (
                                    <motion.li
                                        key={index}
                                        className="service-content__req-item"
                                        variants={listItemVariants}
                                    >
                                        <FaCheckCircle className="service-content__req-check" />
                                        <span>{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* CALLOUT NOTE */}
                        <motion.div className="service-content__callout" variants={fadeUpVariants}>
                            <FaInfoCircle className="service-content__callout-icon" />
                            <p className="service-content__callout-text">
                                Received a rejection recently? Reach out as soon as
                                possible — some case types carry deadlines as short as a
                                few days, and early action keeps every option open.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default SupportRejectedAppSection;