import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

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
  category: Category;
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
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  business_image_url?: string;
  business_logo_url?: string;
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
  partnership_number: string;
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
  category: number;
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
        
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('access_token', response.access);
              
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${response.access}`;
              }
              
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh token failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Authentication Methods
  async login(data: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.api.post('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.api.post('/auth/register', data);
    return response.data;
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
    const response = await this.api.post('/business/', data);
    return response.data;
  }

  async updateBusiness(id: string, data: Partial<BusinessCreateRequest>): Promise<Business> {
    const response = await this.api.put(`/business/${id}`, data);
    return response.data;
  }

  async deleteBusiness(id: string): Promise<void> {
    await this.api.delete(`/business/${id}`);
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
  async getBusinessProducts(businessId: string): Promise<Product[]> {
    const response = await this.api.get(`/business/api/businesses/${businessId}/products`);
    return response.data;
  }

  async createProduct(businessId: string, data: {
    name: string;
    description?: string;
    price: number;
    price_currency?: string;
    product_image_url?: string;
    in_stock?: boolean;
  }): Promise<Product> {
    const response = await this.api.post(`/business/api/businesses/${businessId}/products`, data);
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
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.api.put('/users/profile', data);
    return response.data;
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }

  setAuthTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export types for use in components
export type {
  User,
  Business,
  Category,
  Service,
  Product,
  Review,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  BusinessCreateRequest,
  OTPRequest,
  OTPVerificationRequest,
}; 