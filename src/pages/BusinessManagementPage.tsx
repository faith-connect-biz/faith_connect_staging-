import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Building2, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Tag, 
  Users, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Camera,
  ArrowRight,
  Eye,
  Clock,
  Image,
  Share2,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { toast } from '@/hooks/use-toast';
import { apiService, Service, Product, ProfessionalServiceRequest } from '@/services/api';
import { ServiceForm } from '@/components/ServiceForm';
import { ProductForm } from '@/components/ProductForm';
import { Label } from '@/components/ui/label';
import { PhotoRequestModal } from '@/components/PhotoRequestModal';
import { BusinessSupportSection } from '@/components/support/BusinessSupportSection';
import { formatToBritishDate } from '@/utils/dateUtils';
import HelpButton from '@/components/onboarding/HelpButton';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { ProtectedContactInfo } from '@/components/ui/ProtectedContactInfo';
import { InlineLogo } from '@/components/ui/Logo';


interface BusinessData {
  id: string;
  business_name: string;
  category: { name: string; slug: string } | null;
  description: string;
  long_description?: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  county: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  business_image_url: string;
  business_logo_url: string;
  // Social media links
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  youtube_url?: string;
}

// Local interface for products that matches the API structure
interface LocalProduct {
  id?: string | number;
  name: string;
  description?: string;
  price: number;
  price_currency: string;
  product_image_url?: string;
  images?: string[];
  is_active?: boolean;
  in_stock: boolean;
  created_at?: string;
  business?: string; // Add business property to match Product type
}


export const BusinessManagementPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { fetchBusinesses } = useBusiness();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [professionalServiceRequests, setProfessionalServiceRequests] = useState<ProfessionalServiceRequest[]>([]);
  const [businessHours, setBusinessHours] = useState<Array<{
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
  }>>([]);
  const [analytics, setAnalytics] = useState<{
    business_id: string;
    business_name: string;
    total_reviews: number;
    average_rating: number;
    rating_distribution: { [key: number]: number };
    recent_reviews: Array<{
      id: number;
      user: string;
      rating: number;
      review_text: string;
      is_verified: boolean;
      created_at: string;
      updated_at: string;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Form state variables
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingProduct, setEditingProduct] = useState<LocalProduct | null>(null);
  const [showPhotoRequestModal, setShowPhotoRequestModal] = useState(false);

  // Image navigation state (for any remaining modals)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage your business",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    loadBusinessData();
  }, [authLoading, isAuthenticated, user, navigate]);

  const loadBusinessData = async () => {
    try {
      setIsLoading(true);
      
      // Check if we have a business ID from navigation state (e.g., after creation)
      const businessIdFromState = location.state?.businessId;
      
      if (businessIdFromState) {
        console.log('Loading business from state ID:', businessIdFromState);
        try {
          const business = await apiService.getBusiness(businessIdFromState);
          console.log('Business loaded from ID:', business);
          
          if (business) {
            // Transform the API response to match our local interface
            const transformedBusinessData: BusinessData = {
              id: business.id,
              business_name: business.business_name,
              category: business.category || { name: 'Uncategorized', slug: 'uncategorized' },
              description: business.description || '',
              long_description: business.long_description || '',
              phone: business.phone || '',
              email: business.email || '',
              website: business.website || '',
              address: business.address,
              city: business.city || '',
              county: (business as any).county || '',
              rating: typeof business.rating === 'string' ? parseFloat(business.rating) : business.rating,
              review_count: business.review_count,
              is_verified: business.is_verified,
              is_featured: business.is_featured,
              is_active: business.is_active,
              business_image_url: business.business_image_url,
              business_logo_url: business.business_logo_url,
              // Social media links
              facebook_url: business.facebook_url,
              instagram_url: business.instagram_url,
              twitter_url: business.twitter_url,
              youtube_url: business.youtube_url
            };

            console.log('Transformed business data:', transformedBusinessData);
            setBusinessData(transformedBusinessData);
            
            // Load additional data
            await Promise.all([
              loadBusinessServices(),
              loadBusinessProducts(),
              loadProfessionalServiceRequests()
            ]);
            
            return;
          }
        } catch (error) {
          console.error('Error loading business by ID:', error);
        }
      }
      
      // Use the correct method to get current user's business
      let business = await apiService.getUserBusiness();
      
      console.log('Raw business data from API:', business);
      console.log('Business owner user ID:', business?.user?.id);
      console.log('Current user ID:', user?.id);
      console.log('Business ownership match:', business?.user?.id?.toString() === user?.id?.toString());
      
      if (business) {
        // Security check: Ensure the business belongs to the current user
        if (business.user?.id?.toString() !== user?.id?.toString()) {
          console.error('SECURITY ISSUE: Business does not belong to current user!');
          console.error('Business user ID:', business.user?.id);
          console.error('Current user ID:', user?.id);
          toast({
            title: "Security Error",
            description: "This business does not belong to you. Please contact support.",
            variant: "destructive"
          });
          setBusinessData(null);
          setServices([]);
          setProducts([]);
          setBusinessHours([]);
          setIsLoading(false);
          return;
        }
        
        // Transform the API response to match our local interface
        const transformedBusinessData: BusinessData = {
          id: business.id,
          business_name: business.business_name,
          category: business.category || { name: 'Uncategorized', slug: 'uncategorized' },
          description: business.description || '',
          long_description: business.long_description || '',
          phone: business.phone || '',
          email: business.email || '',
          website: business.website || '',
          address: business.address,
          city: business.city || '',
          county: (business as any).county || '',
          rating: typeof business.rating === 'string' ? parseFloat(business.rating) : business.rating,
          review_count: business.review_count,
          is_verified: business.is_verified,
          is_featured: business.is_featured,
          is_active: business.is_active,
          business_image_url: business.business_image_url,
          business_logo_url: business.business_logo_url,
          // Social media links
          facebook_url: business.facebook_url,
          instagram_url: business.instagram_url,
          twitter_url: business.twitter_url,
          youtube_url: business.youtube_url
        };

        console.log('Transformed business data:', transformedBusinessData);

        setBusinessData(transformedBusinessData);

        // Fetch services, products, and hours for the business
        try {
          console.log('BusinessManagementPage: Fetching business details for business ID (from API):', business.id);
          
          const [servicesData, productsData, hoursData, analyticsData] = await Promise.all([
            apiService.getBusinessServices(business.id),
            apiService.getBusinessProducts(business.id),
            apiService.getBusinessHours(business.id),
            apiService.getBusinessAnalytics(business.id)
          ]);

          console.log('BusinessManagementPage: Services data received (from API):', servicesData);
          console.log('BusinessManagementPage: Products data received (from API):', productsData);
          console.log('BusinessManagementPage: Hours data received (from API):', hoursData);
          console.log('BusinessManagementPage: Analytics data received (from API):', analyticsData);

          setServices(servicesData);
          // Transform products to match LocalProduct interface
          const transformedProducts: LocalProduct[] = productsData.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
            price_currency: product.price_currency || 'KSH',
            product_image_url: product.product_image_url,
            images: product.images || [],
            is_active: product.is_active,
            in_stock: product.in_stock,
            created_at: product.created_at,
            business: typeof product.business === 'string' ? product.business : product.business?.id || ''
          }));
          setProducts(transformedProducts);
          setBusinessHours(hoursData);
          setAnalytics(analyticsData);
        } catch (error) {
          console.error('Error fetching business details:', error);
          // Set empty arrays as fallback
          setServices([]);
          setProducts([]);
          setBusinessHours([]);
          setAnalytics(null);
        }
      } else {
        // No business found
        setBusinessData(null);
        setServices([]);
        setProducts([]);
        setBusinessHours([]);
      }

    } catch (error) {
      toast({
        title: "Error loading business data",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBusinessServices = async () => {
    if (!businessData) return;
    try {
      const servicesData = await apiService.getBusinessServices(businessData.id);
      console.log('Loaded business services:', servicesData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching business services:', error);
      setServices([]);
    }
  };

  const loadBusinessProducts = async () => {
    if (!businessData) return;
    try {
      const productsData = await apiService.getBusinessProducts(businessData.id);
      // Transform products to match LocalProduct interface
      const transformedProducts: LocalProduct[] = productsData.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        price_currency: product.price_currency || 'KSH',
        product_image_url: product.product_image_url,
        images: product.images || [],
        is_active: product.is_active,
        in_stock: product.in_stock,
        created_at: product.created_at,
        business: typeof product.business === 'string' ? product.business : product.business?.id || ''
      }));
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching business products:', error);
      setProducts([]);
    }
  };

  const loadBusinessHours = async () => {
    if (!businessData) return;
    try {
      const hoursData = await apiService.getBusinessHours(businessData.id);
      console.log('Refreshed business hours:', hoursData);
      setBusinessHours(hoursData);
    } catch (error) {
      console.error('Error fetching business hours:', error);
      setBusinessHours([]);
    }
  };

  const loadProfessionalServiceRequests = async () => {
    try {
      const requests = await apiService.getProfessionalServiceRequests();
      console.log('Loaded professional service requests:', requests);
      setProfessionalServiceRequests(requests);
    } catch (error) {
      console.error('Error fetching professional service requests:', error);
      setProfessionalServiceRequests([]);
    }
  };

  const handleEditBusiness = () => {
    navigate('/register-business', { state: { editMode: true, businessId: businessData?.id } });
  };

  const handleAddService = () => {
    setEditingService(null);
    setShowServiceForm(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService({
      ...service,
      business: businessData?.id || ''
    });
    setShowServiceForm(true);
  };

  const handleEditProduct = (product: LocalProduct) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      price_currency: product.price_currency,
      product_image_url: product.product_image_url,
      images: product.images,
      is_active: product.is_active,
      in_stock: product.in_stock,
      created_at: product.created_at
    });
    setShowProductForm(true);
  };

  const handleProductClick = (product: LocalProduct) => {
    // Navigate to product detail page using category-based URL if available
    if (businessData?.category?.slug && (product as any).slug) {
      navigate(`/category/${businessData.category.slug}/product/${(product as any).slug}`);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const handleServiceClick = (service: Service) => {
    // Navigate to service detail page using category-based URL if available
    if (businessData?.category?.slug && (service as any).slug) {
      navigate(`/category/${businessData.category.slug}/service/${(service as any).slug}`);
    } else {
      navigate(`/service/${service.id}`);
    }
  };

  // Image navigation function (kept for any remaining modals)
  const handleImageNavigation = (direction: 'next' | 'prev') => {
    // This function is kept for any remaining modals that might need it
    // The main product/service details now use dedicated pages
  };

  const handleServiceSuccess = () => {
    // Refresh services data
    if (businessData) {
      loadBusinessServices();
    }
  };

  const handleProductSuccess = () => {
    // Refresh products data
    if (businessData) {
      loadBusinessProducts();
    }
  };

  const handleProfilePictureClick = async () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && businessData) {
        try {
          setIsUploadingImage(true);
          
          // Step 1: Get pre-signed URL for profile photo upload
          const uploadData = await apiService.getProfilePhotoUploadUrl(file.name, file.type);
          
          // Step 2: Upload file directly to S3
          const uploadSuccess = await apiService.uploadFileToS3(
            uploadData.presigned_url,
            file
          );
          
          if (!uploadSuccess) {
            throw new Error('Failed to upload file to S3');
          }
          
                                // Step 3: Generate S3 URL and update local state
            const s3Url = `https://${import.meta.env.VITE_AWS_STORAGE_BUCKET_NAME || 'faithconnectapp'}.s3.${import.meta.env.VITE_AWS_S3_REGION_NAME || 'af-south-1'}.amazonaws.com/${uploadData.file_key}`;
           
           // Step 4: Update the business profile photo in the backend
           try {
             const updateResult = await apiService.updateBusinessImage(businessData.id, 'image', uploadData.file_key);
             console.log('Business image update result:', updateResult);
             
             // Use the URL returned from the backend if available
             const finalImageUrl = updateResult.business_image_url || s3Url;
             
             // Update the local state with the new profile photo URL
             setBusinessData(prev => prev ? {
               ...prev,
               business_image_url: finalImageUrl
             } : null);
             
             // Refresh the business context to update other components
             if (fetchBusinesses) {
               fetchBusinesses({ page: 1, limit: 15 });
             }
           } catch (error) {
             console.error('Error updating business profile photo in backend:', error);
             // Still update local state with S3 URL as fallback
             setBusinessData(prev => prev ? {
               ...prev,
               business_image_url: s3Url
             } : null);
             
             // Refresh the business context to update other components
             if (fetchBusinesses) {
               fetchBusinesses({ page: 1, limit: 15 });
             }
           }
           
           toast({
             title: "Success",
             description: "Profile picture updated successfully!",
           });
          
        } catch (error) {
          console.error('Error uploading image:', error);
          toast({
            title: "Error",
            description: "Failed to upload image. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsUploadingImage(false);
        }
      }
    };
    input.click();
  };



  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fem-terracotta mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your business...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Business Found</h2>
              <p className="text-gray-600 mb-4">
                It looks like you haven't registered your business yet.
              </p>
              <Button 
                onClick={() => navigate('/register-business')}
                className="bg-fem-terracotta hover:bg-fem-terracotta/90"
              >
                Register Your Business
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Enhanced Breadcrumb Navigation */}
          <div className="mb-8 bg-white rounded-2xl border border-gray-200/50 shadow-lg backdrop-blur-sm">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-fem-terracotta to-fem-gold rounded-full animate-pulse"></div>
                  <span className="text-gray-700 text-sm font-semibold tracking-wide uppercase">Navigation</span>
                  </div>
                  {/* Faith Connect Logo for better branding visibility */}
                  <div className="hidden sm:flex items-center space-x-2 pl-4 border-l border-gray-200">
                    <InlineLogo />
                    <span className="text-xs text-gray-500 font-medium">Powered by</span>
                  </div>
                </div>
                <div className="text-gray-600 text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                  {businessData.business_name}
                </div>
              </div>
              
              <Breadcrumb 
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Business Directory', href: '/directory' },
                  { label: businessData.business_name, href: `/business/${businessData.id}` },
                  { label: 'Manage Business', href: undefined }
                ]}
                className="text-gray-700"
              />
            </div>
          </div>
          
          {/* Enhanced Business Header */}
          <div className="mb-12">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-fem-terracotta/10 via-fem-gold/5 to-fem-terracotta/10 p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center space-x-6">
                    {/* Enhanced Business Profile Picture */}
                <div className="relative group">
                  <div 
                        className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-2xl hover:border-fem-terracotta transition-all duration-200 cursor-pointer overflow-hidden"
                    onClick={() => handleProfilePictureClick()}
                  >
                    {businessData.business_image_url ? (
                      <img 
                        src={businessData.business_image_url} 
                        alt="Business Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(businessData.business_name)}&background=6366f1&color=fff&size=96&font-size=32&bold=true`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-fem-navy to-fem-terracotta flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {businessData.business_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg">
                    {businessData.business_image_url ? 'Change Profile Picture' : 'Add Profile Picture'}
                  </div>
                </div>

                    <div className="flex-1">
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-fem-terracotta to-gray-900 bg-clip-text text-transparent mb-3">
                        {businessData.business_name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 hover:shadow-md transition-all duration-300">
                        {businessData.category?.name || 'Uncategorized'}
                      </Badge>
                      {businessData.is_verified && (
                          <Badge variant="default" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300 hover:shadow-md transition-all duration-300">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          Verified
                        </Badge>
                      )}
                      {businessData.is_featured && (
                          <Badge variant="default" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-300 hover:shadow-md transition-all duration-300">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                          Featured
                        </Badge>
                        )}
                    </div>
                  </div>
                </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={handleEditBusiness} 
                      variant="outline"
                      className="bg-white/80 backdrop-blur-sm border-2 border-fem-terracotta/30 text-fem-terracotta hover:bg-fem-terracotta hover:text-white hover:border-fem-terracotta transition-all duration-200 hover:shadow-lg px-6 py-3"
                    >
                <Edit className="h-4 w-4 mr-2" />
                Edit Business
              </Button>
                  </div>
                </div>
            </div>
            
              {/* Enhanced Business Stats */}
              <div className="p-8 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-300">
                    <div className="p-2 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{businessData.rating}</div>
                      <div className="text-sm text-gray-600">{businessData.review_count} reviews</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-300">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{businessData.city}</div>
                      <div className="text-sm text-gray-600">{businessData.county}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-300">
                    <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                      <Phone className="h-5 w-5 text-green-600" />
              </div>
                    <div>
                      <div className="font-semibold text-gray-900">Phone</div>
                      <div className="text-sm text-gray-600">{businessData.phone}</div>
              </div>
              </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
              <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-gray-50 to-white p-2 h-auto">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 py-4 px-6 rounded-xl"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="services" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 py-4 px-6 rounded-xl"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Services
                </TabsTrigger>
                <TabsTrigger 
                  value="products" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 py-4 px-6 rounded-xl"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Products
                </TabsTrigger>
                <TabsTrigger 
                  value="support" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 py-4 px-6 rounded-xl"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Support
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 py-4 px-6 rounded-xl"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
            </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Business Information Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Business Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900">{businessData.description}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Long Description</label>
                    <p className="text-gray-900">
                      {businessData.long_description || 'No detailed description provided yet.'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">{businessData.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-gray-900">{businessData.city}, {businessData.county}</p>
                  </div>
                  {businessData.website && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Website</label>
                      <a 
                        href={businessData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-fem-terracotta hover:underline flex items-center space-x-1"
                      >
                        <span>Visit Website</span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>



              {/* Social Media Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Share2 className="h-5 w-5" />
                    <span>Social Media</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {businessData.facebook_url && (
                    <div className="flex items-center space-x-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      <a 
                        href={businessData.facebook_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Facebook
                      </a>
                    </div>
                  )}
                  {businessData.instagram_url && (
                    <div className="flex items-center space-x-2">
                      <Instagram className="h-4 w-4 text-pink-600" />
                      <a 
                        href={businessData.instagram_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:underline text-sm"
                      >
                        Instagram
                      </a>
                    </div>
                  )}
                  {businessData.twitter_url && (
                    <div className="flex items-center space-x-2">
                      <Twitter className="h-4 w-4 text-blue-400" />
                      <a 
                        href={businessData.twitter_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline text-sm"
                      >
                        Twitter
                      </a>
                    </div>
                  )}

                  {businessData.youtube_url && (
                    <div className="flex items-center space-x-2">
                      <Youtube className="h-4 w-4 text-red-600" />
                      <a 
                        href={businessData.youtube_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-red-600 hover:underline text-sm"
                      >
                        YouTube
                      </a>
                    </div>
                  )}

                  {!businessData.facebook_url && !businessData.instagram_url && !businessData.twitter_url && 
                   !businessData.youtube_url && (
                    <p className="text-gray-500 text-sm">No social media links added yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Quick Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{services.length}</div>
                      <div className="text-sm text-blue-600">Active Services</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{products.length}</div>
                      <div className="text-sm text-green-600">Active Products</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{businessData.review_count}</div>
                      <div className="text-sm text-yellow-600">Total Reviews</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

                             {/* Business Hours */}
               <Card>
                 <CardHeader>
                   <div className="flex items-center justify-between">
                     <CardTitle className="flex items-center space-x-2">
                       <Clock className="h-5 w-5" />
                       <span>Business Hours</span>
                     </CardTitle>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={loadBusinessHours}
                       className="text-xs"
                     >
                       <Clock className="h-4 w-4 mr-1" />
                       Refresh
                     </Button>
                   </div>
                 </CardHeader>
                <CardContent>
                  {businessHours.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                      {businessHours.map((hour) => {
                        // Helper function to format time without seconds
                        const formatTime = (timeString: string | null | undefined) => {
                          if (!timeString) return 'N/A';
                          // Remove seconds and format as HH:MM
                          return timeString.split(':').slice(0, 2).join(':');
                        };

                        // Check if times are valid (open time should be before close time)
                        const openTime = formatTime(hour.open_time);
                        const closeTime = formatTime(hour.close_time);
                        const isValidTimeRange = hour.open_time && hour.close_time && 
                          hour.open_time < hour.close_time;

                        return (
                          <div key={hour.day_of_week} className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-gray-900 mb-1">
                              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][hour.day_of_week]}
                            </div>
                            <div className="text-sm text-gray-600">
                              {hour.is_closed ? 'Closed' : 
                                (isValidTimeRange ? `${openTime} - ${closeTime}` : 'Invalid Hours')
                              }
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No business hours set</p>
                      <p className="text-sm">Business hours will appear here once configured</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-fem-terracotta to-gray-900 bg-clip-text text-transparent mb-2">
                      Your Services
                    </h2>
                    <p className="text-gray-600">Manage and organize your business services</p>
                  </div>
                <div className="flex items-center gap-3">
                    <Button 
                      onClick={handleAddService} 
                      className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                    >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                  </div>
                </div>
              </div>
              

              
              {services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service, index) => (
                    <Card 
                      key={service.id || `service-${service.name}-${index}`} 
                      className="group relative overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-gradient-to-br from-white to-gray-50 border-2 border-transparent hover:border-fem-terracotta/30"
                    >
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-fem-terracotta/0 via-fem-gold/0 to-fem-terracotta/0 group-hover:from-fem-terracotta/5 group-hover:via-fem-gold/5 group-hover:to-fem-terracotta/5 transition-all duration-200"></div>
                      
                      
                      <CardContent className="relative z-10 p-6">
                        <div className="flex items-start space-x-4 mb-4">
                          {/* Service Preview Image with enhanced effects */}
                          <div className="flex-shrink-0 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-fem-terracotta/20 to-fem-gold/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <img 
                              src={service.images?.[0] || service.service_image_url || "/placeholder.svg"} 
                              alt={service.name}
                              className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 group-hover:border-fem-terracotta/50 transition-all duration-200 shadow-md group-hover:shadow-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                            {/* Glow effect on image */}
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-fem-terracotta/30 to-fem-gold/30 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-200 -z-10"></div>
                          </div>
                          
                          {/* Service Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-lg group-hover:text-fem-terracotta transition-colors duration-300">{service.name}</h3>
                              <Badge 
                                variant={service.is_active ? "default" : "secondary"}
                                className={`${service.is_active ? 'bg-green-100 text-green-800 border-green-200 group-hover:bg-green-200 group-hover:shadow-md' : 'bg-gray-100 text-gray-600 border-gray-200'} transition-all duration-300 group-hover:scale-105`}
                              >
                                <div className={`w-2 h-2 rounded-full mr-2 ${service.is_active ? 'bg-green-500 group-hover:animate-pulse' : 'bg-gray-400'}`}></div>
                                {service.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mt-2 group-hover:text-gray-700 transition-colors duration-300 line-clamp-3">{service.description}</p>
                            <div className="space-y-1 text-sm text-gray-500 mt-2">
                              <div className="flex items-center space-x-2 group-hover:text-gray-600 transition-colors duration-300">
                                <Tag className="h-4 w-4 group-hover:text-fem-terracotta transition-colors duration-300" />
                                <span className="font-medium">{service.price_range !== 'Free' ? service.price_range : 'Contact for pricing'}</span>
                              </div>
                              <div className="flex items-center space-x-2 group-hover:text-gray-600 transition-colors duration-300">
                                <Clock className="h-4 w-4 group-hover:text-fem-gold transition-colors duration-300" />
                                <span className="font-medium">{service.duration}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 group/btn hover:bg-fem-terracotta hover:text-white hover:border-fem-terracotta transition-all duration-300 hover:shadow-md hover:scale-105"
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="h-4 w-4 mr-2 group-hover/btn:animate-spin transition-transform duration-300" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 group/btn hover:bg-fem-gold hover:text-white hover:border-fem-gold transition-all duration-300 hover:shadow-md hover:scale-105" 
                            onClick={() => handleServiceClick(service)}
                          >
                            <Eye className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                      
                      {/* Bottom accent line */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-fem-terracotta/0 to-transparent group-hover:via-fem-terracotta transition-all duration-500"></div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                  <div className="bg-gradient-to-br from-gray-50 to-white p-12 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-fem-terracotta/20 to-fem-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Settings className="h-12 w-12 text-fem-terracotta" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Services Yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Start building your business by adding your first service. Showcase what you offer and attract more customers.
                    </p>
                    <Button 
                      onClick={handleAddService} 
                      className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 py-3"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Your First Service
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Products</h2>
                <div className="flex items-center gap-3">
                  <Button onClick={handleAddProduct} className="bg-fem-terracotta hover:bg-fem-terracotta/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>
              

              
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <Card key={product.id || `product-${product.name}-${index}`} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleProductClick(product)}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4 mb-4">
                          {/* Product Preview Image */}
                          <div className="flex-shrink-0">
                            <img 
                              src={product.images?.[0] || product.product_image_url || "/placeholder.svg"} 
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-lg">{product.name}</h3>
                              <Badge variant={product.is_active ? "default" : "secondary"}>
                                {product.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mt-2">{product.description}</p>
                            <div className="space-y-1 text-sm text-gray-500 mt-2">
                              <div className="flex items-center justify-between">
                                <span>Price:</span>
                                <span className="font-semibold text-gray-900">
                                  {product.price} {product.price_currency}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4" />
                                <span>{product.in_stock ? "In Stock" : "Out of Stock"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProduct(product);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start by adding your first product to showcase what you sell.
                    </p>
                    <Button onClick={handleAddProduct} className="bg-fem-terracotta hover:bg-fem-terracotta/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Business Support Tab */}
            <TabsContent value="support" className="space-y-6">
              <BusinessSupportSection 
                businessId={businessData?.id || ''}
                businessName={businessData?.business_name || ''}
                requests={professionalServiceRequests}
              />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {analytics ? (
                <>
                  {/* Overview Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {analytics.average_rating.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Average Rating</div>
                        <div className="flex justify-center mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= Math.round(analytics.average_rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {analytics.total_reviews}
                        </div>
                        <div className="text-sm text-gray-600">Total Reviews</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {services.length + products.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Offerings</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Rating Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Rating Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1 w-16">
                              <span className="text-sm font-medium">{rating}</span>
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{
                                  width: `${analytics.total_reviews > 0 ? (analytics.rating_distribution[rating] / analytics.total_reviews) * 100 : 0}%`
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {analytics.rating_distribution[rating]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Reviews */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.recent_reviews.length > 0 ? (
                        <div className="space-y-4">
                          {analytics.recent_reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= review.rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">
                                    {review.user}
                                  </span>
                                  {review.is_verified && (
                                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {formatToBritishDate(review.created_at)}
                                </span>
                              </div>
                              {review.review_text && (
                                <p className="text-gray-700">{review.review_text}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          No reviews yet. Encourage your customers to leave reviews!
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Business Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Loading analytics data...
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </main>
      
      {/* Service Form Modal */}
      <ServiceForm
        isOpen={showServiceForm}
        onClose={() => setShowServiceForm(false)}
        businessId={businessData?.id || ''}
        service={editingService}
        onSuccess={handleServiceSuccess}
      />

      {/* Product Form Modal */}
      <ProductForm
        isOpen={showProductForm}
        onClose={() => setShowProductForm(false)}
        businessId={businessData?.id || ''}
        product={editingProduct as any}
        onSuccess={handleProductSuccess}
      />

      {/* Product and Service details now use dedicated pages instead of modals */}
      
      {/* Photo Request Modal */}
      <PhotoRequestModal
        isOpen={showPhotoRequestModal}
        onClose={() => setShowPhotoRequestModal(false)}
        businessId={businessData?.id || ''}
        businessName={businessData?.business_name || ''}
      />
      
              <Footer />
        <ScrollToTop />
        <HelpButton />
      </div>
    );
};
