import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { toast } from '@/hooks/use-toast';
import { apiService, Service, Product } from '@/services/api';
import { ServiceForm } from '@/components/ServiceForm';
import { ProductForm } from '@/components/ProductForm';
import { Label } from '@/components/ui/label';
import { PhotoRequestModal } from '@/components/PhotoRequestModal';


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
}


export const BusinessManagementPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { forceReAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<LocalProduct[]>([]);
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

  // Product detail modal state
  const [selectedProduct, setSelectedProduct] = useState<LocalProduct | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Service detail modal state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceDetail, setShowServiceDetail] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and is a business user
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage your business",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    // Load business data
    loadBusinessData();
  }, [user, navigate]);

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
              county: business.county || '',
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
              const [servicesData, productsData, hoursData, analyticsData] = await Promise.all([
                apiService.getBusinessServices(business.id),
                apiService.getBusinessProducts(business.id),
                apiService.getBusinessHours(business.id),
                apiService.getBusinessAnalytics(business.id)
              ]);

              setServices(servicesData);
              setProducts(productsData);
              setBusinessHours(hoursData);
              setAnalytics(analyticsData);
              
              // Clear the location state to avoid issues on subsequent renders
              if (location.state?.businessId) {
                navigate(location.pathname, { replace: true });
              }
              
              return; // Exit early since we successfully loaded the business
            } catch (error) {
              console.error('Error fetching business details:', error);
              // Set empty arrays as fallback
              setServices([]);
              setProducts([]);
              setBusinessHours([]);
              setAnalytics(null);
            }
            
          }
        } catch (error) {
          console.error('Error loading business from ID:', error);
          // Fall back to the original method
        }
      }
      
      // Try the simple method first
      let business = await apiService.getCurrentUserBusinessSimple();
      
      if (!business) {
        // Fallback to the complex method
        business = await apiService.getCurrentUserBusiness();
      }
      
      console.log('Raw business data from API:', business);
      
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
          county: business.county || '',
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
          const [servicesData, productsData, hoursData, analyticsData] = await Promise.all([
            apiService.getBusinessServices(business.id),
            apiService.getBusinessProducts(business.id),
            apiService.getBusinessHours(business.id),
            apiService.getBusinessAnalytics(business.id)
          ]);

          setServices(servicesData);
          setProducts(productsData);
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
      setProducts(productsData);
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
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setShowProductDetail(true);
  };

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setShowServiceDetail(true);
  };

  const handleImageNavigation = (direction: 'next' | 'prev') => {
    if (!selectedProduct) return;
    
    const allImages = [
      ...(selectedProduct.product_image_url ? [selectedProduct.product_image_url] : []),
      ...(selectedProduct.images || [])
    ];
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === allImages.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? allImages.length - 1 : prev - 1
      );
    }
  };

  const closeProductDetail = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  };

  const closeServiceDetail = () => {
    setShowServiceDetail(false);
    setSelectedService(null);
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
           } catch (error) {
             console.error('Error updating business profile photo in backend:', error);
             // Still update local state with S3 URL as fallback
             setBusinessData(prev => prev ? {
               ...prev,
               business_image_url: s3Url
             } : null);
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                {/* Business Profile Picture - Beautiful rounded circle */}
                <div className="relative group">
                  <div 
                    className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-4 border-gray-200 hover:border-fem-terracotta transition-all duration-300 cursor-pointer overflow-hidden shadow-lg hover:shadow-xl"
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

                <div className="flex items-center space-x-3">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{businessData.business_name}</h1>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary">
                        {businessData.category?.name || 'Uncategorized'}
                      </Badge>
                      {businessData.is_verified && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      )}
                      {businessData.is_featured && (
                        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                        )}
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={handleEditBusiness} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Business
              </Button>
            </div>
            

            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>{businessData.rating} ({businessData.review_count} reviews)</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-5 w-5" />
                <span>{businessData.city}, {businessData.county}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="h-5 w-5" />
                <span>{businessData.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="h-5 w-5" />
                <span>{businessData.email}</span>
              </div>
            </div>
          </div>



          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

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

              {/* Professional Photo Request Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Professional Photo Requests</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-6">
                    <Camera className="h-16 w-16 text-fem-terracotta mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Need Professional Photos?
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Request professional photography services from this business. 
                      Let them know what you need and they'll get back to you.
                    </p>
                    <Button 
                      onClick={() => setShowPhotoRequestModal(true)}
                      className="bg-fem-terracotta hover:bg-fem-terracotta/90"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Request Professional Photos
                    </Button>
                  </div>
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
            <TabsContent value="services" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Services</h2>
                <Button onClick={handleAddService} className="bg-fem-terracotta hover:bg-fem-terracotta/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>
              
              {services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service, index) => (
                    <Card key={service.id || `service-${service.name}-${index}`} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4 mb-4">
                          {/* Service Preview Image */}
                          <div className="flex-shrink-0">
                            <img 
                              src={service.service_image_url || service.images?.[0] || "/placeholder.svg"} 
                              alt={service.name}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                          </div>
                          
                          {/* Service Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-lg">{service.name}</h3>
                              <Badge variant={service.is_active ? "default" : "secondary"}>
                                {service.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mt-2">{service.description}</p>
                            <div className="space-y-1 text-sm text-gray-500 mt-2">
                              <div className="flex items-center space-x-2">
                                <Tag className="h-4 w-4" />
                                <span>{service.price_range !== 'Free' ? service.price_range : 'Contact for pricing'}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>{service.duration}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleServiceClick(service)}>
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
                    <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start by adding your first service to showcase what you offer.
                    </p>
                    <Button onClick={handleAddService} className="bg-fem-terracotta hover:bg-fem-terracotta/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Service
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Products</h2>
                <Button onClick={handleAddProduct} className="bg-fem-terracotta hover:bg-fem-terracotta/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
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
                              src={product.product_image_url || product.images?.[0] || "/placeholder.svg"} 
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
                                  {new Date(review.created_at).toLocaleDateString()}
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
        product={editingProduct}
        onSuccess={handleProductSuccess}
      />

      {/* Product Detail Modal */}
      <Dialog open={showProductDetail} onOpenChange={closeProductDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedProduct?.name}</span>
              <Button variant="ghost" size="sm" onClick={closeProductDetail}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              {/* Image Gallery */}
              <div className="relative">
                {(() => {
                  const allImages = [
                    ...(selectedProduct.product_image_url ? [selectedProduct.product_image_url] : []),
                    ...(selectedProduct.images || [])
                  ];
                  
                  if (allImages.length === 0) {
                    return (
                      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Image className="h-16 w-16 text-gray-400" />
                        <span className="ml-2 text-gray-500">No images available</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="relative">
                      {/* Main Image */}
                      <img 
                        src={allImages[currentImageIndex]} 
                        alt={`${selectedProduct.name} - Image ${currentImageIndex + 1}`}
                        className="w-full h-96 object-cover rounded-lg shadow-lg"
                      />
                      
                      {/* Navigation Arrows */}
                      {allImages.length > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                            onClick={() => handleImageNavigation('prev')}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                            onClick={() => handleImageNavigation('next')}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {allImages.length}
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {/* Thumbnail Gallery */}
              {(() => {
                const allImages = [
                  ...(selectedProduct.product_image_url ? [selectedProduct.product_image_url] : []),
                  ...(selectedProduct.images || [])
                ];
                
                if (allImages.length > 1) {
                  return (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-700 mb-2">All Images</Label>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {allImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 relative group ${
                              index === currentImageIndex 
                                ? 'ring-2 ring-fem-terracotta ring-offset-2' 
                                : 'hover:ring-2 hover:ring-gray-300 ring-offset-2'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${selectedProduct.name} thumbnail ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                            />
                            {index === currentImageIndex && (
                              <div className="absolute inset-0 bg-fem-terracotta/20 rounded-lg flex items-center justify-center">
                                <div className="w-2 h-2 bg-fem-terracotta rounded-full"></div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              {/* Product Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{selectedProduct.name}</h3>
                  <p className="text-gray-600">{selectedProduct.description || 'No description available'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Price</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProduct.price} {selectedProduct.price_currency}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Stock Status</label>
                    <Badge variant={selectedProduct.in_stock ? "default" : "secondary"}>
                      {selectedProduct.in_stock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <Badge variant={selectedProduct.is_active ? "default" : "secondary"}>
                      {selectedProduct.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  {selectedProduct.created_at && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Added</label>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedProduct.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    closeProductDetail();
                    handleEditProduct(selectedProduct);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
                <Button onClick={closeProductDetail}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Service Detail Modal */}
      <Dialog open={showServiceDetail} onOpenChange={closeServiceDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedService?.name}</span>
              <Button variant="ghost" size="sm" onClick={closeServiceDetail}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedService && (
            <div className="space-y-6">
              {/* Service Image */}
              <div className="relative">
                {selectedService.service_image_url ? (
                  <img 
                    src={selectedService.service_image_url} 
                    alt={selectedService.name}
                    className="w-full h-96 object-cover rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-16 w-16 text-gray-400" />
                    <span className="ml-2 text-gray-500">No image available</span>
                  </div>
                )}
              </div>
              
              {/* Service Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{selectedService.name}</h3>
                  <p className="text-gray-600">{selectedService.description || 'No description available'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Price Range</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedService.price_range || 'Contact for pricing'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedService.duration || 'Not specified'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <Badge variant={selectedService.is_active ? "default" : "secondary"}>
                      {selectedService.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  {selectedService.created_at && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Added</label>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedService.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    closeServiceDetail();
                    handleEditService(selectedService);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Service
                </Button>
                <Button onClick={closeServiceDetail}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Photo Request Modal */}
      <PhotoRequestModal
        isOpen={showPhotoRequestModal}
        onClose={() => setShowPhotoRequestModal(false)}
        businessId={businessData?.id || ''}
        businessName={businessData?.business_name || ''}
      />
      
      <Footer />
    </div>
  );
};
