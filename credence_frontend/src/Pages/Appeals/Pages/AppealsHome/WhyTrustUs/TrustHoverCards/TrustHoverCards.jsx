import React from "react";
import { motion } from "framer-motion";
import "./TrustHoverCards.scss";

import {
    FaCertificate,
    FaFileInvoiceDollar,
    FaCommentDots,
    FaLock,
    FaUserShield,
} from "react-icons/fa";

// ===== TRUST REASONS (replace with your real reasons) =====
const trustData = [
    {
        icon: <FaCertificate />,
        title: "Licensed & Certified Experts",
        desc: "Professionals with deep, verified experience in appeals and residence permit law.",
    },
    {
        icon: <FaFileInvoiceDollar />,
        title: "Transparent Pricing",
        desc: "You'll know the full cost upfront — no hidden fees, ever.",
    },
    {
        icon: <FaCommentDots />,
        title: "Free Initial Consultation",
        desc: "Talk through your case with us before committing to anything.",
    },
    {
        icon: <FaLock />,
        title: "100% Confidential",
        desc: "Your documents and personal information are handled securely and privately.",
    },
    {
        icon: <FaUserShield />,
        title: "Dedicated Case Manager",
        desc: "One consistent point of contact who knows your case fully.",
    },
];

const TrustHoverCards = () => {
    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
    };

    const headerVariants = {
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
    };

    return (
        <section className="trust-hover-cards-section">
            <div className="trust-hover-cards__container">
                <motion.div
                    className="trust-hover-cards__header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={headerVariants}
                >
                    <span className="trust-hover-cards__eyebrow">Why Trust Us</span>
                    <h2 className="trust-hover-cards__heading">Hover To See Why It Matters</h2>
                </motion.div>

                <motion.div
                    className="trust-hover-cards__grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={containerVariants}
                >
                    {trustData.map((item, index) => (
                        <motion.div key={index} className="trust-hover-cards__card" variants={cardVariants}>
                            <div className="trust-hover-cards__card-inner">
                                {/* ===== FRONT FACE ===== */}
                                <div className="trust-hover-cards__face trust-hover-cards__face--front">
                                    <span className="trust-hover-cards__icon">{item.icon}</span>
                                    <h3 className="trust-hover-cards__title">{item.title}</h3>
                                </div>

                                {/* ===== BACK FACE (revealed on hover) ===== */}
                                <div className="trust-hover-cards__face trust-hover-cards__face--back">
                                    <h3 className="trust-hover-cards__title trust-hover-cards__title--back">
                                        {item.title}
                                    </h3>
                                    <p className="trust-hover-cards__desc">{item.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default TrustHoverCards;