import React from "react";
import { motion } from "framer-motion";
import "./ResidenceSupremeSection.scss";

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
    FaFileSignature,
    FaHandPaper,
    FaGavel,
    FaFlagCheckered,
    FaStamp,
} from "react-icons/fa";

// ===== RESIDENCE PERMIT APPEALS (SUPREME ADMINISTRATIVE COURT) — CONTENT =====
// Sourced from the Supreme Administrative Court of Finland (Korkein
// hallinto-oikeus / KHO) — the correct final-instance court for
// residence permit cases (distinct from the Supreme Court / KKO, which
// handles civil and criminal matters only). Most cases here require
// "leave to appeal" (valituslupa) before the substance is reviewed.
// Verify current deadlines and fees before shipping.

const quickFacts = [
    { icon: <FaClock />, label: "Filing Deadline", value: "30 Days*" },
    { icon: <FaFileAlt />, label: "Requires", value: "Leave to Appeal" },
    { icon: <FaTag />, label: "Filed With", value: "Supreme Admin. Court" },
];

const includedItems = [
    {
        icon: <FaCheckCircle />,
        title: "Leave-to-Appeal Assessment",
        desc: "We evaluate whether your case has genuine grounds — either a precedent-setting legal question or a manifest error in the Administrative Court's ruling.",
    },
    {
        icon: <FaUserCheck />,
        title: "Application & Petition Drafting",
        desc: "We prepare the combined application for leave to appeal and petition of appeal, following the Supreme Administrative Court's strict formatting requirements.",
    },
    {
        icon: <FaShieldAlt />,
        title: "Stay of Execution Request",
        desc: "Where removal is a risk, we request that enforcement be stayed while the court decides on leave to appeal — this is not automatic and must be argued for.",
    },
    {
        icon: <FaHeadset />,
        title: "Case Correspondence",
        desc: "All communication with the court registry is handled on your behalf, including secure submissions and responses to any requests.",
    },
    {
        icon: <FaBalanceScale />,
        title: "Final-Instance Guidance",
        desc: "We explain what a decision at this level means for your case, since the Supreme Administrative Court's ruling is final within Finland's domestic courts.",
    },
];

const requirementItems = [
    "The Administrative Court's decision being appealed, in full",
    "Migri's original decision and all prior appeal documents",
    "Legal grounds for leave to appeal (precedent value or manifest error)",
    "Any new evidence relevant to those specific grounds",
    "Valid passport and current contact details",
    "Power of attorney, if we are to represent you before the court",
];

// ===== PROCESS FLOW — the new "flow" section =====
const processSteps = [
    {
        icon: <FaSearch />,
        step: "01",
        title: "Assess Grounds for Leave to Appeal",
        desc: "Most cases need leave to appeal — granted mainly where the case sets legal precedent, or where the lower court made a manifest error.",
    },
    {
        icon: <FaFileSignature />,
        step: "02",
        title: "File Application & Petition of Appeal",
        desc: "The application for leave to appeal is submitted together with the petition of appeal, within the deadline stated in the Administrative Court's decision.",
    },
    {
        icon: <FaHandPaper />,
        step: "03",
        title: "Request a Stay of Execution",
        desc: "If removal is possible while the case is pending, we ask the court to stay enforcement — this protection must be requested, not assumed.",
    },
    {
        icon: <FaGavel />,
        step: "04",
        title: "Court Decides on Leave to Appeal",
        desc: "The Supreme Administrative Court first decides only whether to grant leave. Many cases are not subject to this requirement and proceed straight to review.",
    },
    {
        icon: <FaFlagCheckered />,
        step: "05",
        title: "Substantive Review, If Granted",
        desc: "If leave is granted (or not required), the court examines the legality of the case in full, including the Administrative Court's handling of it.",
    },
    {
        icon: <FaStamp />,
        step: "06",
        title: "Final Decision",
        desc: "The Supreme Administrative Court's ruling is the last domestic instance — it either upholds the earlier decision or changes the outcome.",
    },
];

const ResidenceSupremeSection = () => {
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
                        Taking Your Case to Finland's Highest Administrative Court
                    </motion.h2>
                    <motion.p className="service-content__intro" variants={fadeUpVariants}>
                        When the Administrative Court rejects an appeal, the Supreme
                        Administrative Court (Korkein hallinto-oikeus) is the final
                        domestic instance. Most cases first require leave to appeal —
                        we assess your grounds honestly and build the strongest
                        possible case before this court.
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
                    *Deadlines are stated in the Administrative Court's decision and
                    can differ by case type — confirm the exact date before relying on it.
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
                                Not every case qualifies for leave to appeal — we'll give
                                you an honest assessment of your chances before any filing,
                                so effort goes only where it can make a difference.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ResidenceSupremeSection;