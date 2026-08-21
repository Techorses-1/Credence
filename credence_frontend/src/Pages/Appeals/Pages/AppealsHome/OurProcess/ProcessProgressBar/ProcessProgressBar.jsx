import React, { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import "./ProcessProgressBar.scss";

import {
    FaFileAlt,
    FaSearch,
    FaClipboardList,
    FaPaperPlane,
    FaBell,
} from "react-icons/fa";

// ===== PROCESS STEPS (dummy content — replace when confirmed) =====
const stepsData = [
    {
        icon: <FaFileAlt />,
        title: "Submit Case Details",
        desc: "Share your documents and situation with us.",
    },
    {
        icon: <FaSearch />,
        title: "Team Reviews Documents",
        desc: "We assess the strongest path forward.",
    },
    {
        icon: <FaClipboardList />,
        title: "Strategy & Filing Prepared",
        desc: "Your paperwork is prepared accurately.",
    },
    {
        icon: <FaPaperPlane />,
        title: "Appeal Submitted",
        desc: "Your case is officially filed.",
    },
    {
        icon: <FaBell />,
        title: "Updates Until Resolution",
        desc: "We keep you informed at every stage.",
    },
];

// Each row watches its own visibility and reports back up when it enters view
const StepRow = ({ step, index, onActivate, isActive }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { amount: 1 });

    useEffect(() => {
        if (inView) onActivate(index);
    }, [inView, index, onActivate]);

    return (
        <div
            ref={ref}
            className={`process-progress__detail-item ${isActive ? "active" : ""}`}
        >
            <span className="process-progress__detail-icon">{step.icon}</span>
            <div>
                <span className="process-progress__detail-step-num">
                    Step {index + 1}
                </span>
                <h3 className="process-progress__detail-title">{step.title}</h3>
                <p className="process-progress__detail-desc">{step.desc}</p>
            </div>
        </div>
    );
};

const ProcessProgressBar = () => {
    const [activeStep, setActiveStep] = useState(0);

    const handleActivate = (index) => {
        setActiveStep((prev) => (index > prev ? index : prev));
    };

    const headerVariants = {
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const fillPercent =
        stepsData.length > 1 ? (activeStep / (stepsData.length - 1)) * 100 : 0;

    return (
        <section className="process-progress-section">
            <div className="process-progress__container">
                <motion.div
                    className="process-progress__header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={headerVariants}
                >
                    <span className="process-progress__eyebrow">What Happens Next</span>
                    <h2 className="process-progress__heading">
                        Track The Journey Of Your Case
                    </h2>
                </motion.div>

                {/* ===== PROGRESS BAR WITH CHECKPOINTS ===== */}
                <div className="process-progress__bar-track">
                    <motion.div
                        className="process-progress__bar-fill"
                        animate={{ width: `${fillPercent}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    ></motion.div>

                    <div className="process-progress__checkpoints">
                        {stepsData.map((_, index) => (
                            <div
                                key={index}
                                className={`process-progress__checkpoint ${index <= activeStep ? "active" : ""
                                    }`}
                            >
                                <span className="process-progress__checkpoint-num">
                                    {index + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ===== STEP DETAILS ===== */}
                <div className="process-progress__detail-list">
                    {stepsData.map((step, index) => (
                        <StepRow
                            key={index}
                            step={step}
                            index={index}
                            onActivate={handleActivate}
                            isActive={index === activeStep}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProcessProgressBar;