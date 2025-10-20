
import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Building, Star, Globe, Heart, Shield, Handshake, Target, Check, ArrowRight, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const AboutPage = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [stats, setStats] = useState<any>(null);
  
  // Container ref for the hero section
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRegisterBusinessClick = () => {
    navigate('/register-business');
  };

  const handleOpenAuthModal = () => {
    navigate('/login');
  };

  // Enhanced carousel images with more creative content
  const carouselImages = [
    {
      src: "/photography-shooting-and-photographer-with-woman-2025-04-06-08-35-17-utc.jpg",
      title: "Creative Excellence",
      description: "Capturing moments that tell your story"
    },
    {
      src: "/portrait-of-smiling-mature-woman-wearing-apron-tak-2024-10-19-02-07-45-utc.jpg",
      title: "Community Care",
      description: "Serving with heart and dedication"
    },
    {
      src: "/stylish-mulat-man-in-marsala-jacket-talk-by-video-2024-10-30-20-50-25-utc.jpg",
      title: "Digital Leadership",
      description: "Connecting through technology"
    },
    {
      src: "/shaking-hands-in-professional-business-meeting-2025-06-02-15-01-38-utc.jpg",
      title: "Trust & Partnership",
      description: "Building lasting relationships"
    },
    {
      src: "/portrait-of-an-african-muslim-dressmaker-at-outdoor-2025-01-09-20-00-34-utc.jpg",
      title: "Cultural Heritage",
      description: "Preserving traditions through craftsmanship"
    },
    {
      src: "/pleased-african-american-content-maker-standing-wi-2025-07-27-07-45-39-utc.jpg",
      title: "Content Creation",
      description: "Sharing stories that inspire"
    },
    {
      src: "/portrait-of-smiling-sous-chef-2025-02-11-12-51-17-utc.jpg",
      title: "Culinary Excellence",
      description: "Creating flavors that bring people together"
    },
    {
      src: "/shop-assistant-arranging-clothes-on-rack-in-fashio-2025-06-22-19-39-04-utc.jpg",
      title: "Fashion & Style",
      description: "Expressing individuality through design"
    },
    {
      src: "/small-business-parcel-delivery-concept-female-ent-2024-10-18-04-04-58-utc.jpg",
      title: "Logistics & Delivery",
      description: "Connecting products to people"
    },
    {
      src: "/sme-freelance-african-american-teenage-woman-worki-2025-01-07-10-32-10-utc.jpg",
      title: "Young Entrepreneurship",
      description: "Building the future, one dream at a time"
    },
    {
      src: "/man-in-apron-packing-boxes-at-a-table-surrounded-2025-03-08-11-33-37-utc.jpg",
      title: "Quality Assurance",
      description: "Every detail matters in our work"
    },
    {
      src: "/professional-studio-photography-2025-04-05-23-44-15-utc.jpg",
      title: "Professional Excellence",
      description: "Setting standards in every industry"
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [carouselImages.length]);

  // Fetch platform stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/business/stats/`);
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow" style={{ 
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain'
      }}>
        {/* Enhanced Hero Section with Creative Image Carousel */}
        <section ref={containerRef} className="relative h-[80vh] bg-gradient-to-br from-fem-navy to-fem-terracotta flex items-center justify-center overflow-hidden">
          {/* Dynamic Background Carousel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
            style={{
                backgroundImage: `url(${carouselImages[currentImageIndex].src})`
              }}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </AnimatePresence>
          
          {/* Enhanced Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-fem-navy/85 via-fem-navy/70 to-fem-terracotta/85 z-10"></div>
          
          {/* Floating Decorative Elements */}
          <div className="absolute inset-0 z-5 pointer-events-none">
            {/* Top Left Floating Circle */}
            <motion.div
              className="absolute top-20 left-20 w-4 h-4 bg-fem-gold/30 rounded-full"
              animate={{ 
                y: [0, -20, 0],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Top Right Floating Circle */}
            <motion.div
              className="absolute top-32 right-32 w-6 h-6 bg-white/20 rounded-full"
              animate={{ 
                y: [0, 15, 0],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
            
            {/* Bottom Left Floating Circle */}
            <motion.div
              className="absolute bottom-32 left-32 w-3 h-3 bg-fem-terracotta/40 rounded-full"
              animate={{ 
                y: [0, -15, 0],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
            
            {/* Bottom Right Floating Circle */}
            <motion.div
              className="absolute bottom-20 right-20 w-5 h-5 bg-fem-gold/25 rounded-full"
              animate={{ 
                y: [0, 20, 0],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{ 
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          </div>
          
          {/* Content - Fixed Position */}
          <motion.div 
            className="relative z-20 text-center text-white px-4"
          >
            <motion.div 
              className="w-24 h-24 bg-fem-gold rounded-full flex items-center justify-center mx-auto mb-6 animate-float"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Heart className="w-12 h-12 text-white" />
            </motion.div>
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              About <span className="text-fem-gold">Faith Connect</span>
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Connecting faith-based businesses and community members through trust, support, and meaningful relationships.
            </motion.p>
            
            {/* Call to Action Button */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-8"
            >
              <Button
                onClick={handleOpenAuthModal}
                className="bg-fem-gold hover:bg-fem-gold/90 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              >
                Join Us Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
            
            {/* Enhanced Carousel Controls - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              {/* Navigation Arrows */}
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={prevImage}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/30 touch-manipulation"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
                
                <motion.button
                  onClick={nextImage}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/30 touch-manipulation"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              </div>
              
              {/* Dot Indicators */}
              <div className="flex gap-2 mt-2 sm:mt-0">
                {carouselImages.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-fem-gold scale-125' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Current Image Info - Enhanced */}
            <motion.div
              key={currentImageIndex}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20 max-w-sm sm:max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-fem-gold rounded-full animate-pulse"></div>
                <h3 className="text-base sm:text-lg font-semibold text-center">{carouselImages[currentImageIndex].title}</h3>
                <div className="w-2 h-2 bg-fem-gold rounded-full animate-pulse"></div>
          </div>
              <p className="text-xs sm:text-sm text-white/90 text-center leading-relaxed">{carouselImages[currentImageIndex].description}</p>
            </motion.div>
          </motion.div>
        </section>

        {/* Statistics Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="w-16 h-16 bg-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-fem-navy mb-2">
                  {stats ? `${stats.total_users}+` : "500+"}
                </div>
                <div className="text-gray-600">Community Members</div>
              </div>
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 bg-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-fem-navy mb-2">
                  {stats ? `${stats.total_businesses}+` : "200+"}
                </div>
                <div className="text-gray-600">Businesses Listed</div>
              </div>
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="w-16 h-16 bg-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-fem-navy mb-2">
                  {stats ? stats.average_rating : "4.8"}
                </div>
                <div className="text-gray-600">Average Rating</div>
              </div>
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="w-16 h-16 bg-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-fem-navy mb-2">
                  {stats ? `${stats.counties_covered}+` : "15+"}
                </div>
                <div className="text-gray-600">Counties Covered</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section - Enhanced */}
        <section className="py-16 sm:py-20 bg-fem-gray">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
                className="order-2 md:order-1"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-fem-navy mb-6">Our Mission</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
                  <p>
                    To create a thriving ecosystem where faith-based businesses can grow, community members can discover trusted services, and meaningful connections can flourish through shared values and mutual support.
                  </p>
                  <p>
                    We believe that when businesses operate with integrity, faith, and community spirit, everyone benefits - from the entrepreneur to the customer, and the entire community.
                  </p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
                className="order-1 md:order-2"
              >
                <div className="bg-gradient-to-br from-fem-terracotta to-fem-navy text-white p-6 sm:p-8 rounded-2xl relative shadow-2xl">
                  <div className="absolute top-4 right-4">
                    <Star className="w-6 h-6 text-fem-gold fill-current" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4">Our Vision</h3>
                  <p className="text-base sm:text-lg leading-relaxed">
                    To become the leading platform for faith-based business networking, fostering economic growth while maintaining spiritual values and community bonds.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Values Section - Enhanced */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-fem-navy mb-4">Our Core Values</h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do and every connection we make.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                {
                  icon: Heart,
                  title: "Faith-Based Community",
                  description: "Built on shared spiritual values and trust, creating meaningful connections beyond business."
                },
                {
                  icon: Shield,
                  title: "Trusted Network",
                  description: "Verified businesses and community members ensure quality and reliability in every interaction."
                },
                {
                  icon: Handshake,
                  title: "Mutual Support",
                  description: "Supporting local businesses while building lasting relationships within our faith community."
                },
                {
                  icon: Target,
                  title: "Growth & Development",
                  description: "Empowering entrepreneurs to grow their businesses through community support and networking."
                }
              ].map((value, index) => (
                <motion.div 
                  key={index}
                  className="text-center group"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ y: -10 }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
                  <h3 className="text-lg sm:text-xl font-bold text-fem-navy mb-3">{value.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Offer Section - Enhanced */}
        <section className="py-16 sm:py-20 bg-fem-gray">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
                className="order-2 md:order-1"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-fem-navy mb-6 sm:mb-8">What We Offer</h2>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    "Business Directory & Discovery",
                    "Service & Product Showcases",
                    "Community Reviews & Ratings",
                    "Business Registration & Management",
                    "Faith-Based Networking Events",
                    "Local Business Support Programs"
                  ].map((feature, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true, margin: "-50px" }}
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-fem-terracotta rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
                className="order-1 md:order-2"
              >
                <div className="bg-gradient-to-br from-fem-gray to-fem-lightgold p-6 sm:p-8 rounded-2xl shadow-xl">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-fem-gold rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Star className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-current" />
                  </div>
                  <h3 className="text-3xl font-bold text-fem-navy mb-4 text-center">Join Our Community</h3>
                  <p className="text-gray-700 text-center mb-6 leading-relaxed">
                    Ready to connect with faith-based businesses or list your own? Start your journey with Faith Connect today.
                  </p>
                  <Button 
                    onClick={handleOpenAuthModal}
                    className="w-full bg-gradient-to-r from-fem-terracotta to-fem-navy text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Community in Action Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-fem-navy mb-4">Our Community in Action</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See the diverse range of businesses and craftspeople that make up our faith-based community network.
              </p>
            </div>
            
            {/* Image Carousel */}
            <div className="max-w-4xl mx-auto relative">
              <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={carouselImages[currentImageIndex].src}
                  alt={carouselImages[currentImageIndex].title}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {carouselImages[currentImageIndex].title}
                  </h3>
                  <p className="text-white/90">
                    {carouselImages[currentImageIndex].description}
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 text-fem-navy px-3 py-1 rounded-full text-sm font-medium">
                  {currentImageIndex + 1}/{carouselImages.length}
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-fem-navy p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                aria-label="Previous image"
                title="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-fem-navy p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                aria-label="Next image"
                title="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Dot Indicators */}
              <div className="flex justify-center mt-6 space-x-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex ? 'bg-fem-terracotta' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                    title={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Get Started Section - Enhanced */}
        <section className="py-16 sm:py-20 bg-fem-gray">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div 
                className="bg-white p-6 sm:p-12 rounded-2xl shadow-xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-fem-navy mb-4 sm:mb-6">Get Started Today</h2>
                <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
                  Join our growing community of faith-based businesses and community members. Together, we can build a stronger, more connected community.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button 
                    onClick={handleRegisterBusinessClick}
                    className="bg-fem-terracotta text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-fem-terracotta/90 transition-colors text-base sm:text-lg"
                  >
                    Register Your Business
                  </Button>
                  <Button 
                    onClick={handleOpenAuthModal}
                    className="bg-fem-navy text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-fem-navy/90 transition-colors text-base sm:text-lg"
                  >
                    Join Our Community
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Section - Enhanced */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-fem-navy mb-4 sm:mb-6">Contact Us</h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                If you have any questions about Faith Connect Business Directory, please don't hesitate to contact us:
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  ),
                  title: "Email",
                  contact: "info@faithconnect.biz"
                },
                {
                  icon: (
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  ),
                  title: "Phone",
                  contact: "0714777797"
                },
                {
                  icon: (
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  ),
                  title: "Location",
                  contact: "Faith Connect Headquarters, Nairobi, Kenya"
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                    {item.icon}
                </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-fem-navy mb-2">{item.title}</h3>
                  <p className="text-sm sm:text-base text-fem-terracotta font-medium">{item.contact}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      {/* Enhanced Scroll to Top Button */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-fem-navy to-fem-terracotta text-white p-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-fem-terracotta/30"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-5 h-5" />
      </motion.button>
      
      <Footer />
      
    </div>
  );
};

export default AboutPage;
