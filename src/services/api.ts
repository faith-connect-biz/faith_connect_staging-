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
  website?: string;  // Add website field
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
  // Owner information
  owner_partnership_number?: string;
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
  like_count: number;
  is_liked_by_user: boolean;
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
  services_data?: Array<{
    name: string;
    description?: string;
    price_range?: string;
    duration?: string;
    is_available?: boolean;
    photos?: string[]; // Up to 5 images
  }>;
  products_data?: Array<{
    name: string;
    description?: string;
    price: string;
    is_available?: boolean;
    photos?: string[]; // Up to 5 images
  }>;
  features?: string[];
  photo_request?: string | null;
  photo_request_notes?: string | null;
}

export interface OTPRequest {
  email?: string;
  phone?: string;
  purpose?: 'registration' | 'password_reset' | 'email_verification' | 'phone_verification';
}

export interface OTPVerificationRequest {
  email?: string;
  phone?: string;
  otp: string;
  purpose?: 'registration' | 'password_reset' | 'email_verification' | 'phone_verification';
}

export interface PhotoRequest {
  id: string;
  business: string;
  user: string;
  user_name: string;
  business_name: string;
  request_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  notes?: string;
  business_response?: string;
  completed_date?: string;
}

export interface CreatePhotoRequestData {
  business: string;
  notes?: string;
}

export interface BusinessLike {
  id: string;
  user: string;
  business: string;
  user_name: string;
  business_name: string;
  created_at: string;
}

export interface ReviewLike {
  id: string;
  user: string;
  review: string;
  user_name: string;
  review_text: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user: string;
  business: string;
  business_name: string;
  business_category: string;
  created_at: string;
}

export interface UserActivity {
  type: 'favorite' | 'business_like' | 'review_like' | 'review';
  id: string;
  business_name: string;
  business_category: string;
  date: string;
  business_id: string;
  rating?: number;
  review_text?: string;
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://femdjango-production.up.railway.app/api';

// Debug: Log the API base URL
console.log('🔧 API Configuration:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_BASE_URL: API_BASE_URL,
  NODE_ENV: import.meta.env.MODE
});

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
        // List of public endpoints that don't require authentication
        const publicEndpoints = [
          'register',
          'verify-registration-otp',
          'resend-otp',
          'login',
          'logout',
          'refresh-token',
          'verify-email',
          'verify-email-confirm',
          'verify-phone',
          'forgot-password',
          'reset-password',
          'categories'
        ];
        
        // Check if the current endpoint is public
        const isPublicEndpoint = publicEndpoints.some(endpoint => 
          config.url?.includes(endpoint)
        );
        
        // Public business GET endpoints (read-only). All write actions require auth.
        const method = (config.method || 'get').toLowerCase();
        const isBusinessPath = !!config.url?.includes('/business/');
        const isWriteMethod = method !== 'get';
        const isRestrictedSegment = config.url?.includes('/user-activity/') ||
          config.url?.includes('/favorites/') ||
          config.url?.includes('/like/') ||
          config.url?.includes('/photo-request/');
        // Allow unauthenticated only for GETs to business resources and reviews listing
        // IMPORTANT: POST/PUT/DELETE requests to business endpoints require authentication
        const isPublicBusinessEndpoint = isBusinessPath && !isWriteMethod && !isRestrictedSegment;
        

        
        // Only add auth token for protected endpoints
        // If it's a public endpoint OR a public business endpoint, don't add auth
        if (!isPublicEndpoint && !isPublicBusinessEndpoint) {
          const token = localStorage.getItem('access_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
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
              console.log('Refresh response:', response);
              
              // Handle different response structures
              const newAccessToken = response.access || response.access_token || response.data?.access || response.data?.access_token;
              
              if (newAccessToken) {
                console.log('New access token received, storing in localStorage');
                localStorage.setItem('access_token', newAccessToken);
                
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                
                console.log('Token refreshed successfully, retrying request...');
                return this.api(originalRequest);
              } else {
                console.log('No access token in refresh response:', response);
                throw new Error('No access token in refresh response');
              }
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

  async register(data: RegisterRequest): Promise<{ 
    success: boolean; 
    message: string; 
    user_id?: number; 
    registration_token?: string;
    requires_otp?: boolean; 
    otp_sent_to?: string; 
    user?: User; 
    tokens?: AuthTokens; 
  }> {
    const response = await this.api.post('/register', data);
    // The backend now creates user in DB and sends OTP - user must verify OTP to activate
    return response.data;
  }

  // New method to verify registration OTP
  async verifyRegistrationOTP(userId: number, otp: string): Promise<{ 
    success: boolean; 
    message: string; 
    user?: User; 
    tokens?: AuthTokens; 
  }> {
    const response = await this.api.post('/verify-registration-otp', {
      user_id: userId,
      otp: otp
    });
    return response.data;
  }

  // New method to verify registration OTP using registration token
  async verifyRegistrationOTPWithToken(registrationToken: string, otp: string): Promise<{ 
    success: boolean; 
    message: string; 
    user?: User; 
    tokens?: AuthTokens; 
  }> {
    const response = await this.api.post('/verify-registration-otp', {
      registration_token: registrationToken,
      otp: otp
    });
    return response.data;
  }

  // New method to resend registration OTP
  async resendRegistrationOTP(userId: number): Promise<{ 
    success: boolean; 
    message: string; 
    otp_sent_to?: string; 
  }> {
    const response = await this.api.post('/resend-otp', {
      user_id: userId
    });
    return response.data;
  }

  // New method to resend registration OTP using registration token
  async resendRegistrationOTPWithToken(registrationToken: string): Promise<{ 
    success: boolean; 
    message: string; 
    otp_sent_to?: string; 
  }> {
    const response = await this.api.post('/resend-otp', {
      registration_token: registrationToken
    });
    return response.data;
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

  async refreshToken(refreshToken: string): Promise<any> {
    const response = await this.api.post('/refresh-token', {
      refresh: refreshToken,
    });
    return response.data;
  }

  async sendOTP(data: OTPRequest): Promise<{ success: boolean; message: string }> {
    const response = await this.api.post('/verify-phone', data);
    return response.data;
  }

  async verifyOTP(data: OTPVerificationRequest): Promise<{ success: boolean; message: string }> {
    const response = await this.api.post('/verify-registration-otp', data);
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

  // Reset password with identifier + OTP (server supports this contract)
  async resetPasswordWithOTP(identifier: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post('/reset-password', {
        identifier,
        otp,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting password with OTP:', error);
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
    limit?: number;
    offset?: number;
  }): Promise<{ results: Business[]; count: number; next?: string; previous?: string }> {
    console.log('API getBusinesses - params received:', params);
    const response = await this.api.get('/business/', { params }); // Business list is at /api/business/ endpoint
    console.log('API getBusinesses - Raw response:', response);
    console.log('API getBusinesses - response.data:', response.data);
    
    // Handle both response formats:
    // 1. Direct array response: [business1, business2, ...]
    // 2. Paginated response: { count, next, previous, results }
    let businesses: Business[] = [];
    let count = 0;
    let next = undefined;
    let previous = undefined;
    
    if (Array.isArray(response.data)) {
      // Direct array response
      businesses = response.data;
      count = businesses.length;
    } else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      // Paginated response
      businesses = response.data.results || [];
      count = response.data.count || 0;
      next = response.data.next || undefined;
      previous = response.data.previous || undefined;
    } else {
      // Fallback
      businesses = [];
      count = 0;
    }
    
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
    
    // Return the properly parsed response
    return {
      results: businesses,
      count: count,
      next: next,
      previous: previous
    };
  }

  async getBusiness(id: string): Promise<Business> {
    const response = await this.api.get(`/business/${id}/`); // Business detail is at /api/business/{id}
    return response.data;
  }

  async createBusiness(data: BusinessCreateRequest): Promise<Business> {
    try {
      // Check if user already has a business
      const existingBusiness = await this.getUserBusiness();
      if (existingBusiness) {
        throw new Error('Business owners can only have one business. You already have a registered business.');
      }

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
        services_data: data.services_data || [],
        products_data: data.products_data || [],
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
        services_data: data.services_data || [],
        products_data: data.products_data || [],
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

  // DEPRECATED: This method is dangerous and can cause security issues
  // Use getUserBusiness() instead which properly filters by current user
  async getCurrentUserBusiness(): Promise<Business | null> {
    console.warn('getCurrentUserBusiness is deprecated. Use getUserBusiness() instead.');
    return this.getUserBusiness();
  }

  // DEPRECATED: This method is dangerous and can cause security issues
  // Use getUserBusiness() instead which properly filters by current user
  async getCurrentUserBusinessSimple(): Promise<Business | null> {
    console.warn('getCurrentUserBusinessSimple is deprecated. Use getUserBusiness() instead.');
    return this.getUserBusiness();
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
    duration?: string;
    ordering?: string;
    page?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ results: Service[]; count: number; next?: string; previous?: string }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('business__category', params.category);
      if (params?.price_range) queryParams.append('price_range', params.price_range);
      if (params?.duration) queryParams.append('duration', params.duration);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const response = await this.api.get(`/business/services/${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
      console.log('API getAllServices - Raw response:', response);
      console.log('API getAllServices - Response data:', response.data);
      console.log('API getAllServices - Response data type:', typeof response.data);
      console.log('API getAllServices - Response data keys:', Object.keys(response.data || {}));
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
    limit?: number;
    offset?: number;
  }): Promise<{ results: Product[]; count: number; next?: string; previous?: string }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('business__category', params.category);
      if (params?.in_stock !== undefined) queryParams.append('in_stock', params.in_stock.toString());
      if (params?.price_currency) queryParams.append('price_currency', params.price_currency);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const response = await this.api.get(`/business/products/${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
      console.log('API getAllProducts - Raw response:', response);
      console.log('API getAllProducts - Response data:', response.data);
      console.log('API getAllProducts - Response data type:', typeof response.data);
      console.log('API getAllProducts - Response data keys:', Object.keys(response.data || {}));
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
      console.log('API: Updating business hours for business:', businessId);
      console.log('API: Hours data being sent:', JSON.stringify(hours, null, 2));
      
      const response = await this.api.post(`/business/${businessId}/hours/`, { hours });
      console.log('API: Business hours update response:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('API: Error updating business hours:', error);
      if (error.response) {
        console.error('API: Error response status:', error.response.status);
        console.error('API: Error response data:', error.response.data);
      }
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
    { id: 20, name: 'Pet Services & Veterinary 🐾', slug: 'pet-services-veterinary' }
  ];

  // Get categories from backend API
  async getCategories(): Promise<{ results: Category[]; count: number }> {
    try {
      // Attempt to fetch all pages if the endpoint is paginated
      const first = await this.api.get('/business/categories/');
      const data = first.data;

      let categories: Category[] = [];
      let count = 0;

      if (Array.isArray(data)) {
        categories = data;
        count = categories.length;
      } else if (data && typeof data === 'object' && 'results' in data) {
        // Collect all pages
        categories = data.results || [];
        count = data.count || categories.length;

        let nextUrl = data.next as string | null | undefined;
        while (nextUrl) {
          const page = await this.api.get(nextUrl.startsWith('http') ? nextUrl : nextUrl.replace(/^\/api/, ''));
          const pageData = page.data;
          if (pageData?.results) {
            categories = categories.concat(pageData.results);
            nextUrl = pageData.next;
          } else {
            nextUrl = null;
          }
        }
      } else {
        categories = [];
        count = 0;
      }

      return { results: categories, count };
    } catch (error) {
      console.error('Error fetching categories from API, falling back to hardcoded:', error);
      return {
        results: this.hardcodedCategories,
        count: this.hardcodedCategories.length,
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
    price_currency: string;
    images?: string[]; // Up to 10 images
    in_stock?: boolean;
    is_active?: boolean;
  }): Promise<Product> {
    const productData = {
      ...data,
      business: businessId
    };
    const response = await this.api.post(`/business/${businessId}/products/`, productData);
    return response.data;
  }

  // Get product by ID
  async getProduct(productId: string): Promise<Product> {
    try {
      const response = await this.api.get(`/business/products/${productId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Update product
  async updateProduct(productId: string, data: Partial<Product>): Promise<Product> {
    try {
      const response = await this.api.put(`/business/products/${productId}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product
  async deleteProduct(productId: string): Promise<void> {
    await this.api.delete(`/business/products/${productId}/`);
  }

  // Review Methods
  async getBusinessReviews(businessId: string): Promise<Review[]> {
    const response = await this.api.get(`/business/${businessId}/reviews/`);
    // The API returns a paginated response with { count, next, previous, results }
    // We need to return the results array
    return response.data.results || response.data;
  }

  // Check if current user owns a business
  async getUserBusiness(): Promise<Business | null> {
    try {
      const response = await this.api.get('/business/my-business/');
      // Handle structured response: { success: true, data: {...} }
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      // Fallback to direct response.data if no nesting
      return response.data;
    } catch (error) {
      // If user doesn't have a business, return null
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Check if user can review a business (business owners cannot review their own business)
  async canUserReviewBusiness(businessId: string): Promise<boolean> {
    try {
      const userBusiness = await this.getUserBusiness();
      if (userBusiness && userBusiness.id === businessId) {
        return false; // User owns this business, cannot review
      }
      return true;
    } catch (error) {
      console.error('Error checking if user can review business:', error);
      return true; // Default to allowing review if check fails
    }
  }

  // Check if current user owns a specific business
  async isBusinessOwner(businessId: string): Promise<boolean> {
    try {
      const userBusiness = await this.getUserBusiness();
      return userBusiness?.id === businessId;
    } catch (error) {
      console.error('Error checking if user owns business:', error);
      return false;
    }
  }

  async createReview(businessId: string, data: {
    rating: number;
    review_text?: string;
  }): Promise<Review> {
    // Check if user can review this business
    const canReview = await this.canUserReviewBusiness(businessId);
    if (!canReview) {
      throw new Error('Business owners cannot review their own businesses');
    }

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

  async updateProfile(data: Partial<User>): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const response = await this.api.patch('/profile-update', data);
      return response.data;  // Return the response data directly
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
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
        this.clearAuthState();
        return false;
      }
      return true;
    } catch (error) {
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

  async getService(serviceId: string): Promise<Service> {
    const response = await this.api.get(`/business/services/${serviceId}/`);
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

  // Upload product image using S3 pre-signed URLs
  async uploadProductImage(productId: string, imageFile: File): Promise<{ success: boolean; image_url?: string; message: string }> {
    try {
      // Get pre-signed URL for upload
      const uploadUrlResponse = await this.api.post(`/business/products/${productId}/upload-image/`, {
        file_name: imageFile.name,
        content_type: imageFile.type
      });

      if (!uploadUrlResponse.data.success) {
        throw new Error(uploadUrlResponse.data.message || 'Failed to get upload URL');
      }

      const { upload_url, fields, file_key } = uploadUrlResponse.data;

      // Create FormData for S3 upload
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', imageFile);

      // Upload to S3
      const s3Response = await fetch(upload_url, {
        method: 'POST',
        body: formData
      });

      if (!s3Response.ok) {
        throw new Error(`S3 upload failed: ${s3Response.statusText}`);
      }

      // Update product with new image URL
      const updateResponse = await this.api.put(`/business/products/${productId}/update-image/`, {
        image_url: `https://${process.env.REACT_APP_S3_BUCKET}.s3.amazonaws.com/${file_key}`
      });

      if (updateResponse.data.success) {
        return {
          success: true,
          image_url: updateResponse.data.image_url,
          message: 'Image uploaded successfully'
        };
      } else {
        throw new Error(updateResponse.data.message || 'Failed to update product image');
      }
    } catch (error) {
      console.error('Error uploading product image:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload image'
      };
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

  // Business Profile Image Upload using S3 pre-signed URLs
  async getBusinessProfileImageUploadUrl(businessId: string, fileName: string, contentType: string): Promise<{
    presigned_url: string;
    file_key: string;
    expires_in_minutes: number;
  }> {
    try {
      const response = await this.api.post(`business/${businessId}/upload-profile-image/`, {
        file_name: fileName,
        content_type: contentType
      });
      return response.data;
    } catch (error) {
      console.error('Error getting business profile image upload URL:', error);
      throw error;
    }
  }

  // Update business with uploaded profile image
  async updateBusinessProfileImage(businessId: string, fileKey: string): Promise<{
    business_image_url: string;
    s3_url: string;
  }> {
    try {
      const response = await this.api.put(`business/${businessId}/update-profile-image/`, {
        file_key: fileKey
      });
      return response.data;
    } catch (error) {
      console.error('Error updating business profile image:', error);
      throw error;
    }
  }

  // Business Logo Upload using S3 pre-signed URLs
  async getBusinessLogoUploadUrl(businessId: string, fileName: string, contentType: string): Promise<{
    presigned_url: string;
    file_key: string;
    expires_in_minutes: number;
  }> {
    try {
      const response = await this.api.post(`business/${businessId}/upload-logo/`, {
        file_name: fileName,
        content_type: contentType
      });
      return response.data;
    } catch (error) {
      console.error('Error getting business logo upload URL:', error);
      throw error;
    }
  }

  // Update business with uploaded logo
  async updateBusinessLogo(businessId: string, fileKey: string): Promise<{
    business_logo_url: string;
    s3_url: string;
  }> {
    try {
      const response = await this.api.put(`business/${businessId}/update-logo/`, {
        file_key: fileKey
      });
      return response.data;
    } catch (error) {
      console.error('Error updating business logo:', error);
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

  // Photo Request Methods
  async createPhotoRequest(data: CreatePhotoRequestData): Promise<PhotoRequest> {
    try {
      const response = await this.api.post(`/business/${data.business}/photo-request/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating photo request:', error);
      throw error;
    }
  }

  async getPhotoRequests(): Promise<PhotoRequest[]> {
    try {
      const response = await this.api.get('/business/photo-requests/');
      return response.data;
    } catch (error) {
      console.error('Error fetching photo requests:', error);
      throw error;
    }
  }

  async updatePhotoRequest(id: string, data: Partial<PhotoRequest>): Promise<PhotoRequest> {
    try {
      const response = await this.api.patch(`/business/photo-requests/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating photo request:', error);
      throw error;
    }
  }

  // Like Methods
  async toggleBusinessLike(businessId: string): Promise<{ liked: boolean; message: string }> {
    try {
      const response = await this.api.post(`/business/${businessId}/like/`);
      return response.data;
    } catch (error) {
      console.error('Error toggling business like:', error);
      throw error;
    }
  }

  async toggleReviewLike(reviewId: string): Promise<{ liked: boolean; message: string }> {
    try {
      const response = await this.api.post(`/business/reviews/${reviewId}/like/`);
      return response.data;
    } catch (error) {
      console.error('Error toggling review like:', error);
      throw error;
    }
  }

  // User Activity Methods
  async getUserActivity(): Promise<{ activities: UserActivity[]; total_count: number }> {
    try {
      const response = await this.api.get('/business/user-activity/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  }

  // User Favorites Methods
  async getUserFavorites(): Promise<Favorite[]> {
    try {
      const response = await this.api.get('/business/favorites/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      throw error;
    }
  }

  // User Reviews Methods
  async getUserReviews(): Promise<Review[]> {
    try {
      const response = await this.api.get('/business/user-reviews/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  }

  // Get user's liked reviews
  async getUserLikedReviews(): Promise<string[]> {
    try {
      const response = await this.api.get('/business/user-liked-reviews/');
      return response.data.liked_review_ids || [];
    } catch (error) {
      console.error('Error fetching user liked reviews:', error);
      return [];
    }
  }

  // Product Review Methods
  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const response = await this.api.get(`/business/products/${productId}/reviews/`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return [];
    }
  }

  async createProductReview(productId: string, data: {
    rating: number;
    review_text?: string;
  }): Promise<Review> {
    try {
      const response = await this.api.post(`/business/products/${productId}/reviews/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating product review:', error);
      throw error;
    }
  }

  // Service Review Methods
  async getServiceReviews(serviceId: string): Promise<Review[]> {
    try {
      const response = await this.api.get(`/business/services/${serviceId}/reviews/`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching service reviews:', error);
      return [];
    }
  }

  async createServiceReview(serviceId: string, data: {
    rating: number;
    review_text?: string;
  }): Promise<Review> {
    try {
      const response = await this.api.post(`/business/services/${serviceId}/reviews/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating service review:', error);
      throw error;
    }
  }


}

// Create singleton instance
export const apiService = new ApiService();