import React from "react";
import "./Footer.scss";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { useModal } from "../Model/ModalProvider";

const Footer = () => {
  const { openAgreementModal } = useModal();

  const handleEnrollClick = (e) => {
    e.preventDefault();
    openAgreementModal();
  };

  return (
    <footer className="credence-global-footer">
      <div className="fgf-wrapper">
        {/* TOP */}
        <div className="fgf-top-row">
          {/* LEFT - BRAND */}
          <div className="fgf-col fgf-brand-col">
            <h2>CREDENCE</h2>
            <p className="fgf-owner-line">
              Own By Jlad Group OY
              <br />
              (1234567890)
            </p>
            <p className="fgf-hover-text">
              Bridging solutions,<br />
              Building trust.
            </p>
          </div>

          {/* MIDDLE LEFT - ENROLL/SIGN IN */}
          <div className="fgf-col fgf-links-col">
            <a href="#" onClick={handleEnrollClick}>
              Enroll now
            </a>
            <a href="/login">Sign In</a>
          </div>

          {/* NEW COLUMN - TERMS & POLICIES */}
          <div className="fgf-col fgf-policies-col">
            <a href="/terms">Terms and Conditions</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/cases">Cases</a>
          </div>

          {/* RIGHT - CONTACT */}
          <div className="fgf-col fgf-contact-col">
            <p className="fgf-hover-item">
              <FaPhoneAlt />
              <a href="tel:+358413250081">+358 413250081</a>
            </p>

            <p className="fgf-hover-item">
              <FaEnvelope />
              <a href="mailto:support@jladgroup.fi">
                support@jladgroup.fi
              </a>
            </p>

            <p className="fgf-hover-item">
              <FaEnvelope />
              <a href="mailto:credence@jladgroup.fi">
                credence@jladgroup.fi
              </a>
            </p>

            <p className="fgf-address fgf-hover-item">
              <FaMapMarkerAlt />
              <a
                href="https://www.google.com/maps/search/?api=1&query=Uomarinne+5+A+014+01600+VANTAA+Finland"
                target="_blank"
                rel="noopener noreferrer"
                className="mobileaddress"
              >
                VANTAA Finland.
              </a>
            </p>
          </div>
        </div>

        <div className="fgf-divider-line"></div>

        {/* ============================================ */}
        {/* BOTTOM ROW - COPYRIGHT LEFT | SOCIAL RIGHT */}
        {/* ============================================ */}
        <div className="fgf-bottom-row">
          {/* Copyright - LEFT */}
          <div className="fgf-copyright-left">
            <p className="desktop-view">
              Copyright © 2026 - Credence Developed by
              <span>
                <a
                  rel="noopener noreferrer"
                >
                  J.lad Group OY
                </a>
              </span>
            </p>

            <p className="mobile-view">
              Copyrights © 2026 - Credence <br />
              Developed by{" "}
              <span>
                <a
                  rel="noopener noreferrer"
                >
                  J.lad Group OY
                </a>
              </span>
            </p>
          </div>

          {/* Social Icons - RIGHT */}
          <div className="fgf-social-right">
            <div className="fgf-social-icons">
              <FaInstagram />
              <FaFacebookF />
              <FaLinkedinIn />
              <FaYoutube />
            </div>
          </div>
        </div >
      </div >
    </footer >
  );
};

export default Footer;