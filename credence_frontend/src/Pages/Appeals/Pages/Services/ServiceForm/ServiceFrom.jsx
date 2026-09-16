import React from "react";
import { motion } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaLock } from "react-icons/fa";
import "./ServiceForm.scss";
import { trackStandardEvent } from "../../../../../Components/services/metaPixel";
import { trackCustomEvent as trackGoogleEvent } from "../../../../../Components/services/googleAds"; // adjust path to match your actual folder structure

// ===== SERVICES LIST =====
const servicesData = [
    "Residence Permit Applications",
    "Residence Permit Extensions & Renewals",
    "Residence Permit Appeals (Administrative Court)",
    "Residence Permit Appeals (Supreme Court)",
    "Support For Rejected Applications",
    "Immigration Documentation & Consultation",
];

// ===== VALIDATION SCHEMA =====
const validationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .required("Full name is required"),
    email: Yup.string()
        .trim()
        .email("Enter a valid email address")
        .required("Email is required"),
    phone: Yup.string()
        .trim()
        .matches(/^[0-9+\s-]{7,15}$/, "Enter a valid phone number")
        .required("Phone number is required"),
    service: Yup.string().required("Please select a service"),
    message: Yup.string().trim().max(600, "Message is too long"),
});

// ===== ServiceForm =====
// Pass `defaultService` (must match one entry in servicesData) to pre-select
// and lock the dropdown for that specific service page.
const ServiceForm = ({ defaultService = "" }) => {
    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            phone: "",
            service: defaultService,
            message: "",
        },
        validationSchema,
        onSubmit: async (values, { resetForm, setSubmitting }) => {
            toast.dismiss();
            try {
                // ===== REAL API CALL =====
                // NOTE: adjust the path below ("/service-request/submit") to match
                // however you mount serviceRequestRoutes.js in your server.js/app.js
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/service-request/submit`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            name: values.name.trim(),
                            email: values.email.trim(),
                            phone: values.phone.trim(),
                            service: values.service.trim(),
                            message: values.message.trim(),
                        }),
                    }
                );

                const data = await response.json();

                if (data.success) {
                    toast.success(
                        "🎉 Your request has been submitted! We'll be in touch soon.",
                        {
                            position: "top-center",
                            autoClose: 5000,
                            closeButton: true,
                            draggable: false,
                            pauseOnHover: false,
                            style: { zIndex: 10001, background: "#7cd64b", color: "#000" },
                        }
                    );

                    // ===== TRACKING - only fires after confirmed backend success =====
                    // Same "Lead" event name for all 6 services - the specific
                    // service is attached as data, so it stays filterable later.
                    trackStandardEvent("Lead", {
                        content_name: values.service,
                        content_category: "Service Request",
                    });

                    // Google - plain custom event, no conversion label needed.
                    // Enough for building a remarketing audience of "people who submitted".
                    trackGoogleEvent("service_form_submitted", {
                        service: values.service,
                    });

                    // keep the locked service selected after reset, only clear other fields
                    resetForm({
                        values: {
                            name: "",
                            email: "",
                            phone: "",
                            service: defaultService,
                            message: "",
                        },
                    });
                } else {
                    // e.g. 409 duplicate-request message from backend
                    toast.error(
                        data.message || "Failed to submit request. Please try again.",
                        {
                            position: "top-center",
                            autoClose: 4000,
                            closeButton: true,
                            draggable: false,
                            pauseOnHover: false,
                            style: { zIndex: 10001 },
                        }
                    );
                }
            } catch (error) {
                console.error("Submission error:", error);
                toast.error("Network error. Please check your connection and try again.", {
                    position: "top-center",
                    autoClose: 4000,
                    closeButton: true,
                    draggable: false,
                    pauseOnHover: false,
                    style: { zIndex: 10001 },
                });
            } finally {
                setSubmitting(false);
            }
        },
    });

    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
    };

    const fadeUpVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    return (
        <section className="service-form-section">
            <ToastContainer />
            <div className="service-form__container">
                <motion.div
                    className="service-form__header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={containerVariants}
                >
                    <motion.span className="service-form__eyebrow" variants={fadeUpVariants}>
                        Get Started
                    </motion.span>
                    <motion.h2 className="service-form__heading" variants={fadeUpVariants}>
                        Ready to Apply for This Service?
                    </motion.h2>
                    <motion.p className="service-form__subtitle" variants={fadeUpVariants}>
                        Fill in your details below and our team will reach out to guide
                        you through the next steps.
                    </motion.p>
                </motion.div>

                <motion.div
                    className="service-form__card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <form onSubmit={formik.handleSubmit} noValidate>
                        <div className="service-form__grid">
                            {/* NAME */}
                            <div className="service-form__field">
                                <label htmlFor="name" className="service-form__label">
                                    Full Name*
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    className={`service-form__input ${formik.touched.name && formik.errors.name ? "error" : ""
                                        }`}
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={formik.isSubmitting}
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <span className="service-form__error">{formik.errors.name}</span>
                                )}
                            </div>

                            {/* EMAIL */}
                            <div className="service-form__field">
                                <label htmlFor="email" className="service-form__label">
                                    Email Address*
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className={`service-form__input ${formik.touched.email && formik.errors.email ? "error" : ""
                                        }`}
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={formik.isSubmitting}
                                />
                                {formik.touched.email && formik.errors.email && (
                                    <span className="service-form__error">{formik.errors.email}</span>
                                )}
                            </div>

                            {/* PHONE */}
                            <div className="service-form__field">
                                <label htmlFor="phone" className="service-form__label">
                                    Phone Number*
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="+358 000 000 000"
                                    className={`service-form__input ${formik.touched.phone && formik.errors.phone ? "error" : ""
                                        }`}
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={formik.isSubmitting}
                                />
                                {formik.touched.phone && formik.errors.phone && (
                                    <span className="service-form__error">{formik.errors.phone}</span>
                                )}
                            </div>

                            {/* SERVICE DROPDOWN — LOCKED / READ-ONLY */}
                            <div className="service-form__field">
                                <label htmlFor="service" className="service-form__label">
                                    Selected Service
                                    <FaLock className="service-form__lock-icon" />
                                </label>
                                <select
                                    id="service"
                                    name="service"
                                    className="service-form__select service-form__select--locked"
                                    value={formik.values.service}
                                    onChange={formik.handleChange}
                                    disabled
                                >
                                    {!defaultService && <option value="">Choose a service</option>}
                                    {servicesData.map((service, index) => (
                                        <option key={index} value={service}>
                                            {service}
                                        </option>
                                    ))}
                                </select>
                                {formik.touched.service && formik.errors.service && (
                                    <span className="service-form__error">{formik.errors.service}</span>
                                )}
                            </div>

                            {/* MESSAGE */}
                            <div className="service-form__field service-form__field--full">
                                <label htmlFor="message" className="service-form__label">
                                    Message <span className="service-form__optional">(optional)</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={4}
                                    placeholder="Tell us a bit more about your situation..."
                                    className={`service-form__textarea ${formik.touched.message && formik.errors.message ? "error" : ""
                                        }`}
                                    value={formik.values.message}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={formik.isSubmitting}
                                ></textarea>
                                {formik.touched.message && formik.errors.message && (
                                    <span className="service-form__error">{formik.errors.message}</span>
                                )}
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            className="service-form__submit-btn"
                            disabled={formik.isSubmitting}
                            whileHover={formik.isSubmitting ? {} : { scale: 1.02 }}
                            whileTap={formik.isSubmitting ? {} : { scale: 0.98 }}
                        >
                            {formik.isSubmitting ? "Submitting..." : "Submit Request"}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </section>
    );
};

export default ServiceForm;