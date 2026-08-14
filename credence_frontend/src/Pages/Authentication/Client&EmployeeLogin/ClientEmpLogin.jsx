import React, { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiMail,
  FiLock,
  FiLogIn,
  FiEye,
  FiEyeOff,
  FiUser,
  FiBriefcase,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiCalendar,
  FiShield,
  FiX
} from "react-icons/fi";
import "./ClientEmpLogin.scss";
import { useModal } from "../../Home/Model/ModalProvider";

// Validation Schemas
const employeeLoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required")
});

const clientLoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
});

const ClientEmpLogin = () => {
  const [loginType, setLoginType] = useState("client");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  // Forgot Password States
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [verifyToken, setVerifyToken] = useState("");

  const { openAgreementModal } = useModal();

  const handleEnrollNowClick = (e) => {
    e.preventDefault();
    openAgreementModal();
  };

  // Configure axios defaults
  axios.defaults.withCredentials = true;

  // Employee Login
  const employeeFormik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: employeeLoginSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        setServerError("");

        console.log("📝 Attempting employee login:", {
          email: values.email,
          timestamp: new Date().toISOString()
        });

        await axios.post(
          `${import.meta.env.VITE_API_URL}/employee/login`,
          values
        );

        console.log("✅ Employee login successful");
        window.location.href = "/employee/dashboard";

      } catch (error) {
        // Log error to console with details
        console.error("❌ Employee login error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
          method: error.config?.method,
          timestamp: new Date().toISOString()
        });

        // Show appropriate toast message
        if (error.response) {
          const { status, data } = error.response;

          switch (status) {
            case 401:
              toast.error(data?.message || "Invalid password. Please try again.");
              break;
            case 404:
              toast.error(data?.message || "Email not found. Please check and try again.");
              break;
            case 400:
              toast.error(data?.message || "Invalid input. Please check your credentials.");
              break;
            case 500:
              toast.error("Server error. Please try again later.");
              break;
            default:
              toast.error(data?.message || "Login failed. Please try again.");
          }
        } else if (error.request) {
          console.error("📡 No response received:", error.request);
          toast.error("Network error. Please check your internet connection.");
        } else {
          console.error("⚙️ Request setup error:", error.message);
          toast.error("An unexpected error occurred. Please try again.");
        }

        resetForm();
      } finally {
        setLoading(false);
      }
    }
  });

  // Client Login
  const clientFormik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: clientLoginSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        setServerError("");

        console.log("📝 Attempting client login:", {
          email: values.email,
          timestamp: new Date().toISOString()
        });

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/client/login`,
          values
        );

        console.log("✅ Client login successful:", {
          data: response.data,
          cookies: document.cookie,
          timestamp: new Date().toISOString()
        });

        // Show success toast (optional - you can remove if you don't want it)
        toast.success("Login successful! Redirecting...", {
          autoClose: 1500,
        });

        // Immediate redirect - this is key!
        window.location.href = "/client/dashboard";

      } catch (error) {
        // Log error to console with full details
        console.error("❌ Client login error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data
          },
          timestamp: new Date().toISOString()
        });

        // Handle different error scenarios with specific toasts
        if (error.response) {
          const { status, data } = error.response;

          switch (status) {
            case 401:
              toast.error(data?.message || "Incorrect password. Please try again.");
              break;
            case 404:
              toast.error(data?.message || "Email not registered. Please enroll first.");
              break;
            case 400:
              toast.error(data?.message || "Invalid input. Please check your credentials.");
              break;
            case 500:
              toast.error("Server error. Please try again later.");
              break;
            default:
              toast.error(data?.message || "Login failed. Please try again.");
          }
        } else if (error.request) {
          console.error("📡 No response received - Network Error:", error.request);
          toast.error("Cannot connect to server. Please check your internet connection.");
        } else {
          console.error("⚙️ Request configuration error:", error.message);
          toast.error("An unexpected error occurred. Please try again.");
        }

        resetForm();
      } finally {
        setLoading(false);
      }
    }
  });

  const activeFormik = loginType === "employee" ? employeeFormik : clientFormik;

  const handleLoginTypeChange = (type) => {
    if (type !== loginType) {
      setLoginType(type);
      setServerError("");
      employeeFormik.resetForm();
      clientFormik.resetForm();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      activeFormik.handleSubmit();
    }
  };

  // Forgot Password Functions with enhanced error logging
  const handleForgotPassword = async (step) => {
    setForgotPasswordError("");
    setForgotPasswordSuccess("");

    if (step === 1) {
      if (!forgotEmail) {
        setForgotPasswordError("Please enter your email");
        return;
      }

      setForgotLoading(true);
      try {
        console.log("📝 Sending forgot password OTP to:", forgotEmail);

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/client/forgot-password`,
          { email: forgotEmail }
        );

        console.log("✅ Forgot password OTP sent:", response.data);

        if (response.data.success) {
          setForgotPasswordStep(2);
          setForgotPasswordSuccess("OTP sent to your email. Check your inbox.");
          toast.success("OTP sent successfully!");
        }
      } catch (error) {
        console.error("❌ Forgot password error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });

        const errorMsg = error.response?.data?.message || "Failed to send OTP. Please try again.";
        setForgotPasswordError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setForgotLoading(false);
      }

    } else if (step === 2) {
      if (!forgotOtp || forgotOtp.length !== 4) {
        setForgotPasswordError("Please enter a valid 4-digit OTP");
        return;
      }

      setForgotLoading(true);
      try {
        console.log("📝 Verifying OTP for:", forgotEmail);

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/client/verify-otp`,
          { email: forgotEmail, otp: forgotOtp }
        );

        console.log("✅ OTP verified:", response.data);

        if (response.data.success) {
          setVerifyToken(response.data.verifyToken);
          setForgotPasswordStep(3);
          setForgotPasswordSuccess("OTP verified. Now set your new password.");
          toast.success("OTP verified successfully!");
        }
      } catch (error) {
        console.error("❌ OTP verification error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });

        const errorMsg = error.response?.data?.message || "Invalid OTP. Please try again.";
        setForgotPasswordError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setForgotLoading(false);
      }

    } else if (step === 3) {
      if (!newPassword || !confirmPassword) {
        setForgotPasswordError("Please enter and confirm your new password");
        return;
      }

      if (newPassword.length < 6) {
        setForgotPasswordError("Password must be at least 6 characters");
        return;
      }

      if (newPassword !== confirmPassword) {
        setForgotPasswordError("Passwords do not match");
        return;
      }

      setForgotLoading(true);
      try {
        console.log("📝 Resetting password for token:", verifyToken);

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/client/reset-password`,
          { verifyToken, newPassword }
        );

        console.log("✅ Password reset successful:", response.data);

        if (response.data.success) {
          setForgotPasswordSuccess("Password updated successfully! You can now login.");
          toast.success("Password updated successfully!");

          setTimeout(() => {
            setForgotPasswordModal(false);
            resetForgotPasswordForm();
          }, 2000);
        }
      } catch (error) {
        console.error("❌ Password reset error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });

        const errorMsg = error.response?.data?.message || "Failed to reset password. Please try again.";
        setForgotPasswordError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setForgotLoading(false);
      }
    }
  };

  const resetForgotPasswordForm = () => {
    setForgotPasswordStep(1);
    setForgotEmail("");
    setForgotOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
    setVerifyToken("");
  };

  return (
    <div className="client-emp-login">
      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="login-container">
        {/* Login Form Card - Left Side */}
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="logo-container">
              <div className="logo">
                <FiShield size={32} />
              </div>
              <h1>Secure Portal</h1>
            </div>
            <p className="welcome-text">
              {loginType === "employee"
                ? "Employee access to company resources"
                : "Client access to your account dashboard"
              }
            </p>
          </div>

          {/* Login Type Toggle */}
          <div className="login-type-toggle">
            <div className="toggle-container">
              <button
                className={`toggle-option ${loginType === "client" ? "active" : ""}`}
                onClick={() => handleLoginTypeChange("client")}
                disabled={loading}
              >
                <FiUser size={16} />
                <span>Client Login</span>
              </button>
              <button
                className={`toggle-option ${loginType === "employee" ? "active" : ""}`}
                onClick={() => handleLoginTypeChange("employee")}
                disabled={loading}
              >
                <FiBriefcase size={16} />
                <span>Employee Login</span>
              </button>
              <div className={`toggle-slider ${loginType === "employee" ? "slider-right" : "slider-left"}`}></div>
            </div>
          </div>

          {/* Server Error Message */}
          {serverError && (
            <div className="server-error">
              <FiAlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={activeFormik.handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <FiMail size={18} className="input-icon" />
                Email Address
              </label>
              <div className="input-container email-container">
                <FiMail className="input-field-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={loginType === "employee"
                    ? "Enter your company email"
                    : "Enter your registered email"
                  }
                  className={`form-input ${activeFormik.touched.email && activeFormik.errors.email ? 'error' : ''}`}
                  onChange={activeFormik.handleChange}
                  onBlur={activeFormik.handleBlur}
                  value={activeFormik.values.email}
                  disabled={loading}
                />
              </div>
              {activeFormik.touched.email && activeFormik.errors.email && (
                <div className="error-message">{activeFormik.errors.email}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <FiLock size={18} className="input-icon" />
                Password
              </label>
              <div className="input-container password-container">
                <FiLock className="input-field-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`form-input ${activeFormik.touched.password && activeFormik.errors.password ? 'error' : ''}`}
                  onChange={activeFormik.handleChange}
                  onBlur={activeFormik.handleBlur}
                  value={activeFormik.values.password}
                  disabled={loading}
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  disabled={loading}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {activeFormik.touched.password && activeFormik.errors.password && (
                <div className="error-message">{activeFormik.errors.password}</div>
              )}
            </div>

            <div className={`forgot-password ${loginType === 'client' ? 'client-only' : 'employee-only'}`}>
              <button type="button" className="forgot-link" onClick={() => setForgotPasswordModal(true)}>
                Forgot Your Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading || !activeFormik.isValid || activeFormik.isSubmitting}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                <>
                  <FiLogIn size={18} />
                  {loginType === "employee" ? "Employee Sign In" : "Client Sign In"}
                </>
              )}
            </button>

            {/* Enrollment Link for Clients */}
            {loginType === "client" && (
              <div className="enrollment-link">
                <p>
                  Don't have an account?{" "}
                  <a href="#" onClick={handleEnrollNowClick}>
                    Enroll here
                  </a>
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Info Side - Right Side */}
        <div className="login-info-side">
          <div className="info-content">
            <h2>
              {loginType === "employee"
                ? "Employee Portal Features"
                : "Client Portal Benefits"
              }
            </h2>

            {loginType === "employee" ? (
              <>
                <p>Manage accounting tasks assigned by admin with secure access.</p>
                <ul className="features-list">
                  <li><FiCheckCircle /> View assigned client accounting tasks</li>
                  <li><FiFileText /> Access client documents for accounting</li>
                  <li><FiClock /> Track task completion status</li>
                  <li><FiCalendar /> Manage monthly accounting assignments</li>
                  <li><FiShield /> Secure document access & processing</li>
                </ul>
              </>
            ) : (
              <>
                <p>Manage your accounting services and documents in one secure place.</p>
                <ul className="features-list">
                  <li><FiCheckCircle /> Upload business documents securely</li>
                  <li><FiFileText /> Track assigned employee & task status</li>
                  <li><FiClock /> Monitor accounting progress monthly</li>
                  <li><FiCalendar /> View which tasks are completed</li>
                  <li><FiShield /> Your financial data is always protected</li>
                </ul>
              </>
            )}

            <div className="security-note">
              <FiShield size={20} />
              <p>
                <strong>Security First:</strong> All financial data is secured for protection.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordModal && (
        <div className="forgot-password-modal-overlay">
          <div className="forgot-password-modal">
            <div className="modal-header">
              <h3>Reset Your Password</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setForgotPasswordModal(false);
                  resetForgotPasswordForm();
                }}
                disabled={forgotLoading}
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="modal-content">
              {/* Step Indicator */}
              <div className="step-indicator">
                <div className={`step ${forgotPasswordStep >= 1 ? 'active' : ''}`}>
                  <span>1</span>
                  <p>Enter Email</p>
                </div>
                <div className={`step-line ${forgotPasswordStep >= 2 ? 'active' : ''}`}></div>
                <div className={`step ${forgotPasswordStep >= 2 ? 'active' : ''}`}>
                  <span>2</span>
                  <p>Verify OTP</p>
                </div>
                <div className={`step-line ${forgotPasswordStep >= 3 ? 'active' : ''}`}></div>
                <div className={`step ${forgotPasswordStep >= 3 ? 'active' : ''}`}>
                  <span>3</span>
                  <p>New Password</p>
                </div>
              </div>

              {/* Error Message */}
              {forgotPasswordError && (
                <div className="modal-error">
                  <FiAlertCircle size={16} />
                  <span>{forgotPasswordError}</span>
                </div>
              )}

              {/* Success Message */}
              {forgotPasswordSuccess && (
                <div className="modal-success">
                  <FiCheckCircle size={16} />
                  <span>{forgotPasswordSuccess}</span>
                </div>
              )}

              {/* Step 1: Email Input */}
              {forgotPasswordStep === 1 && (
                <div className="step-content">
                  <div className="form-group">
                    <label>
                      <FiMail size={16} />
                      Enter your registered email
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      disabled={forgotLoading}
                      className="modal-input"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: OTP Input */}
              {forgotPasswordStep === 2 && (
                <div className="step-content">
                  <div className="form-group">
                    <label>
                      <FiLock size={16} />
                      Enter 4-digit OTP sent to {forgotEmail}
                    </label>
                    <div className="otp-input-container">
                      <input
                        type="text"
                        maxLength="4"
                        placeholder="1234"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                        disabled={forgotLoading}
                        className="modal-input otp-input"
                      />
                    </div>
                    <p className="otp-hint">
                      Check your email inbox and spam folder. OTP expires in 10 minutes.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: New Password */}
              {forgotPasswordStep === 3 && (
                <div className="step-content">
                  <div className="form-group">
                    <label>
                      <FiLock size={16} />
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password (min. 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={forgotLoading}
                      className="modal-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FiLock size={16} />
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={forgotLoading}
                      className="modal-input"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="modal-actions">
                {forgotPasswordStep > 1 && (
                  <button
                    className="modal-btn secondary"
                    onClick={() => setForgotPasswordStep(forgotPasswordStep - 1)}
                    disabled={forgotLoading}
                  >
                    Back
                  </button>
                )}

                <button
                  className="modal-btn primary"
                  onClick={() => handleForgotPassword(forgotPasswordStep)}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <>
                      <span className="spinner small"></span>
                      Processing...
                    </>
                  ) : forgotPasswordStep === 3 ? (
                    "Update Password"
                  ) : forgotPasswordStep === 2 ? (
                    "Verify OTP"
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </div>

              {/* Resend OTP Link (Step 2 only) */}
              {forgotPasswordStep === 2 && (
                <p className="resend-link">
                  Didn't receive OTP?{" "}
                  <button
                    type="button"
                    onClick={() => handleForgotPassword(1)}
                    disabled={forgotLoading}
                  >
                    Resend OTP
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientEmpLogin;