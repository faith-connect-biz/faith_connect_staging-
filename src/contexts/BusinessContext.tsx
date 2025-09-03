import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import { apiService } from '@/services/apiService';

// Constants for consistent limits across the entire app
const DEFAULT_LIMITS = {
  INITIAL: 20,      // Initial page load
  STANDARD: 20,     // Standard pagination
  SEARCH: 50,       // Search results
  ALL: 100          // Load all (only when explicitly requested)
};

interface Business {
  id: string;
  business_name: string;
  description?: string;
  address?: string;
  city?: string;
  county?: string;
  phone?: string;
  email?: string;
  website?: string;
  category?: number;
  rating?: number;
  is_featured?: boolean;
  hasServices?: boolean;
  servicesCount?: number;
  hasProducts?: boolean;
  productsCount?: number;
  allKeys?: string[];
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: string;
  business?: string | Business;
  category?: string;
  allKeys?: string[];
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  in_stock?: boolean;
  business?: string | Business;
  category?: string;
  allKeys?: string[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface BusinessContextType {
  // State
  businesses: Business[];
  services: Service[];
  products: Product[];
  categories: Category[];
  
  // Loading states
  isLoading: boolean;
  isLoadingBusinesses: boolean;
  isLoadingServices: boolean;
  isLoadingProducts: boolean;
  
  // Pagination
  currentPage: number;
  totalCount: number;
  totalServicesCount: number;
  totalProductsCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  fetchBusinesses: (params?: any) => Promise<void>;
  fetchServices: (params?: any) => Promise<void>;
  fetchProducts: (params?: any) => Promise<void>;
  fetchCategories: () => Promise<void>;
  
  // Cache management
  clearCache: () => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

// Utility function to shuffle arrays for variety
const shuffleArray = (array: any[]): any[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Simple cache implementation
class SimpleCache {
  private cache = new Map();
  private timestamps = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any): void {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now());
  }

  get(key: string): any | null {
    const timestamp = this.timestamps.get(key);
    if (!timestamp || Date.now() - timestamp > this.TTL) {
      this.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.timestamps.clear();
  }
}

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalServicesCount, setTotalServicesCount] = useState(0);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  
  // Cache instances
  const businessesCache = new SimpleCache();
  const servicesCache = new SimpleCache();
  const productsCache = new SimpleCache();
  
  // Abort controllers for request cancellation
  const businessesAbortRef = useRef<AbortController | null>(null);
  const servicesAbortRef = useRef<AbortController | null>(null);
  const productsAbortRef = useRef<AbortController | null>(null);

  // Generate cache key for consistent caching
  const generateCacheKey = (type: string, params: any): string => {
    const sortedParams = Object.keys(params || {})
      .sort()
      .reduce((result: any, key) => {
        if (params[key] !== undefined && params[key] !== null) {
          result[key] = params[key];
        }
        return result;
      }, {});
    return `${type}:${JSON.stringify(sortedParams)}`;
  };

  // Unified fetch function with caching
  const fetchWithCache = async (
    type: string,
    fetchFunction: (params: any) => Promise<any>,
    params: any,
    cache: SimpleCache,
    setData: (data: any[]) => void,
    setLoading: (loading: boolean) => void,
    setTotal: (total: number) => void,
    setPage: (page: number) => void,
    setNext: (next: boolean) => void,
    setPrev: (prev: boolean) => void
  ): Promise<void> => {
    try {
      const cacheKey = generateCacheKey(type, params);
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData && !params.search) {
        console.log(`🔍 BusinessContext - Serving ${type} from cache:`, cacheKey);
        setData(cachedData.data);
        setTotal(cachedData.total);
        setPage(cachedData.page);
        setNext(cachedData.hasNext);
        setPrev(cachedData.hasPrev);
        setLoading(false);
        return;
      }

      // Cancel any in-flight request
      const abortRef = type === 'businesses' ? businessesAbortRef : 
                      type === 'services' ? servicesAbortRef : productsAbortRef;
      if (abortRef.current) {
        abortRef.current.abort();
      }
      
      const controller = new AbortController();
      abortRef.current = controller;
      
      setLoading(true);
      setError(null);

      // Ensure consistent limits
      const apiParams = {
        ...params,
        limit: params.limit || DEFAULT_LIMITS.STANDARD,
        offset: params.offset || ((params.page || 1) - 1) * (params.limit || DEFAULT_LIMITS.STANDARD)
      };

      console.log(`🔍 BusinessContext - Fetching ${type} with params:`, apiParams);
      
      const response = await fetchFunction(apiParams);
      
      if (response && typeof response === 'object' && 'results' in response && Array.isArray(response.results)) {
        const shuffledData = shuffleArray(response.results);
        setData(shuffledData);
        setTotal(response.count || 0);
        setPage(apiParams.page || 1);
        setNext(!!response.next);
        setPrev(!!response.previous);

        // Cache the result
        cache.set(cacheKey, {
          data: shuffledData,
          total: response.count || 0,
          page: apiParams.page || 1,
          hasNext: !!response.next,
          hasPrev: !!response.previous
        });

        console.log(`🔍 BusinessContext - ${type} fetched and cached:`, {
          count: response.count || 0,
          resultsLength: response.results.length,
          page: apiParams.page || 1
        });
      } else if (Array.isArray(response)) {
        const shuffledData = shuffleArray(response);
        setData(shuffledData);
        setTotal(response.length);
        setPage(1);
        setNext(false);
        setPrev(false);
      } else {
        console.error(`${type} API returned unexpected response format:`, response);
        setError(`${type} API returned invalid format`);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log(`🔍 BusinessContext - ${type} request was cancelled`);
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch ${type}`;
      setError(errorMessage);
      console.error(`Failed to fetch ${type}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = useCallback(async (params?: any) => {
    await fetchWithCache(
      'businesses',
      apiService.getBusinesses,
      params,
      businessesCache,
      setBusinesses,
      setIsLoadingBusinesses,
      setTotalCount,
      setCurrentPage,
      setHasNextPage,
      setHasPreviousPage
    );
  }, []);

  const fetchServices = useCallback(async (params?: any) => {
    await fetchWithCache(
      'services',
      apiService.getAllServices,
      params,
      servicesCache,
      setServices,
      setIsLoadingServices,
      setTotalServicesCount,
      setCurrentPage,
      setHasNextPage,
      setHasPreviousPage
    );
  }, []);

  const fetchProducts = useCallback(async (params?: any) => {
    await fetchWithCache(
      'products',
      apiService.getAllProducts,
      params,
      productsCache,
      setProducts,
      setIsLoadingProducts,
      setTotalProductsCount,
      setCurrentPage,
      setHasNextPage,
      setHasPreviousPage
    );
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setError(null);
      const response = await apiService.getCategories();
      
      if (response && typeof response === 'object' && 'results' in response && Array.isArray(response.results)) {
        const shuffledCategories = shuffleArray(response.results);
        setCategories(shuffledCategories);
        console.log('🔍 BusinessContext - Categories fetched:', response.results.length);
      } else if (Array.isArray(response)) {
        const shuffledCategories = shuffleArray(response);
        setCategories(shuffledCategories);
        console.log('🔍 BusinessContext - Categories fetched (direct array):', response.length);
      } else {
        console.error('Categories API returned unexpected response format:', response);
        setError('Categories API returned invalid format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  // Cache management functions
  const clearCache = useCallback(() => {
    businessesCache.clear();
    servicesCache.clear();
    productsCache.clear();
    console.log('🔍 BusinessContext - All caches cleared');
  }, []);

  // Computed values
  const computedServices = useMemo(() => {
    return services.map(service => ({
      ...service,
      business: businesses.find(b => b.id === service.business)
    }));
  }, [services, businesses]);

  const computedProducts = useMemo(() => {
    return products.map(product => ({
      ...product,
      business: businesses.find(b => b.id === product.business)
    }));
  }, [products, businesses]);

  const value: BusinessContextType = {
    // State
    businesses,
    services: computedServices,
    products: computedProducts,
    categories,
    
    // Loading states
    isLoading,
    isLoadingBusinesses,
    isLoadingServices,
    isLoadingProducts,
    
    // Pagination
    currentPage,
    totalCount,
    totalServicesCount,
    totalProductsCount,
    hasNextPage,
    hasPreviousPage,
    
    // Error handling
    error,
    
    // Actions
    fetchBusinesses,
    fetchServices,
    fetchProducts,
    fetchCategories,
    
    // Cache management
    clearCache
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};
