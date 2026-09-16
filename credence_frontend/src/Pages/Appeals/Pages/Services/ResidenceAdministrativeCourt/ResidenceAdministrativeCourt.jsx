import React from 'react'
import ServiceHero from '../ServiceHero/ServiceHero';
import ServiceForm from '../ServiceForm/ServiceFrom';
import ResidenceAdministrativeSection from './ResidenceAdministrativeSection/ResidenceAdministrativeSection';
const service1HeroImage = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1920&q=80";

const ResidenceAdministrativeCourt = () => {
    return (
        <div>
            <ServiceHero
                title="Residence Permit Appeals (Administrative court)"
                subtitle="A negative decision isn't final - we build your case for the Administrative Court."
                bgImage={service1HeroImage}
            />
            <ResidenceAdministrativeSection />

            <ServiceForm defaultService="Residence Permit Appeals (Administrative Court)" />
        </div>
    );
}

export default ResidenceAdministrativeCourt
