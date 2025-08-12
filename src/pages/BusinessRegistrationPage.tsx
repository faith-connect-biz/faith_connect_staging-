import { useState, useEffect, useRef } from "react";
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
  const { user, forceReAuth } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{id: number, name: string, slug: string}>>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    // Basic Information
    business_name: "",
    category: "",
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
    services: [] as string[],
    products: [] as Array<{name: string, price: string, description: string, photo?: string}>,
    features: [] as string[],
    tags: [] as string[],
    
    // Photo Request
    photoRequest: false,
    photoRequestNotes: ""
  });

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

    // Debug: Check authentication tokens
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    console.log('Authentication debug:', {
      user: user,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0
    });
  }, [user, navigate, location.state]);

  // Load existing business data for editing
  const loadExistingBusinessData = async (id: string) => {
    try {
      // Fetch real business data from the API
      const business = await apiService.getBusiness(id);
      
      console.log('Raw business data for editing:', business);
      
      if (business) {
        // Transform API data to match our form structure
        const transformedData = {
          business_name: business.business_name,
          category: business.category?.name || '',
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

        console.log('Transformed data for edit mode:', transformedData);

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

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await apiService.getCategories();
        setCategories(response.results);
      } catch (error: any) {
        console.error('Failed to fetch categories:', error);
        // Fallback to default categories if API fails
        const fallbackCategories = [
          { id: 1, name: 'Food & Dining', slug: 'food-dining' },
          { id: 2, name: 'Health & Beauty', slug: 'health-beauty' },
          { id: 3, name: 'Technology', slug: 'technology' },
          { id: 4, name: 'Fashion & Clothing', slug: 'fashion-clothing' },
          { id: 5, name: 'Home & Garden', slug: 'home-garden' },
          { id: 6, name: 'Sports & Fitness', slug: 'sports-fitness' },
          { id: 7, name: 'Education', slug: 'education' },
          { id: 8, name: 'Automotive', slug: 'automotive' },
          { id: 9, name: 'Entertainment', slug: 'entertainment' },
          { id: 10, name: 'Professional Services', slug: 'professional-services' },
          { id: 11, name: 'Restaurant', slug: 'restaurant' },
          { id: 12, name: 'Retail', slug: 'retail' },
          { id: 13, name: 'Services', slug: 'services' },
          { id: 14, name: 'Real Estate', slug: 'real-estate' },
          { id: 15, name: 'Legal Services', slug: 'legal-services' },
          { id: 16, name: 'Financial Services', slug: 'financial-services' },
          { id: 17, name: 'Construction', slug: 'construction' },
          { id: 18, name: 'Transportation', slug: 'transportation' },
          { id: 19, name: 'Non-Profit', slug: 'non-profit' },
          { id: 20, name: 'Beauty & Personal Care', slug: 'beauty-personal-care' }
        ];
        setCategories(fallbackCategories);
        toast({
          title: "Using default categories",
          description: "Could not load categories from server. Using default categories.",
          variant: "default"
        });
      } finally {
        setIsLoadingCategories(false);
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

  // Clear field error when user starts typing
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear form errors when user starts typing
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => {
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
    });
  };

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
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
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Validate form data before submission
  const validateFormData = () => {
    const errors: string[] = [];

    if (!formData.business_name.trim()) {
      errors.push("Business name is required");
    } else if (formData.business_name.trim().length < 2) {
      errors.push("Business name must be at least 2 characters long");
    }

    if (!formData.category) {
      errors.push("Business category is required");
    }

    if (!formData.description.trim()) {
      errors.push("Business description is required");
    } else if (formData.description.trim().length < 10) {
      errors.push("Business description must be at least 10 characters long");
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

    if (!formData.city.trim()) {
      errors.push("City is required");
    }

    if (!formData.county.trim()) {
      errors.push("County is required");
    }

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
      .filter(service => service.trim() !== '')
      .map(service => ({
        name: service,
        description: `${service} service`,
        price_range: 'Varies',
        duration: 'Varies',
        is_available: true
      }));

    // Convert products to the format expected by the API
    const products = formData.products
      .filter(product => product.name.trim() !== '')
      .map(product => ({
        name: product.name,
        description: product.description || `${product.name} product`,
        price: product.price || '0.00',
        is_available: true
      }));

    // Clean and prepare the data
    const businessData = {
      business_name: formData.business_name.trim(),
      category: formData.category,
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

    console.log('Prepared business data structure:', {
      hours: hours,
      services: services,
      products: products,
      features: businessData.features
    });

    return businessData;
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setFormErrors([]);
    
    // Validate form data
    const validationErrors = validateFormData();
    if (validationErrors.length > 0) {
      setFormErrors(validationErrors);
      toast({
        title: "Validation errors",
        description: validationErrors.join(", "),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Debug: Check authentication before API call
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      console.log('Before API call - Authentication state:', {
        user: user,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length || 0,
        refreshTokenLength: refreshToken?.length || 0
      });

      const businessData = prepareBusinessData();
      
      // Debug: Log the data being sent
      console.log('Business data being sent to API:', businessData);
      
      if (isEditMode && businessId) {
        // Update existing business
        const updatedBusiness = await apiService.updateBusiness(businessId, businessData);
        console.log('Business updated successfully:', updatedBusiness);
      } else {
        // Create new business
        const business = await apiService.createBusiness(businessData);
        console.log('Business created successfully:', business);
      }
      
      toast({
        title: isEditMode ? "Business updated successfully!" : "Business registered successfully!",
        description: isEditMode 
          ? "Your business information has been updated successfully."
          : "Your business has been added to the directory. Welcome to the Faith Connect community!",
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

  const renderStep1 = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Label htmlFor="business_name">
          Business Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="business_name"
          value={formData.business_name}
          onChange={(e) => handleInputChange("business_name", e.target.value)}
          placeholder="Enter your business name"
          className="mt-1"
          required
        />
        {getFieldError("business_name") && (
          <p className="text-sm text-red-500 mt-1">{getFieldError("business_name")}</p>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="category">
          Business Category <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingCategories ? (
              <SelectItem value="loading" disabled>Loading categories...</SelectItem>
            ) : categories.length === 0 ? (
              <SelectItem value="no-categories" disabled>No categories found.</SelectItem>
            ) : (
              categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {getFieldError("category") && (
          <p className="text-sm text-red-500 mt-1">{getFieldError("category")}</p>
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
                <div className="text-sm text-gray-600">Products & services</div>
              </div>
            </div>
          </div>
        </div>
        {getFieldError("businessType") && (
          <p className="text-sm text-red-500 mt-1">{getFieldError("businessType")}</p>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="description">
          Short Description <span className="text-red-500">*</span>
        </Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Brief description of your business"
          className="mt-1"
          required
        />
        {getFieldError("description") && (
          <p className="text-sm text-red-500 mt-1">{getFieldError("description")}</p>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="long_description">Detailed Description</Label>
        <Textarea
          id="long_description"
          value={formData.long_description}
          onChange={(e) => handleInputChange("long_description", e.target.value)}
          placeholder="Tell us more about your business, services, and what makes you unique"
          rows={4}
          className="mt-1"
          required
        />
        {getFieldError("long_description") && (
          <p className="text-sm text-red-500 mt-1">{getFieldError("long_description")}</p>
        )}
      </motion.div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <Label htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+254 XXX XXX XXX"
            className="mt-1"
            required
          />
          {getFieldError("phone") && (
            <p className="text-sm text-red-500 mt-1">{getFieldError("phone")}</p>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Label htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="business@example.com"
            className="mt-1"
            required
          />
          {getFieldError("email") && (
            <p className="text-sm text-red-500 mt-1">{getFieldError("email")}</p>
          )}
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="website">Website (Optional)</Label>
        <Input
          id="website"
          value={formData.website}
          onChange={(e) => handleInputChange("website", e.target.value)}
          placeholder="https://www.yourbusiness.com"
        />
        {getFieldError("website") && (
          <p className="text-sm text-red-500 mt-1">{getFieldError("website")}</p>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="facebook_url">Facebook URL (Optional)</Label>
        <Input
          id="facebook_url"
          value={formData.facebook_url}
          onChange={(e) => handleInputChange("facebook_url", e.target.value)}
          placeholder="https://www.facebook.com/yourbusiness"
        />
        {getFieldError("facebook_url") && (
          <p className="text-sm text-red-500 mt-1">{getFieldError("facebook_url")}</p>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="instagram_url">Instagram URL (Optional)</Label>
        <Input
          id="instagram_url"
          value={formData.instagram_url}
          onChange={(e) => handleInputChange("instagram_url", e.target.value)}
          placeholder="https://www.instagram.com/yourbusiness"
        />
        {getFieldError("instagram_url") && (
          <p className="text-sm text-red-500 mt-1">{getFieldError("instagram_url")}</p>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="twitter_url">Twitter URL (Optional)</Label>
        <Input
          id="twitter_url"
          value={formData.twitter_url}
          onChange={(e) => handleInputChange("twitter_url", e.target.value)}
          placeholder="https://twitter.com/yourbusiness"
        />
        {getFieldError("twitter_url") && (
          <p className="text-sm text-red-500 mt-1">{getFieldError("twitter_url")}</p>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="youtube_url">YouTube URL (Optional)</Label>
        <Input
          id="youtube_url"
          value={formData.youtube_url}
          onChange={(e) => handleInputChange("youtube_url", e.target.value)}
          placeholder="https://www.youtube.com/channel/yourbusiness"
        />
        {getFieldError("youtube_url") && (
          <p className="text-sm text-red-500 mt-1">{getFieldError("youtube_url")}</p>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="address">
          Street Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="123 Main Street"
          required
        />
        {getFieldError("address") && (
          <p className="text-sm text-red-500 mt-1">{getFieldError("address")}</p>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={itemVariants}>
          <Label htmlFor="city">
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            placeholder="Nairobi"
            required
          />
          {getFieldError("city") && (
            <p className="text-sm text-red-500 mt-1">{getFieldError("city")}</p>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Label htmlFor="county">
            County <span className="text-red-500">*</span>
          </Label>
          <Input
            id="county"
            value={formData.county}
            onChange={(e) => handleInputChange("county", e.target.value)}
            placeholder="Nairobi"
            required
          />
          {getFieldError("county") && (
            <p className="text-sm text-red-500 mt-1">{getFieldError("county")}</p>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Label htmlFor="zipCode">Postal Code</Label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => handleInputChange("zipCode", e.target.value)}
            placeholder="00100"
          />
        </motion.div>
      </div>

      {/* Business Hours */}
      <motion.div variants={itemVariants} className="space-y-4">
        <Label className="text-lg font-semibold">Business Hours</Label>
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
      {/* Services Offered */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Services Offered
        </h3>
        <p className="text-sm text-blue-700 mb-4">
          Select the services you provide to your customers
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableServices.map((service) => (
            <div key={service} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-100 transition-colors">
              <Checkbox
                id={service}
                checked={formData.services.includes(service)}
                onCheckedChange={() => handleArrayToggle("services", service)}
              />
              <Label htmlFor={service} className="text-sm cursor-pointer">{service}</Label>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Products */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-sm">
        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Products You Sell
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
                          newProducts[index] = {
                            ...newProducts[index],
                            photo: ""
                          };
                          setFormData(prev => ({ ...prev, products: newProducts }));
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 text-white hover:bg-red-600 border-red-500"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-3">
                <Label htmlFor={`product-description-${index}`}>Description</Label>
                <Textarea
                  id={`product-description-${index}`}
                  placeholder="Describe your product, its features, materials, etc."
                  value={product.description}
                  onChange={(e) => {
                    const newProducts = [...formData.products];
                    newProducts[index].description = e.target.value;
                    setFormData(prev => ({ ...prev, products: newProducts }));
                  }}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Add Product Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFormData(prev => ({
              ...prev,
              products: [...prev.products, { name: "", price: "", description: "", photo: "" }]
            }));
          }}
          className="w-full border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800"
        >
          <Package className="w-4 h-4 mr-2" />
          Add Another Product
        </Button>
      </motion.div>

      {/* Features & Amenities */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200 shadow-sm">
        <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Features & Amenities
        </h3>
        <p className="text-sm text-purple-700 mb-4">
          Select the features and amenities your business offers (Maximum 5)
        </p>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-purple-600">
            Selected: {formData.features.length}/5
          </span>
          {formData.features.length >= 5 && (
            <span className="text-xs text-red-600 font-medium">
              Maximum features reached
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableFeatures.map((feature) => (
            <div key={feature} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-purple-100 transition-colors">
              <Checkbox
                id={feature}
                checked={formData.features.includes(feature)}
                onCheckedChange={() => handleArrayToggle("features", feature)}
                disabled={!formData.features.includes(feature) && formData.features.length >= 5}
              />
              <Label htmlFor={feature} className="text-sm cursor-pointer">{feature}</Label>
            </div>
          ))}
        </div>
      </motion.div>



      {/* Professional Photography Request */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200 shadow-sm">
        <h3 className="text-lg font-semibold text-pink-900 mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Professional Photography
        </h3>
        <p className="text-sm text-pink-700 mb-4">
          Request professional photos for your business to enhance your listing
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="photoRequest"
              checked={formData.photoRequest}
              onCheckedChange={(checked) => handleInputChange("photoRequest", checked)}
            />
            <Label htmlFor="photoRequest" className="text-sm cursor-pointer">
              Request professional photos for my business
            </Label>
          </div>
          
          {formData.photoRequest && (
            <div className="bg-white p-4 rounded-lg border border-pink-200">
              <Label htmlFor="photoRequestNotes" className="text-sm font-medium text-pink-900 mb-2 block">
                Photo Request Details
              </Label>
              <Textarea
                id="photoRequestNotes"
                value={formData.photoRequestNotes}
                onChange={(e) => handleInputChange("photoRequestNotes", e.target.value)}
                placeholder="Describe your business, preferred photo style, specific areas to capture, or any special requirements..."
                rows={4}
                className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
              />
              <p className="text-xs text-pink-600 mt-2">
                Our professional photographers will contact you to schedule a session and discuss your specific needs.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Creative Summary */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Your Business Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-blue-100 rounded-lg">
            <div className="font-semibold text-blue-900">{formData.services.length}</div>
            <div className="text-blue-700">Services</div>
          </div>
          <div className="text-center p-3 bg-green-100 rounded-lg">
            <div className="font-semibold text-green-900">{formData.products.length}</div>
            <div className="text-green-700">Products</div>
          </div>
          <div className="text-center p-3 bg-purple-100 rounded-lg">
            <div className="font-semibold text-purple-900">{formData.features.length}</div>
            <div className="text-purple-700">Features</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );




  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar />
      <OnboardingCheck userType="business" />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          
          {/* Enhanced Header */}
          <motion.div 
            ref={headerRef}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-fem-navy to-fem-terracotta text-white px-6 py-3 rounded-full shadow-lg mb-4">
              <Sparkles className="w-5 h-5" />
              <h1 className="text-2xl font-bold">
                {isEditMode ? 'Edit Your Business' : 'Register Your Business'}
              </h1>
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {isEditMode 
                ? 'Update your business information to keep your listing current and accurate'
                : 'Join our faith community directory and connect with customers who share your values'
              }
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            
            {/* Enhanced Progress Steps */}
            <motion.div 
              ref={progressRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-8"
            >
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                      const StepIcon = step.icon;
                      return (
                        <div key={step.id} className="flex items-center">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                            currentStep >= step.id 
                              ? 'bg-fem-terracotta border-fem-terracotta text-white' 
                              : 'bg-white border-gray-300 text-gray-500'
                          }`}>
                            {currentStep > step.id ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <StepIcon className="w-5 h-5" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${
                              currentStep >= step.id ? 'text-fem-terracotta' : 'text-gray-500'
                            }`}>
                              {step.title}
                            </p>
                          </div>
                          {index < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-4 ${
                              currentStep > step.id ? 'bg-fem-terracotta' : 'bg-gray-300'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Form */}
            <motion.div 
              ref={formRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const StepIcon = steps[currentStep - 1].icon;
                      return <StepIcon className="w-5 h-5" />;
                    })()}
                    Step {currentStep} of 3: {steps[currentStep - 1].title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Display form errors */}
                  {formErrors.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h3 className="text-sm font-medium text-red-800 mb-2">
                        Please fix the following errors:
                      </h3>
                      <ul className="text-sm text-red-700 space-y-1">
                        {formErrors.map((error, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Debug Authentication Status */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                      Authentication Status (Debug)
                    </h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>User: {user ? `${user.partnership_number} (${user.user_type})` : 'Not logged in'}</p>
                      <p>Access Token: {localStorage.getItem('access_token') ? 'Present' : 'Missing'}</p>
                      <p>Refresh Token: {localStorage.getItem('refresh_token') ? 'Present' : 'Missing'}</p>
                      <p>Is Authenticated: {apiService.isAuthenticated() ? 'Yes' : 'No'}</p>
                      <div className="mt-2 space-x-2">
                        <Button
                          onClick={() => forceReAuth()}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          Force Re-authentication
                        </Button>
                        <Button
                          onClick={() => apiService.logAuthStatus()}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          Log Auth Status
                        </Button>
                        <Button
                          onClick={() => {
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('refresh_token');
                            window.location.href = '/';
                          }}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Force Re-login
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {renderCurrentStep()}
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Delegate Account",
                        description: "Allow team members or employees to manage your business listing. Coming soon!",
                      });
                    }}
                    className="border-fem-gold text-fem-gold hover:bg-fem-gold hover:text-white group relative"
                    title="Delegate Account - Allow team members to manage your business listing"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Delegate Account
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      Allow team members to manage your business
                    </div>
                  </Button>

                  {currentStep === 3 ? (
                    <Button 
                      onClick={handleSubmit}
                      className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="ml-2">{isEditMode ? 'Updating...' : 'Registering...'}</span>
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4 mr-2" />
                          {isEditMode ? 'Update Business' : 'Complete Registration'}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={nextStep} className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white">
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessRegistrationPage; 