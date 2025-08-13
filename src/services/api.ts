import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Extend axios config to include _retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Types
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  partnership_number: string; // Primary unique identifier for church members
  email?: string;
  phone?: string;
  user_type: 'community' | 'business';
  profile_image_url?: string;
  bio?: string;
  address?: string;
  county?: string;
  city?: string;
  is_verified: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    partnership_number?: string;
  } | null;
  business_name: string;
  category?: Category | null;
  description?: string;
  long_description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address: string;
  city?: string;
  county?: string;
  state?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  rating: number | string;
  review_count: number;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  business_image_url?: string;
  business_logo_url?: string;
  // Social media links
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  created_at: string;
  updated_at: string;
  // Embedded services and products from API response
  services?: Service[];
  products?: Product[];
  hours?: BusinessHour[];
  reviews?: Review[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Service {
  id?: string | number; // Make optional since we generate it dynamically
  business: string | {
    id: string;
    business_name: string;
    category?: Category | null;
    city?: string;
    county?: string;
    rating: number | string;
    is_verified: boolean;
    is_active: boolean;
  };
  name: string;
  description?: string;
  price_range?: string;
  duration?: string;
  service_image_url?: string;
  is_active?: boolean; // Make optional
  is_available?: boolean; // Add this field for business services
  // Multiple images support (up to 10)
  images?: string[];
  created_at?: string; // Make optional since business services might not have this
}

export interface Product {
  id?: string; // Make optional since we generate it dynamically
  business: string | {
    id: string;
    business_name: string;
    category?: Category | null;
    city?: string;
    county?: string;
    rating: number | string;
    is_verified: boolean;
    is_active: boolean;
  };
  name: string;
  description?: string;
  price: number;
  price_currency: string;
  product_image_url?: string;
  // Multiple images support (up to 10)
  images?: string[];
  is_active?: boolean; // Make optional
  in_stock: boolean;
  created_at?: string; // Make optional since business products might not have this
}

export interface BusinessHour {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface Review {
  id: number;
  business: string;
  user: string;
  rating: number;
  review_text?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  partnership_number?: string;
  identifier?: string; // email or phone
  auth_method?: 'email' | 'phone';
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  partnership_number: string;
  email?: string;
  phone?: string;
  user_type: 'community' | 'business';
  password: string;
}

export interface BusinessCreateRequest {
  business_name: string;
  category_id: number;
  description?: string;
  long_description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address: string;
  city?: string;
  county?: string;
  state?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  business_image_url?: string;
  business_logo_url?: string;
  // Social media links
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  // Additional fields for business registration
  hours?: Array<{
    day_of_week: number;
    open_time?: string;
    close_time?: string;
    is_closed: boolean;
  }>;
  services?: Array<{
    name: string;
    description?: string;
    price_range?: string;
    duration?: string;
    is_available?: boolean;
    images?: string[]; // Up to 10 images
  }>;
  products?: Array<{
    name: string;
    description?: string;
    price: string;
    is_available?: boolean;
    images?: string[]; // Up to 10 images
  }>;
  features?: string[];
  photo_request?: string | null;
  photo_request_notes?: string | null;
}

export interface OTPRequest {
  email?: string;
  phone?: string;
  purpose: 'registration' | 'password_reset' | 'email_verification' | 'phone_verification';
}

export interface OTPVerificationRequest {
  email?: string;
  phone?: string;
  otp: string;
  purpose: 'registration' | 'password_reset' | 'email_verification' | 'phone_verification';
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && originalRequest && !(originalRequest as ExtendedAxiosRequestConfig)._retry) {
          (originalRequest as ExtendedAxiosRequestConfig)._retry = true;
          
          try {
            console.log('Token expired, attempting refresh...');
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('access_token', response.access);
              
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${response.access}`;
              }
              
              console.log('Token refreshed successfully, retrying request...');
              return this.api(originalRequest);
            } else {
              console.log('No refresh token found, clearing auth state...');
              this.clearAuthState();
            }
          } catch (refreshError) {
            console.log('Token refresh failed, clearing auth state...', refreshError);
            // Refresh token failed, clear auth state and redirect to home page
            this.clearAuthState();
            window.location.href = '/';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Authentication Methods
  async login(data: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.api.post('/login', data);
    // The backend wraps the response in a data field via success_response
    return response.data.data || response.data;
  }

  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.api.post('/register', data);
    // The backend wraps the response in a data field via success_response
    return response.data.data || response.data;
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        // Add timeout to prevent logout delays
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        await this.api.post('/logout', {
          refresh: refreshToken
        }, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Always clear local storage regardless of API response
      this.clearAuthState();
    }
  }

  // Generic HTTP methods for custom endpoints
  async post(endpoint: string, data: any): Promise<any> {
    const response = await this.api.post(endpoint, data);
    return response.data;
  }

  async get(endpoint: string): Promise<any> {
    const response = await this.api.get(endpoint);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await this.api.post('/refresh-token', {
      refresh: refreshToken,
    });
    return response.data;
  }

  async sendOTP(data: OTPRequest): Promise<{ message: string }> {
    const response = await this.api.post('/verify-phone', data);
    return response.data;
  }

  async verifyOTP(data: OTPVerificationRequest): Promise<{ message: string }> {
    const response = await this.api.post('/verify-phone-confirm', data);
    return response.data;
  }

  // Verify email OTP for signup
  async verifyEmailOTP(userId: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post('/verify-email-confirm', {
        user_id: userId,
        otp: otp
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying email OTP:', error);
      throw error;
    }
  }

  // Resend email OTP for signup
  async resendEmailOTP(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post('/verify-email', {
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error resending email OTP:', error);
      throw error;
    }
  }

  // Verify password reset OTP
  async verifyPasswordResetOTP(token: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post('/forgot-password', {
        token: token,
        otp: otp
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying password reset OTP:', error);
      throw error;
    }
  }

  // Resend password reset OTP
  async resendPasswordResetOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post('/forgot-password', {
        email: email
      });
      return response.data;
    } catch (error) {
      console.error('Error resending password reset OTP:', error);
      throw error;
    }
  }

  // Request password reset
  async requestPasswordReset(identifier: string, method: 'email' | 'phone'): Promise<{ success: boolean; message: string; token?: string }> {
    try {
      const response = await this.api.post('/forgot-password', {
        identifier: identifier,
        method: method
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
      }
  }

  // Reset password after OTP verification
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post('/reset-password', {
        token: token,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Business Methods
  async getBusinesses(params?: {
    search?: string;
    category?: number;
    city?: string;
    county?: string;
    rating?: number;
    is_featured?: boolean;
    ordering?: string;
    page?: number;
  }): Promise<{ results: Business[]; count: number; next?: string; previous?: string }> {
    const response = await this.api.get('/business/', { params }); // Business list is at /api/business/ endpoint
    console.log('API getBusinesses - Raw response:', response);
    console.log('API getBusinesses - response.data:', response.data);
    
    // The backend returns a direct array, not wrapped in results
    const businesses = response.data;
    
    // Check if businesses have services and products
    if (Array.isArray(businesses)) {
      businesses.forEach((business, index) => {
        console.log(`API getBusinesses - Business ${index}:`, {
          id: business.id,
          business_name: business.business_name,
          hasServices: !!business.services,
          servicesCount: business.services?.length || 0,
          hasProducts: !!business.products,
          productsCount: business.products?.length || 0,
          allKeys: Object.keys(business)
        });
      });
    }
    
    return {
      results: businesses,
      count: businesses.length,
      next: undefined,
      previous: undefined
    };
  }

  async getBusiness(id: string): Promise<Business> {
    const response = await this.api.get(`/business/${id}/`); // Business detail is at /api/business/{id}
    return response.data;
  }

  async createBusiness(data: BusinessCreateRequest): Promise<Business> {
    try {
      // Prepare the business data for the API
      const businessData = {
        business_name: data.business_name,
        category_id: data.category_id,
        description: data.description,
        long_description: data.long_description,
        phone: data.phone,
        email: data.email,
        website: data.website,
        address: data.address,
        city: data.city,
        county: data.county,
        state: data.state,
        zip_code: data.zip_code,
        latitude: data.latitude,
        longitude: data.longitude,
        business_image_url: data.business_image_url,
        business_logo_url: data.business_logo_url,
        // Social media links
        facebook_url: data.facebook_url,
        instagram_url: data.instagram_url,
        twitter_url: data.twitter_url,
        youtube_url: data.youtube_url,
        // Include additional data that the backend expects
        hours: data.hours || [],
        services: data.services || [],
        products: data.products || [],
        features: data.features || [],
        photo_request: data.photo_request || null,
        photo_request_notes: data.photo_request_notes || null
      };

      const response = await this.api.post('/business/', businessData); // Business creation is at /api/business/ endpoint
      
      // Handle the response format from the backend
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Business creation failed:', error);
      throw error;
    }
  }

  // Update existing business
  async updateBusiness(id: string, data: BusinessCreateRequest): Promise<Business> {
    try {
      // Prepare the business data for the API
      const businessData = {
        business_name: data.business_name,
        category_id: data.category_id,
        description: data.description,
        long_description: data.long_description,
        phone: data.phone,
        email: data.email,
        website: data.website,
        address: data.address,
        city: data.city,
        county: data.county,
        state: data.state,
        zip_code: data.zip_code,
        latitude: data.latitude,
        longitude: data.longitude,
        business_image_url: data.business_image_url,
        business_logo_url: data.business_logo_url,
        // Social media links
        facebook_url: data.facebook_url,
        instagram_url: data.instagram_url,
        twitter_url: data.twitter_url,
        youtube_url: data.youtube_url,
        // Include additional data that the backend expects
        hours: data.hours || [],
        services: data.services || [],
        products: data.products || [],
        features: data.features || [],
        photo_request: data.photo_request || null,
        photo_request_notes: data.photo_request_notes || null
      };

      // Use the correct backend endpoint for updates
      const response = await this.api.put(`/business/${id}/update/`, businessData);
      
      // Handle the response format from the backend
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Business update failed:', error);
      throw error;
    }
  }

  async deleteBusiness(id: string): Promise<void> {
    await this.api.delete(`/business/${id}`);
  }

  async getCurrentUserBusiness(): Promise<Business | null> {
    try {
      console.log('getCurrentUserBusiness: Starting...');
      
      // Get current user first
      const user = await this.getCurrentUser();
      console.log('getCurrentUserBusiness: Current user:', user);
      console.log('getCurrentUserBusiness: User object keys:', Object.keys(user));
      
      if (!user || !user.id) {
        console.error('getCurrentUserBusiness: No user or user ID found');
        return null;
      }
      
      // Check if user object has business information directly
      if ((user as any).business) {
        console.log('getCurrentUserBusiness: User has business field:', (user as any).business);
        return (user as any).business;
      }
      
      // Try to get business by user ID directly first
      try {
        const directResponse = await this.api.get(`/business/user/${user.id}/`);
        if (directResponse.data) {
          console.log('getCurrentUserBusiness: Found business via direct user endpoint:', directResponse.data);
          return directResponse.data;
        }
      } catch (directError) {
        console.log('getCurrentUserBusiness: Direct user endpoint failed, trying alternative method...');
      }
      
      // Try alternative endpoint format
      try {
        const altResponse = await this.api.get(`/business/?user=${user.id}`);
        if (altResponse.data && altResponse.data.results && altResponse.data.results.length > 0) {
          console.log('getCurrentUserBusiness: Found business via user query parameter:', altResponse.data.results[0]);
          return altResponse.data.results[0];
        }
      } catch (altError) {
        console.log('getCurrentUserBusiness: Alternative endpoint failed, trying main method...');
      }
      
      // Fetch businesses and find the one owned by current user
      const businessesResponse = await this.getBusinesses();
      console.log('getCurrentUserBusiness: All businesses response:', businessesResponse);
      
      // Log all businesses to see their structure
      businessesResponse.results.forEach((business, index) => {
        console.log(`getCurrentUserBusiness: Business ${index}:`, {
          id: business.id,
          user: business.user,
          business_name: business.business_name,
          allFields: Object.keys(business)
        });
      });
      
      const userBusiness = businessesResponse.results.find(business => {
        console.log('getCurrentUserBusiness: Checking business:', business.id, 'user:', business.user, 'current user:', user.id);
        
        // Check multiple possible field names for user ownership
        const possibleUserFields = ['user', 'user_id', 'owner', 'owner_id'];
        const hasUserMatch = possibleUserFields.some(field => {
          const fieldValue = (business as any)[field];
          return fieldValue === user.id;
        });
        
        console.log('getCurrentUserBusiness: User match result:', hasUserMatch);
        return hasUserMatch;
      });
      
      console.log('getCurrentUserBusiness: Found user business:', userBusiness);
      
      if (userBusiness) {
        // Get full business details including services, products, etc.
        const fullBusiness = await this.getBusiness(userBusiness.id);
        console.log('getCurrentUserBusiness: Full business details:', fullBusiness);
        return fullBusiness;
      }
      
      console.log('getCurrentUserBusiness: No business found for user');
      return null;
    } catch (error) {
      console.error('Error fetching current user business:', error);
      return null;
    }
  }

  // Alternative method to get current user's business
  async getCurrentUserBusinessSimple(): Promise<Business | null> {
    try {
      console.log('getCurrentUserBusinessSimple: Starting...');
      
      // Get current user first
      const user = await this.getCurrentUser();
      console.log('getCurrentUserBusinessSimple: Current user:', user);
      console.log('getCurrentUserBusinessSimple: User object keys:', Object.keys(user));
      console.log('getCurrentUserBusinessSimple: User ID:', user.id);
      console.log('getCurrentUserBusinessSimple: User partnership_number:', user.partnership_number);
      
      if (!user || !user.id) {
        console.error('getCurrentUserBusinessSimple: No user or user ID found');
        return null;
      }
      
      // Try to get business by user ID using path parameter (this should return a single business)
      try {
        const response = await this.api.get(`/business/user/${user.id}/`);
        console.log('getCurrentUserBusinessSimple: Direct user endpoint response:', response.data);
        console.log('getCurrentUserBusinessSimple: Response data type:', typeof response.data);
        console.log('getCurrentUserBusinessSimple: Response data keys:', response.data ? Object.keys(response.data) : 'null');
        
        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.log('getCurrentUserBusinessSimple: Direct user endpoint failed:', error);
      }
      
      // Try using partnership_number as fallback
      if (user.partnership_number) {
        try {
          const response = await this.api.get(`/business/?partnership_number=${user.partnership_number}`);
          console.log('getCurrentUserBusinessSimple: Partnership number response:', response.data);
          
          if (response.data && response.data.results && response.data.results.length > 0) {
            const business = response.data.results[0];
            console.log('getCurrentUserBusinessSimple: Found business via partnership number:', business);
            return business;
          }
        } catch (error) {
          console.log('getCurrentUserBusinessSimple: Partnership number method failed:', error);
        }
      }
      
      // Try to get business by user ID using query parameter
      try {
        const response = await this.api.get(`/business/?user=${user.id}`);
        console.log('getCurrentUserBusinessSimple: Response:', response.data);
        
        if (response.data && response.data.results && response.data.results.length > 0) {
          const business = response.data.results[0];
          console.log('getCurrentUserBusinessSimple: Found business:', business);
          return business;
        }
      } catch (error) {
        console.log('getCurrentUserBusinessSimple: Query parameter method failed:', error);
      }
      
      // Try current user business endpoint
      try {
        // Get current user ID from localStorage or context
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
          const response = await this.api.get(`/business/user/${user.id}/`);
          console.log('getCurrentUserBusinessSimple: Current business endpoint response:', response.data);
          
          if (response.data) {
            return response.data;
          }
        }
      } catch (error) {
        console.log('getCurrentUserBusinessSimple: Current business endpoint failed:', error);
      }
      
      console.log('getCurrentUserBusinessSimple: No business found');
      return null;
    } catch (error) {
      console.error('getCurrentUserBusinessSimple: Error:', error);
      return null;
    }
  }

  // Get business services
  async getBusinessServices(businessId: string): Promise<Service[]> {
    try {
      const response = await this.api.get(`/business/${businessId}/services/`);
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('Error fetching business services:', error);
      return [];
    }
  }

  // Get business products
  async getBusinessProducts(businessId: string): Promise<Product[]> {
    try {
      const response = await this.api.get(`/business/${businessId}/products/`);
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('Error fetching business products:', error);
      return [];
    }
  }

  // Get all services across all businesses
  async getAllServices(params?: {
    search?: string;
    category?: string;
    price_range?: string;
    ordering?: string;
    page?: number;
  }): Promise<{ results: Service[]; count: number; next?: string; previous?: string }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('business__category', params.category);
      if (params?.price_range) queryParams.append('price_range', params.price_range);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());

      const response = await this.api.get(`/business/services/${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all services:', error);
      return { results: [], count: 0 };
    }
  }

  // Get all products across all businesses
  async getAllProducts(params?: {
    search?: string;
    category?: string;
    in_stock?: boolean;
    price_currency?: string;
    ordering?: string;
    page?: number;
  }): Promise<{ results: Product[]; count: number; next?: string; previous?: string }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('business__category', params.category);
      if (params?.in_stock !== undefined) queryParams.append('in_stock', params.in_stock.toString());
      if (params?.price_currency) queryParams.append('price_currency', params.price_currency);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());

      const response = await this.api.get(`/business/products/${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all products:', error);
      return { results: [], count: 0 };
    }
  }

  // Get business hours
  async getBusinessHours(businessId: string): Promise<Array<{
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
  }>> {
    try {
      const response = await this.api.get(`/business/${businessId}/hours/`);
      // Backend returns { success: true, data: [...] }
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching business hours:', error);
      return [];
    }
  }

  // Get business analytics
  async getBusinessAnalytics(businessId: string): Promise<{
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
  } | null> {
    try {
      const response = await this.api.get(`/business/${businessId}/analytics/`);
      return response.data.data || null;
    } catch (error) {
      console.error('Error fetching business analytics:', error);
      return null;
    }
  }

  // Update business hours
  async updateBusinessHours(businessId: string, hours: Array<{
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
  }>): Promise<Array<{
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
  }>> {
    try {
      const response = await this.api.post(`/business/${businessId}/hours/`, { hours });
      return response.data.data || [];
    } catch (error) {
      console.error('Error updating business hours:', error);
      throw error;
    }
  }

  // Upload business image using S3 pre-signed URLs
  async getImageUploadUrl(businessId: string, imageType: 'image' | 'logo', fileName: string, contentType: string): Promise<{
    presigned_url: string;
    file_key: string;
    expires_in_minutes: number;
    image_type: string;
  }> {
    try {
      const response = await this.api.post(`/business/${businessId}/upload-image/`, {
        image_type: imageType,
        file_name: fileName,
        content_type: contentType
      });
      return response.data.data;
    } catch (error) {
      console.error('Error getting upload URL:', error);
      throw error;
    }
  }

  // Update business image using S3 pre-signed URLs
  async updateBusinessImage(businessId: string, imageType: 'image' | 'logo', fileKey: string): Promise<{
    business_image_url: string | null;
    business_logo_url: string | null;
    s3_url: string;
  }> {
    try {
      const response = await this.api.put(`/business/${businessId}/upload-image/`, {
        image_type: imageType,
        file_key: fileKey
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating business image:', error);
      throw error;
    }
  }

  // Upload file directly to S3 using pre-signed URL
  async uploadFileToS3(presignedUrl: string, file: File): Promise<boolean> {
    try {
      console.log('Starting S3 upload with presigned URL:', presignedUrl);
      console.log('File details:', { name: file.name, type: file.type, size: file.size });
      
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          'Cache-Control': 'no-cache',
        },
        mode: 'cors',
        credentials: 'omit', // Don't send cookies to S3
      });
      
      console.log('S3 upload response:', { status: response.status, statusText: response.statusText });
      
      if (response.ok) {
        console.log('S3 upload successful');
        return true;
      } else {
        console.error('S3 upload failed:', response.status, response.statusText);
        // Try to get response text for more details
        try {
          const errorText = await response.text();
          console.error('S3 error response:', errorText);
        } catch (e) {
          console.error('Could not read error response:', e);
        }
        return false;
      }
    } catch (error) {
      console.error('Error uploading to S3:', error);
      return false;
    }
  }

  // Hardcoded categories that match the database (same as frontend)
  private hardcodedCategories = [
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

  // Get categories from backend API
  async getCategories(): Promise<{ results: Category[]; count: number }> {
    try {
      const response = await this.api.get('/business/categories/');
      // The backend returns a direct array, not wrapped in results
      const categories = response.data;
      return {
        results: categories,
        count: categories.length
      };
    } catch (error) {
      console.error('Error fetching categories from API, falling back to hardcoded:', error);
      // Fallback to hardcoded categories if API fails
      return {
        results: this.hardcodedCategories,
        count: this.hardcodedCategories.length
      };
    }
  }

  async toggleFavorite(businessId: string): Promise<{ message: string }> {
    const response = await this.api.post(`/business/${businessId}/favorite`);
    return response.data;
  }

  // Product Methods
  async createProduct(businessId: string, data: {
    name: string;
    description?: string;
    price: number;
    price_currency?: string;
    product_image_url?: string;
    images?: string[]; // Up to 10 images
    in_stock?: boolean;
  }): Promise<Product> {
    const productData = {
      ...data,
      business: businessId
    };
    const response = await this.api.post(`/business/${businessId}/products/`, productData);
    return response.data;
  }

  async updateProduct(productId: string, data: Partial<Product>): Promise<Product> {
    const response = await this.api.put(`/business/products/${productId}/`, data);
    return response.data;
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.api.delete(`/business/products/${productId}/`);
  }

  // Review Methods
  async getBusinessReviews(businessId: string): Promise<Review[]> {
    const response = await this.api.get(`/business/${businessId}/reviews/`);
    return response.data;
  }

  async createReview(businessId: string, data: {
    rating: number;
    review_text?: string;
  }): Promise<Review> {
    const reviewData = {
      ...data,
      business: businessId
    };
    const response = await this.api.post(`/business/${businessId}/reviews/`, reviewData);
    return response.data;
  }

  async updateReview(businessId: string, reviewId: number, data: {
    rating?: number;
    review_text?: string;
  }): Promise<Review> {
    const response = await this.api.put(`/business/${businessId}/reviews/${reviewId}/`, data);
    return response.data;
  }

  async deleteReview(businessId: string, reviewId: number): Promise<void> {
    await this.api.delete(`/business/${businessId}/reviews/${reviewId}/`);
  }

  async getUserReview(businessId: string): Promise<Review | null> {
    try {
      const response = await this.api.get(`/business/${businessId}/reviews/`);
      const reviews = response.data;
      // Find the current user's review
      return reviews.find((review: Review) => review.user === 'current_user') || null;
    } catch (error) {
      return null;
    }
  }

  // User Methods
  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/profile');
    // Handle nested response structure: { success: true, message: "...", data: { user_data } }
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    // Fallback to direct response.data if no nesting
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.api.put('/profile-update', data);
    // Handle nested response structure: { success: true, message: "...", data: { user_data } }
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    // Fallback to direct response.data if no nesting
    return response.data;
  }

  // Utility Methods
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    // Check if token is expired (JWT tokens have expiration)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      if (payload.exp && payload.exp < currentTime) {
        console.log('Token is expired, clearing auth state...');
        this.clearAuthState();
        return false;
      }
      return true;
    } catch (error) {
      console.log('Error parsing token, clearing auth state...', error);
      this.clearAuthState();
      return false;
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return false;
      
      // Make a simple API call to validate the token
      await this.api.get('/profile');
      return true;
    } catch (error) {
      console.log('Token validation failed:', error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        this.clearAuthState();
      }
      return false;
    }
  }

  getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }

  setAuthTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }

  clearAuthState(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Debug method to get all businesses and their structure
  async debugAllBusinesses(): Promise<void> {
    try {
      console.log('=== DEBUG: Getting all businesses ===');
      const response = await this.api.get('/business/');
      console.log('All businesses response:', response.data);
      
      if (response.data && response.data.results) {
        response.data.results.forEach((business: any, index: number) => {
          console.log(`Business ${index}:`, {
            id: business.id,
            business_name: business.business_name,
            user: business.user,
            user_id: (business as any).user_id,
            owner: (business as any).owner,
            owner_id: (business as any).owner_id,
            allFields: Object.keys(business)
          });
        });
      }
    } catch (error) {
      console.error('Debug: Error getting all businesses:', error);
    }
  }

  // Debug method to log current authentication status
  logAuthStatus(): void {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    console.log('=== AUTH STATUS DEBUG ===');
    console.log('Access Token:', accessToken ? 'Present' : 'Missing');
    console.log('Refresh Token:', refreshToken ? 'Present' : 'Missing');
    
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const isExpired = payload.exp && payload.exp < currentTime;
        
        console.log('Token Payload:', {
          issuedAt: new Date(payload.iat * 1000),
          expiresAt: new Date(payload.exp * 1000),
          isExpired,
          timeUntilExpiry: payload.exp ? `${Math.floor((payload.exp - currentTime) / 60)} minutes` : 'Unknown'
        });
      } catch (error) {
        console.log('Error parsing token:', error);
      }
    }
    
    console.log('Is Authenticated (local):', this.isAuthenticated());
    console.log('========================');
  }

  // Service Methods
  async createService(businessId: string, data: {
    name: string;
    description?: string;
    price_range?: string;
    duration?: string;
    images?: string[]; // Up to 10 images
    is_active?: boolean;
  }): Promise<Service> {
    const serviceData = {
      ...data,
      business: businessId
    };
    const response = await this.api.post(`/business/${businessId}/services/`, serviceData);
    return response.data;
  }

  async updateService(serviceId: string, data: Partial<Service>): Promise<Service> {
    const response = await this.api.put(`/business/services/${serviceId}/`, data);
    return response.data;
  }

  async deleteService(serviceId: string): Promise<void> {
    await this.api.delete(`/business/services/${serviceId}/`);
  }

  // Service Image Upload using S3 pre-signed URLs
  async getServiceImageUploadUrl(serviceId: string, imageType: 'main' | 'additional', fileName: string, contentType: string): Promise<{
    presigned_url: string;
    file_key: string;
    expires_in_minutes: number;
    image_type: string;
  }> {
    try {
      const response = await this.api.post(`/business/services/${serviceId}/upload-image/`, {
        image_type: imageType,
        file_name: fileName,
        content_type: contentType
      });
      return response.data;
    } catch (error) {
      console.error('Error getting service image upload URL:', error);
      throw error;
    }
  }

  // Update service with uploaded image
  async updateServiceImage(serviceId: string, imageType: 'main' | 'additional', fileKey: string): Promise<{
    service_image_url: string | null;
    images: string[];
    s3_url: string;
  }> {
    try {
      const response = await this.api.put(`/business/services/${serviceId}/update-image/`, {
        image_type: imageType,
        file_key: fileKey
      });
      return response.data;
    } catch (error) {
      console.error('Error updating service image:', error);
      throw error;
    }
  }

  // Product Image Upload using S3 pre-signed URLs
  async getProductImageUploadUrl(productId: string, imageType: 'main' | 'additional', fileName: string, contentType: string): Promise<{
    presigned_url: string;
    file_key: string;
    expires_in_minutes: number;
    image_type: string;
  }> {
    try {
      const response = await this.api.post(`/business/products/${productId}/upload-image/`, {
        image_type: imageType,
        file_name: fileName,
        content_type: contentType
      });
      return response.data;
    } catch (error) {
      console.error('Error getting product image upload URL:', error);
      throw error;
    }
  }

  // Update product with uploaded image
  async updateProductImage(productId: string, imageType: 'main' | 'additional', fileKey: string): Promise<{
    product_image_url: string | null;
    images: string[];
    s3_url: string;
  }> {
    try {
      const response = await this.api.put(`/business/products/${productId}/update-image/`, {
        image_type: imageType,
        file_key: fileKey
      });
      return response.data;
    } catch (error) {
      console.error('Error updating product image:', error);
      throw error;
    }
  }

  // Profile Photo Upload using S3 pre-signed URLs
  async getProfilePhotoUploadUrl(fileName: string, contentType: string): Promise<{
    presigned_url: string;
    file_key: string;
    expires_in_minutes: number;
  }> {
    try {
      const response = await this.api.post('/profile-photo-upload-url', {
        file_name: fileName,
        content_type: contentType
      });
      return response.data;
    } catch (error) {
      console.error('Error getting profile photo upload URL:', error);
      throw error;
    }
  }

  // Update profile with uploaded photo
  async updateProfilePhoto(fileKey: string): Promise<{
    profile_image_url: string | null;
    s3_url: string;
  }> {
    try {
      const response = await this.api.put('/profile-photo-update', {
        file_key: fileKey
      });
      return response.data;
    } catch (error) {
      console.error('Error updating profile photo:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService(); 