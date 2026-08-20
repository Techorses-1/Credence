import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";
import "./WhoWeAre.scss";

import {
    FaUserTie,
    FaClipboardCheck,
    FaHandshake,
    FaShieldAlt,
} from "react-icons/fa";

// ===== STATS DATA (replace with your real numbers) =====
const statsData = [
    { value: 500, suffix: "+", label: "Cases Handled" },
    { value: 10, suffix: "+", label: "Years Experience" },
    { value: 95, suffix: "%", label: "Success Rate" },
    { value: 24, suffix: "/7", label: "Client Support" },
];

// ===== VALUE CARDS DATA =====
const valuesData = [
    {
        icon: <FaUserTie />,
        title: "Experienced Team",
        desc: "Specialists who understand the details of appeals and residence permit law.",
    },
    {
        icon: <FaClipboardCheck />,
        title: "Transparent Process",
        desc: "You always know where your case stands, step by step, no surprises.",
    },
    {
        icon: <FaHandshake />,
        title: "Personalized Approach",
        desc: "Every case is different — we build a strategy around your situation.",
    },
    {
        icon: <FaShieldAlt />,
        title: "Proven Results",
        desc: "A consistent track record of successful appeals and approvals.",
    },
];

// ===== ANIMATED COUNTER SUBCOMPONENT =====
const StatCounter = ({ value, suffix, label, delay }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.6 });
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        const controls = animate(0, value, {
            duration: 1.6,
            delay,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (latest) => setDisplayValue(Math.round(latest)),
        });
        return () => controls.stop();
    }, [isInView, value, delay]);

    return (
        <motion.div
            ref={ref}
            className="who-we-are__stat"
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
        >
            <span className="who-we-are__stat-number">
                {displayValue}
                {suffix}
            </span>
            <span className="who-we-are__stat-label">{label}</span>
        </motion.div>
    );
};

const WhoWeAre = () => {
    // ===== ANIMATION VARIANTS =====
    const containerVariants = {
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.15, delayChildren: 0.1 },
        },
    };

    const fadeUpVariants = {
        hidden: { opacity: 0, y: 26 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: "easeOut" },
        },
    };

    const underlineVariants = {
        hidden: { scaleX: 0, opacity: 0 },
        visible: {
            scaleX: 1,
            opacity: 1,
            transition: { duration: 0.7, ease: "easeOut", delay: 0.15 },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };

    return (
        <section className="who-we-are-section">
            <div className="who-we-are__container">
                {/* ===== HEADER: CENTERED STORY ===== */}
                <motion.div
                    className="who-we-are__header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={containerVariants}
                >
                    <motion.span className="who-we-are__eyebrow" variants={fadeUpVariants}>
                        Who We Are
                    </motion.span>

                    <motion.h2 className="who-we-are__heading" variants={fadeUpVariants}>
                        People-First Legal Guidance,{" "}
                        <span className="who-we-are__heading-accent">Every Case</span>
                    </motion.h2>

                    <motion.span className="who-we-are__underline" variants={underlineVariants}></motion.span>

                    <motion.p className="who-we-are__intro" variants={fadeUpVariants}>
                        We're a team dedicated to helping individuals navigate appeals
                        and residence permit processes with confidence. From the first
                        consultation to the final decision, we stand beside you with
                        clear guidance, honest advice, and steady support.
                    </motion.p>
                </motion.div>

                {/* ===== STATS ROW ===== */}
                <div className="who-we-are__stats-row">
                    {statsData.map((stat, index) => (
                        <StatCounter
                            key={index}
                            value={stat.value}
                            suffix={stat.suffix}
                            label={stat.label}
                            delay={index * 0.12}
                        />
                    ))}
                </div>

                {/* ===== VALUE CARDS GRID ===== */}
                <motion.div
                    className="who-we-are__values-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={containerVariants}
                >
                    {valuesData.map((item, index) => (
                        <motion.div
                            key={index}
                            className="who-we-are__value-card"
                            variants={cardVariants}
                            whileHover={{ y: -6 }}
                        >
                            <span className="who-we-are__value-icon">{item.icon}</span>
                            <h3 className="who-we-are__value-title">{item.title}</h3>
                            <p className="who-we-are__value-desc">{item.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default WhoWeAre;