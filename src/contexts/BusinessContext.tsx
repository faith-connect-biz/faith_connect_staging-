import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, Business, Category, BusinessCreateRequest } from '@/services/api';

interface BusinessContextType {
  businesses: Business[];
  categories: Category[];
  featuredBusinesses: Business[];
  services: any[];
  products: any[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Actions
  fetchBusinesses: (params?: {
    search?: string;
    category?: number;
    city?: string;
    county?: string;
    rating?: number;
    is_featured?: boolean;
    ordering?: string;
    page?: number;
  }) => Promise<void>;
  
  fetchCategories: () => Promise<void>;
  fetchServices: (params?: any) => Promise<void>;
  fetchProducts: (params?: any) => Promise<void>;
  createBusiness: (data: BusinessCreateRequest) => Promise<Business>;
  updateBusiness: (id: string, data: BusinessCreateRequest) => Promise<Business>;
  deleteBusiness: (id: string) => Promise<void>;
  toggleFavorite: (businessId: string) => Promise<void>;
  
  // Utility
  getBusinessById: (id: string) => Business | undefined;
  clearError: () => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

interface BusinessProviderProps {
  children: ReactNode;
}

export const BusinessProvider: React.FC<BusinessProviderProps> = ({ children }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Computed featured businesses
  const featuredBusinesses = businesses?.filter(business => 
    business.is_featured && business.is_active && business.is_verified
  ) || [];

  const fetchBusinesses = async (params?: {
    search?: string;
    category?: number;
    city?: string;
    county?: string;
    rating?: number;
    is_featured?: boolean;
    ordering?: string;
    page?: number;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getBusinesses(params);
      setBusinesses(response.results);
      setTotalCount(response.count);
      setCurrentPage(params?.page || 1);
      setHasNextPage(!!response.next);
      setHasPreviousPage(!!response.previous);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch businesses';
      setError(errorMessage);
      console.error('Failed to fetch businesses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setError(null);
      const response = await apiService.getCategories();
      
      // Handle paginated response
      if (response && typeof response === 'object' && 'results' in response && Array.isArray(response.results)) {
        setCategories(response.results);
      } else if (Array.isArray(response)) {
        // Handle direct array response
        setCategories(response);
      } else {
        console.error('Categories API returned unexpected response format:', response);
        setCategories([]);
        setError('Categories API returned invalid format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Failed to fetch categories:', err);
      setCategories([]); // Set empty array on error
    }
  };

  const fetchServices = async (params?: any) => {
    try {
      setError(null);
      const response = await apiService.getAllServices(params);
      setServices(response.results || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch services';
      setError(errorMessage);
      console.error('Failed to fetch services:', err);
    }
  };

  const fetchProducts = async (params?: any) => {
    try {
      setError(null);
      const response = await apiService.getAllProducts(params);
      setProducts(response.results || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      console.error('Failed to fetch products:', err);
    }
  };

  const createBusiness = async (data: BusinessCreateRequest): Promise<Business> => {
    try {
      setError(null);
      const newBusiness = await apiService.createBusiness(data);
      
      // Add to current list if it's the first page
      if (currentPage === 1) {
        setBusinesses(prev => [newBusiness, ...prev]);
        setTotalCount(prev => prev + 1);
      }
      
      return newBusiness;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create business';
      setError(errorMessage);
      console.error('Failed to create business:', err);
      throw err;
    }
  };

  const updateBusiness = async (id: string, data: BusinessCreateRequest): Promise<Business> => {
    try {
      setError(null);
      const updatedBusiness = await apiService.updateBusiness(id, data);
      
      // Update in current list
      setBusinesses(prev => 
        prev.map(business => 
          business.id === id ? updatedBusiness : business
        )
      );
      
      return updatedBusiness;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update business';
      setError(errorMessage);
      console.error('Failed to update business:', err);
      throw err;
    }
  };

  const deleteBusiness = async (id: string): Promise<void> => {
    try {
      setError(null);
      await apiService.deleteBusiness(id);
      
      // Remove from current list
      setBusinesses(prev => prev.filter(business => business.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete business';
      setError(errorMessage);
      console.error('Failed to delete business:', err);
      throw err;
    }
  };

  const toggleFavorite = async (businessId: string): Promise<void> => {
    try {
      setError(null);
      await apiService.toggleFavorite(businessId);
      
      // Update business in list (toggle favorite status)
      // Note: This is a simplified approach. In a real app, you might want to track favorites separately
      setBusinesses(prev => 
        prev.map(business => 
          business.id === businessId 
            ? { ...business, is_featured: !business.is_featured }
            : business
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle favorite';
      setError(errorMessage);
      console.error('Failed to toggle favorite:', err);
      throw err;
    }
  };

  const getBusinessById = (id: string): Business | undefined => {
    return businesses?.find(business => business.id === id);
  };

  const clearError = () => {
    setError(null);
  };

  // Load initial data
  useEffect(() => {
    fetchBusinesses();
    fetchCategories();
    fetchServices();
    fetchProducts();
  }, []);

  const value: BusinessContextType = {
    businesses,
    categories,
    featuredBusinesses,
    services,
    products,
    isLoading,
    error,
    totalCount,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    fetchBusinesses,
    fetchCategories,
    fetchServices,
    fetchProducts,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    toggleFavorite,
    getBusinessById,
    clearError,
  };

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
};

export const useBusiness = (): BusinessContextType => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}; 