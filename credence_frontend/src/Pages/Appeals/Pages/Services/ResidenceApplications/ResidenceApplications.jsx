import React from 'react'
import ServiceHero from '../ServiceHero/ServiceHero';
import ServiceForm from '../ServiceForm/ServiceFrom';
import ResidenceApplicationSection from './ResidenceApplicationSection/ResidenceApplicationSection';

const service1HeroImage = "https://images.unsplash.com/photo-1586441133374-ed1cb4007a47?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const ResidenceApplications = () => {
    return (
        <div>
            <ServiceHero
                title="Residence Permit Applications"
                subtitle="Complete guidance from your first application to Migri's final decision."
                bgImage={service1HeroImage}
            />
            <ResidenceApplicationSection />

            <ServiceForm defaultService="Residence Permit Applications" />
        </div>
    );
}

export default ResidenceApplications