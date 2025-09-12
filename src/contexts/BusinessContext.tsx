import React, { createContext, useContext, useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { apiService } from '@/services/api';

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
  price_range?: string;
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
  subcategories?: string[];
  icon?: string;
  is_active?: boolean;
  sort_order?: number;
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
  totalPages: number;
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
  fetchServicesWithPagination: (params?: any) => Promise<void>;
  fetchProductsWithPagination: (params?: any) => Promise<void>;
  fetchBusinessesWithSearch: (params?: any) => Promise<void>;
  
  // Cache management
  clearCache: () => void;
  
  // Utility functions
  getPriceRanges: () => { label: string; value: [number, number] }[];
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
  
  // Debug state changes
  useEffect(() => {
    console.log('🔍 BusinessContext - Services state changed:', {
      servicesLength: services?.length || 0,
      sampleServices: services?.slice(0, 2),
      businessFieldType: services?.[0]?.business ? typeof services[0].business : 'undefined'
    });
  }, [services]);
  
  useEffect(() => {
    console.log('🔍 BusinessContext - Products state changed:', {
      productsLength: products?.length || 0,
      sampleProducts: products?.slice(0, 2),
      businessFieldType: products?.[0]?.business ? typeof products[0].business : 'undefined'
    });
  }, [products]);
  
  useEffect(() => {
    console.log('🔍 BusinessContext - Businesses state changed:', {
      businessesLength: businesses?.length || 0,
      sampleBusinesses: businesses?.slice(0, 2)
    });
  }, [businesses]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
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
    const cacheKey = `${type}:${JSON.stringify(sortedParams)}`;
    console.log(`🔍 BusinessContext - Generated cache key for ${type}:`, {
      params,
      sortedParams,
      cacheKey
    });
    return cacheKey;
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
    setPrev: (prev: boolean) => void,
    setTotalPages?: (totalPages: number) => void
  ): Promise<void> => {
    const cacheKey = generateCacheKey(type, params);
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData && !params.search) {
      console.log(`🔍 BusinessContext - Serving ${type} from cache:`, {
        cacheKey,
        cachedDataLength: cachedData.data?.length || 0,
        cachedData: cachedData.data,
        sampleCachedData: cachedData.data?.slice(0, 2),
        hasBusinessData: cachedData.data?.[0]?.business,
        businessFieldType: typeof cachedData.data?.[0]?.business,
        firstItemKeys: cachedData.data?.[0] ? Object.keys(cachedData.data[0]) : [],
        businessFieldValue: cachedData.data?.[0]?.business
      });
      
      // Store the raw data from cache - computed values will handle business relationships
      setData(cachedData.data);
      setTotal(cachedData.total);
      setPage(cachedData.page);
      setNext(cachedData.hasNext);
      setPrev(cachedData.hasPrev);
      if (setTotalPages && cachedData.totalPages) {
        setTotalPages(cachedData.totalPages);
      }
      setLoading(false);
      console.log(`🔍 BusinessContext - Cache served for ${type}, loading set to false`);
      
      // Debug: Log what was set
      console.log(`🔍 BusinessContext - After setting ${type} data:`, {
        type,
        dataLength: cachedData.data?.length || 0,
        sampleData: cachedData.data?.slice(0, 2),
        businessFieldType: typeof cachedData.data?.[0]?.business,
        businessFieldValue: cachedData.data?.[0]?.business
      });
      
      return;
    }

    try {
      // Cancel any in-flight request
      const abortRef = type === 'businesses' ? businessesAbortRef : 
                      type === 'services' ? servicesAbortRef : productsAbortRef;
      if (abortRef.current) {
        abortRef.current.abort();
      }
      
      const controller = new AbortController();
      abortRef.current = controller;
      
      console.log(`🔍 BusinessContext - Setting loading to true for ${type}`);
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
        const limit = apiParams.limit || DEFAULT_LIMITS.STANDARD;
        const totalPages = Math.ceil((response.count || 0) / limit);
        
        console.log(`🔍 BusinessContext - Setting ${type} data:`, {
          type,
          dataLength: shuffledData.length,
          sampleData: shuffledData.slice(0, 2),
          totalPages
        });
        setData(shuffledData);
        setTotal(response.count || 0);
        setPage(apiParams.page || 1);
        setNext(!!response.next);
        setPrev(!!response.previous);
        if (setTotalPages) {
          setTotalPages(totalPages);
        }

        // Cache the result
        const cacheData = {
          data: shuffledData,
          total: response.count || 0,
          page: apiParams.page || 1,
          totalPages,
          hasNext: !!response.next,
          hasPrev: !!response.previous
        };
        console.log(`🔍 BusinessContext - Caching ${type} data:`, {
          cacheKey,
          cacheDataLength: shuffledData.length,
          cacheData
        });
        cache.set(cacheKey, cacheData);

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
      console.log(`🔍 BusinessContext - Setting loading to false for ${type} in finally block`);
      setLoading(false);
    }
  };

  const fetchBusinesses = useCallback(async (params?: any) => {
    await fetchWithCache(
      'businesses',
      apiService.getBusinesses.bind(apiService),
      params,
      businessesCache,
      setBusinesses,
      setIsLoadingBusinesses,
      setTotalCount,
      setCurrentPage,
      setHasNextPage,
      setHasPreviousPage,
      setTotalPages
    );
  }, []);

  const fetchServices = useCallback(async (params?: any) => {
    await fetchWithCache(
      'services',
      apiService.getAllServices.bind(apiService),
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
      apiService.getAllProducts.bind(apiService),
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

  // Enhanced fetchServices with proper server-side pagination and search
  const fetchServicesWithPagination = useCallback(async (params?: any) => {
    await fetchWithCache(
      'services',
      apiService.getAllServices.bind(apiService),
      params,
      servicesCache,
      setServices,
      setIsLoadingServices,
      setTotalServicesCount,
      setCurrentPage,
      setHasNextPage,
      setHasPreviousPage,
      setTotalPages
    );
  }, []);

  // Enhanced fetchProducts with proper server-side pagination and search
  const fetchProductsWithPagination = useCallback(async (params?: any) => {
    await fetchWithCache(
      'products',
      apiService.getAllProducts.bind(apiService),
      params,
      productsCache,
      setProducts,
      setIsLoadingProducts,
      setTotalProductsCount,
      setCurrentPage,
      setHasNextPage,
      setHasPreviousPage,
      setTotalPages
    );
  }, []);

  // Enhanced fetchBusinesses with search support
  const fetchBusinessesWithSearch = useCallback(async (params?: any) => {
    await fetchWithCache(
      'businesses',
      apiService.getBusinesses.bind(apiService),
      params,
      businessesCache,
      setBusinesses,
      setIsLoadingBusinesses,
      setTotalCount,
      setCurrentPage,
      setHasNextPage,
      setHasPreviousPage,
      setTotalPages
    );
  }, []);

  // Initialize data on context mount
  useEffect(() => {
    // Fetch all data on initial load for the home page
    Promise.all([
      fetchCategories(),
      fetchBusinesses({ page: 1, limit: 20 }), // Server-side pagination
      fetchServicesWithPagination({ page: 1, limit: 20 }), // Server-side pagination
      fetchProductsWithPagination({ page: 1, limit: 20 })  // Server-side pagination
    ]).catch(error => {
      console.error('Error loading initial data:', error);
    });
  }, [fetchCategories, fetchBusinesses, fetchServicesWithPagination, fetchProductsWithPagination]);

  // Cache management functions
  const clearCache = useCallback(() => {
    businessesCache.clear();
    servicesCache.clear();
    productsCache.clear();
    console.log('🔍 BusinessContext - All caches cleared');
  }, []);

  // Utility function to get dynamic price ranges
  const getPriceRanges = useCallback(() => {
    const allPrices: number[] = [];
    
    // Extract prices from products
    if (Array.isArray(products)) {
      products.forEach(product => {
        if (product.price && typeof product.price === 'number') {
          allPrices.push(product.price);
        }
      });
    }
    
    // Extract prices from services (parse price_range strings)
    if (Array.isArray(services)) {
      services.forEach(service => {
        if (service.price_range) {
          // Parse price range strings like "KSh 500 - 1000" or "KSh 1000+"
          const priceMatch = service.price_range.match(/(\d+(?:,\d{3})*(?:\.\d{2})?)/g);
          if (priceMatch) {
            priceMatch.forEach(priceStr => {
              const price = parseFloat(priceStr.replace(/,/g, ''));
              if (!isNaN(price)) {
                allPrices.push(price);
              }
            });
          }
        }
      });
    }
    
    if (allPrices.length === 0) {
      // Return default ranges if no prices found
      return [
        { label: 'Any Price', value: [0, 10000] as [number, number] },
        { label: 'Under KSh 1,000', value: [0, 1000] as [number, number] },
        { label: 'KSh 1,000 - KSh 5,000', value: [1000, 5000] as [number, number] },
        { label: 'KSh 5,000+', value: [5000, 10000] as [number, number] }
      ];
    }
    
    // Sort prices and create dynamic ranges
    allPrices.sort((a, b) => a - b);
    const minPrice = allPrices[0];
    const maxPrice = allPrices[allPrices.length - 1];
    
    // Create dynamic ranges based on actual data
    const ranges = [
      { label: 'Any Price', value: [0, maxPrice] as [number, number] }
    ];
    
    // Calculate quartiles for better distribution
    const q1 = allPrices[Math.floor(allPrices.length * 0.25)];
    const q2 = allPrices[Math.floor(allPrices.length * 0.5)];
    const q3 = allPrices[Math.floor(allPrices.length * 0.75)];
    
    if (minPrice < q1) {
      ranges.push({ 
        label: `Under KSh ${Math.round(q1).toLocaleString()}`, 
        value: [minPrice, q1] as [number, number] 
      });
    }
    
    if (q1 < q2) {
      ranges.push({ 
        label: `KSh ${Math.round(q1).toLocaleString()} - KSh ${Math.round(q2).toLocaleString()}`, 
        value: [q1, q2] as [number, number] 
      });
    }
    
    if (q2 < q3) {
      ranges.push({ 
        label: `KSh ${Math.round(q2).toLocaleString()} - KSh ${Math.round(q3).toLocaleString()}`, 
        value: [q2, q3] as [number, number] 
      });
    }
    
    if (q3 < maxPrice) {
      ranges.push({ 
        label: `KSh ${Math.round(q3).toLocaleString()}+`, 
        value: [q3, maxPrice] as [number, number] 
      });
    }
    
    return ranges;
  }, [products, services]);

  // Computed values - FIXED: Handle both string IDs and business objects
  const computedServices = useMemo(() => {
    console.log('🔍 BusinessContext - Computing services:', {
      servicesLength: services?.length || 0,
      servicesType: typeof services,
      isArray: Array.isArray(services),
      servicesData: services?.slice(0, 2),
      businessesLength: businesses?.length || 0,
      businessesData: businesses?.slice(0, 2),
      firstServiceKeys: services?.[0] ? Object.keys(services[0]) : [],
      firstServiceBusinessField: services?.[0]?.business,
      firstServiceBusinessFieldType: typeof services?.[0]?.business,
      servicesReference: services,
      businessesReference: businesses
    });
    
    if (!Array.isArray(services) || services.length === 0) {
      console.log('🔍 BusinessContext - No services to compute');
      return [];
    }
    
    if (!Array.isArray(businesses) || businesses.length === 0) {
      console.log('🔍 BusinessContext - No businesses available for services computation');
      return services; // Return services without business data if businesses not loaded
    }
    
    const computed = services.map(service => {
      // Handle both string IDs and business objects
      let business;
      if (typeof service.business === 'string') {
        business = businesses.find(b => b.id === service.business);
      } else if (service.business && typeof service.business === 'object') {
        // If business is already an object, use it directly
        business = service.business;
      } else {
        // Try to find business by business_id if business field is undefined
        business = businesses.find(b => b.id === (service as any).business_id);
      }
      
      return {
        ...service,
        business: business || null // Ensure business is never undefined
      };
    });
    
    console.log('🔍 BusinessContext - Computed services result:', {
      computedLength: computed.length,
      sampleComputed: computed.slice(0, 2),
      sampleComputedBusiness: computed.slice(0, 2).map(c => ({ id: c.id, business: c.business }))
    });
    
    return computed;
  }, [services, businesses]);

  const computedProducts = useMemo(() => {
    console.log('🔍 BusinessContext - Computing products:', {
      productsLength: products?.length || 0,
      productsType: typeof products,
      isArray: Array.isArray(products),
      productsData: products?.slice(0, 2),
      businessesLength: businesses?.length || 0,
      businessesData: businesses?.slice(0, 2),
      firstProductKeys: products?.[0] ? Object.keys(products[0]) : [],
      firstProductBusinessField: products?.[0]?.business,
      firstProductBusinessFieldType: typeof products?.[0]?.business
    });
    
    if (!Array.isArray(products) || products.length === 0) {
      console.log('🔍 BusinessContext - No products to compute');
      return [];
    }
    
    if (!Array.isArray(businesses) || businesses.length === 0) {
      console.log('🔍 BusinessContext - No businesses available for products computation');
      return products; // Return products without business data if businesses not loaded
    }
    
    const computed = products.map(product => {
      // Handle both string IDs and business objects
      let business;
      if (typeof product.business === 'string') {
        business = businesses.find(b => b.id === product.business);
      } else if (product.business && typeof product.business === 'object') {
        // If business is already an object, use it directly
        business = product.business;
      } else {
        // Try to find business by business_id if business field is undefined
        business = businesses.find(b => b.id === (product as any).business_id);
      }
      
      return {
        ...product,
        business: business || null // Ensure business is never undefined
      };
    });
    
    console.log('🔍 BusinessContext - Computed products result:', {
      computedLength: computed.length,
      sampleComputed: computed.slice(0, 2),
      sampleComputedBusiness: computed.slice(0, 2).map(c => ({ id: c.id, business: c.business }))
    });
    
    return computed;
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
    totalPages,
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
    fetchServicesWithPagination,
    fetchProductsWithPagination,
    fetchBusinessesWithSearch,
    
    // Cache management
    clearCache,
    
    // Utility functions
    getPriceRanges
  };

  // Debug logging for the context value
  console.log('🔍 BusinessContext - Context value being provided:', {
    businessesLength: businesses?.length || 0,
    servicesLength: computedServices?.length || 0,
    productsLength: computedProducts?.length || 0,
    isLoadingBusinesses,
    isLoadingServices,
    isLoadingProducts,
    sampleServices: computedServices?.slice(0, 2),
    sampleProducts: computedProducts?.slice(0, 2)
  });

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};
