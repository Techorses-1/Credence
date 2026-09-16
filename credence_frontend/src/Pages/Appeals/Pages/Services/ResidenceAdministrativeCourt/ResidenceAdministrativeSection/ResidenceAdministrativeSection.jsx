import React from "react";
import { motion } from "framer-motion";
import "./ResidenceAdministrativeSection.scss";

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
    FaSearch,
    FaGavel,
    FaHandPaper,
    FaLandmark,
    FaClipboardCheck,
    FaUniversity,
} from "react-icons/fa";

// ===== RESIDENCE PERMIT APPEALS (ADMINISTRATIVE COURT) — CONTENT =====
// Sourced from Migri and Finnish Administrative Court appeal procedure.
// Reflects the 6 May 2025 / 12 June 2026 enforcement-rule amendments —
// appealing no longer automatically halts enforcement in every case.
// Verify current deadlines and fees before shipping; these are legally
// significant and subject to change.

const quickFacts = [
    { icon: <FaClock />, label: "Appeal Deadline", value: "30 Days*" },
    { icon: <FaFileAlt />, label: "Court Handling Time", value: "3–6 Months" },
    { icon: <FaTag />, label: "Filed With", value: "Administrative Court" },
];

const includedItems = [
    {
        icon: <FaCheckCircle />,
        title: "Decision Analysis",
        desc: "We review Migri's original decision in full to identify factual errors, procedural mistakes, or overlooked evidence that support an appeal.",
    },
    {
        icon: <FaUserCheck />,
        title: "Legal Appeal Drafting",
        desc: "We structure your appeal to the Administrative Court in compliance with formatting and evidentiary standards, with clear legal arguments.",
    },
    {
        icon: <FaShieldAlt />,
        title: "Enforcement Prevention Request",
        desc: "Where relevant, we file a separate request to prohibit or suspend enforcement so you can remain in Finland while the appeal is decided.",
    },
    {
        icon: <FaHeadset />,
        title: "Case Monitoring",
        desc: "We track your case through the court, respond to any requests for clarification, and keep you informed at every stage.",
    },
    {
        icon: <FaBalanceScale />,
        title: "Next-Instance Readiness",
        desc: "If the Administrative Court rejects the appeal, we assess whether applying for permission to appeal to the Supreme Administrative Court is worthwhile.",
    },
];

const requirementItems = [
    "Migri's negative decision letter, in full",
    "Any decision on denial of admittance, stay, or deportation issued alongside it",
    "Original application documents and evidence submitted to Migri",
    "New or supplementary evidence addressing the grounds for refusal",
    "Valid passport and current contact details",
    "Power of attorney, if we are to represent you before the court",
];

// ===== PROCESS FLOW — the new "flow" section =====
const processSteps = [
    {
        icon: <FaSearch />,
        step: "01",
        title: "Review the Negative Decision",
        desc: "We examine Migri's stated grounds for refusal and check the appeal deadline stated in the decision — typically 30 days from service.",
    },
    {
        icon: <FaGavel />,
        step: "02",
        title: "File the Appeal",
        desc: "A structured, evidence-based appeal is submitted to the Administrative Court before the deadline, addressing each point of refusal.",
    },
    {
        icon: <FaHandPaper />,
        step: "03",
        title: "Request Prohibition of Enforcement",
        desc: "Since recent rule changes, an appeal does not always pause removal automatically — we file a separate request so you can stay in Finland while the case is heard, where this applies.",
    },
    {
        icon: <FaLandmark />,
        step: "04",
        title: "Court Reviews the Case",
        desc: "The Administrative Court examines the legality and evidence behind Migri's decision, and may request further clarification from either side.",
    },
    {
        icon: <FaClipboardCheck />,
        step: "05",
        title: "Court Issues Its Decision",
        desc: "The court either rejects the appeal, leaving Migri's decision in force, or returns the matter to Migri for reprocessing.",
    },
    {
        icon: <FaUniversity />,
        step: "06",
        title: "Further Appeal, If Needed",
        desc: "If the appeal is rejected, we assess whether to seek permission to appeal to the Supreme Administrative Court for a final review.",
    },
];

const ResidenceAdministrativeSection = () => {
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
                        A Negative Decision Isn't the Final Word
                    </motion.h2>
                    <motion.p className="service-content__intro" variants={fadeUpVariants}>
                        Every negative residence permit decision from Migri carries the
                        right to appeal to the Administrative Court. The process is
                        time-sensitive and legally technical — we build your case,
                        meet every deadline, and act to protect your right to stay in
                        Finland while it's reviewed.
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
                    *Deadlines are stated in your specific decision letter and can
                    differ by case type — confirm the exact date before relying on it.
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
                                Appealing does not count against you in any future
                                application — it's a legal right, and courts assess every
                                case independently of the applicant's decision to appeal.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ResidenceAdministrativeSection;