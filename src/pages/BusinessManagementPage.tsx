import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  Youtube
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

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

interface Service {
  id: number;
  name: string;
  description?: string;
  price_range?: string;
  duration?: string;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  price_currency: string;
  product_image_url?: string;
  in_stock: boolean;
  is_active: boolean;
}

export const BusinessManagementPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { forceReAuth } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [businessHours, setBusinessHours] = useState<Array<{
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
          const [servicesData, productsData, hoursData] = await Promise.all([
            apiService.getBusinessServices(business.id),
            apiService.getBusinessProducts(business.id),
            apiService.getBusinessHours(business.id)
          ]);

          setServices(servicesData);
          setProducts(productsData);
          setBusinessHours(hoursData);
          
          console.log('Business hours data:', hoursData);
        } catch (error) {
          console.error('Error fetching business details:', error);
          // Set empty arrays as fallback
          setServices([]);
          setProducts([]);
          setBusinessHours([]);
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

  const handleEditBusiness = () => {
    navigate('/register-business', { state: { editMode: true, businessId: businessData?.id } });
  };

  const handleAddService = () => {
    // TODO: Implement add service functionality
    toast({
      title: "Add Service",
      description: "This feature will be available soon!",
    });
  };

  const handleAddProduct = () => {
    // TODO: Implement add product functionality
    toast({
      title: "Add Product",
      description: "This feature will be available soon!",
    });
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
          
          // For now, we'll use a placeholder URL
          // In a real implementation, you'd upload to a cloud service like AWS S3
          const imageUrl = URL.createObjectURL(file);
          
          // Upload the image to the backend
          const result = await apiService.uploadBusinessImage(
            businessData.id, 
            'image', 
            imageUrl
          );
          
          // Update the local state
          setBusinessData(prev => prev ? {
            ...prev,
            business_image_url: result.business_image_url
          } : null);
          
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

  const handleLogoUpload = async () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && businessData) {
        try {
          setIsUploadingImage(true);
          
          // For now, we'll use a placeholder URL
          // In a real implementation, you'd upload to a cloud service like AWS S3
          const imageUrl = URL.createObjectURL(file);
          
          // Upload the image to the backend
          const result = await apiService.uploadBusinessImage(
            businessData.id, 
            'logo', 
            imageUrl
          );
          
          // Update the local state
          setBusinessData(prev => prev ? {
            ...prev,
            business_logo_url: result.business_image_url
          } : null);
          
          toast({
            title: "Success",
            description: "Logo updated successfully!",
          });
          
        } catch (error) {
          console.error('Error uploading logo:', error);
          toast({
            title: "Error",
            description: "Failed to upload logo. Please try again.",
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
                {/* Business Profile Picture Icon - Now the Upload Button */}
                <div className="relative group">
                  <div 
                    className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-300 hover:border-fem-terracotta transition-colors cursor-pointer overflow-hidden"
                    onClick={() => handleProfilePictureClick()}
                  >
                    {businessData.business_image_url ? (
                      <img 
                        src={businessData.business_image_url} 
                        alt="Business Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="h-8 w-8 text-gray-500" />
                    )}
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {businessData.business_image_url ? 'Change Profile Picture' : 'Add Profile Picture'}
                  </div>
                </div>

                {/* Business Logo Upload */}
                <div className="relative group">
                  <div 
                    className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-300 hover:border-fem-terracotta transition-colors cursor-pointer overflow-hidden"
                    onClick={() => handleLogoUpload()}
                  >
                    {businessData.business_logo_url ? (
                      <img 
                        src={businessData.business_logo_url} 
                        alt="Business Logo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {businessData.business_logo_url ? 'Change Logo' : 'Add Logo'}
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

          {/* Debug Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Debug & Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Authentication Status</h4>
                  <div className="text-sm space-y-1">
                    <p>User: {user?.partnership_number || 'None'} ({user?.user_type || 'None'})</p>
                    <p>Access Token: {apiService.getAuthToken() ? 'Present' : 'Missing'}</p>
                    <p>Refresh Token: {localStorage.getItem('refresh_token') ? 'Present' : 'Missing'}</p>
                    <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Debug Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => forceReAuth()}
                      className="w-full"
                    >
                      Force Re-authentication
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => apiService.debugAllBusinesses()}
                      className="w-full"
                    >
                      Debug All Businesses
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => loadBusinessData()}
                      className="w-full"
                    >
                      Test Simple Method
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => apiService.logAuthStatus()}
                      className="w-full"
                    >
                      Log Auth Status
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{services.length}</div>
                        <div className="text-sm text-blue-600">Active Services</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{products.length}</div>
                        <div className="text-sm text-green-600">Active Products</div>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{businessData.review_count}</div>
                      <div className="text-sm text-yellow-600">Total Reviews</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Business Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Business Hours</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                    {businessHours.map((hour) => (
                      <div key={hour.day_of_week} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900 mb-1">
                          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][hour.day_of_week]}
                        </div>
                        <div className="text-sm text-gray-600">
                          {hour.is_closed ? 'Closed' : `${hour.open_time || 'N/A'} - ${hour.close_time || 'N/A'}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Business Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Tag className="h-5 w-5" />
                    <span>Business Features & Amenities</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {/* TODO: Display actual features from API */}
                    {['Free Wi-Fi', 'Parking Available', 'Wheelchair Accessible', 'Credit Cards Accepted'].map((feature) => (
                      <Badge key={feature} variant="secondary" className="px-3 py-1">
                        {feature}
                      </Badge>
                    ))}
                  </div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <Badge variant={service.is_active ? "default" : "secondary"}>
                          {service.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4" />
                          <span>{service.price_range}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{product.description}</p>
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center justify-between">
                          <span>Price:</span>
                          <span className="font-semibold text-gray-900">
                            ${product.price} {product.price_currency}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4" />
                          <span>{product.in_stock ? "In Stock" : "Out of Stock"}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Analytics dashboard will be available soon! Track your business performance, 
                    customer engagement, and growth metrics.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};
