import React from "react";
import { motion } from "framer-motion";
import "./WhoWeHelpCards.scss";

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
        desc: "First-time applicants navigating the permit process from scratch.",
    },
    {
        icon: <FaGavel />,
        title: "Rejected Applications & Appeals",
        desc: "Those who've received a rejection and need a strong appeal strategy.",
    },
    {
        icon: <FaBriefcase />,
        title: "Work & Student Permit Holders",
        desc: "Professionals and students renewing or extending their permits.",
    },
    {
        icon: <FaUsers />,
        title: "Family Reunification Cases",
        desc: "Families working to bring loved ones together legally.",
    },
    {
        icon: <FaGlobeAmericas />,
        title: "Asylum Seekers",
        desc: "Individuals seeking protection and a fair, guided process.",
    },
    {
        icon: <FaChartLine />,
        title: "Business & Investor Visa Cases",
        desc: "Entrepreneurs and investors establishing legal residency.",
    },
];

const WhoWeHelpCards = () => {
    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
    };

    const headerVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
    };

    return (
        <section className="who-we-help-cards-section">
            <div className="who-we-help-cards__container">
                <motion.div
                    className="who-we-help-cards__header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={headerVariants}
                >
                    <span className="who-we-help-cards__eyebrow">Who Do We Help</span>
                    <h2 className="who-we-help-cards__heading">
                        Support For Every Stage of Your Case
                    </h2>
                    <p className="who-we-help-cards__subtitle">
                        Whatever your situation, there's a path forward — here's who we
                        work with every day.
                    </p>
                </motion.div>

                <motion.div
                    className="who-we-help-cards__grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={containerVariants}
                >
                    {helpData.map((item, index) => (
                        <motion.div
                            key={index}
                            className="who-we-help-cards__card"
                            variants={cardVariants}
                            whileHover={{ y: -8 }}
                        >
                            <span className="who-we-help-cards__icon">{item.icon}</span>
                            <h3 className="who-we-help-cards__title">{item.title}</h3>
                            <p className="who-we-help-cards__desc">{item.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default WhoWeHelpCards;