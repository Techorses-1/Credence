import React, { useEffect } from "react";
import BlogList from './Blogslist/BlogList'
import BlogsHero from './BlogsHero/BlogsHero'
import BlogIntro from './BlogIntro/BlogIntro'
import Navbar from "../Home/Navbar/Navbar";
import Footer from "../Home/Footer/Footer";

const Blogs = () => {

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth" // Use "smooth" for smooth scrolling, "instant" for immediate
    });
  }, []);


  return (
    <>
    {/* <Navbar/> */}
      <BlogsHero />
      <BlogIntro />
      <BlogList />
      {/* <Footer/> */}
   
    </>
  )
}

export default Blogs