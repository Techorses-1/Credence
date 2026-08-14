import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { useModal } from '../ModalProvider';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../ModalStyles.scss';

const RegistrationModal = () => {
  const { closeRegistrationModal, selectedPlan } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(selectedPlan || '');

  // Define plan prices for all 8 plans (5 Toiminimi + 3 Osakeyhtiö)
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

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      address: '',
      visaType: '',
      hasStrongId: '',
      mobile: '',
      email: '',
      businessAddress: '',
      bankAccount: '',
      bicCode: '',
      businessName: '',
      vatPeriod: '',
      businessNature: '',
      registerTrade: '',
      planSelected: selectedPlan || ''
    },

    onSubmit: async (values) => {
      // 1. FIRST VALIDATE ALL FIELDS ARE FILLED
      const requiredFields = [
        'firstName', 'lastName', 'address', 'visaType', 'hasStrongId',
        'mobile', 'email', 'businessAddress', 'bankAccount', 'bicCode',
        'businessName', 'vatPeriod', 'businessNature', 'registerTrade', 'planSelected'
      ];

      const emptyFields = [];
      requiredFields.forEach(field => {
        if (!values[field] || values[field].trim() === '') {
          emptyFields.push(field);
        }
      });

      if (emptyFields.length > 0) {
        console.log('❌ Empty fields detected:', emptyFields);
        toast.error(`Please fill all required fields: ${emptyFields.join(', ')}`, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/client-enrollment/enroll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...values,
            email: values.email.toLowerCase().trim()
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 409) {
            toast.error(`Cannot submit enrollment: ${data.message}`, {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            return;
          }
          throw new Error(data.message || 'Enrollment failed');
        }

        toast.success('Registration submitted successfully!', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Close modal after successful submission
        setTimeout(() => {
          closeRegistrationModal();
          window.location.href = '/';
        }, 1500);

      } catch (error) {
        console.error('❌ Enrollment error:', error);
        toast.error(`Enrollment failed: ${error.message}`, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Update currentPlan when selectedPlan changes (initial load)
  useEffect(() => {
    if (selectedPlan) {
      setCurrentPlan(selectedPlan);
      formik.setFieldValue('planSelected', selectedPlan);
    }
  }, [selectedPlan]);

  // Handle plan selection change
  const handlePlanChange = (e) => {
    const newPlan = e.target.value;
    setCurrentPlan(newPlan);
    formik.setFieldValue('planSelected', newPlan);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    closeRegistrationModal();
  };

  return (
    <>
      {/* Add ToastContainer INSIDE the modal */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-container form-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={handleClose}>×</button>

          <h2 className="modal-heading">Registration Form</h2>

          {/* Show current plan info */}
          {currentPlan && (
            <div className="selected-plan-info">
              <p>You are registering for: <strong>{currentPlan} Plan</strong> <span className="plan-price">({planPrices[currentPlan]})</span></p>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="registration-form">
            {/* Row 1: First Name & Last Name */}
            <div className="form-row">
              <input
                type="text"
                name="firstName"
                placeholder="FIRST NAME*"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                required
                className="form-input"
                disabled={isSubmitting}
              />
              <input
                type="text"
                name="lastName"
                placeholder="LAST NAME*"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                required
                className="form-input"
                disabled={isSubmitting}
              />
            </div>

            {/* Row 2: Permanent/Temporary Address */}
            <input
              type="text"
              name="address"
              placeholder="PERMANENT / TEMPORARY ADDRESS*"
              value={formik.values.address}
              onChange={formik.handleChange}
              required
              className="form-input full-width"
              disabled={isSubmitting}
            />

            {/* Row 3: Visa Type & Strong ID (Desktop: same row, Mobile: stacked) */}
            <div className="form-row radio-row">
              <div className="radio-group">
                <p className="radio-label">VISA TYPE*</p>
                <div className="radio-options">
                  <label>
                    <input
                      type="radio"
                      name="visaType"
                      value="A"
                      checked={formik.values.visaType === 'A'}
                      onChange={formik.handleChange}
                      required
                      disabled={isSubmitting}
                    />
                    <span>A</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="visaType"
                      value="B"
                      checked={formik.values.visaType === 'B'}
                      onChange={formik.handleChange}
                      disabled={isSubmitting}
                    />
                    <span>B</span>
                  </label>
                </div>
              </div>

              <div className="radio-group">
                <p className="radio-label">STRONG IDENTIFICATION?*</p>
                <div className="radio-options">
                  <label>
                    <input
                      type="radio"
                      name="hasStrongId"
                      value="yes"
                      checked={formik.values.hasStrongId === 'yes'}
                      onChange={formik.handleChange}
                      required
                      disabled={isSubmitting}
                    />
                    <span>Yes</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="hasStrongId"
                      value="no"
                      checked={formik.values.hasStrongId === 'no'}
                      onChange={formik.handleChange}
                      disabled={isSubmitting}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Row 4: Mobile & Email */}
            <div className="form-row">
              <input
                type="tel"
                name="mobile"
                placeholder="MOBILE NUMBER*"
                value={formik.values.mobile}
                onChange={formik.handleChange}
                required
                className="form-input"
                disabled={isSubmitting}
              />
              <input
                type="email"
                name="email"
                placeholder="EMAIL ID*"
                value={formik.values.email}
                onChange={formik.handleChange}
                required
                className="form-input"
                disabled={isSubmitting}
              />
            </div>

            {/* Row 5: Business Address */}
            <input
              type="text"
              name="businessAddress"
              placeholder="BUSINESS ADDRESS*"
              value={formik.values.businessAddress}
              onChange={formik.handleChange}
              required
              className="form-input full-width"
              disabled={isSubmitting}
            />

            {/* Row 6: Bank Account */}
            <input
              type="text"
              name="bankAccount"
              placeholder="BANK ACCOUNT NUMBER*"
              value={formik.values.bankAccount}
              onChange={formik.handleChange}
              required
              className="form-input full-width"
              disabled={isSubmitting}
            />

            {/* Row 7: BIC Code & Business Name */}
            <div className="form-row">
              <input
                type="text"
                name="bicCode"
                placeholder="BIC CODE*"
                value={formik.values.bicCode}
                onChange={formik.handleChange}
                required
                className="form-input"
                disabled={isSubmitting}
              />
              <input
                type="text"
                name="businessName"
                placeholder="BUSINESS NAME / ID*"
                value={formik.values.businessName}
                onChange={formik.handleChange}
                required
                className="form-input"
                disabled={isSubmitting}
              />
            </div>

            {/* Row 8: VAT Period & Nature of Business (Desktop: same row, Mobile: stacked) */}
            <div className="form-row radio-row">
              <div className="radio-group">
                <p className="radio-label">VAT REPORTING PERIOD*</p>
                <div className="radio-options">
                  <label>
                    <input
                      type="radio"
                      name="vatPeriod"
                      value="monthly"
                      checked={formik.values.vatPeriod === 'monthly'}
                      onChange={formik.handleChange}
                      required
                      disabled={isSubmitting}
                    />
                    <span>Monthly</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="vatPeriod"
                      value="quarterly"
                      checked={formik.values.vatPeriod === 'quarterly'}
                      onChange={formik.handleChange}
                      disabled={isSubmitting}
                    />
                    <span>Quarterly</span>
                  </label>
                </div>
              </div>

              <div className="radio-group">
                <p className="radio-label">NATURE OF BUSINESS*</p>
                <div className="radio-options">
                  <label>
                    <input
                      type="radio"
                      name="businessNature"
                      value="posti"
                      checked={formik.values.businessNature === 'posti'}
                      onChange={formik.handleChange}
                      required
                      disabled={isSubmitting}
                    />
                    <span>Posti</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="businessNature"
                      value="wolt"
                      checked={formik.values.businessNature === 'wolt'}
                      onChange={formik.handleChange}
                      disabled={isSubmitting}
                    />
                    <span>Wolt</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="businessNature"
                      value="taxi"
                      checked={formik.values.businessNature === 'taxi'}
                      onChange={formik.handleChange}
                      disabled={isSubmitting}
                    />
                    <span>Taxi</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="businessNature"
                      value="restaurant"
                      checked={formik.values.businessNature === 'restaurant'}
                      onChange={formik.handleChange}
                      disabled={isSubmitting}
                    />
                    <span>Restaurant</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="businessNature"
                      value="other"
                      checked={formik.values.businessNature === 'other'}
                      onChange={formik.handleChange}
                      disabled={isSubmitting}
                    />
                    <span>Other</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Row 9: Trade Register */}
            <div className="radio-group full-width-radio">
              <p className="radio-label">REGISTER IN TRADE REGISTER?*</p>
              <div className="radio-options">
                <label>
                  <input
                    type="radio"
                    name="registerTrade"
                    value="yes"
                    checked={formik.values.registerTrade === 'yes'}
                    onChange={formik.handleChange}
                    required
                    disabled={isSubmitting}
                  />
                  <span>Yes</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="registerTrade"
                    value="no"
                    checked={formik.values.registerTrade === 'no'}
                    onChange={formik.handleChange}
                    disabled={isSubmitting}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {/* Row 10: Plan Selection - UPDATED WITH ALL 8 PLANS (just added the 3 new ones) */}
            <div className="select-group">
              <div className="select-label-wrapper">
                <span className="select-label">SELECT PLAN</span>
                <span className="asterisk">*</span>
              </div>
              <select
                name="planSelected"
                value={formik.values.planSelected}
                onChange={handlePlanChange}
                required
                className="form-select"
                disabled={isSubmitting}
              >
                <option value="">Select a plan...</option>
                <option value="Lite">Lite - {planPrices['Lite']}</option>
                <option value="Taxi">Taxi - {planPrices['Taxi']}</option>
                <option value="Premium">Premium - {planPrices['Premium']}</option>
                <option value="Pro">Pro - {planPrices['Pro']}</option>
                <option value="Restaurant">Restaurant - {planPrices['Restaurant']}</option>
                {/* Added the 3 new Osakeyhtiö plans */}
                <option value="Lite Oy">Lite Oy - {planPrices['Lite Oy']}</option>
                <option value="Premium Oy">Premium Oy - {planPrices['Premium Oy']}</option>
                <option value="Pro Oy">Pro Oy - {planPrices['Pro Oy']}</option>
              </select>
              {selectedPlan && !formik.values.planSelected && (
                <p className="plan-note">Plan pre-selected based on your choice</p>
              )}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  SUBMITTING...
                </>
              ) : (
                'SUBMIT REGISTRATION'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegistrationModal;