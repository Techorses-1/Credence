import React from "react";
import { motion } from "framer-motion";
import "./TrustNumberedList.scss";

// ===== TRUST REASONS (replace with your real reasons) =====
const trustData = [
    {
        num: "01",
        title: "Licensed & Certified Experts",
        desc: "Every case is handled by professionals who know immigration and appeals law inside out.",
    },
    {
        num: "02",
        title: "Transparent Pricing",
        desc: "No hidden fees, no surprise charges — you know exactly what you're paying for upfront.",
    },
    {
        num: "03",
        title: "Free Initial Consultation",
        desc: "Talk through your case with us before committing to anything, at no cost.",
    },
    {
        num: "04",
        title: "100% Confidential",
        desc: "Your documents and personal details are handled with strict privacy and security.",
    },
];

const TrustNumberedList = () => {
    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
    };

    const headerVariants = {
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
    };

    return (
        <section className="trust-numbered-section">
            <div className="trust-numbered__container">
                <motion.div
                    className="trust-numbered__header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={headerVariants}
                >
                    <span className="trust-numbered__eyebrow">Why Trust Us</span>
                    <h2 className="trust-numbered__heading">Reasons Clients Choose Us</h2>
                </motion.div>

                <motion.div
                    className="trust-numbered__list"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={containerVariants}
                >
                    {trustData.map((item, index) => (
                        <motion.div key={index} className="trust-numbered__row" variants={rowVariants}>
                            <span className="trust-numbered__num">{item.num}</span>
                            <div className="trust-numbered__text">
                                <h3 className="trust-numbered__title">{item.title}</h3>
                                <p className="trust-numbered__desc">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default TrustNumberedList;