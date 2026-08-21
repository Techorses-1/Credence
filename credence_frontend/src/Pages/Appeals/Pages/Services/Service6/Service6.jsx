import React from 'react'
import ServiceHero from "../ServiceHero/ServiceHero";
import ServiceContent from "../ServiceContent/ServiceContent";
import ServiceForm from "../ServiceForm/ServiceFrom";

// Dummy hero image (Unsplash, free license) — replace with real asset when ready
const service6HeroImage = "https://images.unsplash.com/photo-1767972159871-b9f5d320be2b?auto=format&fit=crop&w=1920&q=80";

const Service6 = () => {
    return (
        <div>
            <ServiceHero
                title="Service 6 Name Placeholder"
                subtitle="A short one-line description of this service goes here."
                bgImage={service6HeroImage}
            />
            <ServiceContent />
            <ServiceForm defaultService="Service Six" />
        </div>
    );
}

export default Service6