import { useState, useCallback } from 'react';

export const useModal = () => {
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  const openAgreementModal = useCallback(() => {
    console.log('Opening agreement modal'); // Add this for debugging
    setIsAgreementModalOpen(true);
  }, []);

  const closeAgreementModal = useCallback(() => {
    setIsAgreementModalOpen(false);
  }, []);

  const openRegistrationModal = useCallback(() => {
    setIsRegistrationModalOpen(true);
    setIsAgreementModalOpen(false);
  }, []);

  const closeRegistrationModal = useCallback(() => {
    setIsRegistrationModalOpen(false);
  }, []);

  return {
    isAgreementModalOpen,
    isRegistrationModalOpen,
    openAgreementModal,
    closeAgreementModal,
    openRegistrationModal,
    closeRegistrationModal,
  };
};