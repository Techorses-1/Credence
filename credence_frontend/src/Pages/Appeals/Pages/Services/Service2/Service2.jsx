import React from 'react'
import ServiceHero from "../ServiceHero/ServiceHero";
import ServiceContent from "../ServiceContent/ServiceContent";
import ServiceForm from "../ServiceForm/ServiceFrom";

const service2HeroImage = "https://images.unsplash.com/photo-1767972159871-b9f5d320be2b?auto=format&fit=crop&w=1920&q=80";


const Service2 = () => {
    return (
        <div>
            <ServiceHero
                title="Service 2 Name Placeholder"
                subtitle="A short one-line description of this service goes here."
                bgImage={service2HeroImage}
            />
            <ServiceContent />
            <ServiceForm defaultService="Service Two" />
        </div>
    );
}

export default Service2