import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModal } from "../Home/Model/ModalProvider";
import logoImage from "../../assets/Images/home/logo.png";
import "./TermsConditions.scss";
import Footer from '../Home/Footer/Footer';
import Navbar from '../Home/Navbar/Navbar';

const TermsConditions = () => {
    const navigate = useNavigate();
    const { openAgreementModal } = useModal();

    // Navbar handlers (exactly from PackagePlans)
    const handleEnrollClick = (e) => {
        e.preventDefault();
        openAgreementModal();
    };

    const handleSignInClick = (e) => {
        e.preventDefault();
        navigate("/login");
    };

    // Navbar animation variants (exactly from PackagePlans)
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

    // Animation variants (matching your existing components)
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

    const importantNoteVariants = {
        hidden: { scale: 0.95, opacity: 0, x: -20 },
        visible: {
            scale: 1,
            opacity: 1,
            x: 0,
            transition: {
                type: "spring",
                stiffness: 150,
                damping: 15,
                delay: 0.8
            }
        }
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

    // Consolidated important guidelines from both PDFs
    const importantGuidelines = [
        "Please do not share photographs of RP card or social security number or any EU IDs",
        "Make sure you have at least 75 euros balance in your bank account",
        "Every Entrepreneur must take Pension Insurance if their income exceeds 9010 Euros in the respective financial Year",
        "Please do not share your any details on any number other than mentioned in the form",
        "While applying application, you need to be online for strong identification and answering queries while processing",
        "Please note that even if you have no transactions in your company, we will charge Minimum Plan fees for that particular Month"
    ];

    // Service provider responsibilities
    const serviceProviderResponsibilities = [
        "Under the Lite Plan, the service provider maintains the client's accounts using single-entry accounting, limited to the preparation of the income statement and balance sheet.",
        "Under all other plans, the service provider maintains the client's accounts using double-entry accounting.",
        "The service provider will give the right information to the client as per the required ethical principles of accounting.",
        "In case any wrong information is provided by the client, they shall be responsible for all legal or financial repercussions, if any.",
        "Annual personal return will be charged separately, which will be equal to your monthly accounting fees.",
        "A separate folder with the client's name will be provided by the service provider in Google Drive, and all required documents must be uploaded by the client.",
        "The service provider shall not be held responsible for any information provided by the client.",
        "The service provider will provide the financial statements whenever needed, subject to the Fees agreed on the Initial offer.",
        "The service provider may keep the record for a maximum of one year after the termination of this contract. This may be done without any prior notification to the client."
    ];

    // Client responsibilities
    const clientResponsibilities = [
        "The client must provide all relevant information required to manage the accounts of the company.",
        "In case of any wrong information provided by the client, the service provider shall not be held responsible for any discrepancies.",
        "Accounting policies will be designed by the client, and guidance can be provided by the service provider, but the ultimate responsibility will always lie on the client.",
        "The client will provide all relevant information for a month on a daily basis, so that the records can be maintained by the service provider in due time.",
        "If documents are delayed and not submitted even after reminders, then service provider will not be responsible for submitting the reports to the authorities.",
        "The client must pay the service fee in advance by the 15th of every month at the latest.",
        "If the fee is not paid on time by the client, then the service provider has the right to not submit any report for the month in question."
    ];

    // Important notes (special highlights)
    const importantNotes = [
        {
            title: "Courier & Taxi Services",
            content: "If your business involves courier or taxi services, it is mandatory to maintain a driving logbook. Please note that personal fuel expenses are not deductible under any circumstances. Claiming personal expenses as business-related will result in the disallowance of all previously claimed VAT, and you will be solely responsible for the consequences."
        },
        {
            title: "PRH Queries",
            content: "You must check your email every day and see if there is any query from PRH. If you fail to inform us about the query, you will lose your 70-euro trademark fees (trade register)."
        },
        {
            title: "Follow-ups",
            content: "You will get a follow-up from our back office for data upload and for VAT reporting. Also, they may contact you for any other information or queries during the course of monthly VAT compliance."
        }
    ];

    // Marketing reference
    const marketingReference = "The service provider may share the client details (Company Name and/or Business ID) for the purpose of marketing, if needed. No other information will be shared by the service provider without prior consent from the client.";

    // Bookkeeping charges
    const bookkeepingCharges = "Bookkeeping charges are billed on the 1st of every month. If your enrolment is after the 1st of the month, you will get an invoice from our company in a week. VAT on the monthly bookkeeping fees is deductible.";

    return (
        <>
            {/* ===== NAVBAR FROM PACKAGEPLANS (EXACT COPY) ===== */}
           

            <Navbar/>

            <motion.section
                className="terms-conditions"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={containerVariants}
            >
                {/* Decorative circles (matching your theme) */}
                <motion.span
                    className="terms-decor-left"
                    variants={decorVariants}
                ></motion.span>
                <motion.span
                    className="terms-decor-right"
                    variants={decorRightVariants}
                ></motion.span>

                <motion.div
                    className="terms-container"
                    variants={containerVariants}
                >
                    {/* Main heading */}
                    <motion.h2
                        variants={titleVariants}
                    >
                        Terms & Conditions
                    </motion.h2>

                    {/* Animated underline */}
                    <motion.div
                        className="terms-underline"
                        variants={underlineVariants}
                    ></motion.div>

                    {/* Last updated note */}
                    <motion.p
                        className="terms-last-updated"
                        variants={sectionVariants}
                        custom={0}
                    >
                        Last Updated: February 2026
                    </motion.p>

                    {/* INTRODUCTION - Important Guidelines Section */}
                    <motion.div
                        className="terms-section"
                        variants={sectionVariants}
                        custom={1}
                    >
                        <motion.h3 variants={sectionVariants} custom={1.1}>
                            Important Guidelines
                        </motion.h3>

                        <ul className="terms-list">
                            {importantGuidelines.map((item, index) => (
                                <motion.li
                                    key={`guideline-${index}`}
                                    variants={listItemVariants}
                                    custom={index}
                                    whileHover={{ x: 5, color: "#6cc24a" }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* BOOKKEEPING CHARGES */}
                    <motion.div
                        className="terms-section"
                        variants={sectionVariants}
                        custom={2}
                    >
                        <motion.h3 variants={sectionVariants} custom={2.1}>
                            Bookkeeping Charges
                        </motion.h3>
                        <motion.p
                            className="terms-text"
                            variants={sectionVariants}
                            custom={2.2}
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {bookkeepingCharges}
                        </motion.p>
                    </motion.div>

                    {/* SERVICE PROVIDER RESPONSIBILITIES */}
                    <motion.div
                        className="terms-section"
                        variants={sectionVariants}
                        custom={3}
                    >
                        <motion.h3 variants={sectionVariants} custom={3.1}>
                            Responsibility of the Service Provider
                        </motion.h3>

                        <ul className="terms-list">
                            {serviceProviderResponsibilities.map((item, index) => (
                                <motion.li
                                    key={`provider-${index}`}
                                    variants={listItemVariants}
                                    custom={index + 10}
                                    whileHover={{ x: 5, color: "#6cc24a" }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* CLIENT RESPONSIBILITIES */}
                    <motion.div
                        className="terms-section"
                        variants={sectionVariants}
                        custom={4}
                    >
                        <motion.h3 variants={sectionVariants} custom={4.1}>
                            Responsibilities of the Client
                        </motion.h3>

                        <ul className="terms-list">
                            {clientResponsibilities.map((item, index) => (
                                <motion.li
                                    key={`client-${index}`}
                                    variants={listItemVariants}
                                    custom={index + 20}
                                    whileHover={{ x: 5, color: "#6cc24a" }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* IMPORTANT NOTES - Special highlights */}
                    <motion.div
                        className="terms-section"
                        variants={sectionVariants}
                        custom={5}
                    >
                        <motion.h3 variants={sectionVariants} custom={5.1}>
                            Important Notes
                        </motion.h3>

                        {importantNotes.map((note, index) => (
                            <motion.div
                                key={`note-${index}`}
                                className="terms-important-note"
                                variants={importantNoteVariants}
                                custom={index}
                                whileHover={{
                                    scale: 1.02,
                                    borderLeftColor: "#6cc24a",
                                    backgroundColor: "rgba(108, 194, 74, 0.05)"
                                }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <motion.strong variants={sectionVariants} custom={5.2 + index}>
                                    {note.title}:
                                </motion.strong>
                                <motion.span variants={sectionVariants} custom={5.3 + index}>
                                    {note.content}
                                </motion.span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* USE AS REFERENCE - Marketing */}
                    <motion.div
                        className="terms-section"
                        variants={sectionVariants}
                        custom={6}
                    >
                        <motion.h3 variants={sectionVariants} custom={6.1}>
                            Use as Reference
                        </motion.h3>

                        <motion.p
                            className="terms-text"
                            variants={sectionVariants}
                            custom={6.2}
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {marketingReference}
                        </motion.p>
                    </motion.div>

                    {/* ADDITIONAL REMINDERS */}
                    <motion.div
                        className="terms-section"
                        variants={sectionVariants}
                        custom={7}
                    >
                        <motion.h3 variants={sectionVariants} custom={7.1}>
                            Additional Reminders
                        </motion.h3>

                        <ul className="terms-list">
                            <motion.li
                                variants={listItemVariants}
                                custom={30}
                                whileHover={{ x: 5, color: "#6cc24a" }}
                            >
                                You will get a follow-up from our back office for data upload and for VAT reporting.
                            </motion.li>
                            <motion.li
                                variants={listItemVariants}
                                custom={31}
                                whileHover={{ x: 5, color: "#6cc24a" }}
                            >
                                Our team may contact you for any other information or queries during the course of monthly VAT compliance.
                            </motion.li>
                        </ul>
                    </motion.div>

                    {/* CONTACT INFORMATION */}
                    <motion.div
                        className="terms-section terms-contact"
                        variants={sectionVariants}
                        custom={8}
                    >
                        <motion.h3 variants={sectionVariants} custom={8.1}>
                            Questions?
                        </motion.h3>

                        <motion.p
                            className="terms-text"
                            variants={sectionVariants}
                            custom={8.2}
                        >
                            If you have any questions about these Terms & Conditions, please contact us at:
                        </motion.p>

                        <motion.div
                            className="terms-contact-info"
                            variants={sectionVariants}
                            custom={8.3}
                            whileHover={{ scale: 1.02 }}
                        >
                            <p>Email: <a href="mailto:support@jladgroup.fi">support@jladgroup.fi</a></p>
                            <p>Phone: <a href="tel:+358413250081">+358 413250081</a></p>
                        </motion.div>
                    </motion.div>

                    {/* FOOTER NOTE */}
                    <motion.div
                        className="terms-footer"
                        variants={sectionVariants}
                        custom={9}
                    >
                        <p>By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.</p>
                    </motion.div>
                </motion.div>
            </motion.section>
            <Footer />
        </>
    );
};

export default TermsConditions;