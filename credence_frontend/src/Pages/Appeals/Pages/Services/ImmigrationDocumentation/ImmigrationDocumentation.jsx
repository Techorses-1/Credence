import React from 'react'
import ServiceHero from '../ServiceHero/ServiceHero';
import ServiceForm from '../ServiceForm/ServiceFrom';
import ImmigrationDocumentationSection from './ImmigrationDocumentationSection/ImmigrationDocumentationSection';
const service1HeroImage = "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=1920&q=80";

const ImmigrationDocumentation = () => {
    return (
        <div>
            <ServiceHero
                title="Immigration Documentation & Consultation"
                subtitle="Documents prepared and translated to Migri's exact standards, the first time."
                bgImage={service1HeroImage}
            />
            <ImmigrationDocumentationSection />

            <ServiceForm defaultService="Immigration Documentation & Consultation" />        </div>
    );
}

export default ImmigrationDocumentation
