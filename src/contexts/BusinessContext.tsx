import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { apiService, Business, Category, BusinessCreateRequest, Service, Product } from '@/services/api';

interface BusinessContextType {
  businesses: Business[];
  categories: Category[];
  featuredBusinesses: Business[];
  services: any[];
  products: any[];
  isLoading: boolean;
  isLoadingBusinesses: boolean;
  isLoadingProducts: boolean;
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
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  
  fetchCategories: () => Promise<void>;
  fetchProducts: (params?: {
    search?: string;
    category?: string;
    in_stock?: boolean;
    price_currency?: string;
    ordering?: string;
    page?: number;
  }) => Promise<void>;
  createBusiness: (data: BusinessCreateRequest) => Promise<Business>;
  updateBusiness: (id: string, data: BusinessCreateRequest) => Promise<Business>;
  deleteBusiness: (id: string) => Promise<void>;
  toggleFavorite: (businessId: string) => Promise<void>;
  
  // Utility
  getBusinessById: (id: string) => Business | undefined;
  getUserBusiness: () => Promise<Business | null>;
  clearError: () => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

interface BusinessProviderProps {
  children: ReactNode;
}

export const BusinessProvider: React.FC<BusinessProviderProps> = ({ children }) => {
  console.log('BusinessProvider: Initializing...');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Computed featured businesses
  const featuredBusinesses = useMemo(() => 
    Array.isArray(businesses) ? businesses.filter(business => 
      business.is_featured && business.is_active && business.is_verified
    ) : [], [businesses]
  );

  // Computed services and products from businesses
  const computedServices = useMemo(() => 
    Array.isArray(businesses) ? businesses.flatMap(business => {
      console.log(`Processing business ${business.id}:`, business);
      console.log(`Business services:`, business.services);
      return business.services?.map((service, index) => ({
        ...service,
        id: `${business.id}-service-${index}`, // Generate unique ID
        business: {
          id: business.id,
          business_name: business.business_name,
          category: business.category,
          city: business.city,
          county: business.county,
          rating: business.rating,
          is_verified: business.is_verified,
          is_active: business.is_active
        }
      })) || [];
    }) : [], [businesses]
  );

  // Use fetched products instead of computed ones
  // const computedProducts = useMemo(() => 
  //   Array.isArray(businesses) ? businesses.flatMap(business => {
  //     console.log(`Processing business ${business.id} products:`, business.products);
  //     return business.products?.map((product, index) => ({
  //       ...product,
  //       id: `${business.id}-product-${index}`, // Generate unique ID
  //       business: {
  //       id: business.id,
  //       business_name: business.business_name,
  //       category: business.category,
  //       city: business.city,
  //       county: business.county,
  //       rating: business.rating,
  //       is_verified: business.is_verified,
  //       is_active: business.is_active
  //     }
  //   })) || [];
  // }) : [], [businesses]
  // );

  // Debug logging
  console.log('BusinessContext - businesses:', businesses);
  console.log('BusinessContext - computedServices:', computedServices);
  console.log('BusinessContext - computedProducts:', products); // Changed from computedProducts to products

  const fetchBusinesses = useCallback(async (params?: {
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
  }) => {
    console.log('fetchBusinesses - Called with params:', params);
    try {
      setIsLoadingBusinesses(true);
      setError(null);
      
      // Calculate offset if page and limit are provided
      let apiParams = { ...params };
      if (params?.page && params?.limit) {
        apiParams.offset = (params.page - 1) * params.limit;
        apiParams.limit = params.limit;
      }
      
      console.log('fetchBusinesses - API params being sent:', apiParams);
      const response = await apiService.getBusinesses(apiParams);
      console.log('fetchBusinesses - API response:', response);
      
      // Ensure businesses is always an array
      if (response && response.results && Array.isArray(response.results)) {
        console.log('fetchBusinesses - Using response.results:', response.results);
        console.log('fetchBusinesses - Setting businesses to:', response.results);
        setBusinesses(response.results);
        setTotalCount(response.count || 0);
        setCurrentPage(params?.page || 1);
        setHasNextPage(!!response.next);
        setHasPreviousPage(!!response.previous);
      } else if (Array.isArray(response)) {
        console.log('fetchBusinesses - Using direct response array:', response);
        setBusinesses(response);
        setTotalCount(response.length);
        setCurrentPage(1);
        setHasNextPage(false);
        setHasPreviousPage(false);
      } else {
        console.error('Businesses API returned unexpected response format:', response);
        setBusinesses([]);
        setTotalCount(0);
        setCurrentPage(1);
        setHasNextPage(false);
        setHasPreviousPage(false);
        setError('Businesses API returned invalid format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch businesses';
      setError(errorMessage);
      console.error('Failed to fetch businesses:', err);
      setBusinesses([]); // Set empty array on error
      setTotalCount(0);
      setCurrentPage(1);
      setHasNextPage(false);
      setHasPreviousPage(false);
    } finally {
      setIsLoadingBusinesses(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setError(null);
      const response = await apiService.getCategories();
      console.log('fetchCategories - API response:', response);
      
      if (response && typeof response === 'object' && 'results' in response && Array.isArray(response.results)) {
        console.log('fetchCategories: Using paginated response, setting categories to:', response.results);
        setCategories(response.results);
      } else if (Array.isArray(response)) {
        // Handle direct array response
        console.log('fetchCategories: Using direct array response, setting categories to:', response);
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
  }, []);

  const fetchProducts = useCallback(async (params?: {
    search?: string;
    category?: string;
    in_stock?: boolean;
    price_currency?: string;
    ordering?: string;
    page?: number;
  }) => {
    try {
      setIsLoadingProducts(true);
      setError(null);
      const response = await apiService.getAllProducts(params);
      if (response && typeof response === 'object' && 'results' in response && Array.isArray(response.results)) {
        setProducts(response.results);
        setTotalCount(response.count || 0);
        setCurrentPage(params?.page || 1);
        setHasNextPage(!!response.next);
        setHasPreviousPage(!!response.previous);
      } else if (Array.isArray(response)) {
        setProducts(response);
        setTotalCount(response.length);
        setCurrentPage(1);
        setHasNextPage(false);
        setHasPreviousPage(false);
      } else {
        console.error('Products API returned unexpected response format:', response);
        setProducts([]);
        setTotalCount(0);
        setCurrentPage(1);
        setHasNextPage(false);
        setHasPreviousPage(false);
        setError('Products API returned invalid format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      console.error('Failed to fetch products:', err);
      setProducts([]);
      setTotalCount(0);
      setCurrentPage(1);
      setHasNextPage(false);
      setHasPreviousPage(false);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);


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

  const getUserBusiness = async (): Promise<Business | null> => {
    try {
      setError(null);
      const userBusiness = await apiService.getUserBusiness();
      return userBusiness || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get user business';
      setError(errorMessage);
      console.error('Failed to get user business:', err);
      return null;
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Initial data loading
  useEffect(() => {
    console.log('BusinessContext: Initial data loading useEffect triggered');
    console.log('BusinessContext: Calling fetchBusinesses with page: 1, limit: 15');
    fetchBusinesses({ page: 1, limit: 15 });
    console.log('BusinessContext: Calling fetchCategories');
    fetchCategories();
    console.log('BusinessContext: Calling fetchProducts');
    fetchProducts();
  }, []); // Empty dependency array - only run once on mount

  const value: BusinessContextType = {
    businesses,
    categories,
    featuredBusinesses,
    services: computedServices,
    products: products, // Changed from computedProducts to products
    isLoading,
    isLoadingBusinesses,
    isLoadingProducts,
    error,
    totalCount,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    fetchBusinesses,
    fetchCategories,
    fetchProducts,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    toggleFavorite,
    getBusinessById,
    getUserBusiness,
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