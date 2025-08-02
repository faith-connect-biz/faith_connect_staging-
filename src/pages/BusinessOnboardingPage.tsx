import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Play, Pause, SkipForward, Building2, Users, MessageCircle, CheckCircle } from "lucide-react";

const steps = [
  {
    title: "Welcome Business Owner!",
    subtitle: "Your business journey begins here",
    content: "We're excited to have your business join our community. Faith Connect helps you showcase your services and products to our trusted church community.",
    color: "from-fem-navy to-fem-terracotta"
  },
  {
    title: "What is Faith Connect for Businesses?",
    subtitle: "Connecting businesses with our community",
    content: "Faith Connect is a platform that connects business owners with our faith community. You can create a business profile, list your services and products, and connect directly with potential customers.",
    color: "from-fem-terracotta to-fem-gold"
  },
  {
    title: "Step 1: Create Your Business Profile",
    subtitle: "Showcase your business",
    content: "Start by creating your business profile with contact information, services, and photos. This helps community members discover and trust your business.",
    color: "from-fem-gold to-fem-navy"
  },
  {
    title: "Step 2: List Your Services & Products",
    subtitle: "Display what you offer",
    content: "Add your services and products with pricing information. Community members can browse and find exactly what they need.",
    color: "from-fem-navy to-fem-terracotta"
  },
  {
    title: "Step 3: Connect with Community",
    subtitle: "Build meaningful relationships",
    content: "Use our built-in chat to communicate with community members, answer questions, and schedule appointments.",
    color: "from-fem-terracotta to-fem-gold"
  },
  {
    title: "You're Ready!",
    subtitle: "Let's grow your business",
    content: "You're all set to start your business journey with Faith Connect. Click 'Get Started' to begin creating your business profile!",
    color: "from-fem-gold to-fem-navy"
  }
];

const BusinessOnboardingPage = () => {
  const [step, setStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  console.log("BusinessOnboardingPage rendered - step:", step);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= steps.length - 1) {
          setIsAutoPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleNext = async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Mark business onboarding as complete and navigate with animation
      localStorage.setItem("hasSeenBusinessOnboarding", "true");
      
      // Animate out before navigation
      await new Promise(resolve => setTimeout(resolve, 800));
      navigate("/register-business");
    }
    
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleBack = async () => {
    if (isTransitioning || step === 0) return;
    setIsTransitioning(true);
    setStep(step - 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleStepClick = (stepIndex: number) => {
    if (isTransitioning) return;
    setStep(stepIndex);
  };

  const handleSkip = () => {
    setStep(steps.length - 1); // Navigate to the last step
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fem-navy via-fem-darkgray to-fem-navy overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="fixed inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(218, 165, 32, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 40%, rgba(139, 69, 19, 0.3) 0%, transparent 50%)"
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-fem-terracotta to-fem-gold z-50"
        style={{ scaleX: smoothProgress, transformOrigin: "0%" }}
      />

      {/* Main Container */}
      <div ref={containerRef} className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <motion.h1
              className="text-6xl md:text-8xl font-extrabold text-white mb-4 tracking-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                background: "linear-gradient(135deg, #8B4513 0%, #DAA520 50%, #8B4513 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              FaithConnect
            </motion.h1>
            <motion.p
              className="text-xl text-gray-300 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Business Directory Platform
            </motion.p>
          </motion.div>

          {/* Steps Container */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="bg-white/15 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/30 shadow-2xl relative"
              >
                {/* Skip Button - Inside the card */}
                <motion.button
                  onClick={handleSkip}
                  className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all duration-300 border border-white/20 text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SkipForward className="w-3 h-3 mr-1 inline" />
                  Skip
                </motion.button>

                {/* Step Number */}
                <motion.div
                  className="flex items-center justify-center mb-8"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-fem-terracotta to-fem-gold flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {step + 1}
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-full border-3 border-fem-gold"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </motion.div>

                {/* Content */}
                <div className="text-center space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                      {steps[step].title}
                    </h2>
                    <p className="text-2xl text-fem-gold font-semibold">
                      {steps[step].subtitle}
                    </p>
                  </motion.div>

                  <motion.p
                    className="text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto font-light"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    {steps[step].content}
                  </motion.p>
                </div>

                {/* Navigation */}
                <motion.div
                  className="flex items-center justify-between mt-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  {step > 0 && (
                    <Button
                      onClick={handleBack}
                      disabled={isTransitioning}
                      variant="outline"
                      className="flex items-center gap-2 border-white/60 text-white bg-white/10 hover:bg-white/20 disabled:opacity-50 px-6 py-3 rounded-full font-semibold shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Back
                    </Button>
                  )}

                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      variant="ghost"
                      className="text-white hover:bg-white/20 rounded-full p-3"
                    >
                      {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>

                    <Button
                      onClick={handleNext}
                      disabled={isTransitioning}
                      className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-gold hover:to-fem-terracotta text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
                    >
                      {step === steps.length - 1 ? "Get Started" : "Next"}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Step Indicators */}
          <motion.div
            className="flex justify-center gap-3 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {steps.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => handleStepClick(i)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i === step ? "bg-fem-gold scale-125" : "bg-white/30 hover:bg-white/50"
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="fixed top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-r from-fem-gold/20 to-fem-terracotta/20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="fixed bottom-20 left-20 w-24 h-24 rounded-full bg-gradient-to-r from-fem-terracotta/20 to-fem-gold/20 blur-2xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default BusinessOnboardingPage; 