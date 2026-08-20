import React from "react";
import { useNavigate } from "react-router-dom";
import "./AppealsFooter.scss";
import {
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaInstagram,
    FaFacebookF,
    FaLinkedinIn,
    FaYoutube,
} from "react-icons/fa";

// ===== SERVICES LIST (replace with your real 6 services + routes) =====
const servicesData = [
    { name: "Service One", path: "/services/service-one" },
    { name: "Service Two", path: "/services/service-two" },
    { name: "Service Three", path: "/services/service-three" },
    { name: "Service Four", path: "/services/service-four" },
    { name: "Service Five", path: "/services/service-five" },
    { name: "Service Six", path: "/services/service-six" },
];

const AppealsFooter = () => {
    const navigate = useNavigate();

    const handleNavClick = (e, path) => {
        e.preventDefault();
        navigate(path);
    };

    return (
        <footer className="apf-global-footer">
            <div className="apf-wrapper">
                {/* TOP */}
                <div className="apf-top-row">
                    {/* COL 1 - BRAND */}
                    <div className="apf-col apf-brand-col">
                        {/* Replace with your real brand name */}
                        <h2>CREDENCE</h2>
                        <p className="apf-hover-text">
                            Clarity in every case,<br />
                            Support at every step.
                        </p>
                    </div>

                    {/* COL 2 - HOME / CASES */}
                    <div className="apf-col apf-links-col">
                        <a href="/appeals" onClick={(e) => handleNavClick(e, "/appeals")}>
                            Home
                        </a>
                        <a href="/cases" onClick={(e) => handleNavClick(e, "/cases")}>
                            Appeals & Cases
                        </a>
                    </div>

                    {/* COL 3 - SERVICES */}
                    <div className="apf-col apf-services-col">
                        {servicesData.map((service, index) => (
                            <a
                                key={index}
                                href={service.path}
                                onClick={(e) => handleNavClick(e, service.path)}
                            >
                                {service.name}
                            </a>
                        ))}
                    </div>

                    {/* COL 4 - CONTACT */}
                    <div className="apf-col apf-contact-col">
                        <p className="apf-hover-item">
                            <FaPhoneAlt />
                            <a href="tel:+358413250081">+358 413250081</a>
                        </p>

                        <p className="apf-hover-item">
                            <FaEnvelope />
                            <a href="mailto:support@jladgroup.fi">support@jladgroup.fi</a>
                        </p>

                        <p className="apf-hover-item">
                            <FaEnvelope />
                            <a href="mailto:credence@jladgroup.fi">credence@jladgroup.fi</a>
                        </p>

                        <p className="apf-address apf-hover-item">
                            <FaMapMarkerAlt />
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=Your+Address+Here"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="apf-mobileaddress"
                            >
                                Uomarinne 5 A 014, 01600,{" "}
                                <span>
                                    <br className="apf-mobilebreak" />
                                </span>
                                VANTAA Uusimaa Finland.
                            </a>
                        </p>
                    </div>
                </div>

                <div className="apf-divider-line"></div>

                {/* BOTTOM ROW - COPYRIGHT LEFT | SOCIAL RIGHT */}
                <div className="apf-bottom-row">
                    <div className="apf-copyright-left">
                        <p className="apf-desktop-view">
                            Copyright © 2026 - Credence Developed by
                            <span>
                                <a rel="noopener noreferrer">Vapautus Media Private Limited</a>
                            </span>
                        </p>

                        <p className="apf-mobile-view">
                            Copyrights © 2026 - Credence <br />
                            Developed by{" "}
                            <span>
                                <a rel="noopener noreferrer">Vapautus Media Private Limited</a>
                            </span>
                        </p>
                    </div>

                    <div className="apf-social-right">
                        <div className="apf-social-icons">
                            <FaInstagram />
                            <FaFacebookF />
                            <FaLinkedinIn />
                            <FaYoutube />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default AppealsFooter;