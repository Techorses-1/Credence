import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import "./ProcessTimelineVertical.scss";

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
        title: "Submit Your Case Details",
        desc: "You share your documents and situation with us through a simple form.",
    },
    {
        icon: <FaSearch />,
        title: "Our Team Reviews Documents",
        desc: "We carefully review everything to understand the strongest path forward.",
    },
    {
        icon: <FaClipboardList />,
        title: "Strategy & Filing Prepared",
        desc: "A tailored strategy is built and your paperwork is prepared accurately.",
    },
    {
        icon: <FaPaperPlane />,
        title: "Application / Appeal Submitted",
        desc: "Your case is officially filed with the relevant authority.",
    },
    {
        icon: <FaBell />,
        title: "Updates Until Resolution",
        desc: "We keep you informed at every stage until a decision is reached.",
    },
];

const ProcessTimelineVertical = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 0.75", "end 0.4"],
    });

    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    const headerVariants = {
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
    };

    return (
        <section className="process-timeline-v-section">
            <div className="process-timeline-v__container">
                <motion.div
                    className="process-timeline-v__header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={headerVariants}
                >
                    <span className="process-timeline-v__eyebrow">What Happens Next</span>
                    <h2 className="process-timeline-v__heading">
                        Here's How We Handle Your Case
                    </h2>
                </motion.div>

                <div className="process-timeline-v__timeline" ref={containerRef}>
                    <div className="process-timeline-v__track"></div>
                    <motion.div
                        className="process-timeline-v__track-fill"
                        style={{ height: lineHeight }}
                    ></motion.div>

                    {stepsData.map((step, index) => (
                        <motion.div
                            key={index}
                            className="process-timeline-v__row"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={rowVariants}
                        >
                            <div className="process-timeline-v__node">
                                <span className="process-timeline-v__node-icon">{step.icon}</span>
                            </div>
                            <div className="process-timeline-v__content">
                                <span className="process-timeline-v__step-num">
                                    Step {index + 1}
                                </span>
                                <h3 className="process-timeline-v__title">{step.title}</h3>
                                <p className="process-timeline-v__desc">{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProcessTimelineVertical;