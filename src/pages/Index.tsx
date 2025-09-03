
import React, { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { BusinessCategories } from '@/components/home/BusinessCategories';
import { ProductServiceCarousel } from '@/components/home/ProductServiceCarousel';
import { CommunityStats } from '@/components/home/CommunityStats';
import { CallToAction } from '@/components/home/CallToAction';
import { OnboardingCheck } from '@/components/OnboardingCheck';
import HelpButton from '@/components/onboarding/HelpButton';
import ScrollToTop from '@/components/ui/ScrollToTop';
// import { DataDebugger } from "@/components/debug/DataDebugger";
// import { ApiTester } from "@/components/debug/ApiTester";

const Index = () => {
  useEffect(() => {
    // Smooth scroll behavior for navigation links
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.hash) {
        e.preventDefault();
        const element = document.querySelector(target.hash);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    // Add smooth scroll to all internal links
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
      link.addEventListener('click', handleSmoothScroll);
    });

    // Enhanced scroll reveal animation with staggered delays
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add staggered delay for multiple elements
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, index * 100);
        }
      });
    }, observerOptions);

    // Observe all scroll-reveal elements with different animation types
    const scrollElements = document.querySelectorAll('.scroll-reveal, .slide-in-left, .slide-in-right, .fade-in, .scale-in');
    scrollElements.forEach(el => observer.observe(el));

    // Enhanced parallax effect for multiple background elements
    const handleParallax = () => {
      const scrolled = window.pageYOffset;
      
      // Different parallax rates for layered effect
      const parallaxElements = document.querySelectorAll('.parallax-bg');
      parallaxElements.forEach((element, index) => {
        const speed = 0.2 + (index * 0.1);
        const yPos = scrolled * -speed;
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });

      // Parallax for floating elements
      const floatingElements = document.querySelectorAll('.animate-float, .animate-float-slow, .animate-float-fast');
      floatingElements.forEach((element, index) => {
        const speed = 0.1 + (index * 0.05);
        const yPos = scrolled * -speed;
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
    };

    // Throttled scroll event for performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleParallax();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      internalLinks.forEach(link => {
        link.removeEventListener('click', handleSmoothScroll);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <OnboardingCheck userType="community" />
             <main className="flex-grow">
         <Hero />
         {/* <ApiTester />
         <DataDebugger /> */}
         <BusinessCategories />
         <ProductServiceCarousel />
         <CommunityStats />
         <CallToAction />
       </main>
      <Footer />
      <ScrollToTop />
      <HelpButton />
    </div>
  );
};

export default Index;
