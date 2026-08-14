import React, { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { 
  FiMail, 
  FiLock, 
  FiLogIn, 
  FiUser, 
  FiUserPlus,
  FiAlertCircle,
  FiShield,
  FiCheckCircle,
  FiSettings,
  FiUsers,
  FiBarChart2,
  FiEye,
  FiEyeOff
} from "react-icons/fi";
import "./AdminAuth.scss";

// Validation Schemas
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
});

const registerSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
});

const AdminAuth = () => {
  const [authType, setAuthType] = useState("login"); // "login" or "register"
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Login Formik
  const loginFormik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        setServerError("");
        setSuccessMessage("");

        await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/login`,
          values,
          { withCredentials: true }
        );

        window.location.href = "/admin/dashboard";
      } catch (error) {
        setServerError(
          error.response?.data?.message || 
          "Invalid email or password. Please try again."
        );
        resetForm();
      } finally {
        setLoading(false);
      }
    }
  });

  // Register Formik
  const registerFormik = useFormik({
    initialValues: { 
      name: "", 
      email: "", 
      password: "", 
      confirmPassword: "" 
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        setServerError("");
        setSuccessMessage("");

        const { confirmPassword, ...registerData } = values;

        await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/register`,
          registerData
        );

        setSuccessMessage("Admin registered successfully! You can now login.");
        resetForm();
        
        // Switch to login after successful registration
        setTimeout(() => {
          setAuthType("login");
          setSuccessMessage("");
        }, 3000);

      } catch (error) {
        setServerError(
          error.response?.data?.message || 
          "Registration failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }
  });

  const activeFormik = authType === "login" ? loginFormik : registerFormik;

  const handleAuthTypeChange = (type) => {
    if (type !== authType) {
      setAuthType(type);
      setServerError("");
      setSuccessMessage("");
      loginFormik.resetForm();
      registerFormik.resetForm();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      activeFormik.handleSubmit();
    }
  };

  return (
    <div className="admin-auth">
      <div className="auth-container">
        {/* Auth Form Card - Left Side */}
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="logo-container">
              <div className="logo">
                <FiShield size={32} />
              </div>
              <h1>Admin Portal</h1>
            </div>
            <p className="welcome-text">
              {authType === "login" 
                ? "Access the administrative dashboard" 
                : "Register a new administrator account"
              }
            </p>
          </div>

          {/* Auth Type Toggle */}
          <div className="auth-type-toggle">
            <div className="toggle-container">
              <button
                className={`toggle-option ${authType === "login" ? "active" : ""}`}
                onClick={() => handleAuthTypeChange("login")}
                disabled={loading}
              >
                <FiLogIn size={16} />
                <span>Admin Login</span>
              </button>
              <button
                className={`toggle-option ${authType === "register" ? "active" : ""}`}
                onClick={() => handleAuthTypeChange("register")}
                disabled={loading}
              >
                <FiUserPlus size={16} />
                <span>Admin Register</span>
              </button>
              <div className={`toggle-slider ${authType === "register" ? "slider-right" : "slider-left"}`}></div>
            </div>
          </div>

          {/* Server Error Message */}
          {serverError && (
            <div className="server-error">
              <FiAlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="success-message">
              <FiCheckCircle size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          {authType === "login" && (
            <form onSubmit={loginFormik.handleSubmit} className="auth-form">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="loginEmail" className="form-label">
                  <FiMail size={18} className="input-icon" />
                  Admin Email
                </label>
                <div className="input-container email-container">
                  <FiMail className="input-field-icon" />
                  <input
                    id="loginEmail"
                    name="email"
                    type="email"
                    placeholder="Enter admin email"
                    className={`form-input ${loginFormik.touched.email && loginFormik.errors.email ? 'error' : ''}`}
                    onChange={loginFormik.handleChange}
                    onBlur={loginFormik.handleBlur}
                    value={loginFormik.values.email}
                    disabled={loading}
                  />
                </div>
                {loginFormik.touched.email && loginFormik.errors.email && (
                  <div className="error-message">{loginFormik.errors.email}</div>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="loginPassword" className="form-label">
                  <FiLock size={18} className="input-icon" />
                  Password
                </label>
                <div className="input-container password-container">
                  <FiLock className="input-field-icon" />
                  <input
                    id="loginPassword"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`form-input ${loginFormik.touched.password && loginFormik.errors.password ? 'error' : ''}`}
                    onChange={loginFormik.handleChange}
                    onBlur={loginFormik.handleBlur}
                    value={loginFormik.values.password}
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
                {loginFormik.touched.password && loginFormik.errors.password && (
                  <div className="error-message">{loginFormik.errors.password}</div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-button"
                disabled={loading || !loginFormik.isValid || loginFormik.isSubmitting}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Logging In...
                  </>
                ) : (
                  <>
                    <FiLogIn size={18} />
                    Admin Login
                  </>
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {authType === "register" && (
            <form onSubmit={registerFormik.handleSubmit} className="auth-form">
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="registerName" className="form-label">
                  <FiUser size={18} className="input-icon" />
                  Full Name
                </label>
                <div className="input-container name-container">
                  <FiUser className="input-field-icon" />
                  <input
                    id="registerName"
                    name="name"
                    type="text"
                    placeholder="Enter full name"
                    className={`form-input ${registerFormik.touched.name && registerFormik.errors.name ? 'error' : ''}`}
                    onChange={registerFormik.handleChange}
                    onBlur={registerFormik.handleBlur}
                    value={registerFormik.values.name}
                    disabled={loading}
                  />
                </div>
                {registerFormik.touched.name && registerFormik.errors.name && (
                  <div className="error-message">{registerFormik.errors.name}</div>
                )}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="registerEmail" className="form-label">
                  <FiMail size={18} className="input-icon" />
                  Admin Email
                </label>
                <div className="input-container email-container">
                  <FiMail className="input-field-icon" />
                  <input
                    id="registerEmail"
                    name="email"
                    type="email"
                    placeholder="Enter admin email"
                    className={`form-input ${registerFormik.touched.email && registerFormik.errors.email ? 'error' : ''}`}
                    onChange={registerFormik.handleChange}
                    onBlur={registerFormik.handleBlur}
                    value={registerFormik.values.email}
                    disabled={loading}
                  />
                </div>
                {registerFormik.touched.email && registerFormik.errors.email && (
                  <div className="error-message">{registerFormik.errors.email}</div>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="registerPassword" className="form-label">
                  <FiLock size={18} className="input-icon" />
                  Password
                </label>
                <div className="input-container password-container">
                  <FiLock className="input-field-icon" />
                  <input
                    id="registerPassword"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password (min. 6 characters)"
                    className={`form-input ${registerFormik.touched.password && registerFormik.errors.password ? 'error' : ''}`}
                    onChange={registerFormik.handleChange}
                    onBlur={registerFormik.handleBlur}
                    value={registerFormik.values.password}
                    disabled={loading}
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
                {registerFormik.touched.password && registerFormik.errors.password && (
                  <div className="error-message">{registerFormik.errors.password}</div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  <FiLock size={18} className="input-icon" />
                  Confirm Password
                </label>
                <div className="input-container password-container">
                  <FiLock className="input-field-icon" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className={`form-input ${registerFormik.touched.confirmPassword && registerFormik.errors.confirmPassword ? 'error' : ''}`}
                    onChange={registerFormik.handleChange}
                    onBlur={registerFormik.handleBlur}
                    value={registerFormik.values.confirmPassword}
                    disabled={loading}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    type="button"
                    className="show-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {registerFormik.touched.confirmPassword && registerFormik.errors.confirmPassword && (
                  <div className="error-message">{registerFormik.errors.confirmPassword}</div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-button"
                disabled={loading || !registerFormik.isValid || registerFormik.isSubmitting}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Registering...
                  </>
                ) : (
                  <>
                    <FiUserPlus size={18} />
                    Register Admin
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          {/* <div className="auth-footer">
            <p className="help-text">
              {authType === "login" 
                ? "For security reasons, please use strong passwords." 
                : "Registered admins will have full system access."
              }
            </p>
            
          </div> */}
        </div>

        {/* Info Side - Right Side (Hidden on Mobile) */}
        <div className="auth-info-side">
          <div className="info-content">
            <h2>
              {authType === "login" 
                ? "Admin Dashboard Features" 
                : "Admin Registration Benefits"
              }
            </h2>
            
            {authType === "login" ? (
              <>
                <p>Access powerful administrative tools to manage the entire system efficiently.</p>
                <ul className="features-list">
                  <li><FiSettings /> Manage system configurations</li>
                  <li><FiUsers /> View and manage all users</li>
                  <li><FiBarChart2 /> Access detailed analytics & reports</li>
                  <li><FiShield /> Monitor security and audit logs</li>
                  <li><FiCheckCircle /> Approve/Reject client enrollments</li>
                </ul>
              </>
            ) : (
              <>
                <p>Register new administrators to help manage and maintain the system securely.</p>
                <ul className="features-list">
                  <li><FiUser /> Full system access and control</li>
                  <li><FiShield /> Enhanced security permissions</li>
                  <li><FiUsers /> User management capabilities</li>
                  <li><FiBarChart2 /> Access to all reports and analytics</li>
                  <li><FiSettings /> System configuration rights</li>
                </ul>
              </>
            )}
            
            <div className="security-note">
              <FiShield size={20} />
              <p>
                <strong>Important:</strong> Admin accounts have full system access. 
                Keep credentials secure and only register trusted personnel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;