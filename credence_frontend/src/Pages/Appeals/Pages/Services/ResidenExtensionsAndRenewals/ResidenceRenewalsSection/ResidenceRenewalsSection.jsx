import React from "react";
import { motion } from "framer-motion";
import "./ResidenceRenewalsSection.scss";

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
    FaCalendarCheck,
    FaEdit,
    FaMoneyCheckAlt,
    FaFingerprint,
    FaCreditCard,
    FaEnvelopeOpenText,
} from "react-icons/fa";

// ===== RESIDENCE PERMIT EXTENSIONS & RENEWALS — CONTENT =====
// Sourced from Migri (Finnish Immigration Service): "Extended permit" and
// "Renewal of a residence permit card" processes. Update figures (fees /
// timelines) from Migri's live processing-times page before shipping.

const quickFacts = [
    { icon: <FaClock />, label: "Apply Before", value: "Permit Expires" },
    { icon: <FaFileAlt />, label: "Best Timing", value: "~2 Months Prior" },
    { icon: <FaTag />, label: "Applied Via", value: "Enter Finland" },
];

const includedItems = [
    {
        icon: <FaCheckCircle />,
        title: "Timing & Eligibility Check",
        desc: "We confirm you still meet the requirements of your current permit and identify the right moment to apply — too early or too late can both cause issues.",
    },
    {
        icon: <FaUserCheck />,
        title: "Extended Permit Application",
        desc: "We prepare and submit your extension through Enter Finland, reusing prior application details where possible to speed things up.",
    },
    {
        icon: <FaShieldAlt />,
        title: "Continuity Protection",
        desc: "We make sure your application is filed in time so your right to reside and work in Finland continues uninterrupted while it's processed.",
    },
    {
        icon: <FaHeadset />,
        title: "Identification Guidance",
        desc: "We check whether you qualify for e-identification (no visit needed) or must book a service point appointment for fingerprints.",
    },
    {
        icon: <FaBalanceScale />,
        title: "Appeal Readiness",
        desc: "If your extension is refused, we're ready to act immediately — you may remain in Finland while an appeal is pending.",
    },
];

const requirementItems = [
    "Valid passport from your country of nationality",
    "Current or most recently held residence permit details",
    "Updated purpose-of-stay evidence (employer, studies, or family ties) if changed",
    "Passport-sized photograph (or photo retrieval code)",
    "Processing fee payment",
    "Residence permit card, if it is lost, stolen or damaged (separate renewal)",
];

// ===== PROCESS FLOW — the new "flow" section =====
const processSteps = [
    {
        icon: <FaCalendarCheck />,
        step: "01",
        title: "Confirm the Right Time to Apply",
        desc: "Apply before your current permit expires — ideally around 2 months prior, and not earlier than 3 months before expiry.",
    },
    {
        icon: <FaEdit />,
        step: "02",
        title: "Submit the Extension in Enter Finland",
        desc: "The extended permit application is filed online, often building on your previous application's details.",
    },
    {
        icon: <FaMoneyCheckAlt />,
        step: "03",
        title: "Income Data Checked Automatically",
        desc: "Migri retrieves salary and benefit information directly from the Incomes Register, so no separate salary certificates are needed in most cases.",
    },
    {
        icon: <FaFingerprint />,
        step: "04",
        title: "Identity Check (If Required)",
        desc: "If you log in with strong Finnish e-identification, a service point visit may not be needed. Otherwise, an appointment is booked for fingerprints.",
    },
    {
        icon: <FaCreditCard />,
        step: "05",
        title: "Pay the Processing Fee",
        desc: "The fee is paid online in Enter Finland, or at the service point if visiting in person.",
    },
    {
        icon: <FaEnvelopeOpenText />,
        step: "06",
        title: "Decision — Your Status Stays Valid",
        desc: "Your right to reside and work continues unchanged while the application is processed. You're notified once Migri issues its decision.",
    },
];

const ResidenceRenewalsSection = () => {
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
                        Keep Your Right To Stay In Finland Without Interruption
                    </motion.h2>
                    <motion.p className="service-content__intro" variants={fadeUpVariants}>
                        Extending or renewing a Finnish residence permit has its own
                        timing rules and shortcuts compared to a first application —
                        miss the window and you risk losing your legal status. We handle
                        the filing, timing and identification requirements for you.
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
                    *Exact timelines and fees vary by permit type and case load —
                    confirm current figures on Migri's official processing-times page.
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
                                Only need a new physical card (lost, stolen or damaged) and
                                your right to reside is still valid? That's a separate,
                                simpler card-renewal request — let us know and we'll route
                                it correctly.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ResidenceRenewalsSection;