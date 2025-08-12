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
  user: string;
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
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Service {
  id: number;
  business: string;
  name: string;
  description?: string;
  price_range?: string;
  duration?: string;
  is_active: boolean;
  // Multiple images support (up to 10)
  images?: string[];
  created_at: string;
}

export interface Product {
  id: string;
  business: string;
  name: string;
  description?: string;
  price: number;
  price_currency: string;
  product_image_url?: string;
  // Multiple images support (up to 10)
  images?: string[];
  is_active: boolean;
  in_stock: boolean;
  created_at: string;
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
  category: number | string;
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
    const response = await this.api.post('/auth/login', data);
    // The backend wraps the response in a data field via success_response
    return response.data.data || response.data;
  }

  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.api.post('/auth/register', data);
    // The backend wraps the response in a data field via success_response
    return response.data.data || response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await this.api.post('/auth/refresh-token', {
      refresh: refreshToken,
    });
    return response.data;
  }

  async sendOTP(data: OTPRequest): Promise<{ message: string }> {
    const response = await this.api.post('/auth/verify-phone', data);
    return response.data;
  }

  async verifyOTP(data: OTPVerificationRequest): Promise<{ message: string }> {
    const response = await this.api.post('/auth/verify-phone-confirm', data);
    return response.data;
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
    const response = await this.api.get('/business/', { params });
    return response.data;
  }

  async getBusiness(id: string): Promise<Business> {
    const response = await this.api.get(`/business/${id}`);
    return response.data;
  }

  async createBusiness(data: BusinessCreateRequest): Promise<Business> {
    try {
      // First, we need to get the category ID from the category name
      let categoryId: number | undefined;
      
      if (data.category && typeof data.category === 'string') {
        try {
          const categoriesResponse = await this.getCategories();
          const category = categoriesResponse.results.find(cat => 
            cat.name.toLowerCase() === (data.category as string).toLowerCase()
          );
          
          if (category) {
            categoryId = category.id;
          } else {
            // If category doesn't exist, provide a helpful error message
            const availableCategories = categoriesResponse.results.map(cat => cat.name).join(', ');
            throw new Error(
              `Category "${data.category}" not found. Available categories: ${availableCategories}. ` +
              `Please select a valid category from the list.`
            );
          }
        } catch (error) {
          console.error('Error handling category:', error);
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Failed to validate business category. Please try again.');
        }
      }

      // Prepare the business data for the API
      const businessData = {
        business_name: data.business_name,
        category: categoryId || data.category,
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

      // Debug: Log the request data
      console.log('Request data being sent:', businessData);

      const response = await this.api.post('/business/', businessData);
      
      // Debug: Log the response
      console.log('Backend response:', response);
      
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
      // First, we need to get the category ID from the category name
      let categoryId: number | undefined;
      
      if (data.category && typeof data.category === 'string') {
        try {
          const categoriesResponse = await this.getCategories();
          const category = categoriesResponse.results.find(cat => 
            cat.name.toLowerCase() === (data.category as string).toLowerCase()
          );
          
          if (category) {
            categoryId = category.id;
          } else {
            // If category doesn't exist, provide a helpful error message
            const availableCategories = categoriesResponse.results.map(cat => cat.name).join(', ');
            throw new Error(
              `Category "${data.category}" not found. Available categories: ${availableCategories}. ` +
              `Please select a valid category from the list.`
            );
          }
        } catch (error) {
          console.error('Error handling category:', error);
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Failed to validate business category. Please try again.');
        }
      }

      // Prepare the business data for the API
      const businessData = {
        business_name: data.business_name,
        category: categoryId || data.category,
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

      // Debug: Log the request data
      console.log('Update request data being sent:', businessData);

      // Use the correct backend endpoint for updates
      const response = await this.api.put(`/business/${id}/update/`, businessData);
      
      // Debug: Log the response
      console.log('Backend update response:', response);
      
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
      
      // Try to get business by user ID using path parameter
      try {
        const response = await this.api.get(`/business/user/${user.id}/`);
        console.log('getCurrentUserBusinessSimple: Direct user endpoint response:', response.data);
        
        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.log('getCurrentUserBusinessSimple: Direct user endpoint failed:', error);
      }
      
      // Try current user business endpoint
      try {
        const response = await this.api.get('/business/current/');
        console.log('getCurrentUserBusinessSimple: Current business endpoint response:', response.data);
        
        if (response.data) {
          return response.data;
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

  // Get business hours
  async getBusinessHours(businessId: string): Promise<Array<{
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
  }>> {
    try {
      const response = await this.api.get(`/business/${businessId}/hours/`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching business hours:', error);
      return [];
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

  // Upload business image
  async uploadBusinessImage(businessId: string, imageType: 'image' | 'logo', imageUrl: string): Promise<{
    business_image_url: string | null;
    business_logo_url: string | null;
  }> {
    try {
      const response = await this.api.post(`/business/${businessId}/upload-image/`, {
        image_type: imageType,
        image_url: imageUrl
      });
      return response.data.data;
    } catch (error) {
      console.error('Error uploading business image:', error);
      throw error;
    }
  }

  async getCategories(): Promise<{ results: Category[]; count: number; next?: string; previous?: string }> {
    const response = await this.api.get('/business/categories');
    return response.data;
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
    const response = await this.api.post(`/business/${businessId}/products`, data);
    return response.data;
  }

  async updateProduct(productId: string, data: Partial<Product>): Promise<Product> {
    const response = await this.api.put(`/business/products/${productId}`, data);
    return response.data;
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.api.delete(`/business/products/${productId}`);
  }

  // Review Methods
  async getBusinessReviews(businessId: string): Promise<Review[]> {
    const response = await this.api.get(`/business/${businessId}/reviews`);
    return response.data;
  }

  async createReview(businessId: string, data: {
    rating: number;
    review_text?: string;
  }): Promise<Review> {
    const response = await this.api.post(`/business/${businessId}/reviews`, data);
    return response.data;
  }

  async updateReview(businessId: string, reviewId: number, data: {
    rating?: number;
    review_text?: string;
  }): Promise<Review> {
    const response = await this.api.put(`/business/${businessId}/reviews/${reviewId}`, data);
    return response.data;
  }

  async deleteReview(businessId: string, reviewId: number): Promise<void> {
    await this.api.delete(`/business/${businessId}/reviews/${reviewId}`);
  }

  // User Methods
  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/users/profile');
    // Handle nested response structure: { success: true, message: "...", data: { user_data } }
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    // Fallback to direct response.data if no nesting
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.api.put('/users/profile', data);
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
      await this.api.get('/users/profile');
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
    const response = await this.api.post(`/business/${businessId}/services`, data);
    return response.data;
  }

  async updateService(serviceId: string, data: Partial<Service>): Promise<Service> {
    const response = await this.api.put(`/business/services/${serviceId}`, data);
    return response.data;
  }

  async deleteService(serviceId: string): Promise<void> {
    await this.api.delete(`/business/services/${serviceId}`);
  }
}

// Create singleton instance
export const apiService = new ApiService(); 