import React from 'react'
import ResidenceRenewalsSection from './ResidenceRenewalsSection/ResidenceRenewalsSection'
import ServiceHero from '../ServiceHero/ServiceHero';
import ServiceForm from '../ServiceForm/ServiceFrom';

const service1HeroImage = "https://images.unsplash.com/photo-1767972159871-b9f5d320be2b?auto=format&fit=crop&w=1920&q=80";

const ResidenExtensionsAndRenewals = () => {
 return (
        <div>
            <ServiceHero
                title="Residence Permit Extensions & Renewals"
                subtitle="A short one-line description of this service goes here."
                bgImage={service1HeroImage}
            />
            <ResidenceRenewalsSection/>
            
            <ServiceForm defaultService="Service Two" />
        </div>
    );
}

export default ResidenExtensionsAndRenewals