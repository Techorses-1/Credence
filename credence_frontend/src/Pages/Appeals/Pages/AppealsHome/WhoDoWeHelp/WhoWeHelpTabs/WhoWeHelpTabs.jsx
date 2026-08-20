import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./WhoWeHelpTabs.scss";

import {
    FaPassport,
    FaGavel,
    FaBriefcase,
    FaUsers,
    FaGlobeAmericas,
    FaChartLine,
} from "react-icons/fa";

// ===== CLIENT TYPES (replace with your real categories) =====
const helpData = [
    {
        icon: <FaPassport />,
        title: "Residence Permit Applicants",
        desc: "You're applying for a residence permit for the first time and want to get every detail right from the start. We help you prepare a complete, accurate application that avoids common rejection triggers.",
        path: "/services/residence-permits",
    },
    {
        icon: <FaGavel />,
        title: "Rejected Applications & Appeals",
        desc: "Your application was rejected and you need a clear, strategic response. We review the decision, identify the strongest grounds for appeal, and represent your case through the process.",
        path: "/cases",
    },
    {
        icon: <FaBriefcase />,
        title: "Work & Student Permit Holders",
        desc: "You're renewing, extending, or switching a work or study permit. We keep your paperwork compliant and your timeline on track so there are no gaps in your status.",
        path: "/services/work-student-permits",
    },
    {
        icon: <FaUsers />,
        title: "Family Reunification Cases",
        desc: "You're working to bring family members together legally. We guide you through eligibility, documentation, and the reunification process from start to finish.",
        path: "/services/family-reunification",
    },
    {
        icon: <FaGlobeAmericas />,
        title: "Asylum Seekers",
        desc: "You're seeking protection and need a fair, well-prepared process. We provide steady guidance and clear explanations at every stage of your claim.",
        path: "/services/asylum",
    },
    {
        icon: <FaChartLine />,
        title: "Business & Investor Visa Cases",
        desc: "You're establishing a business or investing and need the right visa pathway. We handle the legal groundwork so you can focus on building.",
        path: "/services/business-investor-visa",
    },
];

const WhoWeHelpTabs = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);

    const headerVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const panelVariants = {
        hidden: { opacity: 0, x: 24 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, x: -24, transition: { duration: 0.25, ease: "easeIn" } },
    };

    const active = helpData[activeIndex];

    return (
        <section className="who-we-help-tabs-section">
            <div className="who-we-help-tabs__container">
                <motion.div
                    className="who-we-help-tabs__header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={headerVariants}
                >
                    <span className="who-we-help-tabs__eyebrow">Who Do We Help</span>
                    <h2 className="who-we-help-tabs__heading">Find Where You Fit</h2>
                </motion.div>

                <div className="who-we-help-tabs__body">
                    {/* ===== LEFT: TAB LIST ===== */}
                    <div className="who-we-help-tabs__list">
                        {helpData.map((item, index) => (
                            <button
                                key={index}
                                className={`who-we-help-tabs__tab ${activeIndex === index ? "active" : ""
                                    }`}
                                onClick={() => setActiveIndex(index)}
                            >
                                <span className="who-we-help-tabs__tab-icon">{item.icon}</span>
                                <span className="who-we-help-tabs__tab-title">{item.title}</span>
                            </button>
                        ))}
                    </div>

                    {/* ===== RIGHT: DETAIL PANEL ===== */}
                    <div className="who-we-help-tabs__panel-wrapper">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                className="who-we-help-tabs__panel"
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={panelVariants}
                            >
                                <span className="who-we-help-tabs__panel-icon">{active.icon}</span>
                                <h3 className="who-we-help-tabs__panel-title">{active.title}</h3>
                                <p className="who-we-help-tabs__panel-desc">{active.desc}</p>
                                <motion.button
                                    className="who-we-help-tabs__panel-btn"
                                    onClick={() => navigate(active.path)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Learn More
                                </motion.button>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhoWeHelpTabs;