import React from 'react'
import Navbar from '../../Navbar/Navbar'
import HeroSection from './HeroSection/HeroSection'
import AppealsFooter from '../../AppealsFooter/AppealsFooter'
import FinalCTA from './FinalCTA/FinalCTA'
import WhoWeAre from './WhoWeAre/WhoWeAre'
import WhoWeHelpTabs from './WhoDoWeHelp/WhoWeHelpTabs/WhoWeHelpTabs'
import WhoWeHelpCards from './WhoDoWeHelp/WhoWeHelpCards/WhoWeHelpCards'
import TrustStatSplit from './WhyTrustUs/TrustStatSplit/TrustStatSplit'
import TrustAccordion from './WhyTrustUs/TrustAccordion/TrustAccordion'
import TrustNumberedList from './WhyTrustUs/TrustNumberedList/TrustNumberedList'
import TrustHoverCards from './WhyTrustUs/TrustHoverCards/TrustHoverCards'

const AppealsHome = () => {
  return (
    <>
      {/* <Navbar /> */}

      <HeroSection />

      <WhoWeAre />

      <WhoWeHelpCards />
      <WhoWeHelpTabs />


     
      <TrustNumberedList />
      <TrustStatSplit />
      <TrustAccordion />
      <TrustHoverCards />

      <FinalCTA />

      {/* <AppealsFooter /> */}
    </>
  )
}

export default AppealsHome