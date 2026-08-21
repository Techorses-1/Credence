import React from "react";
import { motion } from "framer-motion";
import "./ProcessFlowDiagram.scss";

import {
    FaFileAlt,
    FaSearch,
    FaClipboardList,
    FaPaperPlane,
    FaBell,
    FaLongArrowAltRight,
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

const ProcessFlowDiagram = () => {
    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
    };

    const headerVariants = {
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const nodeVariants = {
        hidden: { opacity: 0, scale: 0.85 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 180, damping: 16 },
        },
    };

    const arrowVariants = {
        hidden: { opacity: 0, scale: 0.5 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    };

    return (
        <section className="process-flow-section">
            <div className="process-flow__container">
                <motion.div
                    className="process-flow__header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={headerVariants}
                >
                    <span className="process-flow__eyebrow">What Happens Next</span>
                    <h2 className="process-flow__heading">From Submission To Resolution</h2>
                </motion.div>

                <motion.div
                    className="process-flow__diagram"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={containerVariants}
                >
                    {stepsData.map((step, index) => (
                        <React.Fragment key={index}>
                            <motion.div className="process-flow__node" variants={nodeVariants}>
                                <span className="process-flow__node-badge">{index + 1}</span>
                                <span className="process-flow__node-icon">{step.icon}</span>
                                <h3 className="process-flow__node-title">{step.title}</h3>
                                <p className="process-flow__node-desc">{step.desc}</p>
                            </motion.div>

                            {index !== stepsData.length - 1 && (
                                <motion.span
                                    className="process-flow__arrow"
                                    variants={arrowVariants}
                                >
                                    <FaLongArrowAltRight />
                                </motion.span>
                            )}
                        </React.Fragment>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default ProcessFlowDiagram;