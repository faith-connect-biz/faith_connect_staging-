import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Business, Category, FEMChurch } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MultiImageUpload } from '@/components/ui/MultiImageUpload';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import HelpButton from '@/components/onboarding/HelpButton';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { useAutoSave, useAutoSaveStatus } from '@/utils/autoSaveUtils';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Globe, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  X, 
  Plus, 
  Trash2, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Tag,
  Image as ImageIcon,
  Settings,
  Upload,
  Package,
  ArrowLeft,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

// Helper function to validate URLs
const isValidUrl = (string: string): boolean => {
  try {
    // If it's just a domain (e.g., "example.com"), add protocol
    const urlString = string.startsWith('http://') || string.startsWith('https://') ? string : `https://${string}`;
    new URL(urlString);
    return true;
  } catch (_) {
    return false;
  }
};

// Helper type for axios error handling
type AxiosErrorType = {
  response?: {
    data?: {
      message?: string;
      detail?: string;
      errors?: Record<string, string[]>;
    };
    status?: number;
    headers?: Record<string, string>;
  };
  message?: string;
};

const BusinessRegistrationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [femChurches, setFemChurches] = useState<FEMChurch[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    business_name: '',
    category: '' as string, // Changed from number | null to string
    sector: '' as string,
    subcategory: '' as string,
    description: '',
    business_logo: '' as string,
    long_description: '',
    phone: '',
    email: '',
    website: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    youtube_url: '',
    address: '',
    office_address: '',
    country: 'Kenya',
    city: '',
    fem_church_id: null as number | null,
    businessType: 'both' as 'products' | 'services' | 'both',
    hours: {
      monday: { open: '08:00', close: '17:00', closed: false },
      tuesday: { open: '08:00', close: '17:00', closed: false },
      wednesday: { open: '08:00', close: '17:00', closed: false },
      thursday: { open: '08:00', close: '17:00', closed: false },
      friday: { open: '08:00', close: '17:00', closed: false },
      saturday: { open: '', close: '', closed: false },
      sunday: { open: '', close: '', closed: false }
    },
    services: [] as Array<{name: string, description?: string, photos?: string[]}>,
    products: [] as Array<{name: string, price: string, description: string, photos?: string[]}>,
    features: ['']
  });

  // State for new service/product inputs
  const [newService, setNewService] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "" });

  // Auto-save functionality
  const autoSaveFormId = isEditMode ? `business_edit_${businessId}` : 'business_registration';
  const { manualSave, clearSavedData } = useAutoSave(
    autoSaveFormId,
    formData,
    setFormData,
    user?.id,
    {
      delay: 3000, // 3 second delay for complex forms
      showToast: true,
      excludeFields: ['features'] // Exclude dynamic fields that might cause issues
    }
  );
  
  const { statusText } = useAutoSaveStatus(autoSaveFormId, user?.id);

  // Static business categories with emojis
  const businessCategories = [
    'Agriculture & Farming 🌱',
    'Manufacturing & Production 🏭',
    'Retail & Wholesale 🛒',
    'Hospitality & Tourism 🏨',
    'Technology & IT 💻',
    'Finance & Insurance 💰',
    'Healthcare & Wellness 🏥',
    'Real Estate & Construction 🏗️',
    'Transportation & Logistics 🚚',
    'Professional Services 📑',
    'Education & Training 📚',
    'Energy & Utilities ⚡',
    'Creative Industries 🎨',
    'Automotive 🚗',
    'Baking & Food Services 🥐',
    'Beauty & Personal Care 💅',
    'Construction 🏚️',
    'Education 🎓',
    'Entertainment 🎭',
    'Financial Services 💳',
    'Health & Wellness 🧘',
    'Home & Garden 🏡',
    'Legal Services ⚖️',
    'Non-Profit 🤝',
    'Restaurant 🍴',
    'Retail 🛍️',
    'Services 🛠️',
    'Transportation 🚛'
  ];

  // Mapping from string categories to numeric IDs for backend compatibility
  const categoryToIdMapping = {
    'Agriculture & Farming 🌱': 1,
    'Manufacturing & Production 🏭': 2,
    'Retail & Wholesale 🛒': 3,
    'Hospitality & Tourism 🏨': 4,
    'Technology & IT 💻': 5,
    'Finance & Insurance 💰': 6,
    'Healthcare & Wellness 🏥': 7,
    'Real Estate & Construction 🏗️': 8,
    'Transportation & Logistics 🚚': 9,
    'Professional Services 📑': 10,
    'Education & Training 📚': 11,
    'Energy & Utilities ⚡': 12,
    'Creative Industries 🎨': 13,
    'Automotive 🚗': 16, // Automotive Services
    'Baking & Food Services 🥐': 14, // Food & Beverage
    'Beauty & Personal Care 💅': 15,
    'Construction 🏚️': 8, // Real Estate & Construction
    'Education 🎓': 11, // Education & Training
    'Entertainment 🎭': 18, // Entertainment & Media
    'Financial Services 💳': 6, // Finance & Insurance
    'Health & Wellness 🧘': 7, // Healthcare & Wellness
    'Home & Garden 🏡': 17,
    'Legal Services ⚖️': 10, // Professional Services
    'Non-Profit 🤝': 19, // Non-Profit & Community
    'Restaurant 🍴': 14, // Food & Beverage
    'Retail 🛍️': 3, // Retail & Wholesale
    'Services 🛠️': 10, // Professional Services
    'Transportation 🚛': 9 // Transportation & Logistics
  } as Record<string, number>;

  // Sector mapping based on business categories
  const sectorMapping = {
    'Agriculture & Farming 🌱': ['Crops', 'Livestock', 'Agro-Processing', 'Organic Products'],
    'Manufacturing & Production 🏭': ['Clothing & Textiles', 'Food & Beverages', 'Electronics', 'Machinery'],
    'Retail & Wholesale 🛒': ['Supermarkets', 'E-Commerce', 'Wholesale Distributors', 'Boutiques'],
    'Hospitality & Tourism 🏨': ['Hotels', 'Restaurants', 'Travel Agencies', 'Entertainment Venues'],
    'Technology & IT 💻': ['Software Development', 'Cybersecurity', 'Cloud Services', 'AI & Data Science'],
    'Finance & Insurance 💰': ['Banking', 'Fintech', 'Credit Unions', 'Insurance Services'],
    'Healthcare & Wellness 🏥': ['Hospitals', 'Clinics', 'Fitness Centers', 'Pharmacies'],
    'Real Estate & Construction 🏗️': ['Property Development', 'Rentals', 'Housing', 'Engineering Firms'],
    'Transportation & Logistics 🚚': ['Delivery Services', 'Ride-Hailing', 'Freight', 'Warehousing'],
    'Professional Services 📑': ['Legal', 'Consulting', 'Accounting', 'Design Agencies'],
    'Education & Training 📚': ['Schools', 'Online Learning', 'Vocational Training', 'Tutoring'],
    'Energy & Utilities ⚡': ['Oil & Gas', 'Renewable Energy', 'Water Services', 'Electricity Providers'],
    'Creative Industries 🎨': ['Media', 'Film', 'Advertising', 'Design & Arts'],
    'Automotive 🚗': ['Car Dealerships', 'Auto Repair', 'Spare Parts', 'Car Wash'],
    'Baking & Food Services 🥐': ['Bakeries', 'Catering', 'Street Food', 'Specialty Foods'],
    'Beauty & Personal Care 💅': ['Salons', 'Barbershops', 'Cosmetics', 'Spas'],
    'Construction 🏚️': ['Contractors', 'Builders', 'Renovation Services', 'Hardware Supply'],
    'Education 🎓': ['Schools', 'Colleges', 'E-Learning', 'Tutoring'],
    'Entertainment 🎭': ['Music', 'Film', 'Events', 'Gaming'],
    'Financial Services 💳': ['Microfinance', 'Lending', 'Investment', 'Accounting'],
    'Health & Wellness 🧘': ['Gyms', 'Nutrition', 'Counseling', 'Alternative Medicine'],
    'Home & Garden 🏡': ['Interior Design', 'Furniture', 'Landscaping', 'Cleaning Services'],
    'Legal Services ⚖️': ['Law Firms', 'Notaries', 'Legal Consulting'],
    'Non-Profit 🤝': ['NGOs', 'Charity Organizations', 'Faith-Based Groups', 'Community Services'],
    'Restaurant 🍴': ['Cafes', 'Fast Food', 'Fine Dining', 'Catering'],
    'Retail 🛍️': ['Fashion', 'Electronics', 'Household Items', 'Bookstores'],
    'Services 🛠️': ['Maintenance', 'Printing', 'Marketing', 'Freelance Services'],
    'Transportation 🚛': ['Logistics', 'Public Transport', 'Courier', 'Ride-Hailing']
  } as Record<string, string[]>;

  // Get sectors for selected category
  const getAvailableSectors = useMemo(() => {
    if (!formData.category) return [];
    return sectorMapping[formData.category] || [];
  }, [formData.category]);



  // Debug logging for step progression - throttled
  const stepChangeCountRef = useRef(0);
  useEffect(() => {
    stepChangeCountRef.current += 1;
    if (stepChangeCountRef.current % 5 === 0 || stepChangeCountRef.current === 1) {
      console.log('Step changed - currentStep:', currentStep, 'businessType:', formData.businessType);
    }
  }, [currentStep, formData.businessType]);

  // Remove the debug logging that causes infinite re-rendering
  // useEffect(() => {
  //   console.log('Form component rendered/updated - currentStep:', currentStep);
  // });

  // Check if user is authenticated and is a business user
  useEffect(() => {
    console.log('BusinessRegistrationPage: useEffect triggered', {
      user: user,
      locationState: location.state,
      editMode: location.state?.editMode,
      businessId: location.state?.businessId
    });

    // Check if user is authenticated
    if (!user) {
      console.log('BusinessRegistrationPage: No user, redirecting to home');
      toast({
        title: "Authentication required",
        description: "Please log in to register your business",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    if (user.user_type !== 'business') {
      console.log('BusinessRegistrationPage: User is not business type, redirecting to home');
      toast({
        title: "Business account required",
        description: "Only business users can register businesses",
        variant: "destructive"
      });
        navigate('/');
        return;
    }

    // Check if we're in edit mode first
    if (location.state?.editMode && location.state?.businessId) {
      console.log('BusinessRegistrationPage: Edit mode detected, setting up edit state');
      setIsEditMode(true);
      setBusinessId(location.state.businessId);
      // Load existing business data to populate the form
      loadExistingBusinessData(location.state.businessId);
      return; // Skip the existing business check when in edit mode
    }

    console.log('BusinessRegistrationPage: Not in edit mode, checking for existing business');
    // Only check for existing business if NOT in edit mode
    const checkExistingBusiness = async () => {
      try {
        const existingBusiness = await apiService.getUserBusiness();
        console.log('BusinessRegistrationPage: Existing business check result:', existingBusiness);
        if (existingBusiness) {
          console.log('BusinessRegistrationPage: Business already exists, redirecting to manage-business');
          toast({
            title: "Business already registered",
            description: "You already have a registered business. Business owners can only have one business.",
            variant: "destructive"
          });
          navigate('/manage-business');
          return;
        }
      } catch (error) {
        console.error('Error checking existing business:', error);
      }
    };

    checkExistingBusiness();
  }, [user, navigate, location.state]);

  // Load existing business data for editing
  const loadExistingBusinessData = async (id: string) => {
    console.log('BusinessRegistrationPage: loadExistingBusinessData called with ID:', id);
    try {
      // Fetch real business data from the API
      const business = await apiService.getBusiness(id);
      console.log('BusinessRegistrationPage: Business data fetched from API:', business);
      
      if (business) {
        // Find the category string from the ID
        const categoryString = Object.keys(categoryToIdMapping).find(
          key => categoryToIdMapping[key] === business.category?.id
        ) || '';
        
        // Transform API data to match our form structure
        const transformedData = {
          business_name: business.business_name,
          category: categoryString, // Convert numeric ID back to string
          sector: business.sector || '',
          subcategory: business.subcategory || '',
          description: business.description || '',
          long_description: business.long_description || '',
          businessType: 'both' as "products" | "services" | "both", // Will be determined below
          phone: business.phone || '',
          email: business.email || '',
          website: business.website || '',
          facebook_url: business.facebook_url || '',
          instagram_url: business.instagram_url || '',
          twitter_url: business.twitter_url || '',
          youtube_url: business.youtube_url || '',
          address: business.address || '',
          office_address: business.office_address || '',
          country: business.country || 'Kenya',
          city: business.city || '',
          fem_church_id: business.fem_church?.id || null,
          hours: business.hours && business.hours.length > 0 ? 
            // Transform API hours back to form format
            business.hours.reduce((acc, hour) => {
              const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              const dayName = dayNames[hour.day_of_week];
              if (dayName) {
                acc[dayName] = {
                  open: hour.open_time || '',
                  close: hour.close_time || '',
                  closed: hour.is_closed
                };
              }
              return acc;
            }, {
              monday: { open: '', close: '', closed: false },
              tuesday: { open: '', close: '', closed: false },
              wednesday: { open: '', close: '', closed: false },
              thursday: { open: '', close: '', closed: false },
              friday: { open: '', close: '', closed: false },
              saturday: { open: '', close: '', closed: false },
              sunday: { open: '', close: '', closed: false }
            }) : {
              monday: { open: '', close: '', closed: false },
              tuesday: { open: '', close: '', closed: false },
              wednesday: { open: '', close: '', closed: false },
              thursday: { open: '', close: '', closed: false },
              friday: { open: '', close: '', closed: false },
              saturday: { open: '', close: '', closed: false },
              sunday: { open: '', close: '', closed: false }
            },
          services: [], // Will be populated below
          products: [], // Will be populated below
          features: [''] // Initialize with empty string to match form structure
        };

        console.log('BusinessRegistrationPage: Transformed data for form:', transformedData);
        
        // Fetch services and products for the business
        try {
          const [servicesData, productsData] = await Promise.all([
            apiService.getBusinessServices(business.id),
            apiService.getBusinessProducts(business.id)
          ]);
          
          console.log('BusinessRegistrationPage: Fetched services:', servicesData);
          console.log('BusinessRegistrationPage: Fetched products:', productsData);
          
          // Transform services to match form structure
          const transformedServices = servicesData.map(service => ({
            name: service.name,
            description: service.description || '',
            photos: service.images || []
          }));
          
          // Transform products to match form structure
          const transformedProducts = productsData.map(product => ({
            name: product.name,
            description: product.description || '',
            price: product.price ? product.price.toString() : '0.00',
            photos: product.images || []
          }));
          
          // Determine business type based on existing services and products
          let businessType: "products" | "services" | "both" = 'both';
          if (transformedServices.length > 0 && transformedProducts.length === 0) {
            businessType = 'services';
          } else if (transformedServices.length === 0 && transformedProducts.length > 0) {
            businessType = 'products';
          } else if (transformedServices.length > 0 && transformedProducts.length > 0) {
            businessType = 'both';
          }
          
          // Update the form data with services and products
          const finalData = {
            ...transformedData,
            businessType,
            services: transformedServices,
            products: transformedProducts
          };
          
          console.log('BusinessRegistrationPage: Final data with services and products:', finalData);
          setFormData(finalData);
          
          toast({
            title: "Edit Mode",
            description: "Business data loaded. You can now edit your business information.",
          });
        } catch (error) {
          console.error('BusinessRegistrationPage: Error fetching services/products:', error);
          // Still set the form data even if services/products fail to load
          setFormData(transformedData);
          toast({
            title: "Edit Mode",
            description: "Business data loaded, but services/products could not be loaded. You can still edit other information.",
          });
        }
      } else {
        throw new Error('Business not found');
      }
    } catch (error) {
      console.error('BusinessRegistrationPage: Error loading business data:', error);
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
    { id: 1, name: 'Agriculture & Farming 🌱', slug: 'agriculture-farming' },
    { id: 2, name: 'Manufacturing & Production 🏭', slug: 'manufacturing-production' },
    { id: 3, name: 'Retail & Wholesale 🛒', slug: 'retail-wholesale' },
    { id: 4, name: 'Hospitality & Tourism 🏨', slug: 'hospitality-tourism' },
    { id: 5, name: 'Technology & IT 💻', slug: 'technology-it' },
    { id: 6, name: 'Finance & Insurance 💰', slug: 'finance-insurance' },
    { id: 7, name: 'Healthcare & Wellness 🏥', slug: 'healthcare-wellness' },
    { id: 8, name: 'Real Estate & Construction 🏗️', slug: 'real-estate-construction' },
    { id: 9, name: 'Transportation & Logistics 🚚', slug: 'transportation-logistics' },
    { id: 10, name: 'Professional Services 📑', slug: 'professional-services' },
    { id: 11, name: 'Education & Training 📚', slug: 'education-training' },
    { id: 12, name: 'Energy & Utilities ⚡', slug: 'energy-utilities' },
    { id: 13, name: 'Creative Industries 🎨', slug: 'creative-industries' },
    { id: 14, name: 'Food & Beverage 🍽️', slug: 'food-beverage' },
    { id: 15, name: 'Beauty & Personal Care 💄', slug: 'beauty-personal-care' },
    { id: 16, name: 'Automotive Services 🚗', slug: 'automotive-services' },
    { id: 17, name: 'Home & Garden 🏡', slug: 'home-garden' },
    { id: 18, name: 'Entertainment & Media 🎭', slug: 'entertainment-media' },
    { id: 19, name: 'Non-Profit & Community 🤝', slug: 'non-profit-community' },
    { id: 20, name: 'Pet Services & Veterinary 🐾', slug: 'pet-services-veterinary' },
    { id: 21, name: 'Sports & Recreation 🏃', slug: 'sports-recreation' },
    { id: 22, name: 'Mining & Natural Resources ⛏️', slug: 'mining-natural-resources' },
    { id: 23, name: 'Textiles & Fashion 👗', slug: 'textiles-fashion' },
    { id: 24, name: 'Government & Public Services 🏛️', slug: 'government-public-services' },
    { id: 25, name: 'Import & Export Trade 🚢', slug: 'import-export-trade' }
  ];

  // Get subcategories for selected category
  const getSubcategories = useMemo(() => {
    if (!formData.category) return [];
    // Convert the category string back to numeric ID for comparison
    const categoryId = categoryToIdMapping[formData.category];
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    return selectedCategory?.subcategories || [];
  }, [formData.category, categories]);

  // Fetch categories and FEM churches from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await apiService.getCategories();
        setCategories(categoriesResponse.results);
        
        // Fetch FEM churches
        const churchesResponse = await apiService.getFEMChurches();
        setFemChurches(churchesResponse.results);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to hardcoded categories if API fails
        setCategories(hardcodedCategories);
        setFemChurches([]); // Empty array if churches fetch fails
      }
    };
    
    fetchData();
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
    { id: 2, title: "Contact Details", icon: Phone }
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
          error.toLowerCase().includes('description') ||
          error.toLowerCase().includes('listing')
        );
      case 2:
        return formErrors.filter(error => 
          error.toLowerCase().includes('phone') ||
          error.toLowerCase().includes('email') ||
          error.toLowerCase().includes('address')
        );
      default:
        return [];
    }
  };

  // Clear field error when user starts typing
  const handleInputChange = useCallback((field: string, value: string | number | boolean | null) => {
    // Handle subcategory "none" value
    if (field === 'subcategory' && value === 'none') {
      value = '';
    }
    
    // Handle sector "none" value
    if (field === 'sector' && value === 'none') {
      value = '';
    }
    
    // Handle fem_church_id "none" value
    if (field === 'fem_church_id' && value === 'none') {
      value = null;
    }
    
    // Clear sector when category changes (since sectors are category-dependent)
    if (field === 'category') {
      setFormData(prev => ({ ...prev, category: value as string, sector: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear only the error for this specific field, not all errors
    if (formErrors.length > 0) {
      const fieldError = formErrors.find(error => 
        error.toLowerCase().includes(field.toLowerCase()) ||
        error.toLowerCase().includes('business name') && field === 'business_name' ||
        error.toLowerCase().includes('category') && field === 'category' ||
        error.toLowerCase().includes('sector') && field === 'sector' ||
        error.toLowerCase().includes('description') && field === 'description' ||
        error.toLowerCase().includes('listing') && field === 'businessType' ||
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
    setFormData(prev => {
      const newHours = {
        ...prev.hours,
        [day]: {
          ...prev.hours[day as keyof typeof prev.hours],
          [field]: value
        }
      };
      
      console.log(`Hours updated for ${day}.${field}:`, value);
      console.log('New hours state:', newHours);
      
      return {
        ...prev,
        hours: newHours
      };
    });
  }, []);

  // Service and Product handlers
  const handleServiceChange = useCallback((index: number, field: 'name' | 'description', value: string) => {
    setFormData(prev => {
      const newServices = [...prev.services];
      newServices[index] = { ...newServices[index], [field]: value };
      return { ...prev, services: newServices };
    });
  }, []);

  const handleServiceImageChange = useCallback((index: number, imageUrl: string) => {
    setFormData(prev => {
      const newServices = [...prev.services];
      const currentPhotos = newServices[index].photos || [];
      newServices[index] = { ...newServices[index], photos: [...currentPhotos, imageUrl] };
      return { ...prev, services: newServices };
    });
  }, []);

  const handleServiceImageRemove = useCallback((index: number, imageIndex: number) => {
    setFormData(prev => {
      const newServices = [...prev.services];
      const currentPhotos = newServices[index].photos || [];
      const updatedPhotos = currentPhotos.filter((_, i) => i !== imageIndex);
      newServices[index] = { ...newServices[index], photos: updatedPhotos };
      return { ...prev, services: newServices };
    });
  }, []);

  const addService = useCallback(() => {
    setFormData(prev => {
      const total = prev.services.length + prev.products.length;
      if (total >= 10) {
        toast({
          title: "Item limit reached",
          description: "You can add up to 10 services/products in total.",
          variant: "destructive"
        });
        return prev;
      }
      return {
        ...prev,
        services: [...prev.services, { name: '', description: '', photos: [] }]
      };
    });
  }, []);

  const removeService = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  }, []);

  const handleProductChange = useCallback((index: number, field: 'name' | 'price' | 'description', value: string) => {
    setFormData(prev => {
      const newProducts = [...prev.products];
      newProducts[index] = { ...newProducts[index], [field]: value };
      return { ...prev, products: newProducts };
    });
  }, []);

  const handleProductImageChange = useCallback((index: number, imageUrl: string) => {
    setFormData(prev => {
      const newProducts = [...prev.products];
      const currentPhotos = newProducts[index].photos || [];
      newProducts[index] = { ...newProducts[index], photos: [...currentPhotos, imageUrl] };
      return { ...prev, products: newProducts };
    });
  }, []);

  const handleProductImageRemove = useCallback((index: number, imageIndex: number) => {
    setFormData(prev => {
      const newProducts = [...prev.products];
      const currentPhotos = newProducts[index].photos || [];
      const updatedPhotos = currentPhotos.filter((_, i) => i !== imageIndex);
      newProducts[index] = { ...newProducts[index], photos: updatedPhotos };
      return { ...prev, products: newProducts };
    });
  }, []);

  const addProduct = useCallback(() => {
    setFormData(prev => {
      const total = prev.services.length + prev.products.length;
      if (total >= 10) {
        toast({
          title: "Item limit reached",
          description: "You can add up to 10 services/products in total.",
          variant: "destructive"
        });
        return prev;
      }
      return {
        ...prev,
        products: [...prev.products, { name: '', price: '', description: '' }]
      };
    });
  }, []);

  const removeProduct = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
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
        if (!formData.category || formData.category === '') {
          errors.push("Business category is required");
        }
        if (!formData.description.trim()) {
          errors.push("Business description is required");
        } else if (formData.description.trim().length < 3) {
          errors.push("Business description must be at least 3 characters long");
        } else if (formData.description.trim().length > 120) {
          errors.push("Business description must be no more than 120 characters long");
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
        
      
    }
    
    return errors.length === 0;
  }, [formData.business_name, formData.category, formData.description, formData.phone, formData.email, formData.address]);

  // Simplified 2-step process
  const totalSteps = 2;
  
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setIsTransitioning(true);
      // Validate current step before moving to next
      const currentStepValid = validateStep(currentStep);
      if (currentStepValid) {
        setCurrentStep(currentStep + 1);
        // Clear errors when moving to next step
        setFormErrors([]);
      } else {
        // Show validation errors for current step
        const stepErrors = [];
        
        switch (currentStep) {
          case 1:
            if (!formData.business_name.trim()) {
              stepErrors.push("Business name is required");
            }
            if (!formData.category || formData.category === '') {
              stepErrors.push("Business category is required");
            }
            if (!formData.description.trim()) {
              stepErrors.push("Business description is required");
            } else if (formData.description.trim().length < 3) {
              stepErrors.push("Business description must be at least 3 characters long");
            } else if (formData.description.trim().length > 120) {
              stepErrors.push("Business description must be no more than 120 characters long");
            }
            break;
          case 2:
            if (!formData.phone.trim()) {
              stepErrors.push("Phone number is required");
            }
            if (!formData.email.trim()) {
              stepErrors.push("Email address is required");
            }
            if (!formData.address.trim()) {
              stepErrors.push("Business address is required");
            }
            break;
        }
        
        if (stepErrors.length > 0) {
          setFormErrors(stepErrors);
          toast({
            title: "Step Incomplete",
            description: "Please complete all required fields before proceeding",
            variant: "destructive"
          });
        }
      }
      // Reset transitioning state after a short delay
      setTimeout(() => setIsTransitioning(false), 100);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setIsTransitioning(true);
      setCurrentStep(currentStep - 1);
      // Clear errors when going back to previous step
      setFormErrors([]);
      // Reset transitioning state after a short delay
      setTimeout(() => setIsTransitioning(false), 100);
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

    if (!formData.category || formData.category === '') {
      errors.push("Business category is required");
    }

    if (!formData.businessType) {
      errors.push("Please select what you will be listing (products, services, or both)");
    }

    if (!formData.description.trim()) {
      errors.push("Business description is required");
    } else if (formData.description.trim().length < 3) {
      errors.push("Business description must be at least 3 characters long");
    } else if (formData.description.trim().length > 120) {
      errors.push("Business description must be no more than 120 characters long");
    }

    if (!formData.phone.trim()) {
      errors.push("Phone number is required");
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone.trim())) {
      errors.push("Please enter a valid phone number");
    }

    if (!formData.email.trim()) {
      errors.push("Email address is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.push("Please enter a valid email address");
    }

    // Website validation (if provided) - no validation required
    // Website field accepts any non-empty string

    // Social media fields - no validation requiredv

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

  // Upload images to S3 and get URLs
  const uploadImagesToS3 = async (items: Array<{name: string, photos?: string[], price?: string, description?: string}>, type: 'service' | 'product') => {
    const uploadedItems = [];
    let totalImages = 0;
    let uploadedCount = 0;
    
    // Count total base64 images to upload
    items.forEach(item => {
      if (item.photos) {
        totalImages += item.photos.filter(photo => photo.startsWith('data:image')).length;
      }
    });
    
    if (totalImages > 0) {
      setUploadingImages(true);
      setUploadProgress(0);
    }
    
    for (const item of items) {
      const uploadedPhotos: string[] = [];
      
      if (item.photos && item.photos.length > 0) {
        for (const photo of item.photos) {
          if (photo.startsWith('data:image')) {
            try {
              // Convert base64 to blob
              const response = await fetch(photo);
              const blob = await response.blob();
              
              // Create file object
              const file = new File([blob], `${type}_${item.name}_${Date.now()}.jpg`, { type: 'image/jpeg' });
              
              // Get pre-signed URL for upload
              const uploadData = await apiService.getProfilePhotoUploadUrl(file.name, file.type);
              
              // Upload file to S3
              const uploadSuccess = await apiService.uploadFileToS3(uploadData.presigned_url, file);
              
              if (uploadSuccess) {
                // Generate S3 URL
                const s3Url = `https://${import.meta.env.VITE_AWS_STORAGE_BUCKET_NAME || 'faithconnectapp'}.s3.${import.meta.env.VITE_AWS_S3_REGION_NAME || 'af-south-1'}.amazonaws.com/${uploadData.file_key}`;
                uploadedPhotos.push(s3Url);
              }
              
              uploadedCount++;
              setUploadProgress((uploadedCount / totalImages) * 100);
            } catch (error) {
              console.error(`Failed to upload ${type} image for ${item.name}:`, error);
              uploadedCount++;
              setUploadProgress((uploadedCount / totalImages) * 100);
            }
          } else {
            // Already a URL, keep as is
            uploadedPhotos.push(photo);
          }
        }
      }
      
      // Add item with uploaded photos
      uploadedItems.push({
        ...item,
        photos: uploadedPhotos
      });
    }
    
    if (totalImages > 0) {
      setUploadingImages(false);
      setUploadProgress(0);
    }
    
    return uploadedItems;
  };

  // Prepare business data for API submission
  const prepareBusinessData = async () => {
         // Convert hours to the format expected by the API
     const hours = Object.entries(formData.hours)
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
         
         // Handle empty strings - convert them to null for the API
         const openTime = hours.closed ? null : (hours.open && hours.open.trim() ? hours.open : null);
         const closeTime = hours.closed ? null : (hours.close && hours.close.trim() ? hours.close : null);
         
         return {
           day_of_week: dayMap[day.toLowerCase()],
           open_time: openTime,
           close_time: closeTime,
           is_closed: hours.closed
         };
       });
      // Don't filter out any hours - send all of them to the API
      // The backend should handle empty/open/close times appropriately

    console.log('Form hours data:', formData.hours);
    console.log('Converted hours for API:', hours);

    // Upload service images to S3 first
    const servicesWithS3Urls = await uploadImagesToS3(formData.services, 'service');
    
    // Upload product images to S3 first
    const productsWithS3Urls = await uploadImagesToS3(formData.products, 'product');

    // Convert services to the format expected by the API
    const services = servicesWithS3Urls
      .filter(service => service.name.trim() !== '')
      .map(service => ({
        name: service.name,
        description: service.description || `${service.name} service`,
        price_range: 'Varies',
        duration: 'Varies',
        is_available: true,
        photos: service.photos || []  // Use photos array with S3 URLs
      }));

    // Convert products to the format expected by the API
    const products = productsWithS3Urls
      .filter(product => product.name.trim() !== '')
      .map(product => ({
        name: product.name,
        description: product.description || `${product.name} product`,
        price: product.price || '0.00',
        is_available: true,
        photos: product.photos || []  // Use photos array with S3 URLs
      }));

    // Upload logo if provided as base64 and get a URL
    let businessLogoUrl: string | null = null;
    try {
      if (formData.business_logo && formData.business_logo.startsWith('data:image')) {
        setUploadingImages(true);
        const response = await fetch(formData.business_logo);
        const blob = await response.blob();
        const file = new File([blob], `business_logo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const uploadData = await apiService.getProfilePhotoUploadUrl(file.name, file.type);
        const success = await apiService.uploadFileToS3(uploadData.presigned_url, file);
        if (success) {
          businessLogoUrl = `https://${import.meta.env.VITE_AWS_STORAGE_BUCKET_NAME || 'faithconnectapp'}.s3.${import.meta.env.VITE_AWS_S3_REGION_NAME || 'af-south-1'}.amazonaws.com/${uploadData.file_key}`;
        }
      } else if (formData.business_logo) {
        businessLogoUrl = formData.business_logo; // already a URL
      }
    } catch (err) {
      console.error('Logo upload failed:', err);
    } finally {
      setUploadingImages(false);
    }

    // Clean and prepare the data
    const businessData = {
      business_name: formData.business_name.trim(),
      category_id: categoryToIdMapping[formData.category] || null, // Convert string category to numeric ID
      sector: formData.sector?.trim() || null,
      subcategory: formData.subcategory?.trim() || null,
      description: formData.description.trim(),
      long_description: formData.long_description.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      website: formData.website?.trim() || null,
      facebook_url: formData.facebook_url?.trim() || null,
      instagram_url: formData.instagram_url?.trim() || null,
      twitter_url: formData.twitter_url?.trim() || null,
      youtube_url: formData.youtube_url?.trim() || null,
      address: formData.address.trim(),
      office_address: formData.office_address?.trim() || null,
      country: formData.country.trim(),
      city: formData.city.trim(),
      fem_church_id: formData.fem_church_id,
      hours: hours,
      services_data: services,
      products_data: products,
      features: formData.features.filter(feature => feature.trim() !== ''),
      business_logo_url: businessLogoUrl || undefined,
    };

    // Debug logging to see what's being sent
    console.log('Prepared business data:', businessData);
    console.log('Website field value:', businessData.website);
    console.log('Website field type:', typeof businessData.website);
    console.log('Hours data being sent:', hours);
    
    // Validate hours data structure
    if (hours && hours.length > 0) {
      console.log('Hours validation:');
      hours.forEach((hour, index) => {
        console.log(`Hour ${index}:`, {
          day: hour.day_of_week,
          open: hour.open_time,
          close: hour.close_time,
          closed: hour.is_closed
        });
      });
    } else {
      console.log('No hours data to send');
    }

    return businessData;
  };

  // Enhanced form submission with step validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called - currentStep:', currentStep, 'businessType:', formData.businessType, 'isTransitioning:', isTransitioning);
    
    // Prevent submission if we're transitioning between steps
    if (isTransitioning) {
      console.log('Currently transitioning between steps, preventing submission');
      return;
    }
    
    // Only allow submission on the final step
    if (currentStep !== 2) {
      console.log('Not on final step, preventing submission and moving to next step');
      // If not on final step, just move to next step instead of submitting
      toast({
        title: "Complete All Steps",
        description: `Please complete step ${currentStep} of 2 before registering your business.`,
        variant: "default"
      });
      handleNextStep();
      return;
    }
    
    // Double-check: ensure we're on the final step
    if (currentStep < 2) {
      console.log('Still not on final step, preventing submission');
      return;
    }
    
    console.log('On final step, proceeding with business registration');
    
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
      // Check if there are images to upload
      const hasImages = formData.services.some(s => s.photos && s.photos.length > 0) || formData.products.some(p => p.photos && p.photos.length > 0);
      
      if (hasImages) {
        toast({
          title: "Preparing Images",
          description: "Uploading your product and service images to S3...",
          variant: "default"
        });
      }
      
      const businessData = await prepareBusinessData();
      
      // Debug: Log the final data being sent to the API
      console.log('Final business data being sent to API:', businessData);
      console.log('Hours data in final payload:', businessData.hours);
      
             let businessIdToUse = businessId;
       
       if (isEditMode && businessId) {
         // Update existing business
         const updatedBusiness = await apiService.updateBusiness(businessId, businessData);
         businessIdToUse = businessId;
       } else {
         // Create new business
         const business = await apiService.createBusiness(businessData);
         businessIdToUse = business.id;
         
         toast({
           title: isEditMode ? "Business updated successfully!" : "Business registered successfully!",
           description: isEditMode 
             ? "Your business information has been updated successfully."
             : "Your business has been added to the directory. Welcome to the Faith Connect community!",
         });
       }
       
               // Update business hours separately (this is the key fix!)
        if (businessData.hours && businessData.hours.length > 0) {
          try {
            console.log('Updating business hours separately:', businessData.hours);
            console.log('Hours data structure:', JSON.stringify(businessData.hours, null, 2));
            
            const result = await apiService.updateBusinessHours(businessIdToUse, businessData.hours);
            console.log('Business hours updated successfully:', result);
          } catch (error: unknown) {
            console.error('Error updating business hours:', error);
            
            // Type guard for axios error
            const axiosError = error as AxiosErrorType;
            console.error('Error response data:', axiosError.response?.data);
            console.error('Error response status:', axiosError.response?.status);
            console.error('Error response headers:', axiosError.response?.headers);
            
            // Show more specific error message
            let errorMessage = "Business hours could not be saved";
            if (axiosError.response?.data?.message) {
              errorMessage = axiosError.response.data.message;
            } else if (axiosError.response?.data?.detail) {
              errorMessage = axiosError.response.data.detail;
            }
            
            toast({
              title: "Warning",
              description: `Business created/updated but hours could not be saved: ${errorMessage}. You can update hours later.`,
              variant: "destructive"
            });
          }
        }
       
              // Navigate to the business management page
       navigate("/manage-business", { 
         state: { 
           businessId: businessIdToUse,
           newlyCreated: !isEditMode 
         } 
       });
       
       // Clear auto-save data after successful submission
       clearSavedData();
         } catch (error: unknown) {
       console.error('Business registration failed:', error);
       
       // Type guard for axios error  
       const axiosError = error as AxiosErrorType;
       console.error('Error response data:', axiosError.response?.data);
       console.error('Error response status:', axiosError.response?.status);
       
       let errorMessage = "Failed to register business. Please try again.";
       
       if (axiosError.response?.data?.errors) {
         const errors = axiosError.response.data.errors;
         const errorMessages = Object.values(errors).flat();
         errorMessage = errorMessages.join(', ');
         setFormErrors(errorMessages);
       } else if (axiosError.response?.data?.message) {
         errorMessage = axiosError.response.data.message;
       } else if (axiosError.message) {
         errorMessage = axiosError.message;
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
      {/* Removed in-step error block to avoid duplication */}

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
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="category">
          Business Category <span className="text-red-500">*</span>
        </Label>
        <Select 
          value={formData.category || ""} 
          onValueChange={(value) => {
            handleInputChange("category", value);
            // Reset sector when category changes
            if (value !== formData.category) {
              handleInputChange("sector", "");
            }
          }}
        >
          <SelectTrigger 
            className={`mt-1 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-fem-terracotta transition-all duration-200 shadow-sm hover:shadow-md ${
              getFieldError("category") ? 'border-red-500 focus:border-red-500' : ''
            }`}
          >
            <SelectValue placeholder="Select a business category" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 border-gray-100 shadow-lg">
            {businessCategories.map((category) => (
              <SelectItem 
                key={category} 
                value={category}
                className="hover:bg-fem-terracotta/10 focus:bg-fem-terracotta/10 rounded-lg mx-1 my-0.5 transition-colors duration-150"
              >
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {getFieldError("category") && (
          <p className="text-sm text-red-500 mt-1">{getFieldError("category")}</p>
        )}
      </motion.div>

      {/* Sector Selection */}
      {formData.category && getAvailableSectors.length > 0 && (
        <motion.div 
          variants={itemVariants}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Label htmlFor="sector">
            Sector <span className="text-gray-400">(Optional)</span>
          </Label>
          <Select 
            value={formData.sector || ""} 
            onValueChange={(value) => handleInputChange("sector", value)}
          >
            <SelectTrigger 
              className="mt-1 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-fem-terracotta transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <SelectValue placeholder="Select a sector (optional)" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-gray-100 shadow-lg">
              <SelectItem 
                value="none"
                className="hover:bg-gray-100 focus:bg-gray-100 rounded-lg mx-1 my-0.5 transition-colors duration-150"
              >
                None selected
              </SelectItem>
              {getAvailableSectors.map((sector: string) => (
                <SelectItem 
                  key={sector} 
                  value={sector}
                  className="hover:bg-fem-terracotta/10 focus:bg-fem-terracotta/10 rounded-lg mx-1 my-0.5 transition-colors duration-150"
                >
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <span className="w-1 h-1 bg-fem-terracotta rounded-full"></span>
            Choose a specific sector within your business category
          </p>
        </motion.div>
      )}

      {/* Subcategory Selection */}
      {formData.category && getSubcategories.length > 0 && (
        <motion.div variants={itemVariants}>
          <Label htmlFor="subcategory">
            Subcategory (Optional)
          </Label>
          <Select value={formData.subcategory || ""} onValueChange={(value) => handleInputChange("subcategory", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a subcategory (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None selected</SelectItem>
              {getSubcategories.map((subcategory: string) => (
                <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Choose a more specific category for your business
          </p>
        </motion.div>
      )}



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
          maxLength={120}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            {formData.description.length}/120 characters
          </p>
          {formData.description.length > 120 && (
            <p className="text-xs text-red-500">
              Maximum 120 characters allowed
            </p>
          )}
        </div>
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

      {/* Business Logo/Image Upload */}
      <motion.div variants={itemVariants}>
        <ImageUpload
          value={formData.business_logo}
          onChange={(img) => handleInputChange('business_logo', img)}
          onRemove={() => handleInputChange('business_logo', '')}
          label="Business Logo or Image"
          placeholder="Click to upload or drag & drop"
        />
        <p className="text-xs text-gray-500 mt-1">PNG/JPG up to 5MB. Square works best.</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label className="text-base font-medium">
          What will you be listing? <span className="text-red-500">*</span>
        </Label>
        <div className="mt-3 space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="businessType-products"
              name="businessType"
              value="products"
              checked={formData.businessType === 'products'}
              onChange={(e) => handleInputChange("businessType", e.target.value)}
              className="w-4 h-4 text-fem-terracotta bg-gray-100 border-gray-300 focus:ring-fem-terracotta focus:ring-2"
              aria-label="Products only"
            />
            <Label htmlFor="businessType-products" className="text-sm font-normal cursor-pointer">
              Products only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="businessType-services"
              name="businessType"
              value="services"
              checked={formData.businessType === 'services'}
              onChange={(e) => handleInputChange("businessType", e.target.value)}
              className="w-4 h-4 text-fem-terracotta bg-gray-100 border-gray-300 focus:ring-fem-terracotta focus:ring-2"
              aria-label="Services only"
            />
            <Label htmlFor="businessType-services" className="text-sm font-normal cursor-pointer">
              Services only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="businessType-both"
              name="businessType"
              value="both"
              checked={formData.businessType === 'both'}
              onChange={(e) => handleInputChange("businessType", e.target.value)}
              className="w-4 h-4 text-fem-terracotta bg-gray-100 border-gray-300 focus:ring-fem-terracotta focus:ring-2"
              aria-label="Both products and services"
            />
            <Label htmlFor="businessType-both" className="text-sm font-normal cursor-pointer">
              Both products and services
            </Label>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          This will determine what sections are available in the next step
        </p>
      </motion.div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Removed in-step error block to avoid duplication */}

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
            />
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
            />
          </div>
        </div>
        <div>
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            placeholder="www.yourbusiness.com or yourbusiness.com"
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
            <Input id="facebook_url" value={formData.facebook_url} onChange={(e) => handleInputChange("facebook_url", e.target.value)} placeholder="facebook.com/yourbusiness or @username" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="instagram_url">Instagram (Optional)</Label>
            <Input id="instagram_url" value={formData.instagram_url} onChange={(e) => handleInputChange("instagram_url", e.target.value)} placeholder="instagram.com/yourbusiness or @username" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="twitter_url">Twitter (Optional)</Label>
            <Input id="twitter_url" value={formData.twitter_url} onChange={(e) => handleInputChange("twitter_url", e.target.value)} placeholder="twitter.com/yourbusiness or @username" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="youtube_url">YouTube (Optional)</Label>
            <Input id="youtube_url" value={formData.youtube_url} onChange={(e) => handleInputChange("youtube_url", e.target.value)} placeholder="youtube.com/yourbusiness or @username" className="mt-1" />
          </div>
        </div>
      </motion.div>

      {/* Address Information with Online/Physical toggle */}
      <motion.div variants={itemVariants} className="space-y-4">
        <Label className="text-lg font-semibold">Business Address</Label>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="addr-online"
              name="addressType"
              checked={!formData.office_address}
              onChange={() => {
                // online business: clear physical-only fields
                handleInputChange('office_address', '');
                handleInputChange('country', formData.country || 'Kenya');
              }}
            />
            <Label htmlFor="addr-online" className="cursor-pointer">Online Business</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="addr-physical"
              name="addressType"
              checked={!!formData.office_address || (!!formData.country && !!formData.city)}
              onChange={() => {
                if (!formData.country) handleInputChange('country', 'Kenya');
              }}
            />
            <Label htmlFor="addr-physical" className="cursor-pointer">Physical Location</Label>
          </div>
        </div>

        {/* Online presence field */}
        {!formData.office_address && !(formData.country && formData.city) ? (
          <div>
            <Label htmlFor="address">Online Presence Details <span className="text-red-500">*</span></Label>
            <Textarea id="address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} placeholder="Website, social handle, marketplace link, etc." className={`mt-1 ${getFieldError('address') ? 'border-red-500 focus:border-red-500' : ''}`} rows={2} />
          </div>
        ) : (
          <>
            <div>
              <Label htmlFor="address">Street Address <span className="text-red-500">*</span></Label>
              <Textarea id="address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} placeholder="Enter your business address" className={`mt-1 ${getFieldError('address') ? 'border-red-500 focus:border-red-500' : ''}`} rows={2} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={formData.country} onChange={(e) => handleInputChange('country', e.target.value)} placeholder="Kenya" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="city">City (Optional)</Label>
                <Input id="city" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} placeholder="Nairobi" className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="office_address">Office/Shop Address (Optional)</Label>
              <Textarea id="office_address" value={formData.office_address} onChange={(e) => handleInputChange('office_address', e.target.value)} placeholder="Enter separate office or shop address if different from main address" className="mt-1" rows={2} />
            </div>
          </>
        )}
      </motion.div>

      {/* FEM Church Affiliation */}
      <motion.div variants={itemVariants} className="space-y-4">
        <Label className="text-lg font-semibold">FEM Church Affiliation</Label>
        <div>
          <Label htmlFor="fem_church_id">
            FEM Church/Branch (Optional)
          </Label>
          <Select value={formData.fem_church_id?.toString() || "none"} onValueChange={(value) => handleInputChange("fem_church_id", value === "none" ? null : parseInt(value))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select your affiliated FEM Church or Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None selected</SelectItem>
              {femChurches && femChurches.length > 0 ? (
                femChurches.map((church) => (
                  <SelectItem key={church.id} value={church.id.toString()}>
                    {church.name} {church.city && `- ${church.city}`}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-churches" disabled>No FEM churches found.</SelectItem>
              )}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Select your affiliated FEM Church or Branch for better community engagement
          </p>
        </div>
      </motion.div>

      {/* Business Hours */}
      <motion.div variants={itemVariants} className="space-y-4">
        <Label className="text-lg font-semibold">Business Hours (Optional)</Label>
        <p className="text-sm text-gray-600 mb-4">Set your business operating hours. Leave blank if not applicable.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(formData.hours).map(([day, hours]) => (
            <div key={day} className={`border rounded-lg p-4 backdrop-blur-sm transition-all duration-200 ${hours.closed ? 'bg-gray-100/80 border-gray-300' : 'bg-white/80 border-blue-300'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Label className="capitalize font-medium">{day}</Label>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Checkbox id={`${day}-closed`} checked={hours.closed} onCheckedChange={(checked) => handleHoursChange(day, "closed", checked as boolean)} />
                    <Label htmlFor={`${day}-closed`} className="text-xs cursor-pointer">{hours.closed ? "Closed" : "Open"}</Label>
                  </div>
                </div>
              </div>
              {!hours.closed && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm text-gray-700">Open</Label>
                    <Input type="time" value={hours.open} onChange={(e) => handleHoursChange(day, "open", e.target.value)} className="text-sm bg-white border-gray-300 text-gray-900 placeholder-gray-500" placeholder="--:--" />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-700">Close</Label>
                    <Input type="time" value={hours.close} onChange={(e) => handleHoursChange(day, "close", e.target.value)} className="text-sm bg-white border-gray-300 text-gray-900 placeholder-gray-500" placeholder="--:--" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Services Section - Only show if business type includes services */}
      {(formData.businessType === 'services' || formData.businessType === 'both') && (
        <motion.div variants={itemVariants} className="space-y-4">
          <Label className="text-lg font-semibold">Services (Optional)</Label>
          <p className="text-sm text-gray-600 mb-4">Add the main services your business offers.</p>
          <div className="space-y-4">
            {formData.services.map((service, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    value={service.name}
                    onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                    placeholder="Service name"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeService(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove Service
                  </Button>
                </div>
                <Input
                  value={service.description || ''}
                  onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                  placeholder="Service description (optional)"
                />
                <MultiImageUpload
                  value={service.photos || []}
                  onChange={(imageUrls) => {
                    setFormData(prev => {
                      const newServices = [...prev.services];
                      newServices[index] = { ...newServices[index], photos: imageUrls };
                      return { ...prev, services: newServices };
                    });
                  }}
                  label="Service Images"
                  placeholder="Upload service images"
                  maxImages={5}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addService}
              className="w-full"
            >
              + Add Service
            </Button>
          </div>
        </motion.div>
      )}

      {/* Products Section - Only show if business type includes products */}
      {(formData.businessType === 'products' || formData.businessType === 'both') && (
        <motion.div variants={itemVariants} className="space-y-4">
          <Label className="text-lg font-semibold">Products (Optional)</Label>
          <p className="text-sm text-gray-600 mb-4">Add the main products your business sells.</p>
          <div className="space-y-4">
            {formData.products.map((product, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    value={product.name}
                    onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                    placeholder="Product name"
                  />
                  <Input
                    value={product.price}
                    onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                    placeholder="Price"
                  />
                </div>
                <Input
                  value={product.description}
                  onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                  placeholder="Product description"
                />
                <MultiImageUpload
                  value={product.photos || []}
                  onChange={(imageUrls) => {
                    setFormData(prev => {
                      const newProducts = [...prev.products];
                      newProducts[index] = { ...newProducts[index], photos: imageUrls };
                      return { ...prev, products: newProducts };
                    });
                  }}
                  label="Product Images"
                  placeholder="Upload product images"
                  maxImages={5}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeProduct(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove Product
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addProduct}
              className="w-full"
            >
              + Add Product
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );


    // Don't render step 3 if business type is not selected




  // Main component return
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-[3px]">
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
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Step {currentStep} of 2</span>
                <span className="text-xs text-gray-400 italic">{statusText}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-fem-terracotta to-fem-navy h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 2) * 100}%` }}
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
            </div>
            
            {/* Required fields notice (system-themed) */}
            {currentStep === 1 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Required fields for Step 1</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Business Name</li>
                    <li>Business Category</li>
                    <li>Business Description</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Step Validation Status */}
            {getStepErrors(currentStep).length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <span className="text-sm font-medium">Validation Errors on Step {currentStep}:</span>
                </div>
                <ul className="mt-2 text-sm text-red-700 space-y-1">
                  {getStepErrors(currentStep).map((error, index) => (
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
                     <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={(e) => {
             // Prevent form submission with Enter key when not on final step
             if (e.key === 'Enter' && currentStep !== 2) {
               e.preventDefault();
               handleNextStep();
             }
           }} noValidate>
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
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className={`flex pt-2 pb-1 ${currentStep === 1 ? 'justify-end' : 'justify-between'}`}>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}
              
              {currentStep < 2 ? (
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
                  disabled={isSubmitting || uploadingImages}
                  className="flex items-center gap-2 bg-fem-terracotta hover:bg-fem-terracotta/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting || uploadingImages ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {uploadingImages ? "Uploading Images..." : (isEditMode ? "Updating..." : "Registering...")}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {isEditMode ? "Update Business" : "Register Business"}
                    </>
                  )}
                </Button>
              )}
              

              
              {/* Image upload progress */}
              {uploadingImages && (
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600 mb-2">Uploading images to S3...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-fem-terracotta h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}% complete</p>
                </div>
              )}
            </div>
          </form>
        </motion.div>
      </div>
              <Footer />
        <ScrollToTop />
        <HelpButton />
      </>
    );
};

export default BusinessRegistrationPage;