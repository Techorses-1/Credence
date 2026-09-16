import React from 'react'
import ServiceHero from '../ServiceHero/ServiceHero';
import ServiceForm from '../ServiceForm/ServiceFrom';
import ResidenceSupremeSection from './ResidenceSupremeSection/ResidenceSupremeSection';
const service1HeroImage =
    "https://images.unsplash.com/photo-1619418602850-35ad20aa1700?auto=format&fit=crop&w=1920&q=80";

const ResidenceSupremeCourt = () => {
    return (
        <div>
            <ServiceHero
                title="Residence Permit Appeals (Supreme court)"
                subtitle="Taking your case to Finland's highest administrative court."
                bgImage={service1HeroImage}
            />
            <ResidenceSupremeSection />

            <ServiceForm defaultService="Residence Permit Appeals (Supreme Court)" />
        </div>
    );
}

export default ResidenceSupremeCourt
