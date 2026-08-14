import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useModal as useModalState } from './useModal'; 
import AgreementModal from './Agreement/AgreementModal';
import RegistrationModal from './Regiser/RegistrationModal';

export const ModalContext = createContext();

const ModalProvider = ({ children }) => {
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  // Function to disable body scroll
  const disableBodyScroll = () => {
    document.body.classList.add('modal-open');
  };

  // Function to enable body scroll
  const enableBodyScroll = () => {
    document.body.classList.remove('modal-open');
  };

  // Effect to handle body scroll based on modal state
  useEffect(() => {
    if (isAgreementModalOpen || isRegistrationModalOpen) {
      disableBodyScroll();
    } else {
      enableBodyScroll();
    }

    // Cleanup on unmount
    return () => {
      enableBodyScroll();
    };
  }, [isAgreementModalOpen, isRegistrationModalOpen]);

  const openAgreementModal = useCallback((plan = '') => {
    console.log('Opening agreement modal with plan:', plan);
    setSelectedPlan(plan);
    setIsAgreementModalOpen(true);
  }, []);

  const closeAgreementModal = useCallback(() => {
    console.log('Closing agreement modal');
    setIsAgreementModalOpen(false);
  }, []);

  const openRegistrationModal = useCallback(() => {
    console.log('Opening registration modal');
    setIsAgreementModalOpen(false);
    setIsRegistrationModalOpen(true);
  }, []);

  const closeRegistrationModal = useCallback(() => {
    console.log('Closing registration modal');
    setIsRegistrationModalOpen(false);
    setSelectedPlan('');
  }, []);

  // Close both modals (for escape key or outside click)
  const closeAllModals = useCallback(() => {
    setIsAgreementModalOpen(false);
    setIsRegistrationModalOpen(false);
    setSelectedPlan('');
  }, []);

  // Handle ESC key press to close modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    };

    if (isAgreementModalOpen || isRegistrationModalOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isAgreementModalOpen, isRegistrationModalOpen, closeAllModals]);

  const modalValue = {
    isAgreementModalOpen,
    isRegistrationModalOpen,
    selectedPlan,
    openAgreementModal,
    closeAgreementModal,
    openRegistrationModal,
    closeRegistrationModal,
    closeAllModals,
    setSelectedPlan
  };

  return (
    <ModalContext.Provider value={modalValue}>
      {children}
      {isAgreementModalOpen && <AgreementModal />}
      {isRegistrationModalOpen && <RegistrationModal />}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export default ModalProvider;