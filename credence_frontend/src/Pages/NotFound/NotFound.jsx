import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModal } from "../../Pages/Home/Model/ModalProvider";
import logoImage from "../../assets/Images/home/logo.png";
import "./NotFound.scss";

const NotFound = () => {
    const navigate = useNavigate();
    const { openAgreementModal } = useModal();

    // Navbar handlers
    const handleEnrollClick = (e) => {
        e.preventDefault();
        openAgreementModal();
    };

    const handleSignInClick = (e) => {
        e.preventDefault();
        navigate("/login");
    };

    // Animation variants
    const navbarVariants = {
        hidden: { y: -50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20,
                duration: 0.6
            }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    };

    const numberVariants = {
        hidden: { scale: 0.5, opacity: 0, rotate: -10 },
        visible: {
            scale: 1,
            opacity: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 150,
                damping: 12,
                duration: 0.8
            }
        }
    };

    const textVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12,
                delay: 0.3
            }
        }
    };

    const buttonVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.6
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

    const decorVariants = {
        hidden: { scale: 0.8, opacity: 0, rotate: 0 },
        visible: {
            scale: 1,
            opacity: 0.15,
            rotate: [15, 15],
            transition: {
                duration: 1,
                ease: "easeOut",
                delay: 0.3
            }
        }
    };

    const decorRightVariants = {
        hidden: { scale: 0.8, opacity: 0, rotate: 0 },
        visible: {
            scale: 1,
            opacity: 0.15,
            rotate: [-15, -15],
            transition: {
                duration: 1,
                ease: "easeOut",
                delay: 0.3
            }
        }
    };

    const floatingElements = [
        { emoji: "📊", delay: 0.2, x: -100, y: -50 },
        { emoji: "💰", delay: 0.4, x: 120, y: -80 },
        { emoji: "📈", delay: 0.6, x: -80, y: 100 },
        { emoji: "💶", delay: 0.8, x: 150, y: 70 },
        { emoji: "🧾", delay: 1.0, x: -120, y: 120 },
        { emoji: "📱", delay: 1.2, x: 90, y: -120 }
    ];

    return (
        <>
            {/* ===== NAVBAR SECTION ===== */}
            <section className="notfound-header-section">
                <motion.div
                    className="notfound-navbar-wrapper"
                    initial="hidden"
                    animate="visible"
                    variants={navbarVariants}
                >
                    <div className="notfound-navbar">
                        <motion.span
                            className="notfound-nav-link"
                            onClick={handleEnrollClick}
                            style={{ cursor: 'pointer' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="enroll-text">Enroll Now</span>
                        </motion.span>

                        <motion.div
                            className="notfound-logo"
                            whileHover={{ scale: 1.05 }}
                        >
                            <img
                                src={logoImage}
                                alt="Credence Logo"
                                className="notfound-logo-image"
                            />
                        </motion.div>

                        <motion.span
                            className="notfound-nav-link"
                            onClick={handleSignInClick}
                            style={{ cursor: 'pointer' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Sign in
                        </motion.span>
                    </div>
                </motion.div>
            </section>

            {/* ===== 404 CONTENT SECTION ===== */}
            <motion.section
                className="notfound-content"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Decorative circles */}
                <motion.span
                    className="notfound-decor-left"
                    variants={decorVariants}
                ></motion.span>
                <motion.span
                    className="notfound-decor-right"
                    variants={decorRightVariants}
                ></motion.span>

                {/* Floating emoji elements */}
                {floatingElements.map((item, index) => (
                    <motion.div
                        key={`float-${index}`}
                        className="notfound-float-item"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                            opacity: 0.3,
                            scale: 1,
                            x: item.x,
                            y: item.y
                        }}
                        transition={{
                            delay: item.delay,
                            duration: 1,
                            type: "spring",
                            stiffness: 50
                        }}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '40px',
                            pointerEvents: 'none'
                        }}
                    >
                        {item.emoji}
                    </motion.div>
                ))}

                <div className="notfound-container">
                    {/* 404 Number */}
                    <motion.div 
                        className="notfound-number"
                        variants={numberVariants}
                    >
                        <span className="notfound-4">4</span>
                        <motion.span 
                            className="notfound-0"
                            animate={{ 
                                rotate: [0, 10, -10, 10, 0],
                                scale: [1, 1.1, 1.1, 1.1, 1]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut"
                            }}
                        >
                            0
                        </motion.span>
                        <span className="notfound-4">4</span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1 
                        className="notfound-heading"
                        variants={textVariants}
                    >
                        Page Not Found
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p 
                        className="notfound-subtitle"
                        variants={textVariants}
                    >
                        Oops! Looks like this page got lost in the books. 
                        <br />Don't worry, our accountants are good at finding things!
                    </motion.p>

                    {/* Animated line */}
                    <motion.div 
                        className="notfound-line"
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                    ></motion.div>

                    

                    {/* Buttons */}
                    <motion.div 
                        className="notfound-buttons"
                        variants={buttonVariants}
                    >
                        <motion.button
                            className="notfound-btn notfound-btn-primary"
                            onClick={() => navigate('/')}
                            whileHover="hover"
                            whileTap="tap"
                            variants={buttonVariants}
                        >
                            Go to Homepage
                        </motion.button>

                        <motion.button
                            className="notfound-btn notfound-btn-secondary"
                            onClick={() => navigate(-1)}
                            whileHover="hover"
                            whileTap="tap"
                            variants={buttonVariants}
                        >
                            Go Back
                        </motion.button>
                    </motion.div>

                    {/* Fun fact */}
                    <motion.div 
                        className="notfound-fun-fact"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 0.7, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                    >
                        <span className="notfound-fun-icon">💡</span>
                        <span>Fun Fact: In Finland, 404 errors are called "Metsässä" (Lost in the forest)</span>
                    </motion.div>
                </div>
            </motion.section>
        </>
    );
};

export default NotFound;