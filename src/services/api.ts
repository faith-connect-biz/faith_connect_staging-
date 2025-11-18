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

export interface CompleteProfilePayload {
  identifier: string;
  authMethod: 'email' | 'phone';
  firstName: string;
  lastName: string;
  partnershipNumber: string;
  userType: 'community' | 'business';
  bio?: string;
  profileImageUrl?: string;
  address?: string;
  county?: string;
  city?: string;
  website?: string;
}

export interface FEMChurch {
  id: number;
  name: string;
  location?: string;
  country: string;
  city?: string;
  pastor_name?: string;
  contact_phone?: string;
  contact_email?: string;
  is_active: boolean;
  sort_order: number;
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
  sector?: string;
  subcategory?: string;
  description?: string;
  long_description?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  website?: string;
  address: string;
  office_address?: string;
  country: string;
  city?: string;
  fem_church?: FEMChurch | null;
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
  description?: string;
  subcategories?: string[];
  icon?: string;
  is_active?: boolean;
  sort_order?: number;
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
  sector?: string;
  subcategory?: string;
  description?: string;
  long_description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address: string;
  office_address?: string;
  country?: string;
  city?: string;
  fem_church_id?: number;
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

export interface ProfessionalServiceRequest {
  id: string;
  business: string;
  user: string;
  user_name: string;
  business_name: string;
  request_type: string;
  request_type_display: string;
  title: string;
  description: string;
  budget_range?: string;
  timeline?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priority_display: string;
  status: 'pending' | 'in_review' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  status_display: string;
  internal_notes?: string;
  admin_response?: string;
  estimated_cost?: number;
  assigned_to?: string;
  request_date: string;
  updated_at: string;
  completed_date?: string;
  is_active: boolean;
}

export interface CreateProfessionalServiceRequestData {
  request_type: string;
  title: string;
  description: string;
  budget_range?: string;
  timeline?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
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

// New request/response interfaces for OTP Flow
export interface InitiateAuthRequest {
  identifier: string; // email or phone
  auth_method: 'email' | 'phone';
}

export interface InitiateAuthResponse {
  success: boolean;
  message: string;
  user_id?: string;
  requires_profile_completion?: boolean;
}

export interface VerifyOTPRequest {
  identifier?: string; // email or phone (for identifier-based verification)
  user_id?: string; // alternative to identifier
  auth_method?: 'email' | 'phone';
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  user?: User;
  tokens?: AuthTokens;
  requires_profile_completion?: boolean;
}

export interface ResendOTPRequest {
  identifier: string;
  auth_method: 'email' | 'phone';
}

export interface CompleteProfileRequest {
  identifier: string;
  auth_method: 'email' | 'phone';
  first_name: string;
  last_name: string;
  partnership_number: string;
  user_type: 'community' | 'business';
  bio?: string;
  address?: string;
  county?: string;
  city?: string;
  website?: string;
  profile_image_url?: string;
}

export interface PresignedUrlRequest {
  file_name: string;
  content_type: string;
}

export interface PresignedUrlResponse {
  presigned_url: string;
  file_url: string;
  expires_in: number;
}

export interface ProfilePhotoUploadRequest extends PresignedUrlRequest {
  identifier?: string; // for unauthenticated uploads
  auth_method?: 'email' | 'phone';
}

export interface BusinessImageUploadRequest {
  image_type: 'image' | 'logo';
  content_type: string;
}

export interface ServiceProductImageUploadRequest {
  content_type: string;
  image_role: 'main' | 'additional';
}

export interface BusinessHoursRequest {
  hours: Array<{
    day_of_week: number;
    open_time?: string;
    close_time?: string;
    is_closed: boolean;
  }>;
}

export interface CheckWhatsAppRequest {
  phone: string;
}

export interface CheckWhatsAppResponse {
  success: boolean;
  is_whatsapp: boolean;
  phone: string;
  message?: string;
}

export interface PublicStats {
  total_businesses: number;
  total_users: number;
  verified_businesses: number;
  total_services: number;
  total_products: number;
}

export interface BusinessAnalyticsResponse {
  business_id: string;
  business_name: string;
  total_views: number;
  total_favorites: number;
  total_likes: number;
  total_reviews: number;
  average_rating: number;
  rating_distribution: Record<string, number>;
}

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://faithconnectbackend-staging.up.railway.app';

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
      timeout: 30000, // 30 second timeout for all requests
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        // List of public endpoints that don't require authentication
        const publicEndpoints = [
          '/health/',
          '/api/stats/',
          '/api/auth/initiate-auth',
          '/api/auth/verify-otp',
          '/api/auth/resend-otp',
          '/api/auth/complete-profile',
          '/api/profile-photo-upload-url-unauthenticated',
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
          'categories',
          'stats'
        ];

        // Check if the current endpoint is public
        const isPublicEndpoint = publicEndpoints.some(endpoint =>
          config.url?.includes(endpoint)
        );

        // Public business GET endpoints (read-only). All write actions require auth.
        const method = (config.method || 'get').toLowerCase();
        const isBusinessPath = !!config.url?.includes('/business/vset/') || !!config.url?.includes('/business/');
        const isWriteMethod = method !== 'get';
        const isRestrictedSegment = config.url?.includes('/user-activity/') ||
          config.url?.includes('/favorites/') ||
          config.url?.includes('/like/') ||
          config.url?.includes('/my-business/') ||
          config.url?.includes('/businesses/me/') ||  // ViewSet me endpoint requires auth
          config.url?.includes('/photo-request/') ||
          config.url?.includes('/check-whatsapp/') ||
          config.url?.includes('/user-reviews/') ||
          config.url?.includes('/user-liked-reviews/') ||
          config.url?.match(/\/businesses\/[^/]+\/$/) && method === 'get'; // Business detail requires auth

        // Special handling for business hours and analytics - POST to hours requires auth, GET is public
        const isBusinessHoursPost = config.url?.includes('/hours/') && isWriteMethod;
        const isAnalyticsEndpoint = config.url?.includes('/analytics/'); // Analytics is public (GET)

        // Allow unauthenticated only for:
        // 1. GETs to business/services/products LIST endpoints (not detail)
        // 2. GET to analytics endpoint
        // 3. GET to hours endpoint
        // IMPORTANT: POST/PUT/PATCH/DELETE requests to business endpoints require authentication
        // IMPORTANT: Business detail endpoint requires auth according to Postman collection
        const isPublicBusinessList = (config.url?.includes('/business/vset/businesses/') || 
                                      config.url?.includes('/business/vset/services/') ||
                                      config.url?.includes('/business/vset/products/')) && 
                                     method === 'get' && 
                                     !config.url?.match(/\/[^/]+\/[^/]+\/$/); // Not a detail endpoint
        const isPublicBusinessEndpoint = (isPublicBusinessList || isAnalyticsEndpoint) && !isRestrictedSegment;


        // Add auth token for all protected endpoints
        // This includes: all write operations, restricted segments, and non-public endpoints
        if (!isPublicEndpoint && !isPublicBusinessEndpoint) {
          const token = localStorage.getItem('access_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`[API] Adding auth token for ${config.method?.toUpperCase()} ${config.url}`);
          } else {
            console.warn(`[API] No auth token found for protected endpoint: ${config.method?.toUpperCase()} ${config.url}`);
          }
        } else {
          console.log(`[API] Public endpoint, no auth required: ${config.method?.toUpperCase()} ${config.url}`);
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
        
        // Handle timeout errors
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          console.error('API request timed out:', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            timeout: originalRequest?.timeout
          });
          return Promise.reject(new Error('Request timed out. Please check your internet connection and try again.'));
        }
        
        // Handle network errors
        if (error.code === 'NETWORK_ERROR' || !error.response) {
          console.error('Network error:', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            error: error.message
          });
          
          // Check if this is a connection refused error (backend not running)
          if (error.message.includes('ERR_CONNECTION_REFUSED') || error.message.includes('Network Error')) {
            console.warn('Backend server is not running. Using demo mode.');
            // For demo purposes, we'll handle this gracefully
            return Promise.reject(new Error('Backend server is not running. Please start the backend server or use demo mode.'));
          }
          
          return Promise.reject(new Error('Network error. Please check your internet connection and try again.'));
        }
        
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

  // ==================== Health & Public Endpoints ====================

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.api.get('/health/'); // Health endpoint is at root, not under /api
    return response.data;
  }

  /**
   * Get public platform statistics
   */
  async getPublicStats(): Promise<PublicStats> {
    const response = await this.api.get('/api/stats/');
    return response.data;
  }

  // ==================== Authentication Methods (OTP Flow) ====================

  /**
   * Initiate authentication - sends OTP to email or phone
   */
  async initiateAuth(data: InitiateAuthRequest): Promise<InitiateAuthResponse> {
    const response = await this.api.post('/api/auth/initiate-auth', data);
    return response.data;
  }

  /**
   * Verify OTP (using identifier)
   */
  async verifyOTPWithIdentifier(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    const response = await this.api.post('/api/auth/verify-otp', data);
    return response.data;
  }

  /**
   * Verify OTP (using user_id)
   */
  async verifyOTPWithUserId(userId: string, otp: string): Promise<VerifyOTPResponse> {
    const response = await this.api.post('/api/auth/verify-otp', {
      user_id: userId,
      otp: otp
    });
    return response.data;
  }

  /**
   * Resend OTP
   */
  async resendOTP(data: ResendOTPRequest): Promise<{ success: boolean; message: string }> {
    const response = await this.api.post('/api/auth/resend-otp', data);
    return response.data;
  }

  /**
   * Complete profile after OTP verification (includes profile_image_url if uploaded)
   */
  async completeProfile(data: CompleteProfileRequest): Promise<{
    success: boolean;
    message: string;
    user: User;
    tokens: AuthTokens;
  }> {
    const response = await this.api.post('/api/auth/complete-profile', data);
    return response.data;
  }

  // Legacy authentication methods (kept for backward compatibility)
  async login(data: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.api.post('/api/login', data);
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
    const response = await this.api.post('/api/register', data);
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
      const response = await this.api.post('/api/verify-registration-otp', {
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
      const response = await this.api.post('/api/verify-registration-otp', {
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
      const response = await this.api.post('/api/resend-otp', {
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
      const response = await this.api.post('/api/resend-otp', {
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
        
        await this.api.post('/api/logout', {
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
      const response = await this.api.post('/api/refresh-token', {
      refresh: refreshToken,
    });
    return response.data;
  }

  // Verify email OTP for signup
  async verifyEmailOTP(userId: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post('/api/verify-email-confirm', {
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
      const response = await this.api.post('/api/verify-email', {
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
      const response = await this.api.post('/api/forgot-password', {
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
      const response = await this.api.post('/api/forgot-password', {
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
      const response = await this.api.post('/api/forgot-password', {
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
      const response = await this.api.post('/api/reset-password', {
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
      const response = await this.api.post('/api/reset-password', {
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

  // ==================== Business Endpoints (ViewSet) ====================

  /**
   * List businesses (minimal, public)
   */
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
    const response = await this.api.get('/api/business/vset/businesses/', { params });
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

  /**
   * Get business detail (requires auth)
   */
  async getBusiness(id: string): Promise<Business> {
    const response = await this.api.get(`/api/business/vset/businesses/${id}/`);
    return response.data;
  }

  /**
   * Get my business (owner)
   */
  async getMyBusiness(): Promise<Business> {
    const response = await this.api.get('/api/business/vset/businesses/me/');
    return response.data;
  }

  /**
   * Create business (include image/logo URLs if already uploaded)
   */
  async createBusiness(data: BusinessCreateRequest): Promise<Business> {
    try {
      // Prepare the business data for the API
      const businessData = {
        business_name: data.business_name,
        category_id: data.category_id,
        sector: data.sector,
        subcategory: data.subcategory,
        description: data.description,
        long_description: data.long_description,
        phone: data.phone,
        email: data.email,
        website: data.website,
        address: data.address,
        office_address: data.office_address,
        country: data.country,
        city: data.city,
        fem_church_id: data.fem_church_id,
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

      const response = await this.api.post('/api/business/vset/businesses/', businessData);

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

  /**
   * Get business hours (public)
   */
  async getBusinessHoursPublic(businessId: string): Promise<BusinessHour[]> {
    const response = await this.api.get(`/api/business/vset/businesses/${businessId}/hours/`);
    return response.data;
  }

  /**
   * Replace business hours (owner, POST)
   */
  async replaceBusinessHours(businessId: string, data: BusinessHoursRequest): Promise<BusinessHour[]> {
    const response = await this.api.post(`/api/business/vset/businesses/${businessId}/hours/`, data);
    return response.data;
  }

  /**
   * Toggle favorite (auth)
   */
  async toggleBusinessFavorite(businessId: string): Promise<{ favorited: boolean; message: string }> {
    const response = await this.api.post(`/api/business/vset/businesses/${businessId}/favorite/`);
    return response.data;
  }

  /**
   * Toggle like (auth)
   */
  async toggleBusinessLikeVSet(businessId: string): Promise<{ liked: boolean; message: string }> {
    const response = await this.api.post(`/api/business/vset/businesses/${businessId}/like/`);
    return response.data;
  }

  /**
   * Get business reviews (auth required)
   */
  async getBusinessReviews(businessId: string): Promise<{ results: Review[]; count: number }> {
    const response = await this.api.get(`/api/business/vset/businesses/${businessId}/reviews/`);
    return response.data;
  }

  /**
   * Create business review (auth)
   */
  async createBusinessReview(businessId: string, data: { rating: number; review_text?: string }): Promise<Review> {
    const response = await this.api.post(`/api/business/vset/businesses/${businessId}/reviews/`, data);
    return response.data;
  }

  /**
   * Create business review (alias for createBusinessReview)
   */
  async createReview(businessId: string, data: { rating: number; review_text?: string }): Promise<Review> {
    return this.createBusinessReview(businessId, data);
  }

  /**
   * Get business analytics (public)
   */
  async getBusinessAnalyticsVSet(businessId: string): Promise<BusinessAnalyticsResponse> {
    const response = await this.api.get(`/api/business/vset/businesses/${businessId}/analytics/`);
    return response.data;
  }

  /**
   * Get presigned URL for business image upload (client uploads; include URL in normal update)
   */
  async getBusinessImageUploadUrlVSet(businessId: string, data: BusinessImageUploadRequest): Promise<PresignedUrlResponse> {
    const response = await this.api.post(`/api/business/vset/businesses/${businessId}/upload-image/`, data);
    return response.data;
  }

  /**
   * Check WhatsApp number (auth)
   */
  async checkWhatsAppNumberVSet(phone: string): Promise<CheckWhatsAppResponse> {
    const response = await this.api.post('/api/business/vset/businesses/check-whatsapp/', { phone });
    return response.data;
  }

  /**
   * Get user favorites (auth)
   */
  async getUserFavoritesVSet(): Promise<{ results: Favorite[]; count: number }> {
    const response = await this.api.get('/api/business/vset/businesses/favorites/');
    return response.data;
  }

  /**
   * Get user reviews (auth)
   */
  async getUserReviewsVSet(): Promise<{ results: Review[]; count: number }> {
    const response = await this.api.get('/api/business/vset/businesses/user-reviews/');
    return response.data;
  }

  /**
   * Get user liked review IDs (auth)
   */
  async getUserLikedReviewIdsVSet(): Promise<string[]> {
    const response = await this.api.get('/api/business/vset/businesses/user-liked-reviews/');
    return response.data.liked_review_ids || [];
  }

  /**
   * Get user activity (auth)
   */
  async getUserActivityVSet(): Promise<{ activities: UserActivity[]; total_count: number }> {
    const response = await this.api.get('/api/business/vset/businesses/user-activity/');
    return response.data;
  }

  /**
   * Update business (ViewSet - PUT/PATCH)
   */
  async updateBusinessVSet(id: string, data: Partial<BusinessCreateRequest>): Promise<Business> {
    const response = await this.api.patch(`/api/business/vset/businesses/${id}/`, data);
    return response.data;
  }

  /**
   * Delete business (ViewSet)
   */
  async deleteBusinessVSet(id: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/api/business/vset/businesses/${id}/`);
    return response.data;
  }

  // Legacy: Update existing business
  async updateBusiness(id: string, data: BusinessCreateRequest): Promise<Business> {
    try {
      // Prepare the business data for the API
      const businessData = {
        business_name: data.business_name,
        category_id: data.category_id,
        sector: data.sector,
        subcategory: data.subcategory,
        description: data.description,
        long_description: data.long_description,
        phone: data.phone,
        email: data.email,
        website: data.website,
        address: data.address,
        office_address: data.office_address,
        country: data.country,
        city: data.city,
        fem_church_id: data.fem_church_id,
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
      const response = await this.api.patch(`/api/business/vset/businesses/${id}/`, businessData);
      
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
    await this.api.delete(`/api/business/vset/businesses/${id}/`);
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
      const response = await this.api.get(`/api/business/vset/services/?business=${businessId}`);
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('Error fetching business services:', error);
      return [];
    }
  }

  // Get business products
  async getBusinessProducts(businessId: string): Promise<Product[]> {
    try {
      const response = await this.api.get(`/api/business/vset/products/?business=${businessId}`);
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('Error fetching business products:', error);
      return [];
    }
  }

  // ==================== Services Endpoints (ViewSet) ====================

  /**
   * List all services (public)
   */
  async getAllServices(params?: {
    search?: string;
    category?: string;
    business__category?: string;
    price_range?: string;
    business__city?: string;
    business__county?: string;
    duration?: string;
    ordering?: string;
    page?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ results: Service[]; count: number; next?: string; previous?: string }> {
    try {
      const response = await this.api.get('/api/business/vset/services/', { params });
      console.log('API getAllServices - Raw response:', response);
      console.log('API getAllServices - Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all services:', error);
      return { results: [], count: 0 };
    }
  }

  /**
   * Create service (owner; include URLs if already uploaded)
   */
  async createServiceVSet(businessId: string, data: {
    name: string;
    description?: string;
    price_range?: string;
    duration?: string;
    service_image_url?: string;
    images?: string[];
    is_active?: boolean;
  }): Promise<Service> {
    const response = await this.api.post(`/api/business/vset/services/?business_id=${businessId}`, data);
    return response.data;
  }

  /**
   * Get service detail (requires auth)
   */
  async getServiceVSet(serviceId: string): Promise<Service> {
    const response = await this.api.get(`/api/business/vset/services/${serviceId}/`);
    return response.data;
  }

  /**
   * Get presigned URL for service image upload
   */
  async getServiceImageUploadUrlVSet(serviceId: string, data: ServiceProductImageUploadRequest): Promise<PresignedUrlResponse> {
    const response = await this.api.post(`/api/business/vset/services/${serviceId}/upload-image/`, data);
    return response.data;
  }

  /**
   * Get service reviews (public)
   */
  async getServiceReviewsVSet(serviceId: string): Promise<{ results: Review[]; count: number }> {
    const response = await this.api.get(`/api/business/vset/services/${serviceId}/reviews/`);
    return response.data;
  }

  /**
   * Create service review (auth)
   */
  async createServiceReviewVSet(serviceId: string, data: { rating: number; review_text?: string }): Promise<Review> {
    const response = await this.api.post(`/api/business/vset/services/${serviceId}/reviews/`, data);
    return response.data;
  }

  /**
   * Update service (ViewSet - PUT/PATCH)
   */
  async updateServiceVSet(serviceId: string, data: Partial<{
    name: string;
    description?: string;
    price_range?: string;
    duration?: string;
    service_image_url?: string;
    images?: string[];
    is_active?: boolean;
  }>): Promise<Service> {
    const response = await this.api.patch(`/api/business/vset/services/${serviceId}/`, data);
    return response.data;
  }

  /**
   * Delete service (ViewSet)
   */
  async deleteServiceVSet(serviceId: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/api/business/vset/services/${serviceId}/`);
    return response.data;
  }

  // ==================== Products Endpoints (ViewSet) ====================

  /**
   * List all products (public)
   */
  async getAllProducts(params?: {
    search?: string;
    category?: string;
    business__category?: string;
    in_stock?: boolean;
    price_currency?: string;
    ordering?: string;
    page?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ results: Product[]; count: number; next?: string; previous?: string }> {
    try {
      const response = await this.api.get('/api/business/vset/products/', { params });
      console.log('API getAllProducts - Raw response:', response);
      console.log('API getAllProducts - Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all products:', error);
      return { results: [], count: 0 };
    }
  }

  /**
   * Create product (owner; include URLs if already uploaded)
   */
  async createProductVSet(businessId: string, data: {
    name: string;
    description?: string;
    price: number;
    price_currency: string;
    product_image_url?: string;
    images?: string[];
    in_stock?: boolean;
    is_active?: boolean;
  }): Promise<Product> {
    const response = await this.api.post(`/api/business/vset/products/?business_id=${businessId}`, data);
    return response.data;
  }

  /**
   * Get product detail (requires auth)
   */
  async getProductVSet(productId: string): Promise<Product> {
    const response = await this.api.get(`/api/business/vset/products/${productId}/`);
    return response.data;
  }

  /**
   * Get presigned URL for product image upload
   */
  async getProductImageUploadUrlVSet(productId: string, data: ServiceProductImageUploadRequest): Promise<PresignedUrlResponse> {
    const response = await this.api.post(`/api/business/vset/products/${productId}/upload-image/`, data);
    return response.data;
  }

  /**
   * Get product reviews (public)
   */
  async getProductReviewsVSet(productId: string): Promise<{ results: Review[]; count: number }> {
    const response = await this.api.get(`/api/business/vset/products/${productId}/reviews/`);
    return response.data;
  }

  /**
   * Create product review (auth)
   */
  async createProductReviewVSet(productId: string, data: { rating: number; review_text?: string }): Promise<Review> {
    const response = await this.api.post(`/api/business/vset/products/${productId}/reviews/`, data);
    return response.data;
  }

  /**
   * Update product (ViewSet - PUT/PATCH)
   */
  async updateProductVSet(productId: string, data: Partial<{
    name: string;
    description?: string;
    price: number;
    price_currency: string;
    product_image_url?: string;
    images?: string[];
    in_stock?: boolean;
    is_active?: boolean;
  }>): Promise<Product> {
    const response = await this.api.patch(`/api/business/vset/products/${productId}/`, data);
    return response.data;
  }

  /**
   * Delete product (ViewSet)
   */
  async deleteProductVSet(productId: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/api/business/vset/products/${productId}/`);
    return response.data;
  }

  // ==================== Legacy Business Endpoints ====================
  // These methods are kept for backward compatibility
  // New code should use the ViewSet methods above

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
      const response = await this.api.post(`/api/business/vset/businesses/${businessId}/upload-image/`, {
        image_type: imageType,
        content_type: contentType
      });
      return response.data;
    } catch (error) {
      console.error('Error getting upload URL:', error);
      throw error;
    }
  }

  // Update business image using S3 pre-signed URLs
  // Note: After uploading to S3, update the business with the image URL directly via PATCH
  async updateBusinessImage(businessId: string, imageType: 'image' | 'logo', fileKey: string): Promise<{
    business_image_url: string | null;
    business_logo_url: string | null;
    s3_url: string;
  }> {
    try {
      // Construct S3 URL from file_key
      const bucketName = import.meta.env.VITE_AWS_STORAGE_BUCKET_NAME || 'faithconnectapp';
      const region = import.meta.env.VITE_AWS_S3_REGION_NAME || 'af-south-1';
      const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
      
      // Update business with the image URL
      const updateData = imageType === 'image' 
        ? { business_image_url: s3Url }
        : { business_logo_url: s3Url };
      
      const response = await this.api.patch(`/api/business/vset/businesses/${businessId}/`, updateData);
      return {
        business_image_url: response.data.business_image_url || null,
        business_logo_url: response.data.business_logo_url || null,
        s3_url: s3Url
      };
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
    { id: 20, name: 'Pet Services & Veterinary 🐾', slug: 'pet-services-veterinary' },
    { id: 21, name: 'Sports & Recreation 🏃', slug: 'sports-recreation' },
    { id: 22, name: 'Mining & Natural Resources ⛏️', slug: 'mining-natural-resources' },
    { id: 23, name: 'Textiles & Fashion 👗', slug: 'textiles-fashion' },
    { id: 24, name: 'Government & Public Services 🏛️', slug: 'government-public-services' },
    { id: 25, name: 'Import & Export Trade 🚢', slug: 'import-export-trade' }
  ];

  // Get categories from backend API
  async getCategories(): Promise<{ results: Category[]; count: number }> {
    try {
      // Attempt to fetch all pages if the endpoint is paginated
      const first = await this.api.get('/api/business/categories/');
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

  // Get FEM Churches from backend API
  async getFEMChurches(): Promise<{ results: FEMChurch[]; count: number }> {
    try {
      const response = await this.api.get('/api/business/fem-churches/');
      const data = response.data;

      let churches: FEMChurch[] = [];
      let count = 0;

      if (Array.isArray(data)) {
        churches = data;
        count = churches.length;
      } else if (data && typeof data === 'object' && 'results' in data) {
        churches = data.results || [];
        count = data.count || churches.length;
      } else {
        churches = [];
        count = 0;
      }

      return { results: churches, count };
    } catch (error) {
      console.log('[API] FEM Churches endpoint not found (404), using fallback data');
      // Return fallback FEM churches data when API is not available
      const fallbackChurches: FEMChurch[] = [
        { 
          id: 1, 
          name: 'FEM Church Nairobi Central', 
          location: 'Nairobi Central',
          city: 'Nairobi', 
          country: 'Kenya',
          pastor_name: 'Pastor John Doe',
          contact_phone: '+254700123456',
          contact_email: 'nairobi@fem.or.ke',
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: 2, 
          name: 'FEM Church Mombasa', 
          location: 'Mombasa Island',
          city: 'Mombasa', 
          country: 'Kenya',
          pastor_name: 'Pastor Jane Smith',
          contact_phone: '+254700123457',
          contact_email: 'mombasa@fem.or.ke',
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: 3, 
          name: 'FEM Church Kisumu', 
          location: 'Kisumu Town',
          city: 'Kisumu', 
          country: 'Kenya',
          pastor_name: 'Pastor David Wilson',
          contact_phone: '+254700123458',
          contact_email: 'kisumu@fem.or.ke',
          is_active: true,
          sort_order: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: 4, 
          name: 'FEM Church Nakuru', 
          location: 'Nakuru Town',
          city: 'Nakuru', 
          country: 'Kenya',
          pastor_name: 'Pastor Mary Brown',
          contact_phone: '+254700123459',
          contact_email: 'nakuru@fem.or.ke',
          is_active: true,
          sort_order: 4,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: 5, 
          name: 'FEM Church Eldoret', 
          location: 'Eldoret Town',
          city: 'Eldoret', 
          country: 'Kenya',
          pastor_name: 'Pastor Paul Johnson',
          contact_phone: '+254700123460',
          contact_email: 'eldoret@fem.or.ke',
          is_active: true,
          sort_order: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      return {
        results: fallbackChurches,
        count: fallbackChurches.length,
      };
    }
  }

  async toggleFavorite(businessId: string): Promise<{ message: string }> {
    const response = await this.api.post(`/api/business/vset/businesses/${businessId}/favorite/`);
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
      ...data
    };
    const response = await this.api.post(`/api/business/vset/products/?business_id=${businessId}`, productData);
    return response.data;
  }

  // Get product by ID (legacy method)
  async getProduct(productId: string): Promise<Product> {
    try {
      const response = await this.api.get(`/api/business/vset/products/${productId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Get product by category and slug
  async getProductByCategory(categorySlug: string, productSlug: string): Promise<Product> {
    try {
      const response = await this.api.get(`/business/category/${categorySlug}/product/${productSlug}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product by category:', error);
      throw error;
    }
  }

  // Update product
  async updateProduct(productId: string, data: Partial<Product>): Promise<Product> {
    try {
      const response = await this.api.patch(`/api/business/vset/products/${productId}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product
  async deleteProduct(productId: string): Promise<void> {
    await this.api.delete(`/api/business/vset/products/${productId}/`);
  }


  // Check if current user owns a business
  async getUserBusiness(): Promise<Business | null> {
    try {
      const response = await this.api.get('/api/business/vset/businesses/me/');
      // Handle structured response: { success: true, data: {...} }
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      // Fallback to direct response.data if no nesting
      return response.data;
    } catch (error) {
      // If user doesn't have a business or endpoint doesn't exist, return null
      if (error instanceof AxiosError && (error.response?.status === 404 || error.response?.status === 401)) {
        console.log('[API] No business found for user (404/401), returning null');
        return null;
      }
      console.error('[API] Error checking user business:', error);
      return null; // Return null for any error to prevent crashes
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



  // ==================== Profile Endpoints ====================

  /**
   * Get current user profile (authenticated)
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/api/profile');
    // Handle nested response structure: { success: true, message: "...", data: { user_data } }
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    // Fallback to direct response.data if no nesting
    return response.data;
  }

  /**
   * Update user profile (PATCH with profile_image_url)
   */
  async updateProfile(data: Partial<User>): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const response = await this.api.patch('/api/profile-update', data);
      return response.data;  // Return the response data directly
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }

  /**
   * Get presigned URL for profile photo upload (authenticated)
   */
  async getProfilePhotoUploadUrlAuth(data: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    const response = await this.api.post('/api/profile-photo-upload-url', data);
    return response.data;
  }

  /**
   * Get presigned URL for profile photo upload (unauthenticated onboarding)
   */
  async getProfilePhotoUploadUrlUnauth(data: ProfilePhotoUploadRequest): Promise<PresignedUrlResponse> {
    const response = await this.api.post('/api/profile-photo-upload-url-unauthenticated', data);
    return response.data;
  }

  // Get platform statistics (kept for backward compatibility)
  async getStats(): Promise<{
    total_businesses: number;
    total_users: number;
    verified_businesses: number;
    average_rating: number;
  }> {
    try {
      const response = await this.api.get('/api/stats/');
      // Clean up the response data to ensure valid rating
      const data = response.data;
      if (data.average_rating && (isNaN(data.average_rating) || data.average_rating < 0 || data.average_rating > 5)) {
        data.average_rating = 0;
      }
      return data;
    } catch (error) {
      console.error('Error fetching platform statistics:', error);
      // Return fallback data if stats endpoint is not available
      return {
        total_businesses: 0,
        total_users: 0,
        verified_businesses: 0,
        average_rating: 0
      };
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
      await this.api.get('/api/profile');
      return true;
    } catch (error) {
      console.log('Token validation failed:', error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        this.clearAuthState();
      }
      return false;
    }
  }

  // Enhanced authentication check for review submission
  async ensureAuthenticated(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      console.warn('[API] User not authenticated');
      return false;
    }
    
    // Validate token with backend
    const isValid = await this.validateToken();
    if (!isValid) {
      console.warn('[API] Token validation failed');
      return false;
    }
    
    console.log('[API] User properly authenticated');
    return true;
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
      ...data
    };
    const response = await this.api.post(`/api/business/vset/services/?business_id=${businessId}`, serviceData);
    return response.data;
  }

  // Get service by ID (legacy method)
  async getService(serviceId: string): Promise<Service> {
    const response = await this.api.get(`/api/business/vset/services/${serviceId}/`);
    return response.data;
  }

  // Get service by category and slug
  async getServiceByCategory(categorySlug: string, serviceSlug: string): Promise<Service> {
    try {
      const response = await this.api.get(`/business/category/${categorySlug}/service/${serviceSlug}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service by category:', error);
      throw error;
    }
  }

  async updateService(serviceId: string, data: Partial<Service>): Promise<Service> {
    const response = await this.api.patch(`/api/business/vset/services/${serviceId}/`, data);
    return response.data;
  }

  async deleteService(serviceId: string): Promise<void> {
    await this.api.delete(`/api/business/vset/services/${serviceId}/`);
  }

  // Service Image Upload using S3 pre-signed URLs
  async getServiceImageUploadUrl(serviceId: string, imageType: 'main' | 'additional', fileName: string, contentType: string): Promise<{
    presigned_url: string;
    file_key: string;
    expires_in_minutes: number;
    image_type: string;
  }> {
    try {
      const response = await this.api.post(`/api/business/vset/services/${serviceId}/upload-image/`, {
        image_role: imageType === 'main' ? 'main' : 'additional',
        content_type: contentType
      });
      return response.data;
    } catch (error) {
      console.error('Error getting service image upload URL:', error);
      throw error;
    }
  }

  // Update service with uploaded image
  // Note: After uploading to S3, update the service with the image URL directly via PATCH
  async updateServiceImage(serviceId: string, imageType: 'main' | 'additional', fileKey: string): Promise<{
    service_image_url: string | null;
    images: string[];
    s3_url: string;
  }> {
    try {
      // Construct S3 URL from file_key
      const bucketName = import.meta.env.VITE_AWS_STORAGE_BUCKET_NAME || 'faithconnectapp';
      const region = import.meta.env.VITE_AWS_S3_REGION_NAME || 'af-south-1';
      const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
      
      // Update service with the image URL
      const updateData = imageType === 'main'
        ? { service_image_url: s3Url }
        : { images: [s3Url] };
      
      const response = await this.api.patch(`/api/business/vset/services/${serviceId}/`, updateData);
      return {
        service_image_url: response.data.service_image_url || null,
        images: response.data.images || [],
        s3_url: s3Url
      };
    } catch (error) {
      console.error('Error updating service image:', error);
      throw error;
    }
  }

  // Upload product image using S3 pre-signed URLs
  async uploadProductImage(productId: string, imageFile: File): Promise<{ success: boolean; image_url?: string; message: string }> {
    try {
      // Get pre-signed URL for upload
      const uploadUrlResponse = await this.api.post(`/api/business/vset/products/${productId}/upload-image/`, {
        content_type: imageFile.type,
        image_role: 'main'
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
      const s3Url = `https://${import.meta.env.VITE_AWS_STORAGE_BUCKET_NAME || 'faithconnectapp'}.s3.${import.meta.env.VITE_AWS_S3_REGION_NAME || 'af-south-1'}.amazonaws.com/${file_key}`;
      const updateResponse = await this.api.patch(`/api/business/vset/products/${productId}/`, {
        product_image_url: s3Url
      });

      return {
        success: true,
        image_url: updateResponse.data.product_image_url || s3Url,
        message: 'Image uploaded successfully'
      };
    } catch (error) {
      console.error('Error uploading product image:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload image'
      };
    }
  }

  // Update product with uploaded image
  // Note: After uploading to S3, update the product with the image URL directly via PATCH
  async updateProductImage(productId: string, imageType: 'main' | 'additional', fileKey: string): Promise<{
    product_image_url: string | null;
    images: string[];
    s3_url: string;
  }> {
    try {
      // Construct S3 URL from file_key
      const bucketName = import.meta.env.VITE_AWS_STORAGE_BUCKET_NAME || 'faithconnectapp';
      const region = import.meta.env.VITE_AWS_S3_REGION_NAME || 'af-south-1';
      const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
      
      // Update product with the image URL
      const updateData = imageType === 'main'
        ? { product_image_url: s3Url }
        : { images: [s3Url] };
      
      const response = await this.api.patch(`/api/business/vset/products/${productId}/`, updateData);
      return {
        product_image_url: response.data.product_image_url || null,
        images: response.data.images || [],
        s3_url: s3Url
      };
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
    s3_url?: string;
  }> {
    try {
      const response = await this.api.post('/api/profile-photo-upload-url', {
        file_name: fileName,
        content_type: contentType
      });
      return response.data;
    } catch (error) {
      console.error('Error getting profile photo upload URL:', error);
      throw error;
    }
  }

  // Unauthenticated Profile Photo Upload for profile completion
  async getProfilePhotoUploadUrlUnauthenticated(
    identifier: string,
    authMethod: 'email' | 'phone',
    fileName: string,
    contentType: string
  ): Promise<{
    presigned_url: string;
    file_key: string;
    expires_in_minutes: number;
    s3_url: string;
  }> {
    try {
      const response = await this.api.post('/api/profile-photo-upload-url-unauthenticated', {
        identifier,
        auth_method: authMethod,
        file_name: fileName,
        content_type: contentType
      });
      return response.data;
    } catch (error) {
      console.error('Error getting unauthenticated profile photo upload URL:', error);
      throw error;
    }
  }

  // Business Profile Image Upload using S3 pre-signed URLs
  // Uses the unified upload-image endpoint
  async getBusinessProfileImageUploadUrl(businessId: string, fileName: string, contentType: string): Promise<{
    presigned_url: string;
    file_key: string;
    expires_in_minutes: number;
  }> {
    try {
      const response = await this.api.post(`/api/business/vset/businesses/${businessId}/upload-image/`, {
        image_type: 'image',
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
    return this.updateBusinessImage(businessId, 'image', fileKey).then(result => ({
      business_image_url: result.business_image_url || '',
      s3_url: result.s3_url
    }));
  }

  // Business Logo Upload using S3 pre-signed URLs
  // Uses the unified upload-image endpoint
  async getBusinessLogoUploadUrl(businessId: string, fileName: string, contentType: string): Promise<{
    presigned_url: string;
    file_key: string;
    expires_in_minutes: number;
  }> {
    try {
      const response = await this.api.post(`/api/business/vset/businesses/${businessId}/upload-image/`, {
        image_type: 'logo',
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
    return this.updateBusinessImage(businessId, 'logo', fileKey).then(result => ({
      business_logo_url: result.business_logo_url || '',
      s3_url: result.s3_url
    }));
  }

  // Update profile with uploaded photo
  // Note: After uploading to S3, update the profile with the image URL directly via PATCH
  async updateProfilePhoto(fileKey: string): Promise<{
    profile_image_url: string | null;
    s3_url: string;
  }> {
    try {
      // Construct S3 URL from file_key
      const bucketName = import.meta.env.VITE_AWS_STORAGE_BUCKET_NAME || 'faithconnectapp';
      const region = import.meta.env.VITE_AWS_S3_REGION_NAME || 'af-south-1';
      const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
      
      // Update profile with the image URL
      const response = await this.api.patch('/api/profile-update', {
        profile_image_url: s3Url
      });
      return {
        profile_image_url: response.data.user?.profile_image_url || s3Url,
        s3_url: s3Url
      };
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
      const response = await this.api.get('/api/business/photo-requests/');
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

  // Professional Service Request Methods
  async createProfessionalServiceRequest(data: CreateProfessionalServiceRequestData): Promise<ProfessionalServiceRequest> {
    try {
      const response = await this.api.post('/api/business/professional-service-requests/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating professional service request:', error);
      throw error;
    }
  }

  async getProfessionalServiceRequests(): Promise<ProfessionalServiceRequest[]> {
    try {
      const response = await this.api.get('/api/business/my-professional-service-requests/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching professional service requests:', error);
      throw error;
    }
  }

  async getProfessionalServiceRequest(id: string): Promise<ProfessionalServiceRequest> {
    try {
      const response = await this.api.get(`/business/professional-service-requests/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching professional service request:', error);
      throw error;
    }
  }

  // Like Methods
  async toggleBusinessLike(businessId: string): Promise<{ liked: boolean; message: string }> {
    try {
      const response = await this.api.post(`/api/business/vset/businesses/${businessId}/like/`);
      return response.data;
    } catch (error) {
      console.error('Error toggling business like:', error);
      throw error;
    }
  }

  async toggleReviewLike(reviewId: string): Promise<{ liked: boolean; message: string }> {
    try {
      // Note: Review like endpoint path may need to be confirmed with backend
      // This is a placeholder - the actual endpoint may be different
      const response = await this.api.post(`/api/business/vset/businesses/reviews/${reviewId}/like/`);
      return response.data;
    } catch (error) {
      console.error('Error toggling review like:', error);
      throw error;
    }
  }

  // User Activity Methods
  async getUserActivity(): Promise<{ activities: UserActivity[]; total_count: number }> {
    try {
      const response = await this.api.get('/api/business/vset/businesses/user-activity/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  }

  // User Favorites Methods
  async getUserFavorites(): Promise<Favorite[]> {
    try {
      const response = await this.api.get('/api/business/vset/businesses/favorites/');
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      throw error;
    }
  }

  // User Reviews Methods
  async getUserReviews(): Promise<Review[]> {
    try {
      const response = await this.api.get('/api/business/vset/businesses/user-reviews/');
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  }

  // Get user's liked reviews
  async getUserLikedReviews(): Promise<string[]> {
    try {
      const response = await this.api.get('/api/business/vset/businesses/user-liked-reviews/');
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
      const response = await this.api.get(`/api/business/vset/services/${serviceId}/reviews/`);
      return response.data.results || response.data || [];
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
      const response = await this.api.post(`/api/business/vset/services/${serviceId}/reviews/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating service review:', error);
      throw error;
    }
  }

  // Simple connectivity test
  async testConnectivity(): Promise<boolean> {
    try {
      console.log('🔧 Testing API connectivity...');
      const startTime = Date.now();
      const response = await this.api.get('/api/business/vset/businesses/', { 
        params: { limit: 1 },
        timeout: 5000 // 5 second timeout for connectivity test
      });
      const endTime = Date.now();
      console.log(`🔧 API connectivity test successful: ${endTime - startTime}ms`);
      return true;
    } catch (error) {
      console.error('🔧 API connectivity test failed:', error);
      return false;
    }
  }

  /**
   * Check if a phone number is registered on WhatsApp
   */
  async checkWhatsAppNumber(phone: string): Promise<{
    success: boolean;
    phone: string;
    is_whatsapp: boolean;
    is_valid?: boolean;
    cached?: boolean;
    message?: string;
    whatsapp_info?: any;
  }> {
    try {
      const response = await this.api.post('/api/business/vset/businesses/check-whatsapp/', {
        phone: phone
      });
      return response.data;
    } catch (error: any) {
      console.error('WhatsApp check failed:', error);
      throw new Error(error.response?.data?.message || 'Failed to check WhatsApp registration');
    }
  }

  /**
   * Send OTP for authentication
   */
  async sendOTP(contact: string, method: 'email' | 'phone'): Promise<{
      success: boolean;
      message: string;
      userId?: number;
      requiresProfileCompletion?: boolean;
      otp?: string;
    }> {
      try {
        const response = await this.api.post('/api/auth/initiate-auth', {
          identifier: contact,
          auth_method: method
        });
        const data = response.data || {};

        return {
          success: data.success ?? true,
          message: data.message || `OTP sent to your ${method}`,
          userId: data.user_id,
          requiresProfileCompletion: data.requires_profile_completion,
          otp: data.otp
        };
      } catch (error: any) {
        console.error('Send OTP failed:', error);

        let currentError: any = error;
        let statusCode = currentError.response?.status;
        let errorMessage =
          currentError.response?.data?.message ||
          currentError.response?.data?.detail ||
          '';

        // Fallback to legacy endpoints if new auth endpoints aren't available
        if (statusCode === 404) {
          try {
            const legacyEndpoint = method === 'email' ? '/api/verify-email' : '/api/verify-phone';
            const legacyRequestData =
              method === 'email' ? { email: contact } : { phone: contact };

            const legacyResponse = await this.api.post(legacyEndpoint, legacyRequestData);
            const legacyData = legacyResponse.data || {};

            return {
              success: legacyData.success ?? true,
              message: legacyData.message || `OTP sent to your ${method}`,
              userId: legacyData.user_id,
              requiresProfileCompletion: legacyData.requires_profile_completion ?? false,
              otp: legacyData.otp,
            };
          } catch (legacyError: any) {
            console.error('Legacy OTP endpoint failed:', legacyError);
            // Continue to existing fallback logic using the legacy error
            currentError = legacyError;
            statusCode = currentError.response?.status;
            errorMessage =
              currentError.response?.data?.message ||
              currentError.response?.data?.detail ||
              currentError.message ||
              '';
          }
        }
        
        // If backend is not available, fall back to demo mode
        if (currentError.message?.includes('Backend server is not running') || 
            currentError.message?.includes('ERR_CONNECTION_REFUSED') ||
            currentError.message?.includes('Network Error')) {
          
          console.log(`Demo mode: Sending OTP to ${contact} via ${method}`);
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Store OTP in localStorage for demo purposes
          const demoOTP = '123456';
          localStorage.setItem('demo_otp', demoOTP);
          localStorage.setItem('demo_contact', contact);
          localStorage.setItem('demo_method', method);
          localStorage.setItem('demo_user_id', Date.now().toString());
          
          return {
            success: true,
            message: `OTP sent to your ${method} (Demo mode)`,
            requiresProfileCompletion: true,
            otp: demoOTP
          };
        }
        
        // If backend reports a user lookup issue, fall back to demo mode
        if (errorMessage.includes('does not exist') || 
            errorMessage.includes('User not found') ||
            errorMessage.includes('not registered')) {
          console.log(`[API] New user detected: ${contact}. Using demo OTP for sign-up flow.`);
          
          // Store demo OTP for verification
          const demoOTP = '123456';
          localStorage.setItem('demo_otp', demoOTP);
          localStorage.setItem('demo_contact', contact);
          localStorage.setItem('demo_method', method);
          localStorage.setItem('demo_user_id', Date.now().toString());
          
          return {
            success: true,
            message: `OTP sent to your ${method} (Demo mode - use: ${demoOTP})`,
            requiresProfileCompletion: true,
            otp: demoOTP
          };
        }
        
        throw new Error(
          errorMessage || currentError.message || 'Failed to send verification code'
        );
      }
    }

  /**
   * Verify OTP and get user info
   */
  async verifyOTP(contact: string, otp: string, method: 'email' | 'phone'): Promise<{
    success: boolean;
    user?: User;
    tokens?: {
      access: string;
      refresh: string;
    };
    is_new_user: boolean;
    message: string;
    user_id?: number;
  }> {
    try {
      const response = await this.api.post('/api/auth/verify-otp', {
        identifier: contact,
        auth_method: method,
        otp,
      });

      const data = response.data || {};
      const requiresProfileCompletion =
        data.requires_profile_completion ?? data.is_new_user ?? false;

      let mappedUser: User | undefined;
      if (data.user) {
        mappedUser = {
          ...data.user,
        };
      }

      return {
        success: data.success ?? true,
        user: mappedUser,
        tokens: data.tokens,
        is_new_user: requiresProfileCompletion,
        message: data.message || 'OTP verified successfully',
        user_id: data.user_id,
      };
    } catch (error: any) {
      console.error('Verify OTP failed:', error);

      const currentError: any = error;
      const statusCode = currentError.response?.status;
      const errorMessage =
        currentError.response?.data?.message ||
        currentError.response?.data?.detail ||
        currentError.message ||
        '';

      const isNetworkError =
        currentError.message?.includes('Backend server is not running') ||
        currentError.message?.includes('ERR_CONNECTION_REFUSED') ||
        currentError.message?.includes('Network Error');
      const isUserNotFound =
        errorMessage.includes('does not exist') ||
        errorMessage.includes('User not found') ||
        errorMessage.includes('not registered');

      if (isNetworkError || isUserNotFound || statusCode === 400) {
        console.log(`[API] Falling back to demo mode for OTP verification`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if OTP matches demo OTP
        const demoOTP = localStorage.getItem('demo_otp');
        const demoContact = localStorage.getItem('demo_contact');
        const demoMethod = localStorage.getItem('demo_method');

        console.log('[API] Demo verification check:', {
          enteredOTP: otp,
          demoOTP: demoOTP,
          enteredContact: contact,
          demoContact: demoContact,
          enteredMethod: method,
          demoMethod: demoMethod,
        });

        if (otp === demoOTP && contact === demoContact && method === demoMethod) {
          const simulatedUserId = Number(localStorage.getItem('demo_user_id') || Date.now());
          // Simulate new user for demo
          return {
            success: true,
            is_new_user: true,
            message: 'OTP verified successfully (Demo mode)',
            user_id: simulatedUserId,
          };
        }

        return {
          success: false,
          is_new_user: false,
          message: 'Invalid OTP. Please try again.',
        };
      }

      throw new Error(
        errorMessage || currentError.message || 'Failed to verify OTP. Please try again.',
      );
    }
  }

  /**
   * Complete profile after OTP verification
   */
  async registerWithOTP(payload: CompleteProfilePayload): Promise<{
    success: boolean;
    user: User;
    tokens: {
      access: string;
      refresh: string;
    };
    message: string;
  }> {
    try {
      const requestData: Record<string, unknown> = {
        identifier: payload.identifier,
        auth_method: payload.authMethod,
        first_name: payload.firstName,
        last_name: payload.lastName,
        partnership_number: payload.partnershipNumber,
        user_type: payload.userType,
      };

      if (payload.bio) requestData.bio = payload.bio;
      if (payload.profileImageUrl) requestData.profile_image_url = payload.profileImageUrl;
      if (payload.address) requestData.address = payload.address;
      if (payload.county) requestData.county = payload.county;
      if (payload.city) requestData.city = payload.city;
      if (payload.website) requestData.website = payload.website;

      const response = await this.api.post('/api/auth/complete-profile', requestData);
      const data = response.data || {};

      if (!data.user || !data.tokens) {
        throw new Error(data.message || 'Failed to complete profile');
      }

      return {
        success: data.success ?? true,
        user: data.user,
        tokens: data.tokens,
        message: data.message || 'Profile completed successfully',
      };
    } catch (error: any) {
      console.error('Complete profile failed:', error);

      // If backend is not available, fall back to demo mode
      const statusCode = error.response?.status;
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message;

      if (statusCode === 404 ||
          error.message.includes('Backend server is not running') ||
          error.message.includes('ERR_CONNECTION_REFUSED') ||
          error.message.includes('Network Error')) {

        console.log(`Demo mode: Completing profile for ${payload.identifier} as ${payload.userType}`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const now = new Date().toISOString();

        const demoUser: User = {
          id: 'demo-user-123',
          first_name: payload.firstName,
          last_name: payload.lastName,
          partnership_number: payload.partnershipNumber,
          email: payload.authMethod === 'email' ? payload.identifier : undefined,
          phone: payload.authMethod === 'phone' ? payload.identifier : undefined,
          user_type: payload.userType,
          profile_image_url: payload.profileImageUrl,
          bio: payload.bio,
          address: payload.address,
          county: payload.county,
          city: payload.city,
          website: payload.website,
          is_verified: true,
          email_verified: payload.authMethod === 'email',
          phone_verified: payload.authMethod === 'phone',
          is_active: true,
          created_at: now,
          updated_at: now,
        };

        const demoTokens = {
          access: 'demo-access-token-123',
          refresh: 'demo-refresh-token-123',
        };

        return {
          success: true,
          user: demoUser,
          tokens: demoTokens,
          message: 'Profile completed successfully (Demo mode)',
        };
      }

      throw new Error(errorMessage || 'Failed to complete profile');
    }
  }

  /**
   * Create business with simplified data structure for OTP registration flow
   */
  async createBusinessFromRegistration(data: {
    name: string;
    category: string;
    subcategory?: string;
    description: string;
    businessType?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    onlinePresence?: string;
    churchAffiliation?: string;
    businessTypeRadio?: string;
    phone?: string;
    email?: string;
    website?: string;
    hours?: string;
    services?: string;
    productsServices?: Array<{
      id: string;
      name: string;
      description: string;
      price: string;
      currency?: 'KES' | 'USD';
      negotiable?: boolean;
      type: 'product' | 'service';
      images: Array<{
        id: string;
        type: 'file' | 'url';
        file?: File;
        url?: string;
        preview: string;
        name: string;
      }>;
    }>;
  }): Promise<{
    success: boolean;
    business?: Business;
    message: string;
  }> {
    try {
      // Find category ID from the category input (supporting multiple formats)
      let category;
      try {
        const categories = await this.getCategories();
        const normalizedInput = (data.category || '').trim().toLowerCase();

        category = categories.results.find((cat) => {
          const nameMatch = cat.name?.trim().toLowerCase() === normalizedInput;
          const slugMatch = (cat.slug || '').trim().toLowerCase() === normalizedInput;
          return nameMatch || slugMatch;
        });

        if (!category && categories.results.length > 0) {
          console.warn(
            `[API] Category "${data.category}" not found. Using default category "${categories.results[0].name}".`
          );
          category = categories.results[0];
        }
      } catch (error) {
        console.warn('Could not fetch categories, using demo category:', error);
        // Use a demo category for fallback
        category = { id: 1, name: data.category };
      }
      
      if (!category) {
        throw new Error('Invalid business category');
      }

      const businessData: BusinessCreateRequest = {
        business_name: data.name,
        category_id: category.id,
        description: data.description,
        address: data.address || '',
        city: data.city || '',
        country: data.country || 'Kenya',
        phone: data.phone || '',
        email: data.email,
        website: data.website,
        // Add additional fields as needed
        hours: data.hours ? [{
          day_of_week: 1,
          open_time: '09:00',
          close_time: '17:00',
          is_closed: false
        }] : [],
        services_data: data.productsServices && data.productsServices.length > 0 
          ? data.productsServices.map((item) => ({
              name: item.name,
              description: item.description,
              price_range: item.price ? `${item.currency || 'KES'} ${item.price}${item.negotiable ? ' (Negotiable)' : ''}` : 'Contact for pricing',
              duration: 'N/A',
              is_available: true,
              photos: item.images.map(img => img.preview).filter(Boolean),
              type: item.type
            }))
          : data.services 
            ? [{
                name: 'General Services',
                description: data.services,
                price_range: 'Contact for pricing',
                duration: 'Varies',
                is_available: true,
                photos: []
              }]
            : []
      };

      try {
        const business = await this.createBusiness(businessData);
        return {
          success: true,
          business: business,
          message: 'Business created successfully'
        };
      } catch (createError: any) {
        console.warn('Business creation failed, using demo mode:', createError);
        
        // If backend is not available, return success for demo purposes
        if (createError.message.includes('Backend server is not running') || 
            createError.message.includes('ERR_CONNECTION_REFUSED') ||
            createError.message.includes('Network Error')) {
          
          const demoBusiness: Business = {
            id: 'demo-business-123',
            user: null,
            business_name: data.name,
            description: data.description,
            address: data.address,
            country: data.country || '',
            city: data.city,
            phone: data.phone,
            email: data.email,
            website: data.website,
            is_active: true,
            is_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category: {
              id: category.id,
              name: category.name,
              slug: category.slug || String(category.id || 'demo-category'),
            },
            review_count: 0,
            rating: 0,
            is_featured: false
          };
          
          return {
            success: true,
            business: demoBusiness,
            message: 'Business created successfully (Demo mode)'
          };
        }
        
        throw createError;
      }
    } catch (error: any) {
      console.error('Create business failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to create business'
      };
    }
  }


}

// Create singleton instance
export const apiService = new ApiService();