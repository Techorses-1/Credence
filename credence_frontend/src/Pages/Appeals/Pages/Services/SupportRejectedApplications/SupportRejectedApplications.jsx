import React from 'react'
import ServiceHero from '../ServiceHero/ServiceHero';
import ServiceForm from '../ServiceForm/ServiceFrom';
import SupportRejectedAppSection from './SupportRejectedAppSection/SupportRejectedAppSection';

const service1HeroImage =
    "https://images.unsplash.com/photo-1653212883731-4d5bc66e0181?auto=format&fit=crop&w=1920&q=80";

const SupportRejectedApplications = () => {
    return (
        <div>
            <ServiceHero
                title="Support For Rejected Applications"
                subtitle="Fast, clear guidance on your options in the days right after a rejection."
                bgImage={service1HeroImage}
            />
            <SupportRejectedAppSection />

            <ServiceForm defaultService="Support For Rejected Applications" />
        </div>
    );
}

export default SupportRejectedApplications
