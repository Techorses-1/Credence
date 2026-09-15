import React from "react";
import { motion } from "framer-motion";
import "./ResidenceApplicationSection.scss";

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
    FaListOl,
    FaEdit,
    FaGlobeEurope,
    FaCreditCard,
    FaPassport,
    FaEnvelopeOpenText,
    FaIdCard,
} from "react-icons/fa";

// ===== RESIDENCE PERMIT APPLICATIONS — CONTENT =====
// Sourced from Migri (Finnish Immigration Service) process description.
// Update figures (fees / timelines) from Migri's live processing-times page
// before shipping — these change and are not fixed by law.

const quickFacts = [
    { icon: <FaClock />, label: "Processing Time", value: "1–4 Months*" },
    { icon: <FaFileAlt />, label: "Documents Required", value: "6+ Documents" },
    { icon: <FaTag />, label: "Applied Via", value: "Enter Finland" },
];

const includedItems = [
    {
        icon: <FaCheckCircle />,
        title: "Permit Category Assessment",
        desc: "We identify the correct route for you — work, study, family or entrepreneurship — since choosing the wrong one is the most common cause of delay.",
    },
    {
        icon: <FaUserCheck />,
        title: "Enter Finland Application Support",
        desc: "We prepare and submit your application through Migri's official Enter Finland e-service, ensuring every field and attachment meets current requirements.",
    },
    {
        icon: <FaShieldAlt />,
        title: "Document Quality Check",
        desc: "Every document is reviewed for consistency, translation and completeness before submission, to avoid rejection on technical grounds.",
    },
    {
        icon: <FaHeadset />,
        title: "Appointment Guidance",
        desc: "We help you book and prepare for your identity verification appointment at a Finnish mission or VFS Global centre.",
    },
    {
        icon: <FaBalanceScale />,
        title: "Appeal Readiness",
        desc: "If a decision is negative, we're ready to step in immediately with a structured appeal to the Administrative Court.",
    },
];

const requirementItems = [
    "Valid passport (must remain valid for the full permit duration)",
    "Purpose-of-stay proof (employment contract, study admission letter, or family tie evidence)",
    "Proof of sufficient funds for your stay",
    "Valid health/travel insurance (for most first-time applicants)",
    "Passport-sized photograph",
    "Enter Finland application fee payment receipt",
];

// ===== PROCESS FLOW — the new "flow" section =====
const processSteps = [
    {
        icon: <FaListOl />,
        step: "01",
        title: "Choose the Right Permit Category",
        desc: "We confirm whether your case falls under work, study, family or entrepreneurship — each has different criteria and forms.",
    },
    {
        icon: <FaEdit />,
        step: "02",
        title: "Submit Application via Enter Finland",
        desc: "Your application is filed through Migri's official online portal, with all supporting documents attached.",
    },
    {
        icon: <FaCreditCard />,
        step: "03",
        title: "Pay the Processing Fee",
        desc: "The applicable Migri fee is paid online at submission — required before the application can proceed.",
    },
    {
        icon: <FaPassport />,
        step: "04",
        title: "Identity Verification Appointment",
        desc: "You attend an in-person appointment at a Finnish embassy, consulate, or VFS Global centre to verify your identity and biometrics.",
    },
    {
        icon: <FaGlobeEurope />,
        step: "05",
        title: "Migri Reviews the Application",
        desc: "Migri assesses your case against entry requirements, funds, and category-specific criteria. We track status throughout.",
    },
    {
        icon: <FaEnvelopeOpenText />,
        step: "06",
        title: "Decision Issued",
        desc: "You're notified of the outcome. If approved, your residence permit card is produced; if not, we prepare next steps immediately.",
    },
];

const ResidenceApplicationSection = () => {
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
                        Residence Permit Applications, Handled From Start To Decision
                    </motion.h2>
                    <motion.p className="service-content__intro" variants={fadeUpVariants}>
                        Applying for a Finnish residence permit means navigating Migri's
                        Enter Finland system, embassy appointments, and category-specific
                        requirements. We manage the full process so nothing is missed
                        and your application is submitted in the strongest possible shape.
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
                    *Processing time varies by permit category and case load — confirm
                    current estimates on Migri's official processing-times page.
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
                                Missing a document? Don't worry — our team can guide you on
                                alternatives during your consultation.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ResidenceApplicationSection;