
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { JobCategories } from "@/components/home/JobCategories";
import { FeaturedJobs } from "@/components/home/FeaturedJobs";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { CallToAction } from "@/components/home/CallToAction";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Scroll reveal animation
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    // Observe all scroll-reveal elements
    const scrollElements = document.querySelectorAll('.scroll-reveal');
    scrollElements.forEach(el => observer.observe(el));

    // Parallax effect for background elements
    const handleParallax = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-bg');
      
      parallaxElements.forEach(element => {
        const rate = scrolled * -0.5;
        element.style.transform = `translateY(${rate}px)`;
      });
    };

    window.addEventListener('scroll', handleParallax);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleParallax);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-mont">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <div className="section-full-auto">
          <JobCategories />
        </div>
        <div className="section-full-auto">
          <FeaturedJobs />
        </div>
        <div className="section-full-auto">
          <HowItWorks />
        </div>
        <div className="section-full-auto">
          <Testimonials />
        </div>
        <div className="section-full-auto">
          <CallToAction />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
