import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

// ===== SERVICES LIST =====
const servicesData = [
    { name: "Residence Permit Applications", path: "/appeals/services/residence-permit-applications" },
    { name: "Residence Permit Extensions & Renewals", path: "/appeals/services/residence-permit-extensions-renewals" },
    { name: "Residence Permit Appeals (Administrative Court)", path: "/appeals/services/residence-administrative-court" },
    { name: "Residence Permit Appeals (Supreme Court)", path: "/appeals/services/residence-supreme-court" },
    { name: "Support For Rejected Applications", path: "/appeals/services/support-rejected-applications" },
    { name: "Immigration Documentation & Consultation", path: "/appeals/services/immigration-documentation-consultation" },
];

const AppealsFooter = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavClick = (e, path) => {
        e.preventDefault();
        navigate(path);
    };

    // ---- same matching logic as the navbar ----
    const isActive = (path) => {
        if (path === "/appeals") return location.pathname === "/appeals";
        return location.pathname === path || location.pathname.startsWith(path + "/");
    };

    return (
        <footer className="apf-global-footer">
            <div className="apf-wrapper">
                {/* TOP */}
                <div className="apf-top-row">
                    {/* COL 1 - BRAND */}
                    <div className="apf-col apf-brand-col">
                        <h2>CREDENCE</h2>
                        <p className="apf-owner-line">
                            Owned by J. Lad GROUP Oy
                            <br />
                            Y-tunnus: 3494298-7
                        </p>
                        <p className="apf-hover-text">
                            Clarity in every case,<br />
                            Support at every step.
                        </p>
                    </div>

                    {/* COL 2 - HOME / CASES */}
                    <div className="apf-col apf-links-col">
                        <a
                            href="/appeals"
                            className={isActive("/appeals") ? "active" : ""}
                            onClick={(e) => handleNavClick(e, "/appeals")}
                        >
                            Home
                        </a>
                        <a
                            href="/cases"
                            className={isActive("/cases") ? "active" : ""}
                            onClick={(e) => handleNavClick(e, "/cases")}
                        >
                            Appeals & Cases
                        </a>
                    </div>

                    {/* COL 3 - SERVICES */}
                    <div className="apf-col apf-services-col">
                        {servicesData.map((service, index) => (
                            <a
                                key={index}
                                href={service.path}
                                className={isActive(service.path) ? "active" : ""}
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
                                href="https://www.google.com/maps/search/?api=1&query=Uomarinne+5+A+014+01600+VANTAA+Finland"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="apf-mobileaddress"
                            >
                                VANTAA Finland.
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
                                <a rel="noopener noreferrer">J. lad Group OY</a>
                            </span>
                        </p>

                        <p className="apf-mobile-view">
                            Copyrights © 2026 - Credence <br />
                            Developed by{" "}
                            <span>
                                <a rel="noopener noreferrer">J. lad Group OY</a>
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