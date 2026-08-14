import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModal } from "../../Pages/Home/Model/ModalProvider";
import logoImage from "../../assets/Images/home/logo.png";
import "./PrivacyPolicy.scss";
import Footer from '../Home/Footer/Footer';
import Navbar from '../Home/Navbar/Navbar';

const PrivacyPolicy = () => {
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

    // Navbar animation variants
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

    // Animation variants for content
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

    const sectionVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: (i) => ({
            y: 0,
            opacity: 1,
            transition: {
                delay: i * 0.1 + 0.3,
                duration: 0.6,
                ease: "easeOut"
            }
        })
    };

    const listItemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: (i) => ({
            x: 0,
            opacity: 1,
            transition: {
                delay: i * 0.05 + 0.5,
                duration: 0.4,
                ease: "easeOut"
            }
        })
    };

    const decorVariants = {
        hidden: { scale: 0.8, opacity: 0, rotate: 0 },
        visible: {
            scale: 1,
            opacity: 0.1,
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
            opacity: 0.1,
            rotate: [-15, -15],
            transition: {
                duration: 1,
                ease: "easeOut",
                delay: 0.3
            }
        }
    };

    // Data collection categories
    const dataCollected = [
        {
            title: "Personal Identification Information",
            items: ["Full name", "Email address (support@jladgroup.fi)", "Phone number (+358 413250081)", "Postal address", "Date of birth", "Personal identification number (for tax purposes)"]
        },
        {
            title: "Financial Information",
            items: ["Bank account details", "Income statements", "Tax information", "Transaction history", "Business financial records", "VAT information"]
        },
        {
            title: "Business Information",
            items: ["Company name and Business ID", "Company registration documents", "Shareholder information", "Board member details", "Business licenses and permits"]
        },
        {
            title: "Technical Data",
            items: ["IP address", "Browser type and version", "Time zone setting", "Browser plug-in types", "Operating system", "Platform information"]
        }
    ];

    // How we use data
    const dataUsage = [
        "To provide bookkeeping and financial management services",
        "To process VAT returns and tax filings with Finnish authorities (PRH, Vero)",
        "To communicate with you about your accounts and inquiries",
        "To send invoices and process payments",
        "To comply with Finnish legal and regulatory requirements",
        "To improve our website and customer service",
        "To detect and prevent fraud or unauthorized access"
    ];

    // Legal basis for processing
    const legalBasis = [
        {
            title: "Contract Performance",
            description: "Processing necessary to provide our bookkeeping services to you"
        },
        {
            title: "Legal Obligation",
            description: "Compliance with Finnish accounting laws, tax regulations, and PRH requirements"
        },
        {
            title: "Legitimate Interests",
            description: "Improving our services, preventing fraud, and ensuring network security"
        },
        {
            title: "Consent",
            description: "For marketing communications (you can withdraw anytime)"
        }
    ];

    // Data retention periods
    const retentionPeriods = [
        {
            period: "Accounting Records",
            duration: "6 years (as required by Finnish Accounting Act)"
        },
        {
            period: "Client Contracts",
            duration: "10 years after contract termination"
        },
        {
            period: "Personal Identification Data",
            duration: "Duration of client relationship + 1 year"
        },
        {
            period: "Marketing Communications",
            duration: "Until consent is withdrawn"
        }
    ];

    // Your rights under GDPR
    const userRights = [
        "Right to access your personal data",
        "Right to rectify inaccurate data",
        "Right to erasure ('right to be forgotten')",
        "Right to restrict processing",
        "Right to data portability",
        "Right to object to processing",
        "Right to withdraw consent at any time",
        "Right to lodge a complaint with the Finnish Data Protection Ombudsman"
    ];

    return (
        <>
            <Navbar/>

            {/* ===== MAIN CONTENT SECTION ===== */}
            <motion.section
                className="privacy-policy"
                initial="hidden"
                animate="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={containerVariants}
            >
                {/* Decorative circles */}
                <motion.span
                    className="privacy-decor-left"
                    variants={decorVariants}
                ></motion.span>
                <motion.span
                    className="privacy-decor-right"
                    variants={decorRightVariants}
                ></motion.span>

                <motion.div
                    className="privacy-container"
                    variants={containerVariants}
                >
                    {/* Main heading */}
                    <motion.h2
                        variants={titleVariants}
                    >
                        Privacy Policy
                    </motion.h2>

                    {/* Animated underline */}
                    <motion.div
                        className="privacy-underline"
                        variants={underlineVariants}
                    ></motion.div>

                    {/* Last updated note */}
                    <motion.p
                        className="privacy-last-updated"
                        variants={sectionVariants}
                        custom={0}
                    >
                        Last Updated: February 2026
                    </motion.p>

                    {/* INTRODUCTION */}
                    <motion.div
                        className="privacy-section"
                        variants={sectionVariants}
                        custom={1}
                    >
                        <motion.h3 variants={sectionVariants} custom={1.1}>
                            Your Privacy Matters to Us
                        </motion.h3>

                        <motion.p
                            className="privacy-text"
                            variants={sectionVariants}
                            custom={1.2}
                        >
                            At Credence (Jlad Group), we are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our bookkeeping and financial management services in Finland. We comply with the Finnish Data Protection Act and the EU General Data Protection Regulation (GDPR).
                        </motion.p>
                    </motion.div>

                    {/* WHO WE ARE */}
                    <motion.div
                        className="privacy-section"
                        variants={sectionVariants}
                        custom={2}
                    >
                        <motion.h3 variants={sectionVariants} custom={2.1}>
                            Who We Are
                        </motion.h3>

                        <motion.p
                            className="privacy-text"
                            variants={sectionVariants}
                            custom={2.2}
                        >
                            <strong>Company:</strong> Jlad Group / Credence<br />
                            <strong>Email:</strong> <a href="mailto:support@jladgroup.fi">support@jladgroup.fi</a><br />
                            <strong>Phone:</strong> <a href="tel:+358413250081">+358 413250081</a><br />
                            <strong>Business ID:</strong> [Your Business ID]<br />
                            <p>
                                <strong>Address:</strong>{' '}
                                <a
                                    href="https://maps.google.com/?q=Uomarinne+5+A+014+01600+VANTAA+Finland"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="privacy-map-link"
                                >
                                    Uomarinne 5 A 014, 01600 VANTAA Uusimaa Finland
                                    <span className="map-icon">📍</span>
                                </a>
                            </p>
                        </motion.p>

                        <motion.p
                            className="privacy-text"
                            variants={sectionVariants}
                            custom={2.3}
                        >
                            We are the data controller responsible for your personal data. If you have any questions, please contact us at <a href="mailto:support@jladgroup.fi">support@jladgroup.fi</a>.
                        </motion.p>
                    </motion.div>

                    {/* DATA WE COLLECT */}
                    <motion.div
                        className="privacy-section"
                        variants={sectionVariants}
                        custom={3}
                    >
                        <motion.h3 variants={sectionVariants} custom={3.1}>
                            What Data We Collect
                        </motion.h3>

                        {dataCollected.map((category, catIndex) => (
                            <motion.div
                                key={`category-${catIndex}`}
                                className="privacy-subsection"
                                variants={sectionVariants}
                                custom={3.2 + catIndex}
                            >
                                <motion.h4 variants={sectionVariants} custom={3.3 + catIndex}>
                                    {category.title}
                                </motion.h4>

                                <ul className="privacy-list">
                                    {category.items.map((item, itemIndex) => (
                                        <motion.li
                                            key={`item-${catIndex}-${itemIndex}`}
                                            variants={listItemVariants}
                                            custom={itemIndex + (catIndex * 10)}
                                            whileHover={{ x: 5, color: "#6cc24a" }}
                                        >
                                            {item}
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* HOW WE USE YOUR DATA */}
                    <motion.div
                        className="privacy-section"
                        variants={sectionVariants}
                        custom={4}
                    >
                        <motion.h3 variants={sectionVariants} custom={4.1}>
                            How We Use Your Data
                        </motion.h3>

                        <ul className="privacy-list">
                            {dataUsage.map((item, index) => (
                                <motion.li
                                    key={`usage-${index}`}
                                    variants={listItemVariants}
                                    custom={index + 30}
                                    whileHover={{ x: 5, color: "#6cc24a" }}
                                >
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* LEGAL BASIS */}
                    <motion.div
                        className="privacy-section"
                        variants={sectionVariants}
                        custom={5}
                    >
                        <motion.h3 variants={sectionVariants} custom={5.1}>
                            Legal Basis for Processing
                        </motion.h3>

                        {legalBasis.map((basis, index) => (
                            <motion.div
                                key={`basis-${index}`}
                                className="privacy-basis-item"
                                variants={sectionVariants}
                                custom={5.2 + index}
                                whileHover={{
                                    scale: 1.02,
                                    borderLeftColor: "#6cc24a",
                                    backgroundColor: "rgba(108, 194, 74, 0.05)"
                                }}
                            >
                                <motion.strong variants={sectionVariants} custom={5.3 + index}>
                                    {basis.title}:
                                </motion.strong>
                                <motion.span variants={sectionVariants} custom={5.4 + index}>
                                    {basis.description}
                                </motion.span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* DATA RETENTION */}
                    <motion.div
                        className="privacy-section"
                        variants={sectionVariants}
                        custom={6}
                    >
                        <motion.h3 variants={sectionVariants} custom={6.1}>
                            How Long We Keep Your Data
                        </motion.h3>

                        <div className="privacy-table">
                            {retentionPeriods.map((item, index) => (
                                <motion.div
                                    key={`retention-${index}`}
                                    className="privacy-table-row"
                                    variants={sectionVariants}
                                    custom={6.2 + index}
                                    whileHover={{ backgroundColor: "rgba(108, 194, 74, 0.05)" }}
                                >
                                    <span className="privacy-table-period">{item.period}:</span>
                                    <span className="privacy-table-duration">{item.duration}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* DATA SHARING */}
                    <motion.div
                        className="privacy-section"
                        variants={sectionVariants}
                        custom={7}
                    >
                        <motion.h3 variants={sectionVariants} custom={7.1}>
                            Who We Share Your Data With
                        </motion.h3>

                        <motion.p
                            className="privacy-text"
                            variants={sectionVariants}
                            custom={7.2}
                        >
                            We may share your information with:
                        </motion.p>

                        <ul className="privacy-list">
                            <motion.li
                                variants={listItemVariants}
                                custom={40}
                                whileHover={{ x: 5, color: "#6cc24a" }}
                            >
                                <strong>Finnish Authorities:</strong> PRH (Finnish Patent and Registration Office), Vero (Finnish Tax Administration), and other regulatory bodies as required by law
                            </motion.li>
                            <motion.li
                                variants={listItemVariants}
                                custom={41}
                                whileHover={{ x: 5, color: "#6cc24a" }}
                            >
                                <strong>Service Providers:</strong> IT service providers, cloud storage (Google Drive), and payment processors who assist in delivering our services
                            </motion.li>
                            <motion.li
                                variants={listItemVariants}
                                custom={42}
                                whileHover={{ x: 5, color: "#6cc24a" }}
                            >
                                <strong>Professional Advisors:</strong> Lawyers, auditors, and consultants when necessary
                            </motion.li>
                        </ul>

                        <motion.p
                            className="privacy-text privacy-note"
                            variants={sectionVariants}
                            custom={7.3}
                        >
                            <strong>Note:</strong> We do not sell your personal data to third parties. All sharing is done under strict confidentiality agreements.
                        </motion.p>
                    </motion.div>

                    {/* INTERNATIONAL TRANSFERS */}
                    <motion.div
                        className="privacy-section"
                        variants={sectionVariants}
                        custom={8}
                    >
                        <motion.h3 variants={sectionVariants} custom={8.1}>
                            International Data Transfers
                        </motion.h3>

                        <motion.p
                            className="privacy-text"
                            variants={sectionVariants}
                            custom={8.2}
                        >
                            Your data is primarily processed within Finland and the European Economic Area (EEA). If we transfer data outside the EEA, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses approved by the European Commission.
                        </motion.p>
                    </motion.div>

                    {/* YOUR RIGHTS */}
                    <motion.div
                        className="privacy-section"
                        variants={sectionVariants}
                        custom={9}
                    >
                        <motion.h3 variants={sectionVariants} custom={9.1}>
                            Your Rights Under GDPR
                        </motion.h3>

                        <ul className="privacy-list privacy-rights-list">
                            {userRights.map((right, index) => (
                                <motion.li
                                    key={`right-${index}`}
                                    variants={listItemVariants}
                                    custom={index + 50}
                                    whileHover={{ x: 5, color: "#6cc24a" }}
                                >
                                    {right}
                                </motion.li>
                            ))}
                        </ul>

                        <motion.p
                            className="privacy-text"
                            variants={sectionVariants}
                            custom={9.2}
                        >
                            To exercise any of these rights, please contact us at <a href="mailto:support@jladgroup.fi">support@jladgroup.fi</a>. We will respond within 30 days.
                        </motion.p>
                    </motion.div>

                    {/* SECURITY */}
                    <motion.div
                        className="privacy-section"
                        variants={sectionVariants}
                        custom={10}
                    >
                        <motion.h3 variants={sectionVariants} custom={10.1}>
                            Data Security
                        </motion.h3>

                        <motion.p
                            className="privacy-text"
                            variants={sectionVariants}
                            custom={10.2}
                        >
                            We implement appropriate technical and organizational measures to protect your data, including:
                        </motion.p>

                        <ul className="privacy-list">
                            <motion.li
                                variants={listItemVariants}
                                custom={60}
                                whileHover={{ x: 5, color: "#6cc24a" }}
                            >
                                Encryption of sensitive data
                            </motion.li>
                            <motion.li
                                variants={listItemVariants}
                                custom={61}
                                whileHover={{ x: 5, color: "#6cc24a" }}
                            >
                                Secure Google Drive folders with access controls
                            </motion.li>
                            <motion.li
                                variants={listItemVariants}
                                custom={62}
                                whileHover={{ x: 5, color: "#6cc24a" }}
                            >
                                Regular security assessments
                            </motion.li>
                            <motion.li
                                variants={listItemVariants}
                                custom={63}
                                whileHover={{ x: 5, color: "#6cc24a" }}
                            >
                                Staff training on data protection
                            </motion.li>
                        </ul>
                    </motion.div>

                    {/* CHILDREN'S PRIVACY */}
                    <motion.div
                        className="privacy-section"
                        variants={sectionVariants}
                        custom={11}
                    >
                        <motion.h3 variants={sectionVariants} custom={11.1}>
                            Children's Privacy
                        </motion.h3>

                        <motion.p
                            className="privacy-text"
                            variants={sectionVariants}
                            custom={11.2}
                        >
                            Our services are not intended for individuals under 18 years of age. We do not knowingly collect data from children.
                        </motion.p>
                    </motion.div>

                    {/* CHANGES TO POLICY */}
                    <motion.div
                        className="privacy-section"
                        variants={sectionVariants}
                        custom={12}
                    >
                        <motion.h3 variants={sectionVariants} custom={12.1}>
                            Changes to This Privacy Policy
                        </motion.h3>

                        <motion.p
                            className="privacy-text"
                            variants={sectionVariants}
                            custom={12.2}
                        >
                            We may update this policy from time to time. We will notify you of any material changes by email or through our website.
                        </motion.p>
                    </motion.div>

                    {/* CONTACT INFORMATION */}
                    <motion.div
                        className="privacy-section privacy-contact"
                        variants={sectionVariants}
                        custom={13}
                    >
                        <motion.h3 variants={sectionVariants} custom={13.1}>
                            Contact Us
                        </motion.h3>

                        <motion.p
                            className="privacy-text"
                            variants={sectionVariants}
                            custom={13.2}
                        >
                            If you have questions about this Privacy Policy or wish to exercise your rights:
                        </motion.p>

                        <motion.div
                            className="privacy-contact-info"
                            variants={sectionVariants}
                            custom={13.3}
                            whileHover={{ scale: 1.02 }}
                        >
                            <p><strong>Email:</strong> <a href="mailto:support@jladgroup.fi">support@jladgroup.fi</a></p>
                            <p><strong>Phone:</strong> <a href="tel:+358413250081">+358 413250081</a></p>
                            <p>
                                <strong>Address:</strong>{' '}
                                <a
                                    href="https://maps.google.com/?q=Uomarinne+I+B+20+Vantaa+01600+Uusimaa+Finland"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="privacy-map-link"
                                >
                                    Uomarinne I B 20 Vantaa 01600 Uusimaa Finland
                                    <span className="map-icon">📍</span>
                                </a>
                            </p>
                        </motion.div>

                        <motion.p
                            className="privacy-text privacy-supervisory"
                            variants={sectionVariants}
                            custom={13.4}
                        >
                            You also have the right to contact the <strong>Finnish Data Protection Ombudsman</strong> (Tietosuojavaltuutetun toimisto) if you have concerns about how we handle your data.
                        </motion.p>
                    </motion.div>

                    {/* FOOTER NOTE */}
                    <motion.div
                        className="privacy-footer"
                        variants={sectionVariants}
                        custom={14}
                    >
                        <p>By using our services, you acknowledge that you have read and understood this Privacy Policy.</p>
                    </motion.div>
                </motion.div>
            </motion.section >

            <Footer />
        </>
    );
};

export default PrivacyPolicy;