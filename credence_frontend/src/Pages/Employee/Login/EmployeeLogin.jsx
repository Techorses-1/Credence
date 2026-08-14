import { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from "react-icons/fi";
import "./EmployeeLogin.scss";

// Validation Schema
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required")
});

const EmployeeLogin = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        setServerError("");
        
        await axios.post(
          `${import.meta.env.VITE_API_URL}/employee/login`,
          values,
          { withCredentials: true }
        );
        
        // Redirect to dashboard on successful login
        window.location.href = "/employee/dashboard";
        
      } catch (error) {
        console.error("Login error:", error);
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

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      formik.handleSubmit();
    }
  };

  return (
    <div className="employee-login">
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="logo-container">
              <div className="logo">
                <FiLogIn size={32} />
              </div>
              <h1>Employee Portal</h1>
            </div>
            <p className="welcome-text">Welcome back! Please sign in to your account</p>
          </div>

          {/* Server Error Message */}
          {serverError && (
            <div className="server-error">
              <FiAlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <FiMail size={18} className="input-icon" />
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className={`form-input ${formik.touched.email && formik.errors.email ? 'error' : ''}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                disabled={loading}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="error-message">{formik.errors.email}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="password-label-container">
                <label htmlFor="password" className="form-label">
                  <FiLock size={18} className="input-icon" />
                  Password
                </label>
                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <>
                      <FiEyeOff size={16} />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <FiEye size={16} />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`form-input ${formik.touched.password && formik.errors.password ? 'error' : ''}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                disabled={loading}
                onKeyPress={handleKeyPress}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="error-message">{formik.errors.password}</div>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="forgot-password">
              <a href="/employee/forgot-password" className="forgot-link">
                Forgot your password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading || !formik.isValid || formik.isSubmitting}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                <>
                  <FiLogIn size={18} />
                  Sign In
                </>
              )}
            </button>

            {/* Form Status Info */}
            <div className="form-status">
              {formik.isSubmitting && (
                <div className="submitting-status">Submitting...</div>
              )}
              {!formik.isValid && formik.submitCount > 0 && (
                <div className="validation-hint">
                  Please fix the errors above
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p className="help-text">
              Need help? Contact your administrator
            </p>
            <div className="version-info">
              <span>v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Branding/Info Side (optional) */}
        <div className="login-info-side">
          <div className="info-content">
            <h2>Welcome to Employee Portal</h2>
            <p>
              Access your dashboard, view your schedule, 
              and manage your work profile from one place.
            </p>
            <ul className="features-list">
              <li>View your schedule and tasks</li>
              <li>Access work-related documents</li>
              <li>Update your profile information</li>
              <li>Request time off and leaves</li>
            </ul>
            <div className="security-note">
              <p>
                <strong>Security Note:</strong> Please ensure you're on the official 
                company portal and never share your credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;