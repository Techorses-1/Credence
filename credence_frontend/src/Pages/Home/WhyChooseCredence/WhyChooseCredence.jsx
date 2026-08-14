import React from 'react'
import { motion } from 'framer-motion';
import "./WhyChooseCredence.scss";
import girlImg from "../../../assets/Images/img.png";
import { useModal } from "../Model/ModalProvider";

const WhyChooseCredence = () => {
    const { openAgreementModal } = useModal();

    const handleStartNowClick = () => {
        openAgreementModal();
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const titleVariants = {
        hidden: { y: -30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12,
                duration: 0.7
            }
        }
    };

    const underlineVariants = {
        hidden: { scaleX: 0, opacity: 0 },
        visible: {
            scaleX: 1,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut",
                delay: 0.2
            }
        }
    };

    const contentVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const leftContentVariants = {
        hidden: { x: -50, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 15,
                duration: 0.7
            }
        }
    };

    const rightImageVariants = {
        hidden: { x: 50, opacity: 0, scale: 0.9 },
        visible: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 70,
                damping: 15,
                duration: 0.8,
                delay: 0.4
            }
        }
    };

    const listItemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: (i) => ({
            x: 0,
            opacity: 1,
            transition: {
                delay: i * 0.05 + 0.4,
                duration: 0.4,
                ease: "easeOut"
            }
        })
    };

    const quoteVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                delay: 0.8,
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const buttonVariants = {
        hidden: { y: 20, opacity: 0, scale: 0.9 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                delay: 0.9,
                type: "spring",
                stiffness: 200,
                damping: 15
            }
        },
        hover: {
            scale: 1.05,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        },
        tap: {
            scale: 0.95
        }
    };

    const shapeVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 0.1,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                delay: 0.2
            }
        }
    };

    const leftShapeVariants = {
        hidden: { x: -100, opacity: 0 },
        visible: {
            x: 0,
            opacity: 0.1,
            transition: {
                type: "spring",
                stiffness: 60,
                damping: 15,
                duration: 1
            }
        }
    };

    const rightShapeVariants = {
        hidden: { x: 100, opacity: 0 },
        visible: {
            x: 0,
            opacity: 0.1,
            transition: {
                type: "spring",
                stiffness: 60,
                damping: 15,
                duration: 1,
                delay: 0.1
            }
        }
    };

    const listItems = [
        "Local experts with strong knowledge of Finnish regulations",
        "Complete business lifecycle support - from setup to closure",
        "Tailored solutions for startups, SMEs, and international companies",
        "Transparent pricing with no hidden costs",
        "Digital tools for easy document and business management",
        "Reliable, responsive, and client-focused service"
    ];

    return (
        <motion.section 
            className="why-choose-credence"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
        >
            {/* Decorative Shapes with animation */}
            <motion.span 
                className="wc-shape wc-left"
                variants={leftShapeVariants}
            ></motion.span>
            <motion.span 
                className="wc-shape wc-right"
                variants={rightShapeVariants}
            ></motion.span>

            <motion.div 
                className="wc-container"
                variants={containerVariants}
            >
                {/* Title with animation */}
                <motion.h2 
                    className="wc-section-title"
                    variants={titleVariants}
                >
                    Why Choose Credence?
                </motion.h2>
                
                {/* Animated underline */}
                <motion.div 
                    className="wc-underline"
                    variants={underlineVariants}
                ></motion.div>

                {/* Main content with animation */}
                <motion.div 
                    className="wc-content"
                    variants={contentVariants}
                >
                    {/* LEFT TEXT - Animated */}
                    <motion.div 
                        className="wc-text"
                        variants={leftContentVariants}
                    >
                        <motion.h3 variants={leftContentVariants}>
                            Because Your Finances Deserve Accuracy & Care
                        </motion.h3>

                        <ul className="wc-list">
                            {listItems.map((item, index) => (
                                <motion.li 
                                    key={index}
                                    variants={listItemVariants}
                                    custom={index}
                                >
                                    {item}
                                </motion.li>
                            ))}
                        </ul>

                        <motion.p 
                            className="wc-quote"
                            variants={quoteVariants}
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            "With Credence, you gain clarity, control, and confidence over your
                            finances."
                        </motion.p>

                        <motion.button 
                            className="wc-cta-btn" 
                            onClick={handleStartNowClick}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            START NOW
                        </motion.button>
                    </motion.div>

                    {/* RIGHT IMAGE - Animated */}
                    <motion.div 
                        className="wc-image-box"
                        variants={rightImageVariants}
                        whileHover={{ 
                            scale: 1.03,
                            transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 15
                            }
                        }}
                    >
                        <img src={girlImg} alt="Why Choose Credence" />
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.section>
    );
};

export default WhyChooseCredence;