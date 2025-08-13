import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { OnboardingCheck } from "@/components/OnboardingCheck";
import { 
  Building2, 
  Upload, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Camera,
  Settings,
  Package,
  Tag,
  Users,
  Sparkles,
  Award,
  TrendingUp,
  Heart,
  Star
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const BusinessRegistrationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{id: number, name: string, slug: string}>>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    // Basic Information
    business_name: "",
    category: null as number | null,
    description: "",
    long_description: "",
    businessType: "both" as "products" | "services" | "both", // NEW FIELD
    
    // Contact Information
    phone: "",
    email: "",
    website: "",
    // Social media links
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    youtube_url: "",
    address: "",
    city: "",
    county: "",
    zipCode: "",
    
    // Business Details
    hours: {
      monday: { open: "", close: "", closed: false },
      tuesday: { open: "", close: "", closed: false },
      wednesday: { open: "", close: "", closed: false },
      thursday: { open: "", close: "", closed: false },
      friday: { open: "", close: "", closed: false },
      saturday: { open: "", close: "", closed: false },
      sunday: { open: "", close: "", closed: false }
    },
    
    // Services & Products
    services: [] as Array<{name: string, photo?: string}>,
    products: [] as Array<{name: string, price: string, description: string, photo?: string}>,
    features: [] as string[],
    tags: [] as string[],
    
    // Photo Request
    photoRequest: false,
    photoRequestNotes: ""
  });

  // State for new service/product inputs
  const [newService, setNewService] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "" });

  // GSAP Animations
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, 
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }

    if (progressRef.current) {
      gsap.fromTo(progressRef.current,
        { scale: 0.8, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.8, 
          delay: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: progressRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    if (formRef.current) {
      gsap.fromTo(formRef.current,
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          delay: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Check if user is authenticated and is a business user
  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to register your business",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    if (user.user_type !== 'business') {
      toast({
        title: "Business account required",
        description: "Only business users can register businesses",
        variant: "destructive"
      });
        navigate('/');
        return;
    }

    // Check if we're in edit mode
    if (location.state?.editMode && location.state?.businessId) {
      setIsEditMode(true);
      setBusinessId(location.state.businessId);
      // TODO: Load existing business data to populate the form
      loadExistingBusinessData(location.state.businessId);
    }
  }, [user, navigate, location.state]);

  // Load existing business data for editing
  const loadExistingBusinessData = async (id: string) => {
    try {
      // Fetch real business data from the API
      const business = await apiService.getBusiness(id);
      
      if (business) {
        // Transform API data to match our form structure
        const transformedData = {
          business_name: business.business_name,
          category: business.category?.id || null,
          description: business.description || '',
          long_description: business.long_description || '',
          businessType: 'both' as "products" | "services" | "both", // Default to both
          phone: business.phone || '',
          email: business.email || '',
          website: business.website || '',
          facebook_url: business.facebook_url || '',
          instagram_url: business.instagram_url || '',
          twitter_url: business.twitter_url || '',
                youtube_url: business.youtube_url || '',
          address: business.address,
          city: business.city || '',
          county: business.county || '',
          zipCode: business.zip_code || '',
          hours: {
            monday: { open: '', close: '', closed: false },
            tuesday: { open: '', close: '', closed: false },
            wednesday: { open: '', close: '', closed: false },
            thursday: { open: '', close: '', closed: false },
            friday: { open: '', close: '', closed: false },
            saturday: { open: '', close: '', closed: false },
            sunday: { open: '', close: '', closed: false }
          },
          services: [], // TODO: Fetch services when API endpoint is available
          products: [], // TODO: Fetch products when API endpoint is available
          features: [], // TODO: Fetch features when API endpoint is available
          tags: [],
          photoRequest: false,
          photoRequestNotes: ''
        };

        setFormData(transformedData);
        toast({
          title: "Edit Mode",
          description: "Business data loaded. You can now edit your business information.",
        });
      } else {
        throw new Error('Business not found');
      }
    } catch (error) {
      console.error('Error loading business data:', error);
      toast({
        title: "Error loading business data",
        description: "Could not load existing business data for editing. Please try again.",
        variant: "destructive"
      });
      // Redirect back to manage business page if we can't load the data
      navigate('/manage-business');
    }
  };

  // Hardcoded categories that match the database
  const hardcodedCategories = [
    { id: 1, name: 'Restaurant', slug: 'restaurant' },
    { id: 2, name: 'Retail', slug: 'retail' },
    { id: 3, name: 'Services', slug: 'services' },
    { id: 4, name: 'Health & Wellness', slug: 'health-wellness' },
    { id: 5, name: 'Automotive', slug: 'automotive' },
    { id: 6, name: 'Real Estate', slug: 'real-estate' },
    { id: 7, name: 'Education', slug: 'education' },
    { id: 8, name: 'Technology', slug: 'technology' },
    { id: 9, name: 'Beauty & Personal Care', slug: 'beauty-personal-care' },
    { id: 10, name: 'Home & Garden', slug: 'home-garden' },
    { id: 11, name: 'Legal Services', slug: 'legal-services' },
    { id: 12, name: 'Financial Services', slug: 'financial-services' },
    { id: 13, name: 'Entertainment', slug: 'entertainment' },
    { id: 14, name: 'Professional Services', slug: 'professional-services' },
    { id: 15, name: 'Construction', slug: 'construction' },
    { id: 16, name: 'Transportation', slug: 'transportation' },
    { id: 17, name: 'Non-Profit', slug: 'non-profit' }
  ];

  // Fetch categories from API instead of using hardcoded values
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories();
        setCategories(response.results);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to hardcoded categories if API fails
        setCategories(hardcodedCategories);
      }
    };
    
    fetchCategories();
  }, []);

  const availableServices = [
    "Dine-in", "Takeout", "Delivery", "Catering", "Private Events",
    "Consultation", "Installation", "Maintenance", "Repair", "Training",
    "Custom Work", "Rental", "Membership", "Subscription", "One-time Service"
  ];

  const availableFeatures = [
    "Free Wi-Fi", "Parking Available", "Wheelchair Accessible", "Credit Cards Accepted",
    "Cash Only", "Appointment Required", "Walk-ins Welcome", "Emergency Services",
    "24/7 Service", "Mobile Service", "Online Booking", "Gift Cards Available"
  ];

  const availableTags = [
    "Family-Friendly", "Eco-Friendly", "Veteran-Owned", "Woman-Owned", "Local Business",
    "Christian-Owned", "Community-Focused", "Quality Service", "Affordable", "Premium",
    "Fast Service", "Professional", "Reliable", "Trusted", "Innovative"
  ];

  const steps = [
    { id: 1, title: "Basic Info", icon: Building2 },
    { id: 2, title: "Contact Details", icon: Phone },
    { id: 3, title: "Services & Products", icon: Settings }
  ];

  // Get field-specific errors
  const getFieldError = (fieldName: string) => {
    return formErrors.find(error => error.toLowerCase().includes(fieldName.toLowerCase()));
  };

  // Get step-specific errors
  const getStepErrors = (step: number) => {
    switch (step) {
      case 1:
        return formErrors.filter(error => 
          error.toLowerCase().includes('business name') ||
          error.toLowerCase().includes('category') ||
          error.toLowerCase().includes('business type') ||
          error.toLowerCase().includes('description')
        );
      case 2:
        return formErrors.filter(error => 
          error.toLowerCase().includes('phone') ||
          error.toLowerCase().includes('email') ||
          error.toLowerCase().includes('address')
        );
      case 3:
        return formErrors.filter(error => 
          error.toLowerCase().includes('service') ||
          error.toLowerCase().includes('product')
        );
      default:
        return [];
    }
  };

  // Clear field error when user starts typing
  const handleInputChange = useCallback((field: string, value: any) => {
    // Convert category value to number if it's a string
    if (field === 'category' && typeof value === 'string') {
      if (value === '') {
        value = null;
      } else {
        value = parseInt(value, 10);
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear only the error for this specific field, not all errors
    if (formErrors.length > 0) {
      const fieldError = formErrors.find(error => 
        error.toLowerCase().includes(field.toLowerCase()) ||
        error.toLowerCase().includes('business name') && field === 'business_name' ||
        error.toLowerCase().includes('category') && field === 'category' ||
        error.toLowerCase().includes('business type') && field === 'businessType' ||
        error.toLowerCase().includes('description') && field === 'description' ||
        error.toLowerCase().includes('phone') && field === 'phone' ||
        error.toLowerCase().includes('email') && field === 'email' ||
        error.toLowerCase().includes('address') && field === 'address'
      );
      
      if (fieldError) {
        setFormErrors(prev => prev.filter(error => error !== fieldError));
      }
    }
  }, [formErrors]);

  const handleArrayToggle = useCallback((field: string, value: string) => {
    setFormData(prev => {
      if (field === 'services') {
        const currentServices = prev.services as Array<{name: string, photo?: string}>;
        const existingService = currentServices.find(s => s.name === value);
        
        if (existingService) {
          // Remove service
          return { ...prev, [field]: currentServices.filter(s => s.name !== value) };
        } else {
          // Add service
          return { ...prev, [field]: [...currentServices, { name: value, photo: '' }] };
        }
      } else {
        const currentArray = prev[field as keyof typeof prev] as string[];
        if (currentArray.includes(value)) {
          return { ...prev, [field]: currentArray.filter(item => item !== value) };
        } else {
          // Limit features to maximum of 5
          if (field === 'features' && currentArray.length >= 5) {
            toast({
              title: "Feature Limit Reached",
              description: "You can select a maximum of 5 features. Please remove some features before adding new ones.",
              variant: "destructive"
            });
            return prev;
          }
          return { ...prev, [field]: [...currentArray, value] };
        }
      }
    });
  }, []);

  const handleHoursChange = useCallback((day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day as keyof typeof prev.hours],
          [field]: value
        }
      }
    }));
  }, []);

  // Validate specific step data
  const validateStep = useCallback((step: number): boolean => {
    const errors: string[] = [];
    
    switch (step) {
      case 1:
        // Basic Information validation - only required fields
        if (!formData.business_name.trim()) {
          errors.push("Business name is required");
        }
        if (formData.category === null || formData.category === undefined) {
          errors.push("Business category is required");
        }
        if (!formData.businessType) {
          errors.push("Business type is required");
        }
        if (!formData.description.trim()) {
          errors.push("Business description is required");
        }
        break;
        
      case 2:
        // Contact Information validation - phone, email, and address are required
        if (!formData.phone.trim()) {
          errors.push("Phone number is required");
        }
        if (!formData.email.trim()) {
          errors.push("Email address is required");
        }
        if (!formData.address.trim()) {
          errors.push("Business address is required");
        }
        break;
        
      case 3:
        // Services & Products validation - only required if business type requires them
        if (formData.businessType === 'services' && formData.services.length === 0) {
          errors.push("At least one service is required for service-based businesses");
        }
        if (formData.businessType === 'products' && formData.products.length === 0) {
          errors.push("At least one product is required for product-based businesses");
        }
        if (formData.businessType === 'both' && formData.services.length === 0 && formData.products.length === 0) {
          errors.push("At least one service or product is required");
        }
        break;
    }
    
    return errors.length === 0;
  }, [formData.business_name, formData.category, formData.description, formData.address, formData.businessType, formData.services.length, formData.products.length]);

  // Handle next step with validation
  const handleNextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(3, prev + 1));
      setFormErrors([]); // Clear errors when moving to next step
    } else {
      // Get validation errors for current step
      const errors: string[] = [];
      switch (currentStep) {
        case 1:
          if (!formData.business_name.trim()) errors.push("Business name is required");
          if (formData.category === null || formData.category === undefined) errors.push("Business category is required");
          if (!formData.businessType) errors.push("Business type is required");
          if (!formData.description.trim()) errors.push("Business description is required");
          break;
        case 2:
          if (!formData.phone.trim()) errors.push("Phone number is required");
          if (!formData.email.trim()) errors.push("Email address is required");
          if (!formData.address.trim()) errors.push("Business address is required");
          break;
        case 3:
          if (formData.businessType === 'services' && formData.services.length === 0) {
            errors.push("At least one service is required for service-based businesses");
          }
          if (formData.businessType === 'products' && formData.products.length === 0) {
            errors.push("At least one product is required for product-based businesses");
          }
          if (formData.businessType === 'both' && formData.services.length === 0 && formData.products.length === 0) {
            errors.push("At least one service or product is required");
          }
          break;
      }
      
      if (errors.length > 0) {
        setFormErrors(errors);
        toast({
          title: "Validation Error",
          description: errors.join(", "),
          variant: "destructive"
        });
      }
    }
  }, [currentStep, validateStep, formData, setFormErrors]);

  // Handle previous step
  const handlePreviousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    setFormErrors([]); // Clear errors when moving to previous step
  }, [setFormErrors]);

  // Validate form data before submission
  const validateFormData = () => {
    const errors: string[] = [];

    if (!formData.business_name.trim()) {
      errors.push("Business name is required");
    } else if (formData.business_name.trim().length < 2) {
      errors.push("Business name must be at least 2 characters long");
    }

    if (formData.category === null || formData.category === undefined) {
      errors.push("Business category is required");
    }

    if (!formData.businessType) {
      errors.push("Business type is required");
    }

    if (!formData.description.trim()) {
      errors.push("Business description is required");
    } else if (formData.description.trim().length < 5) {
      errors.push("Business description must be at least 5 characters long");
    }

    if (!formData.phone.trim()) {
      errors.push("Phone number is required");
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone.trim())) {
      errors.push("Please enter a valid phone number");
    }

    if (!formData.email.trim()) {
      errors.push("Email address is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.push("Please enter a valid email address");
    }

    // Website validation (if provided)
    if (formData.website.trim()) {
      const websiteRegex = /^https?:\/\/.+\..+/;
      if (!websiteRegex.test(formData.website.trim())) {
        errors.push("Please enter a valid website URL (e.g., https://www.example.com)");
      }
    }

    // Social media URL validation (if provided)
    const socialMediaFields = [
      { field: 'facebook_url', name: 'Facebook' },
      { field: 'instagram_url', name: 'Instagram' },
          { field: 'twitter_url', name: 'Twitter' },
    { field: 'youtube_url', name: 'YouTube' }
    ];

    socialMediaFields.forEach(({ field, name }) => {
      const url = formData[field as keyof typeof formData] as string;
      if (url.trim()) {
        const urlRegex = /^https?:\/\/.+\..+/;
        if (!urlRegex.test(url.trim())) {
          errors.push(`Please enter a valid ${name} URL`);
        }
      }
    });

    if (!formData.address.trim()) {
      errors.push("Business address is required");
    } else if (formData.address.trim().length < 5) {
      errors.push("Business address must be at least 5 characters long");
    }

    // City and county are optional - no validation needed

    // Validate business hours - at least one day should have hours set (optional for now)
    // const hasValidHours = Object.values(formData.hours).some(day => 
    //   !day.closed && day.open && day.close
    // );
    // if (!hasValidHours) {
    //   errors.push("Please set business hours for at least one day");
    // }

    // Validate that at least one service or product is selected (optional for initial registration)
    // if (formData.services.length === 0 && formData.products.length === 0) {
    //   errors.push("Please select at least one service or add at least one product");
    // }

    // Validate products if any are added
    formData.products.forEach((product, index) => {
      if (product.name.trim() && !product.price.trim()) {
        errors.push(`Product ${index + 1}: Price is required`);
      }
      if (product.price.trim() && !product.name.trim()) {
        errors.push(`Product ${index + 1}: Name is required`);
      }
    });

    return errors;
  };

  // Convert form data to API format
  const prepareBusinessData = () => {
    // Convert hours to the format expected by the API
    const hours = Object.entries(formData.hours)
      .filter(([day, hours]) => {
        // Only include days that have been configured (either closed or with times)
        return hours.closed || (hours.open && hours.close);
      })
      .map(([day, hours]) => {
        // Map day names to day numbers (0 = Sunday, 1 = Monday, etc.)
        const dayMap: { [key: string]: number } = {
          'sunday': 0,
          'monday': 1,
          'tuesday': 2,
          'wednesday': 3,
          'thursday': 4,
          'friday': 5,
          'saturday': 6
        };
        
        // Format time strings to HH:MM format
        const formatTime = (timeStr: string) => {
          if (!timeStr) return '';
          // Ensure time is in HH:MM format
          const time = new Date(`2000-01-01T${timeStr}`);
          return time.toTimeString().slice(0, 5);
        };

        return {
          day_of_week: dayMap[day.toLowerCase()],
          open_time: hours.closed ? null : formatTime(hours.open),
          close_time: hours.closed ? null : formatTime(hours.close),
          is_closed: hours.closed || false
        };
      });

    // Convert services to the format expected by the API
    const services = formData.services
      .filter(service => service.name.trim() !== '')
      .map(service => ({
        name: service.name,
        description: `${service.name} service`,
        price_range: 'Varies',
        duration: 'Varies',
        is_available: true,
        photo: service.photo || null
      }));

    // Convert products to the format expected by the API
    const products = formData.products
      .filter(product => product.name.trim() !== '')
      .map(product => ({
        name: product.name,
        description: product.description || `${product.name} product`,
        price: product.price || '0.00',
        is_available: true,
        photo: product.photo || null
      }));

    // Clean and prepare the data
    const businessData = {
      business_name: formData.business_name.trim(),
      category_id: formData.category as number,
      description: formData.description.trim(),
      long_description: formData.long_description.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      website: formData.website.trim() || null,
      facebook_url: formData.facebook_url.trim() || null,
      instagram_url: formData.instagram_url.trim() || null,
      twitter_url: formData.twitter_url.trim() || null,
      youtube_url: formData.youtube_url.trim() || null,
      address: formData.address.trim(),
      city: formData.city.trim(),
      county: formData.county.trim(),
      hours: hours,
      services: services,
      products: products,
      features: formData.features.filter(feature => feature.trim() !== ''),
      photo_request: formData.photoRequest ? 'Yes' : 'No',
      photo_request_notes: formData.photoRequestNotes.trim() || null
    };

    return businessData;
  };

  // Enhanced form submission with step validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields before submission
    const allErrors = validateFormData();
    if (allErrors.length > 0) {
      setFormErrors(allErrors);
      toast({
        title: "Form Incomplete",
        description: "Please complete all required fields before submitting",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    setFormErrors([]);

    try {
      const businessData = prepareBusinessData();
      
      if (isEditMode && businessId) {
        // Update existing business
        const updatedBusiness = await apiService.updateBusiness(businessId, businessData);
      } else {
        // Create new business
        const business = await apiService.createBusiness(businessData);
        
        toast({
          title: isEditMode ? "Business updated successfully!" : "Business registered successfully!",
          description: isEditMode 
            ? "Your business information has been updated successfully."
            : "Your business has been added to the directory. Welcome to the Faith Connect community!",
        });

        // Navigate to the business management page with the business ID
        navigate("/manage-business", { 
          state: { 
            businessId: business.id,
            newlyCreated: true 
          } 
        });
        return; // Exit early since we're redirecting
      }
      
      toast({
        title: isEditMode ? "Business updated successfully!" : "Business registered successfully!",
        description: isEditMode 
          ? "Your business information has been updated successfully."
          : "Your business has been updated successfully.",
      });

      // Navigate to the business management page
      navigate("/manage-business");
    } catch (error: any) {
      console.error('Business registration failed:', error);
      
      let errorMessage = "Failed to register business. Please try again.";
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).join(', ');
        setFormErrors(Object.values(errors));
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Render functions for each step
  const renderStep1 = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Step 1 Errors */}
      {getStepErrors(1).length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <span className="text-sm font-medium">Please fix the following issues:</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {getStepErrors(1).map((error, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {error}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Label htmlFor="business_name">
          Business Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="business_name"
          value={formData.business_name}
          onChange={(e) => handleInputChange("business_name", e.target.value)}
          placeholder="Enter your business name"
          className={`mt-1 ${getFieldError("business_name") ? 'border-red-500 focus:border-red-500' : ''}`}
          required
        />
        {getFieldError("business_name") && (
          <p className="text-sm text-red-500 mt-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            {getFieldError("business_name")}
          </p>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="category">
          Business Category <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.category?.toString() || ""} onValueChange={(value) => handleInputChange("category", value)}>
          <SelectTrigger className={`mt-1 ${getFieldError("category") ? 'border-red-500 focus:border-red-500' : ''}`}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
              ))
            ) : (
              <SelectItem value="no-categories" disabled>No categories found.</SelectItem>
            )}
          </SelectContent>
        </Select>
        {getFieldError("category") && (
          <p className="text-sm text-red-500 mt-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            {getFieldError("category")}
          </p>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label className="text-base font-medium">Business Type *</Label>
        <p className="text-sm text-gray-600 mb-3">What does your business offer?</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              formData.businessType === 'products' 
                ? 'border-fem-terracotta bg-fem-terracotta/10' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => handleInputChange("businessType", "products")}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                formData.businessType === 'products' 
                  ? 'border-fem-terracotta bg-fem-terracotta' 
                  : 'border-gray-400'
              }`}>
                {formData.businessType === 'products' && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                )}
              </div>
              <div>
                <div className="font-medium text-fem-navy">Products Only</div>
                <div className="text-sm text-gray-600">Sell physical goods</div>
              </div>
            </div>
          </div>

          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              formData.businessType === 'services' 
                ? 'border-fem-terracotta bg-fem-terracotta/10' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => handleInputChange("businessType", "services")}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                formData.businessType === 'services' 
                  ? 'border-fem-terracotta bg-fem-terracotta' 
                  : 'border-gray-400'
              }`}>
                {formData.businessType === 'services' && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                )}
              </div>
              <div>
                <div className="font-medium text-fem-navy">Services Only</div>
                <div className="text-sm text-gray-600">Provide services</div>
              </div>
            </div>
          </div>

          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              formData.businessType === 'both' 
                ? 'border-fem-terracotta bg-fem-terracotta/10' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => handleInputChange("businessType", "both")}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                formData.businessType === 'both' 
                  ? 'border-fem-terracotta bg-fem-terracotta' 
                  : 'border-gray-400'
              }`}>
                {formData.businessType === 'both' && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                )}
              </div>
              <div>
                <div className="font-medium text-fem-navy">Both</div>
                <div className="text-sm text-gray-600">Sell products & services</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="description">
          Business Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Briefly describe your business and what makes it unique"
          className={`mt-1 ${getFieldError("description") ? 'border-red-500 focus:border-red-500' : ''}`}
          rows={3}
          required
        />
        {getFieldError("description") && (
          <p className="text-sm text-red-500 mt-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            {getFieldError("description")}
          </p>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="long_description">
          Detailed Description (Optional)
        </Label>
        <Textarea
          id="long_description"
          value={formData.long_description}
          onChange={(e) => handleInputChange("long_description", e.target.value)}
          placeholder="Provide a more detailed description of your business, services, and mission"
          className="mt-1"
          rows={5}
        />
      </motion.div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Step 2 Errors */}
      {getStepErrors(2).length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <span className="text-sm font-medium">Please fix the following issues:</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {getStepErrors(2).map((error, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {error}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Contact Information */}
      <motion.div variants={itemVariants} className="space-y-4">
        <Label className="text-lg font-semibold">Contact Information</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+254 XXX XXX XXX"
              className={`mt-1 ${getFieldError("phone") ? 'border-red-500 focus:border-red-500' : ''}`}
              required
            />
            {getFieldError("phone") && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {getFieldError("phone")}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="business@example.com"
              className={`mt-1 ${getFieldError("email") ? 'border-red-500 focus:border-red-500' : ''}`}
              required
            />
            {getFieldError("email") && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {getFieldError("email")}
              </p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            placeholder="https://www.yourbusiness.com"
            className="mt-1"
          />
        </div>
      </motion.div>

      {/* Social Media Links */}
      <motion.div variants={itemVariants} className="space-y-4">
        <Label className="text-lg font-semibold">Social Media Links (Optional)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="facebook_url">Facebook (Optional)</Label>
            <Input
              id="facebook_url"
              value={formData.facebook_url}
              onChange={(e) => handleInputChange("facebook_url", e.target.value)}
              placeholder="https://facebook.com/yourbusiness"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="instagram_url">Instagram (Optional)</Label>
            <Input
              id="instagram_url"
              value={formData.instagram_url}
              onChange={(e) => handleInputChange("instagram_url", e.target.value)}
              placeholder="https://instagram.com/yourbusiness"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="twitter_url">Twitter (Optional)</Label>
            <Input
              id="twitter_url"
              value={formData.twitter_url}
              onChange={(e) => handleInputChange("twitter_url", e.target.value)}
              placeholder="https://twitter.com/yourbusiness"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="youtube_url">YouTube (Optional)</Label>
            <Input
              id="youtube_url"
              value={formData.youtube_url}
              onChange={(e) => handleInputChange("youtube_url", e.target.value)}
              placeholder="https://youtube.com/yourbusiness"
              className="mt-1"
            />
          </div>
        </div>
      </motion.div>

      {/* Address Information */}
      <motion.div variants={itemVariants} className="space-y-4">
        <Label className="text-lg font-semibold">Address Information</Label>
        <div>
          <Label htmlFor="address">
            Street Address <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="Enter your business address"
            className={`mt-1 ${getFieldError("address") ? 'border-red-500 focus:border-red-500' : ''}`}
            rows={2}
            required
          />
          {getFieldError("address") && (
            <p className="text-sm text-red-500 mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              {getFieldError("address")}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City (Optional)</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="Nairobi"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="county">County (Optional)</Label>
            <Input
              id="county"
              value={formData.county}
              onChange={(e) => handleInputChange("county", e.target.value)}
              placeholder="Nairobi"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP Code (Optional)</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleInputChange("zipCode", e.target.value)}
              placeholder="00100"
              className="mt-1"
            />
          </div>
        </div>
      </motion.div>

      {/* Business Hours */}
      <motion.div variants={itemVariants} className="space-y-4">
        <Label className="text-lg font-semibold">Business Hours (Optional)</Label>
        <p className="text-sm text-gray-600 mb-4">Set your business operating hours. Leave blank if not applicable.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(formData.hours).map(([day, hours]) => (
            <div key={day} className={`border rounded-lg p-4 backdrop-blur-sm transition-all duration-200 ${
              hours.closed 
                ? 'bg-gray-100/80 border-gray-300' 
                : 'bg-white/80 border-blue-300'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Label className="capitalize font-medium">{day}</Label>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Checkbox
                      id={`${day}-closed`}
                      checked={hours.closed}
                      onCheckedChange={(checked) => handleHoursChange(day, "closed", checked as boolean)}
                    />
                    <Label htmlFor={`${day}-closed`} className="text-xs cursor-pointer">
                      {hours.closed ? "Closed" : "Open"}
                    </Label>
                  </div>
                </div>
              </div>
              {!hours.closed && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm text-gray-700">Open</Label>
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleHoursChange(day, "open", e.target.value)}
                      className="text-sm bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      placeholder="--:--"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-700">Close</Label>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleHoursChange(day, "close", e.target.value)}
                      className="text-sm bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      placeholder="--:--"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {/* Step 3 Errors */}
      {getStepErrors(3).length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <span className="text-sm font-medium">Please fix the following issues:</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {getStepErrors(3).map((error, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {error}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Services Offered */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 w-5" />
          Services Offered
        </h3>
        <p className="text-sm text-blue-700 mb-4">
          Select the services you provide to your customers and add images
        </p>
        
        {/* Service List with Images */}
        <div className="space-y-4 mb-4">
          {formData.services.map((service, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-blue-900">{service.name}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newServices = formData.services.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, services: newServices }));
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
              
              {/* Service Image Upload */}
              <div className="mt-4">
                <Label className="text-sm font-medium text-blue-900 mb-2 block">
                  Service Image
                </Label>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <Camera className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-blue-600 mb-2">
                    Click to upload service image
                  </p>
                  <p className="text-xs text-blue-500">
                    JPG, PNG up to 5MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`service-photo-${index}`}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const newServices = [...formData.services];
                          newServices[index] = {
                            name: service.name,
                            photo: event.target?.result as string
                          };
                          setFormData(prev => ({ ...prev, services: newServices }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(`service-photo-${index}`)?.click()}
                    className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Photo
                  </Button>
                </div>
                
                {/* Display uploaded photo */}
                {service.photo && (
                  <div className="mt-3">
                    <div className="relative inline-block">
                      <img
                        src={service.photo}
                        alt={`${service.name} photo`}
                        className="w-24 h-24 object-cover rounded-lg border border-blue-200"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newServices = [...formData.services];
                          newServices[index] = { name: service.name, photo: '' };
                          setFormData(prev => ({ ...prev, services: newServices }));
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 text-white hover:bg-red-600"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Add New Service */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-blue-900">Add New Service</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Consultation, Installation, Repair"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => {
                if (newService.trim()) {
                  setFormData(prev => ({
                    ...prev,
                    services: [...prev.services, { name: newService.trim(), photo: '' }]
                  }));
                  setNewService('');
                }
              }}
              disabled={!newService.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Service
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Products Offered */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-sm">
        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
          <Package className="w-5 w-5" />
          Products Offered
        </h3>
        <p className="text-sm text-green-700 mb-4">
          Add the products you sell with descriptions, pricing, and photos
        </p>
        
        {/* Product List */}
        <div className="space-y-4 mb-4">
          {formData.products.map((product, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-green-900">Product {index + 1}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newProducts = formData.products.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, products: newProducts }));
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`product-name-${index}`}>Product Name *</Label>
                  <Input
                    id={`product-name-${index}`}
                    placeholder="e.g., Handmade Jewelry, Organic Soap"
                    value={product.name}
                    onChange={(e) => {
                      const newProducts = [...formData.products];
                      newProducts[index].name = e.target.value;
                      setFormData(prev => ({ ...prev, products: newProducts }));
                    }}
                    className="mt-1"
                  />
                  {getFieldError(`product-name-${index}`) && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError(`product-name-${index}`)}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`product-price-${index}`}>Price (KSH) *</Label>
                  <Input
                    id={`product-price-${index}`}
                    placeholder="e.g., 500, 1,200"
                    value={product.price}
                    onChange={(e) => {
                      const newProducts = [...formData.products];
                      newProducts[index].price = e.target.value;
                      setFormData(prev => ({ ...prev, products: newProducts }));
                    }}
                    className="mt-1"
                  />
                  {getFieldError(`product-price-${index}`) && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError(`product-price-${index}`)}</p>
                  )}
                </div>
              </div>
              
              {/* Product Photo Upload */}
              <div className="mt-4">
                <Label className="text-sm font-medium text-green-900 mb-2 block">
                  Product Photo
                </Label>
                <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                  <Camera className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-green-600 mb-2">
                    Click to upload product photo
                  </p>
                  <p className="text-xs text-green-500">
                    JPG, PNG up to 5MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`product-photo-${index}`}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const newProducts = [...formData.products];
                          newProducts[index] = {
                            ...newProducts[index],
                            photo: event.target?.result as string
                          };
                          setFormData(prev => ({ ...prev, products: newProducts }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(`product-photo-${index}`)?.click()}
                    className="mt-2 border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Photo
                  </Button>
                </div>
                
                {/* Display uploaded photo */}
                {product.photo && (
                  <div className="mt-3">
                    <div className="relative inline-block">
                      <img
                        src={product.photo}
                        alt={`${product.name} photo`}
                        className="w-24 h-24 object-cover rounded-lg border border-green-200"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newProducts = [...formData.products];
                          newProducts[index] = { ...newProducts[index], photo: '' };
                          setFormData(prev => ({ ...prev, products: newProducts }));
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 text-white hover:bg-red-600"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Add New Product */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-green-900">Add New Product</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Handmade Jewelry"
              value={newProduct.name}
              onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
              className="flex-1"
            />
            <Input
              placeholder="Price in KSH"
              value={newProduct.price}
              onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
              className="w-32"
            />
            <Button
              type="button"
              onClick={() => {
                if (newProduct.name.trim() && newProduct.price.trim()) {
                  setFormData(prev => ({
                    ...prev,
                    products: [...prev.products, { name: newProduct.name.trim(), price: newProduct.price.trim(), description: '', photo: '' }]
                  }));
                  setNewProduct({ name: "", price: "", description: "" });
                }
              }}
              disabled={!newProduct.name.trim() || !newProduct.price.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              Add Product
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  // Main component return
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <motion.div
          ref={headerRef}
          className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white py-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {isEditMode ? "Edit Your Business" : "Register Your Business"}
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-blue-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Join the Faith Connect community and showcase your business
            </motion.p>
            <motion.div 
              className="mt-4 text-sm text-blue-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span className="text-red-300">*</span> Required fields
            </motion.div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          ref={progressRef}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8"
        >
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Progress</h2>
              <span className="text-sm text-gray-500">Step {currentStep} of 3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-fem-terracotta to-fem-navy h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span className={`${currentStep >= 1 ? 'text-fem-terracotta font-medium' : ''}`}>
                Basic Info {currentStep > 1 && '✓'}
              </span>
              <span className={`${currentStep >= 2 ? 'text-fem-terracotta font-medium' : ''}`}>
                Contact Details {currentStep > 2 && '✓'}
              </span>
              <span className={`${currentStep >= 3 ? 'text-fem-terracotta font-medium' : ''}`}>
                Services & Products {currentStep === 3 && '✓'}
              </span>
            </div>
            
            {/* Required Fields Note */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <span className="text-sm font-medium">Required Fields:</span>
              </div>
              <div className="mt-2 text-xs text-blue-700 grid grid-cols-2 gap-2">
                <div>• Business Name</div>
                <div>• Business Category</div>
                <div>• Business Type</div>
                <div>• Business Description</div>
                <div>• Phone Number</div>
                <div>• Email Address</div>
                <div>• Street Address</div>
              </div>
            </div>
            
            {/* Step Validation Status */}
            {formErrors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <span className="text-sm font-medium">Validation Errors on Step {currentStep}:</span>
                </div>
                <ul className="mt-2 text-sm text-red-700 space-y-1">
                  {formErrors.map((error, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          ref={formRef}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step Content */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep1()}
                </motion.div>
              )}
              
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep2()}
                </motion.div>
              )}
              
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep3()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-2 bg-fem-terracotta hover:bg-fem-terracotta/90"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-fem-terracotta hover:bg-fem-terracotta/90"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isEditMode ? "Updating..." : "Registering..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {isEditMode ? "Update Business" : "Register Business"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default BusinessRegistrationPage;