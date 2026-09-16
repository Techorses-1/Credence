import React from "react";
import { motion } from "framer-motion";
import "./ImmigrationDocumentationSection.scss";

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
    FaClipboardList,
    FaLanguage,
    FaStamp,
    FaCopy,
    FaHeadphonesAlt,
    FaFolderOpen,
} from "react-icons/fa";

// ===== IMMIGRATION DOCUMENTATION & CONSULTATION — CONTENT =====
// Sourced from Migri's document, translation and legalisation
// requirements (interpretation-translation-legalisation page) and the
// Digital and Population Data Services Agency's legalisation guidance.
// Focus: getting documents into a form Migri will actually accept,
// before they're attached to any application. Verify current fees and
// country-specific exceptions before shipping.

const quickFacts = [
    { icon: <FaClock />, label: "Best Timing", value: "Before Applying" },
    { icon: <FaFileAlt />, label: "Accepted Languages", value: "FI / SV / EN" },
    { icon: <FaTag />, label: "Focus", value: "Docs + Advisory" },
];

const includedItems = [
    {
        icon: <FaCheckCircle />,
        title: "Case-Specific Document Review",
        desc: "We assess exactly which documents your permit type requires and flag anything missing, outdated, or unlikely to be accepted before you apply.",
    },
    {
        icon: <FaUserCheck />,
        title: "Authorised Translation Coordination",
        desc: "Documents not in Finnish, Swedish or English are arranged for translation by an authorised translator (auktorisoitu kääntäjä), which Migri accepts without further certification.",
    },
    {
        icon: <FaShieldAlt />,
        title: "Legalisation & Apostille Handling",
        desc: "We identify which documents need an apostille or embassy legalisation based on their country of origin — including exceptions where standard apostille rules don't apply.",
    },
    {
        icon: <FaHeadset />,
        title: "Interview & Interpreter Arrangements",
        desc: "If your case involves an interview, we help arrange a qualified interpreter — required for most permit types outside asylum cases.",
    },
    {
        icon: <FaBalanceScale />,
        title: "Pre-Submission Consultation",
        desc: "A full sit-down review of your document package and case strategy before anything is submitted to Migri.",
    },
];

const requirementItems = [
    "Valid passport and any prior permit documents",
    "Original documents or properly certified copies from the issuing authority",
    "Family-tie documents (marriage, birth certificates) if relevant to your case",
    "Any document not in Finnish, Swedish or English, for translation",
    "Documents from non-Hague Convention countries, for embassy legalisation",
    "Employment, study or income documents specific to your permit type",
];

// ===== PROCESS FLOW — the new "flow" section =====
const processSteps = [
    {
        icon: <FaClipboardList />,
        step: "01",
        title: "Case & Document Checklist",
        desc: "We map your specific permit type to the exact documents Migri requires, so nothing is missing when you apply.",
    },
    {
        icon: <FaLanguage />,
        step: "02",
        title: "Translation Where Needed",
        desc: "Anything not already in Finnish, Swedish or English is translated by an authorised translator registered with the Finnish National Agency for Education.",
    },
    {
        icon: <FaStamp />,
        step: "03",
        title: "Apostille or Legalisation",
        desc: "Documents from Hague Convention countries are apostilled; others go through embassy legalisation — with country-specific exceptions checked in advance.",
    },
    {
        icon: <FaCopy />,
        step: "04",
        title: "Certified Copies Verified",
        desc: "We confirm each copy comes from an authority permitted to issue it — Migri rejects copies certified the wrong way.",
    },
    {
        icon: <FaHeadphonesAlt />,
        step: "05",
        title: "Interpreter Arranged, If Needed",
        desc: "For cases requiring an interview, we help book a qualified interpreter ahead of the appointment.",
    },
    {
        icon: <FaFolderOpen />,
        step: "06",
        title: "Final Package Review",
        desc: "A complete consultation on the assembled document package and overall case strategy before it goes to Migri.",
    },
];

const ImmigrationDocumentationSection = () => {
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
                        Documents Migri Will Actually Accept, The First Time
                    </motion.h2>
                    <motion.p className="service-content__intro" variants={fadeUpVariants}>
                        Most delays and rejections trace back to documentation — the
                        wrong translation, a missing apostille, or a copy certified the
                        wrong way. We prepare your paperwork to Migri's exact standards
                        and advise on strategy before you ever submit.
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
                    *Legalisation requirements vary by issuing country, including some
                    exceptions to standard apostille rules — we confirm yours directly.
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
                                Not sure which of your documents even need translating or
                                legalising? That's exactly what the initial consultation is
                                for — bring what you have and we'll sort the rest.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ImmigrationDocumentationSection;