import React from 'react'
import ResidenceRenewalsSection from './ResidenceRenewalsSection/ResidenceRenewalsSection'
import ServiceHero from '../ServiceHero/ServiceHero';
import ServiceForm from '../ServiceForm/ServiceFrom';

const service1HeroImage =
    "https://plus.unsplash.com/premium_photo-1723759283157-54d22e11a870?auto=format&fit=crop&w=1920&q=80";

const ResidenExtensionsAndRenewals = () => {
    return (
        <div>
            <ServiceHero
                title="Residence Permit Extensions & Renewals"
                subtitle="Keep your right to stay and work in Finland without interruption."
                bgImage={service1HeroImage}
            />
            <ResidenceRenewalsSection />

            <ServiceForm defaultService="Residence Permit Extensions & Renewals" />        </div>
    );
}

export default ResidenExtensionsAndRenewals