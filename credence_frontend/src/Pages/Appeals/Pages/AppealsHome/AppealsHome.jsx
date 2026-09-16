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
import ProcessFlowDiagram from './OurProcess/ProcessFlowDiagram/ProcessFlowDiagram'
import ProcessProgressBar from './OurProcess/ProcessProgressBar/ProcessProgressBar'
import ProcessTimelineVertical from './OurProcess/ProcessTimelineVertical/ProcessTimelineVertical'

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

      <ProcessTimelineVertical />
      <ProcessFlowDiagram />
      {/* <ProcessProgressBar /> */}

      {/* <FinalCTA /> */}

      {/* <AppealsFooter /> */}
    </>
  )
}

export default AppealsHome