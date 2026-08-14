import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiBriefcase,
    FiShield,
    FiFileText,
    FiCalendar,
    FiGlobe,
    FiLock,
    FiEye,
    FiEyeOff,
    FiCheck,
    FiX,
    FiAlertCircle,
    FiInfo,
    FiEdit,
    FiSave,
    FiCheckCircle,
    FiCreditCard,
    FiRefreshCw
} from "react-icons/fi";
import { MdOutlineBusinessCenter, MdOutlineVpnKey } from "react-icons/md";
import { TbBuildingBank } from "react-icons/tb";
import "./ClientProfile.scss";
import ClientLayout from "../Layout/ClientLayout";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ClientProfile = () => {
    const navigate = useNavigate();
    const [clientData, setClientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        visaType: '',
        hasStrongId: '',
        businessAddress: '',
        bankAccount: '',
        bicCode: '',
        businessName: '',
        vatPeriod: '',
        businessNature: '',
        registerTrade: ''
    });

    // Change Password Modal States
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    // Forgot Password Modal States
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotOtp, setForgotOtp] = useState("");
    const [forgotNewPassword, setForgotNewPassword] = useState("");
    const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
    const [forgotPasswordError, setForgotPasswordError] = useState("");
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [verifyToken, setVerifyToken] = useState("");

    // Change Plan Modal States
    const [showChangePlanModal, setShowChangePlanModal] = useState(false);
    const [selectedNewPlan, setSelectedNewPlan] = useState("");
    const [changingPlan, setChangingPlan] = useState(false);
    const [planChangeInfo, setPlanChangeInfo] = useState(null);

    // Plan prices
    const planPrices = {
        // Toiminimi plans
        'Lite': '40 Euros + VAT',
        'Taxi': '45 Euros + VAT',
        'Premium': '50 Euros + VAT',
        'Pro': '60 Euros + VAT',
        'Restaurant': '80 Euros + VAT',
        // Osakeyhtiö plans
        'Lite Oy': '120 Euros + VAT',
        'Premium Oy': '160 Euros + VAT',
        'Pro Oy': '200 Euros + VAT'
    };

    // Fetch client data
    useEffect(() => {
        const fetchClientData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/client/me`,
                    { withCredentials: true }
                );
                setClientData(response.data);
                // Initialize form data
                if (response.data) {
                    setFormData({
                        firstName: response.data.firstName || '',
                        lastName: response.data.lastName || '',
                        email: response.data.email || '',
                        phone: response.data.phone || '',
                        address: response.data.address || '',
                        visaType: response.data.visaType || '',
                        hasStrongId: response.data.hasStrongId || '',
                        businessAddress: response.data.businessAddress || '',
                        bankAccount: response.data.bankAccount || '',
                        bicCode: response.data.bicCode || '',
                        businessName: response.data.businessName || '',
                        vatPeriod: response.data.vatPeriod || '',
                        businessNature: response.data.businessNature || '',
                        registerTrade: response.data.registerTrade || ''
                    });

                    // Set plan change info if exists
                    // Set plan change info if exists
                    if (response.data.nextMonthPlan) {
                        setPlanChangeInfo({
                            currentPlan: response.data.planSelected,
                            nextMonthPlan: response.data.nextMonthPlan,
                            effectiveDate: response.data.planEffectiveFrom ? new Date(response.data.planEffectiveFrom) : null,
                            // REMOVED: changeType based on date - now always scheduled if exists
                            changeType: 'scheduled'
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch client data:", error);
                if (error.response?.status === 401) {
                    navigate("/client/login");
                } else {
                    setError("Failed to load profile data. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchClientData();
    }, [navigate]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle radio button changes
    const handleRadioChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Save profile updates
    const handleSaveProfile = async () => {
        try {
            setSaving(true);

            // Validate required fields
            const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'visaType', 'hasStrongId', 'businessAddress', 'businessName', 'vatPeriod', 'businessNature', 'registerTrade'];
            const emptyFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');

            if (emptyFields.length > 0) {
                toast.error(`Please fill all required fields: ${emptyFields.join(', ')}`, {
                    position: "top-center",
                    autoClose: 5000,
                });
                return;
            }

            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/client/update-profile`,
                formData,
                { withCredentials: true }
            );

            if (response.data.success) {
                // Update client data with new values
                setClientData(prev => ({
                    ...prev,
                    ...formData
                }));

                setIsEditing(false);
                toast.success("Profile updated successfully!", {
                    position: "top-center",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast.error(error.response?.data?.message || "Failed to update profile. Please try again.", {
                position: "top-center",
                autoClose: 5000,
            });
        } finally {
            setSaving(false);
        }
    };

    // Cancel editing
    const handleCancelEdit = () => {
        // Reset form data to original client data
        if (clientData) {
            setFormData({
                firstName: clientData.firstName || '',
                lastName: clientData.lastName || '',
                email: clientData.email || '',
                phone: clientData.phone || '',
                address: clientData.address || '',
                visaType: clientData.visaType || '',
                hasStrongId: clientData.hasStrongId || '',
                businessAddress: clientData.businessAddress || '',
                bankAccount: clientData.bankAccount || '',
                bicCode: clientData.bicCode || '',
                businessName: clientData.businessName || '',
                vatPeriod: clientData.vatPeriod || '',
                businessNature: clientData.businessNature || '',
                registerTrade: clientData.registerTrade || ''
            });
        }
        setIsEditing(false);
    };

    // Handle Change Plan
    const handleChangePlan = async () => {
        if (!selectedNewPlan) {
            toast.error("Please select a plan", {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }

        if (selectedNewPlan === clientData?.planSelected) {
            toast.error(`You are already on the ${selectedNewPlan} plan`, {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }

        setChangingPlan(true);
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/client/change-plan`,
                { newPlan: selectedNewPlan },
                { withCredentials: true }
            );

            if (response.data.success) {
                // Update client data with new plan (IMMEDIATE)
                setClientData(prev => ({
                    ...prev,
                    planSelected: response.data.planDetails.planSelected,
                    currentPlan: response.data.planDetails.currentPlan,
                    nextMonthPlan: '',  // Always cleared now
                    planEffectiveFrom: new Date() // Today's date
                }));

                // Clear any pending plan change info
                setPlanChangeInfo(null);

                // Show success toast with immediate message
                toast.success(`✅ Plan changed to ${selectedNewPlan} successfully!`, {
                    position: "top-center",
                    autoClose: 5000,
                });

                setShowChangePlanModal(false);
                setSelectedNewPlan("");
            }
        } catch (error) {
            console.error("Failed to change plan:", error);
            toast.error(error.response?.data?.message || "Failed to change plan. Please try again.", {
                position: "top-center",
                autoClose: 5000,
            });
        } finally {
            setChangingPlan(false);
        }
    };

    // Handle Change Password with Old Password Verification
    const handleChangePassword = async () => {
        setPasswordError("");
        setPasswordSuccess("");

        // Validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordError("All fields are required");
            toast.error("All fields are required", {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters");
            toast.error("New password must be at least 6 characters", {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match");
            toast.error("New passwords do not match", {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }

        if (oldPassword === newPassword) {
            setPasswordError("New password must be different from current password");
            toast.error("New password must be different from current password", {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }

        setChangingPassword(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/client/change-password`,
                { oldPassword, newPassword },
                { withCredentials: true }
            );

            if (response.data.success) {
                setPasswordSuccess("Password changed successfully!");
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");

                toast.success("Password changed successfully!", {
                    position: "top-center",
                    autoClose: 3000,
                });

                setTimeout(() => {
                    setShowChangePasswordModal(false);
                    setPasswordSuccess("");
                }, 2000);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to change password. Please try again.";
            setPasswordError(errorMessage);
            toast.error(errorMessage, {
                position: "top-center",
                autoClose: 5000,
            });
        } finally {
            setChangingPassword(false);
        }
    };

    // Forgot Password Functions
    const handleForgotPassword = async (step) => {
        setForgotPasswordError("");
        setForgotPasswordSuccess("");

        if (step === 1) {
            if (!forgotEmail) {
                setForgotPasswordError("Please enter your email");
                toast.error("Please enter your email", {
                    position: "top-center",
                    autoClose: 3000,
                });
                return;
            }

            setForgotLoading(true);
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/client/forgot-password`,
                    { email: forgotEmail }
                );

                if (response.data.success) {
                    setForgotPasswordStep(2);
                    setForgotPasswordSuccess("OTP sent to your email. Check your inbox.");
                    toast.success("OTP sent to your email. Check your inbox.", {
                        position: "top-center",
                        autoClose: 3000,
                    });
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Failed to send OTP. Please try again.";
                setForgotPasswordError(errorMessage);
                toast.error(errorMessage, {
                    position: "top-center",
                    autoClose: 5000,
                });
            } finally {
                setForgotLoading(false);
            }

        } else if (step === 2) {
            if (!forgotOtp || forgotOtp.length !== 4) {
                setForgotPasswordError("Please enter a valid 4-digit OTP");
                toast.error("Please enter a valid 4-digit OTP", {
                    position: "top-center",
                    autoClose: 3000,
                });
                return;
            }

            setForgotLoading(true);
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/client/verify-otp`,
                    { email: forgotEmail, otp: forgotOtp }
                );

                if (response.data.success) {
                    setVerifyToken(response.data.verifyToken);
                    setForgotPasswordStep(3);
                    setForgotPasswordSuccess("OTP verified. Now set your new password.");
                    toast.success("OTP verified. Now set your new password.", {
                        position: "top-center",
                        autoClose: 3000,
                    });
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Invalid OTP. Please try again.";
                setForgotPasswordError(errorMessage);
                toast.error(errorMessage, {
                    position: "top-center",
                    autoClose: 5000,
                });
            } finally {
                setForgotLoading(false);
            }

        } else if (step === 3) {
            if (!forgotNewPassword || !forgotConfirmPassword) {
                setForgotPasswordError("Please enter and confirm your new password");
                toast.error("Please enter and confirm your new password", {
                    position: "top-center",
                    autoClose: 3000,
                });
                return;
            }

            if (forgotNewPassword.length < 6) {
                setForgotPasswordError("Password must be at least 6 characters");
                toast.error("Password must be at least 6 characters", {
                    position: "top-center",
                    autoClose: 3000,
                });
                return;
            }

            if (forgotNewPassword !== forgotConfirmPassword) {
                setForgotPasswordError("Passwords do not match");
                toast.error("Passwords do not match", {
                    position: "top-center",
                    autoClose: 3000,
                });
                return;
            }

            setForgotLoading(true);
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/client/reset-password`,
                    { verifyToken, newPassword: forgotNewPassword }
                );

                if (response.data.success) {
                    setForgotPasswordSuccess("Password updated successfully! You can now login.");
                    toast.success("Password updated successfully! You can now login.", {
                        position: "top-center",
                        autoClose: 3000,
                    });
                    setTimeout(() => {
                        setShowForgotPasswordModal(false);
                        resetForgotPasswordForm();
                        navigate("/client/login");
                    }, 3000);
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Failed to reset password. Please try again.";
                setForgotPasswordError(errorMessage);
                toast.error(errorMessage, {
                    position: "top-center",
                    autoClose: 5000,
                });
            } finally {
                setForgotLoading(false);
            }
        }
    };

    const resetForgotPasswordForm = () => {
        setForgotPasswordStep(1);
        setForgotEmail("");
        setForgotOtp("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");
        setForgotPasswordError("");
        setForgotPasswordSuccess("");
        setVerifyToken("");
    };

    const resetChangePasswordForm = () => {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
        setPasswordSuccess("");
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const resetChangePlanForm = () => {
        setSelectedNewPlan("");
        setChangingPlan(false);
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Check if today is 1st of month
    const isFirstOfMonth = () => {
        const today = new Date();
        return today.getDate() === 1;
    };

    // Loading state
    if (loading) {
        return (
            <ClientLayout>
                <div className="client-profile-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your profile...</p>
                </div>
            </ClientLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <ClientLayout>
                <div className="client-profile-error">
                    <div className="error-icon">⚠️</div>
                    <h3>Error Loading Profile</h3>
                    <p>{error}</p>
                    <button
                        className="retry-btn"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout>
            <ToastContainer />
            <div className="client-profile-container">
                {/* Header - Matching Upload Page */}
                <div className="profile-header">
                    <div className="header-left">
                        <h2>Client Profile</h2>
                        <p className="subtitle">
                            {isEditing ? "Edit your profile information" : "View and manage your account information"}
                        </p>
                    </div>
                    <div className="header-actions">
                        {!isEditing ? (
                            <button
                                className="edit-profile-btn"
                                onClick={() => setIsEditing(true)}
                            >
                                <FiEdit size={16} />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="edit-actions">
                                <button
                                    className="cancel-btn"
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                >
                                    <FiX size={16} />
                                    Cancel
                                </button>
                                <button
                                    className="save-btn"
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <span className="spinner small"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave size={16} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="main-content">
                    {/* Left Sidebar - Quick Actions */}
                    <div className="profile-sidebar">
                        <div className="sidebar-header">
                            <h3>
                                <FiUser size={20} /> Account Summary
                            </h3>
                        </div>

                        <div className="account-summary-section">
                            <div className="avatar-section">
                                <div className="avatar">
                                    <FiUser size={32} />
                                </div>
                                <div className="avatar-info">
                                    <h4>{clientData?.name || `${clientData?.firstName} ${clientData?.lastName}`}</h4>
                                    <p className="email">{clientData?.email}</p>
                                </div>
                            </div>

                            <div className={`status-badge ${clientData?.isActive ? 'active' : 'inactive'}`}>
                                {clientData?.isActive ? 'Active Account' : 'Inactive Account'}
                            </div>

                            <div className="quick-actions">
                                <button
                                    className="change-password-btn"
                                    onClick={() => setShowChangePasswordModal(true)}
                                >
                                    <FiLock size={16} />
                                    Change Password
                                </button>
                                <button
                                    className="change-plan-btn"
                                    onClick={() => setShowChangePlanModal(true)}
                                >
                                    <FiCreditCard size={16} />
                                    Change Plan
                                </button>
                                <button
                                    className="forgot-password-link"
                                    onClick={() => setShowForgotPasswordModal(true)}
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            {clientData?.enrollmentDate && (
                                <div className="account-info">
                                    <div className="info-item">
                                        <span className="label">Member Since:</span>
                                        <span className="value">
                                            {new Date(clientData.enrollmentDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Current Plan:</span>
                                        <span className="value plan-badge">{clientData?.planSelected || "N/A"}</span>
                                    </div>
                                    {clientData?.nextMonthPlan && (
                                        <div className="info-item">
                                            <span className="label">Plan from next month:</span>
                                            <span className="value next-plan-badge">{clientData.nextMonthPlan}</span>
                                        </div>
                                    )}
                                    {/* <div className="info-item">
                                        <span className="label">Client ID:</span>
                                        <span className="value client-id">{clientData?.clientId}</span>
                                    </div> */}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content - Profile Sections */}
                    <div className="profile-content">
                        {/* Personal Information */}
                        <section className="profile-section">
                            <div className="section-header">
                                <h3>
                                    <FiUser size={20} /> Personal Information
                                </h3>
                            </div>
                            <div className="section-content">
                                {isEditing ? (
                                    <div className="edit-form">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>First Name *</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                    placeholder="Enter first name"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Last Name *</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                    placeholder="Enter last name"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Email Address *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                    placeholder="Enter email address"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                    placeholder="Enter phone number"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group full-width">
                                            <label>Address *</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="form-input"
                                                placeholder="Enter permanent/temporary address"
                                                required
                                            />
                                        </div>
                                        <div className="radio-row">
                                            <div className="radio-group">
                                                <label className="radio-label">Visa Type *</label>
                                                <div className="radio-options">
                                                    <label className={`radio-option ${formData.visaType === 'A' ? 'selected' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name="visaType"
                                                            value="A"
                                                            checked={formData.visaType === 'A'}
                                                            onChange={() => handleRadioChange('visaType', 'A')}
                                                            required
                                                        />
                                                        <span className="radio-custom"></span>
                                                        <span className="radio-text">A</span>
                                                    </label>
                                                    <label className={`radio-option ${formData.visaType === 'B' ? 'selected' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name="visaType"
                                                            value="B"
                                                            checked={formData.visaType === 'B'}
                                                            onChange={() => handleRadioChange('visaType', 'B')}
                                                        />
                                                        <span className="radio-custom"></span>
                                                        <span className="radio-text">B</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="radio-group">
                                                <label className="radio-label">Strong ID Available? *</label>
                                                <div className="radio-options">
                                                    <label className={`radio-option ${formData.hasStrongId === 'yes' ? 'selected' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name="hasStrongId"
                                                            value="yes"
                                                            checked={formData.hasStrongId === 'yes'}
                                                            onChange={() => handleRadioChange('hasStrongId', 'yes')}
                                                            required
                                                        />
                                                        <span className="radio-custom"></span>
                                                        <span className="radio-text">Yes</span>
                                                    </label>
                                                    <label className={`radio-option ${formData.hasStrongId === 'no' ? 'selected' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name="hasStrongId"
                                                            value="no"
                                                            checked={formData.hasStrongId === 'no'}
                                                            onChange={() => handleRadioChange('hasStrongId', 'no')}
                                                        />
                                                        <span className="radio-custom"></span>
                                                        <span className="radio-text">No</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>First Name</label>
                                            <div className="info-value">{clientData?.firstName || "N/A"}</div>
                                        </div>
                                        <div className="info-item">
                                            <label>Last Name</label>
                                            <div className="info-value">{clientData?.lastName || "N/A"}</div>
                                        </div>
                                        <div className="info-item">
                                            <label>Email Address</label>
                                            <div className="info-value email-value">
                                                <FiMail size={14} />
                                                {clientData?.email || "N/A"}
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <label>Phone Number</label>
                                            <div className="info-value">
                                                <FiPhone size={14} />
                                                {clientData?.phone || "N/A"}
                                            </div>
                                        </div>
                                        <div className="info-item full-width">
                                            <label>Address</label>
                                            <div className="info-value">
                                                <FiMapPin size={14} />
                                                {clientData?.address || "N/A"}
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <label>Visa Type</label>
                                            <div className="info-value">{clientData?.visaType || "N/A"}</div>
                                        </div>
                                        <div className="info-item">
                                            <label>Strong ID Available</label>
                                            <div className="info-value">{clientData?.hasStrongId || "N/A"}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Business Information */}
                        <section className="profile-section">
                            <div className="section-header">
                                <h3>
                                    <MdOutlineBusinessCenter size={20} /> Business Information
                                </h3>
                            </div>
                            <div className="section-content">
                                {isEditing ? (
                                    <div className="edit-form">
                                        <div className="form-group full-width">
                                            <label>Business Address *</label>
                                            <input
                                                type="text"
                                                name="businessAddress"
                                                value={formData.businessAddress}
                                                onChange={handleInputChange}
                                                className="form-input"
                                                placeholder="Enter business address"
                                                required
                                            />
                                        </div>
                                        <div className="form-group full-width">
                                            <label>Bank Account Number</label>
                                            <input
                                                type="text"
                                                name="bankAccount"
                                                value={formData.bankAccount}
                                                onChange={handleInputChange}
                                                className="form-input"
                                                placeholder="Enter bank account number"
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>BIC Code</label>
                                                <input
                                                    type="text"
                                                    name="bicCode"
                                                    value={formData.bicCode}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                    placeholder="Enter BIC code"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Business Name *</label>
                                                <input
                                                    type="text"
                                                    name="businessName"
                                                    value={formData.businessName}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                    placeholder="Enter business name"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="radio-row">
                                            <div className="radio-group">
                                                <label className="radio-label">VAT Reporting Period *</label>
                                                <div className="radio-options">
                                                    <label className={`radio-option ${formData.vatPeriod === 'monthly' ? 'selected' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name="vatPeriod"
                                                            value="monthly"
                                                            checked={formData.vatPeriod === 'monthly'}
                                                            onChange={() => handleRadioChange('vatPeriod', 'monthly')}
                                                            required
                                                        />
                                                        <span className="radio-custom"></span>
                                                        <span className="radio-text">Monthly</span>
                                                    </label>
                                                    <label className={`radio-option ${formData.vatPeriod === 'quarterly' ? 'selected' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name="vatPeriod"
                                                            value="quarterly"
                                                            checked={formData.vatPeriod === 'quarterly'}
                                                            onChange={() => handleRadioChange('vatPeriod', 'quarterly')}
                                                        />
                                                        <span className="radio-custom"></span>
                                                        <span className="radio-text">Quarterly</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="radio-group">
                                                <label className="radio-label">Nature of Business *</label>
                                                <div className="radio-options">
                                                    <label className={`radio-option ${formData.businessNature === 'posti' ? 'selected' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name="businessNature"
                                                            value="posti"
                                                            checked={formData.businessNature === 'posti'}
                                                            onChange={() => handleRadioChange('businessNature', 'posti')}
                                                            required
                                                        />
                                                        <span className="radio-custom"></span>
                                                        <span className="radio-text">Posti</span>
                                                    </label>
                                                    <label className={`radio-option ${formData.businessNature === 'wolt' ? 'selected' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name="businessNature"
                                                            value="wolt"
                                                            checked={formData.businessNature === 'wolt'}
                                                            onChange={() => handleRadioChange('businessNature', 'wolt')}
                                                        />
                                                        <span className="radio-custom"></span>
                                                        <span className="radio-text">Wolt</span>
                                                    </label>
                                                    <label className={`radio-option ${formData.businessNature === 'taxi' ? 'selected' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name="businessNature"
                                                            value="taxi"
                                                            checked={formData.businessNature === 'taxi'}
                                                            onChange={() => handleRadioChange('businessNature', 'taxi')}
                                                        />
                                                        <span className="radio-custom"></span>
                                                        <span className="radio-text">Taxi</span>
                                                    </label>
                                                    <label className={`radio-option ${formData.businessNature === 'restaurant' ? 'selected' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name="businessNature"
                                                            value="restaurant"
                                                            checked={formData.businessNature === 'restaurant'}
                                                            onChange={() => handleRadioChange('businessNature', 'restaurant')}
                                                        />
                                                        <span className="radio-custom"></span>
                                                        <span className="radio-text">Restaurant</span>
                                                    </label>
                                                    <label className={`radio-option ${formData.businessNature === 'other' ? 'selected' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name="businessNature"
                                                            value="other"
                                                            checked={formData.businessNature === 'other'}
                                                            onChange={() => handleRadioChange('businessNature', 'other')}
                                                        />
                                                        <span className="radio-custom"></span>
                                                        <span className="radio-text">Other</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="radio-group full-width">
                                            <label className="radio-label">Register in Trade Register? *</label>
                                            <div className="radio-options">
                                                <label className={`radio-option ${formData.registerTrade === 'yes' ? 'selected' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name="registerTrade"
                                                        value="yes"
                                                        checked={formData.registerTrade === 'yes'}
                                                        onChange={() => handleRadioChange('registerTrade', 'yes')}
                                                        required
                                                    />
                                                    <span className="radio-custom"></span>
                                                    <span className="radio-text">Yes</span>
                                                </label>
                                                <label className={`radio-option ${formData.registerTrade === 'no' ? 'selected' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name="registerTrade"
                                                        value="no"
                                                        checked={formData.registerTrade === 'no'}
                                                        onChange={() => handleRadioChange('registerTrade', 'no')}
                                                    />
                                                    <span className="radio-custom"></span>
                                                    <span className="radio-text">No</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Business Name</label>
                                            <div className="info-value">{clientData?.businessName || "N/A"}</div>
                                        </div>
                                        <div className="info-item">
                                            <label>VAT Period</label>
                                            <div className="info-value">{clientData?.vatPeriod || "N/A"}</div>
                                        </div>
                                        <div className="info-item">
                                            <label>Business Nature</label>
                                            <div className="info-value">{clientData?.businessNature || "N/A"}</div>
                                        </div>
                                        <div className="info-item">
                                            <label>Registered Trade</label>
                                            <div className="info-value">{clientData?.registerTrade || "N/A"}</div>
                                        </div>
                                        <div className="info-item full-width">
                                            <label>Business Address</label>
                                            <div className="info-value">
                                                <FiMapPin size={14} />
                                                {clientData?.businessAddress || "N/A"}
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <label>Bank Account</label>
                                            <div className="info-value">{clientData?.bankAccount || "N/A"}</div>
                                        </div>
                                        <div className="info-item">
                                            <label>BIC Code</label>
                                            <div className="info-value">{clientData?.bicCode || "N/A"}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Account Status (Read Only) */}
                        <section className="profile-section">
                            <div className="section-header">
                                <h3>
                                    <FiShield size={20} /> Account Status
                                </h3>
                            </div>
                            <div className="section-content">
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Account Status</label>
                                        <div className={`info-value ${clientData?.isActive ? 'active' : 'inactive'}`}>
                                            {clientData?.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <label>Plan Selected</label>
                                        <div className="info-value plan-badge">{clientData?.planSelected || "N/A"}</div>
                                    </div>
                                    {clientData?.nextMonthPlan && (
                                        <div className="info-item">
                                            <label>Next Month Plan</label>
                                            <div className="info-value next-plan-badge">{clientData.nextMonthPlan}</div>
                                        </div>
                                    )}
                                    {clientData?.planEffectiveFrom && (
                                        <div className="info-item">
                                            <label>Plan Effective From</label>
                                            <div className="info-value">
                                                <FiCalendar size={14} />
                                                {formatDate(clientData.planEffectiveFrom)}
                                            </div>
                                        </div>
                                    )}
                                    {clientData?.enrollmentDate && (
                                        <div className="info-item">
                                            <label>Enrollment Date</label>
                                            <div className="info-value">
                                                <FiCalendar size={14} />
                                                {new Date(clientData.enrollmentDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}
                                    {clientData?.createdAt && (
                                        <div className="info-item">
                                            <label>Account Created</label>
                                            <div className="info-value">
                                                <FiCalendar size={14} />
                                                {new Date(clientData.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Change Password Modal */}
                {showChangePasswordModal && (
                    <div className="profile-password-modal-overlay">
                        <div className="profile-password-modal">
                            <div className="profile-password-header">
                                <h3 className="profile-password-title">
                                    <FiLock size={20} /> Change Password
                                </h3>
                                <button
                                    className="profile-password-close-btn"
                                    onClick={() => {
                                        setShowChangePasswordModal(false);
                                        resetChangePasswordForm();
                                    }}
                                    disabled={changingPassword}
                                >
                                    <FiX size={24} />
                                </button>
                            </div>

                            <div className="profile-password-content">
                                {passwordError && (
                                    <div className="profile-password-error">
                                        <FiAlertCircle size={16} />
                                        <span>{passwordError}</span>
                                    </div>
                                )}

                                {passwordSuccess && (
                                    <div className="profile-password-success">
                                        <FiCheck size={16} />
                                        <span>{passwordSuccess}</span>
                                    </div>
                                )}

                                <div className="profile-password-field">
                                    <label className="profile-password-label">
                                        <FiLock size={18} />
                                        Current Password
                                    </label>
                                    <div className="profile-password-input-wrapper">
                                        <input
                                            type={showOldPassword ? "text" : "password"}
                                            placeholder="Enter your current password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            disabled={changingPassword}
                                            className="profile-password-input"
                                        />
                                        <button
                                            type="button"
                                            className="profile-password-toggle"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            disabled={changingPassword}
                                        >
                                            {showOldPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="profile-password-field">
                                    <label className="profile-password-label">
                                        <MdOutlineVpnKey size={18} />
                                        New Password
                                    </label>
                                    <div className="profile-password-input-wrapper">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="Enter new password (min. 6 characters)"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={changingPassword}
                                            className="profile-password-input"
                                        />
                                        <button
                                            type="button"
                                            className="profile-password-toggle"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            disabled={changingPassword}
                                        >
                                            {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="profile-password-field">
                                    <label className="profile-password-label">
                                        <FiLock size={18} />
                                        Confirm New Password
                                    </label>
                                    <div className="profile-password-input-wrapper">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm your new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={changingPassword}
                                            className="profile-password-input"
                                        />
                                        <button
                                            type="button"
                                            className="profile-password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            disabled={changingPassword}
                                        >
                                            {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="profile-password-actions">
                                    <button
                                        className="profile-password-btn profile-password-btn-secondary"
                                        onClick={() => {
                                            setShowChangePasswordModal(false);
                                            resetChangePasswordForm();
                                        }}
                                        disabled={changingPassword}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="profile-password-btn profile-password-btn-primary"
                                        onClick={handleChangePassword}
                                        disabled={changingPassword}
                                    >
                                        {changingPassword ? (
                                            <>
                                                <span className="spinner-small"></span>
                                                Changing...
                                            </>
                                        ) : (
                                            "Change Password"
                                        )}
                                    </button>
                                </div>

                                <div className="profile-password-forgot-link">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowChangePasswordModal(false);
                                            setShowForgotPasswordModal(true);
                                        }}
                                        disabled={changingPassword}
                                    >
                                        Forgot your current password?
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Change Plan Modal */}
                {showChangePlanModal && (
                    <div className="profile-plan-modal-overlay">
                        <div className="profile-plan-modal">
                            <div className="profile-plan-header">
                                <h3 className="profile-plan-title">
                                    <FiCreditCard size={20} /> Change Your Plan
                                </h3>
                                <button
                                    className="profile-plan-close-btn"
                                    onClick={() => {
                                        setShowChangePlanModal(false);
                                        resetChangePlanForm();
                                    }}
                                    disabled={changingPlan}
                                >
                                    <FiX size={24} />
                                </button>
                            </div>

                            <div className="profile-plan-content">
                                <div className="profile-plan-info-box">
                                    <p className="profile-plan-current">
                                        Your current plan: <strong>{clientData?.planSelected}</strong> ({planPrices[clientData?.planSelected] || 'N/A'})
                                    </p>

                                    {/* REMOVED: pending alert and date info - no longer needed */}
                                    {/* REMOVED: clientData?.nextMonthPlan check */}

                                    {/* ADDED: Immediate change notice */}
                                    <div className="profile-plan-immediate-notice" style={{
                                        background: '#e8f5e9',
                                        borderLeft: '4px solid #4caf50',
                                        padding: '12px 15px',
                                        borderRadius: '6px',
                                        marginTop: '15px'
                                    }}>
                                        <p style={{ margin: 0, color: '#2e7d32', fontWeight: 500 }}>
                                            <FiCheckCircle size={16} style={{ marginRight: '8px' }} />
                                            Plan changes are applied immediately
                                        </p>
                                    </div>
                                </div>

                                <div className="profile-plan-list">
                                    {['Lite', 'Taxi', 'Premium', 'Pro', 'Restaurant', 'Lite Oy', 'Premium Oy', 'Pro Oy'].map((plan) => (
                                        <label
                                            key={plan}
                                            className={`profile-plan-item ${selectedNewPlan === plan ? 'selected' : ''} ${clientData?.planSelected === plan ? 'current' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="newPlan"
                                                value={plan}
                                                checked={selectedNewPlan === plan}
                                                onChange={(e) => setSelectedNewPlan(e.target.value)}
                                                disabled={changingPlan}
                                            />
                                            <div className="profile-plan-item-info">
                                                <div className="profile-plan-name-section">
                                                    <span className="profile-plan-name">{plan}</span>
                                                    {clientData?.planSelected === plan && (
                                                        <span className="profile-plan-badge profile-plan-badge-current">Current</span>
                                                    )}
                                                    {selectedNewPlan === plan && (
                                                        <span className="profile-plan-badge profile-plan-badge-selected">Selected</span>
                                                    )}
                                                </div>
                                                <span className="profile-plan-price">{planPrices[plan]}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {selectedNewPlan && (
                                    <div className="profile-plan-summary">
                                        <h4 className="profile-plan-section-title">Change Summary</h4>
                                        <div className="profile-plan-summary-details">
                                            <p><strong>From:</strong> {clientData?.planSelected} ({planPrices[clientData?.planSelected] || 'N/A'})</p>
                                            <p><strong>To:</strong> {selectedNewPlan} ({planPrices[selectedNewPlan]})</p>
                                            {/* UPDATED: Always immediate now */}
                                            <p><strong>Effective Date:</strong> <span style={{ color: '#4caf50', fontWeight: 600 }}>Immediately (today)</span></p>
                                            <p><strong>Billing Note:</strong> You will be billed {planPrices[selectedNewPlan]} starting immediately.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="profile-plan-actions">
                                    <button
                                        className="profile-plan-btn profile-plan-btn-secondary"
                                        onClick={() => {
                                            setShowChangePlanModal(false);
                                            resetChangePlanForm();
                                        }}
                                        disabled={changingPlan}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="profile-plan-btn profile-plan-btn-primary"
                                        onClick={handleChangePlan}
                                        disabled={changingPlan || !selectedNewPlan}
                                    >
                                        {changingPlan ? (
                                            <>
                                                <span className="spinner-small"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <FiRefreshCw size={16} />
                                                Change Plan Immediately
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Forgot Password Modal */}
                {showForgotPasswordModal && (
                    <div className="profile-modal-overlay">
                        <div className="profile-modal">
                            <div className="modal-header">
                                <h3>Reset Your Password</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => {
                                        setShowForgotPasswordModal(false);
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
                                        <FiCheck size={16} />
                                        <span>{forgotPasswordSuccess}</span>
                                    </div>
                                )}

                                {/* Step 1: Email Input */}
                                {forgotPasswordStep === 1 && (
                                    <div className="step-content">
                                        <div className="form-group">
                                            <label className="form-label">
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
                                            <label className="form-label">
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
                                            <label className="form-label">
                                                <FiLock size={16} />
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Enter new password (min. 6 characters)"
                                                value={forgotNewPassword}
                                                onChange={(e) => setForgotNewPassword(e.target.value)}
                                                disabled={forgotLoading}
                                                className="modal-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                <FiLock size={16} />
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Confirm your new password"
                                                value={forgotConfirmPassword}
                                                onChange={(e) => setForgotConfirmPassword(e.target.value)}
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

                                {/* Resend OTP Link */}
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
        </ClientLayout>
    );
};

export default ClientProfile;