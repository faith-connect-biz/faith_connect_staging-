import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { apiService, Business, Category, BusinessCreateRequest, Service, Product } from '@/services/api';

interface BusinessContextType {
  businesses: Business[];
  categories: Category[];
  services: Service[];
  products: Product[];
  isLoading: boolean;
  isLoadingBusinesses: boolean;
  isLoadingProducts: boolean;
  error: string | null;
  totalCount: number;
  totalProductsCount: number;
  totalServicesCount: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  fetchBusinesses: (params?: { search?: string; category?: number; city?: string; county?: string; rating?: number; is_featured?: boolean; ordering?: string; page?: number; limit?: number; offset?: number }) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchServices: (params?: { search?: string; category?: string; price_range?: string; duration?: string; ordering?: string; page?: number; limit?: number; offset?: number }) => Promise<void>;
  fetchProducts: (params?: { search?: string; category?: string; in_stock?: boolean; price_currency?: string; ordering?: string; page?: number; limit?: number; offset?: number }) => Promise<void>;
  createBusiness: (data: BusinessCreateRequest) => Promise<Business>;
  updateBusiness: (id: string, data: BusinessCreateRequest) => Promise<Business>;
  deleteBusiness: (id: string) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleFavorite: (businessId: string) => Promise<void>;
  getBusinessById: (id: string) => Business | undefined;
  getUserBusiness: () => Promise<Business | null>;
  clearError: () => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

interface BusinessProviderProps {
  children: ReactNode;
}

export const BusinessProvider: React.FC<BusinessProviderProps> = ({ children }) => {
  // Remove initialization log to reduce console spam
  // console.log('BusinessProvider: Initializing...');
  const [products, setProducts] = useState<Product[]>([]);
  const [productsCache, setProductsCache] = useState<Record<number, Product[]>>({});
  const productsAbortRef = React.useRef<AbortController | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesCache, setServicesCache] = useState<Record<number, Service[]>>({});
  const servicesAbortRef = React.useRef<AbortController | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessesCache, setBusinessesCache] = useState<Record<number, Business[]>>({});
  const businessesAbortRef = React.useRef<AbortController | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [totalServicesCount, setTotalServicesCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);



  // Remove the computed services/products logic that causes infinite loops
  // Instead, we'll manage these directly in the fetch functions
  
  // useEffect(() => {
  //   if (Array.isArray(businesses)) {
  //     const totalServices = businesses.reduce((sum, business) => {
  //       return sum + (business.services?.length || 0);
  //     }, 0);
  //     setTotalServicesCount(totalServices);
  //   } else {
  //     setTotalServicesCount(0);
  //   }
  // }, [businesses]);

  // useEffect(() => {
  //   if (Array.isArray(businesses)) {
  //     const totalProducts = businesses.reduce((sum, business) => {
  //       return sum + (business.products?.length || 0);
  //     }, 0);
  //     setTotalProductsCount(totalProducts);
  //   } else {
  //     setTotalProductsCount(0);
  //   }
  // }, [businesses]);

  // Shuffle function to randomize order and prevent bias
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Remove debug logging that causes spam
  // console.log('BusinessContext - businesses:', businesses);
  // console.log('BusinessContext - computedServices:', services);
  // console.log('BusinessContext - computedProducts:', products);

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
      
      const page = params?.page || 1;
      const limit = params?.limit || 15;
      
      // Serve from cache immediately to avoid blank UI
      if (businessesCache[page]) {
        setBusinesses(businessesCache[page]);
        setCurrentPage(page);
        setIsLoadingBusinesses(true); // show subtle loader while refreshing
      }
      
      // Cancel any in-flight request
      if (businessesAbortRef.current) {
        businessesAbortRef.current.abort();
      }
      const controller = new AbortController();
      businessesAbortRef.current = controller;
      
      // Calculate offset if page and limit are provided
      let apiParams = { ...params };
      apiParams.offset = (page - 1) * limit;
      apiParams.limit = limit;
      
      console.log('fetchBusinesses - API params being sent:', apiParams);
      const response = await apiService.getBusinesses(apiParams);
      // Remove excessive debug logging
      // console.log('fetchBusinesses - API response:', response);
      
      // Ensure businesses is always an array
      if (response && response.results && Array.isArray(response.results)) {
        console.log('fetchBusinesses - Using response.results:', response.results);
        console.log('fetchBusinesses - Setting businesses to:', response.results);
        // Randomize the order to prevent bias
        const shuffledBusinesses = shuffleArray(response.results);
        setBusinesses(shuffledBusinesses);
        setTotalCount(response.count || 0);
        setCurrentPage(page);
        setHasNextPage(!!response.next);
        setHasPreviousPage(!!response.previous);

        // Cache current page
        setBusinessesCache(prev => ({ ...prev, [page]: response.results }));

        // Background prefetch next page if available
        const hasNext = !!response.next;
        if (hasNext && !businessesCache[page + 1]) {
          const nextParams: any = { ...apiParams, page: page + 1, offset: (page + 1 - 1) * limit, limit };
          apiService.getBusinesses(nextParams).then((nextRes) => {
            if (nextRes && Array.isArray(nextRes.results)) {
              setBusinessesCache(prev => ({ ...prev, [page + 1]: nextRes.results }));
            }
          }).catch(() => {});
        }
      } else if (Array.isArray(response)) {
        console.log('fetchBusinesses - Using direct response array:', response);
        // Randomize the order to prevent bias
        const shuffledBusinesses = shuffleArray(response);
        setBusinesses(shuffledBusinesses);
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
  }, []); // Remove businessesCache dependency to prevent infinite loops

  const fetchCategories = useCallback(async () => {
    try {
      setError(null);
      const response = await apiService.getCategories();
      console.log('fetchCategories - API response:', response);
      
      if (response && typeof response === 'object' && 'results' in response && Array.isArray(response.results)) {
        console.log('fetchCategories: Using paginated response, setting categories to:', response.results);
        // Randomize the order to prevent bias
        const shuffledCategories = shuffleArray(response.results);
        setCategories(shuffledCategories);
      } else if (Array.isArray(response)) {
        // Handle direct array response
        console.log('fetchCategories: Using direct array response, setting categories to:', response);
        // Randomize the order to prevent bias
        const shuffledCategories = shuffleArray(response);
        setCategories(shuffledCategories);
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
    limit?: number;
    offset?: number;
  }) => {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 15;

      // Serve from cache immediately to avoid blank UI, but not for search queries
      if (productsCache[page] && !params.search) {
        console.log('🔍 BusinessContext - Serving products from cache for page:', page);
        setProducts(productsCache[page]);
        setCurrentPage(page);
        setIsLoading(true); // show subtle loader while refreshing
      } else {
        console.log('🔍 BusinessContext - Not serving products from cache (search or no cache)');
        setIsLoading(true);
      }
      setError(null);

      // Cancel any in-flight request
      if (productsAbortRef.current) {
        productsAbortRef.current.abort();
      }
      const controller = new AbortController();
      productsAbortRef.current = controller;
      
      // Always calculate offset when page and limit are provided (including defaults)
      let apiParams = { ...params } as any;
      apiParams.offset = (page - 1) * limit;
      apiParams.limit = limit;
      
      const response = await apiService.getAllProducts(apiParams);
      // Remove excessive debug logging
      // console.log('fetchProducts - API response:', response);
      // console.log('fetchProducts - response.count:', response?.count);
      // console.log('fetchProducts - response.results length:', response?.results?.length);
      
      if (response && typeof response === 'object' && 'results' in response && Array.isArray(response.results)) {
        console.log('🔍 BusinessContext - Setting products:', {
          count: response.count || 0,
          resultsLength: response.results.length,
          searchTerm: params.search,
          page
        });
        // Randomize the order to prevent bias
        const shuffledProducts = shuffleArray(response.results);
        setProducts(shuffledProducts);
        setTotalProductsCount(response.count || 0);
        console.log('fetchProducts - Setting totalProductsCount to:', response.count || 0);
        setCurrentPage(page);
        setHasNextPage(!!response.next);
        setHasPreviousPage(!!response.previous);

        // Cache current page, but clear cache for search queries
        if (params.search) {
          console.log('🔍 BusinessContext - Clearing products cache for search');
          setProductsCache({ [page]: response.results });
        } else {
          setProductsCache(prev => ({ ...prev, [page]: response.results }));
        }

        // Background prefetch next page if available
        const hasNext = !!response.next;
        if (hasNext && !productsCache[page + 1]) {
          const nextParams: any = { ...apiParams, page: page + 1, offset: (page + 1 - 1) * limit, limit };
          apiService.getAllProducts(nextParams).then((nextRes) => {
            if (nextRes && Array.isArray(nextRes.results)) {
              setProductsCache(prev => ({ ...prev, [page + 1]: nextRes.results }));
            }
          }).catch(() => {});
        }
      } else if (Array.isArray(response)) {
        // Randomize the order to prevent bias
        const shuffledProducts = shuffleArray(response);
        setProducts(shuffledProducts);
        setTotalProductsCount(response.length);
        setCurrentPage(1);
        setHasNextPage(false);
        setHasPreviousPage(false);
      } else {
        console.error('Products API returned unexpected response format:', response);
        // keep previous page data to avoid blank
        setTotalProductsCount(0);
        setCurrentPage(1);
        setHasNextPage(false);
        setHasPreviousPage(false);
        setError('Products API returned invalid format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      console.error('Failed to fetch products:', err);
      // keep previous page data on error
      setTotalProductsCount(0);
      setCurrentPage(1);
      setHasNextPage(false);
      setHasPreviousPage(false);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove productsCache dependency to prevent infinite loops

  const fetchServices = useCallback(async (params?: {
    search?: string;
    category?: string;
    price_range?: string;
    duration?: string;
    ordering?: string;
    page?: number;
    limit?: number;
    offset?: number;
  }) => {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 15;

      // Serve from cache immediately to avoid blank UI, but not for search queries
      if (servicesCache[page] && !params.search) {
        console.log('🔍 BusinessContext - Serving from cache for page:', page);
        setServices(servicesCache[page]);
        setCurrentPage(page);
        setIsLoading(true); // show subtle loader while refreshing
      } else {
        console.log('🔍 BusinessContext - Not serving from cache (search or no cache)');
        setIsLoading(true);
      }
      setError(null);

      // Cancel any in-flight request
      if (servicesAbortRef.current) {
        servicesAbortRef.current.abort();
      }
      const controller = new AbortController();
      servicesAbortRef.current = controller;
      
      // Always calculate offset when page and limit are provided (including defaults)
      let apiParams = { ...params } as any;
      apiParams.offset = (page - 1) * limit;
      apiParams.limit = limit;
      
      const response = await apiService.getAllServices(apiParams);
      // Remove excessive debug logging
      // console.log('fetchServices - API response:', response);
      // console.log('fetchServices - response.count:', response?.count);
      // console.log('fetchServices - response.results length:', response?.results?.length);
      
      if (response && typeof response === 'object' && 'results' in response && Array.isArray(response.results)) {
        console.log('🔍 BusinessContext - Setting services:', {
          count: response.count || 0,
          resultsLength: response.results.length,
          searchTerm: params.search,
          page
        });
        // Randomize the order to prevent bias
        const shuffledServices = shuffleArray(response.results);
        setServices(shuffledServices);
        setTotalServicesCount(response.count || 0);
        console.log('fetchServices - Setting totalServicesCount to:', response.count || 0);
        setCurrentPage(page);
        setHasNextPage(!!response.next);
        setHasPreviousPage(!!response.previous);

        // Cache current page, but clear cache for search queries
        if (params.search) {
          console.log('🔍 BusinessContext - Clearing services cache for search');
          setServicesCache({ [page]: response.results });
        } else {
          setServicesCache(prev => ({ ...prev, [page]: response.results }));
        }

        // Background prefetch next page if available
        const hasNext = !!response.next;
        if (hasNext && !servicesCache[page + 1]) {
          const nextParams: any = { ...apiParams, page: page + 1, offset: (page + 1 - 1) * limit, limit };
          apiService.getAllServices(nextParams).then((nextRes) => {
            if (nextRes && Array.isArray(nextRes.results)) {
              setServicesCache(prev => ({ ...prev, [page + 1]: nextRes.results }));
            }
          }).catch(() => {});
        }
      } else if (Array.isArray(response)) {
        // Randomize the order to prevent bias
        const shuffledServices = shuffleArray(response);
        setServices(shuffledServices);
        setTotalServicesCount(response.length);
        setCurrentPage(1);
        setHasNextPage(false);
        setHasPreviousPage(false);
      } else {
        console.error('Services API returned unexpected response format:', response);
        // keep previous page data to avoid blank
        setTotalServicesCount(0);
        setCurrentPage(1);
        setHasNextPage(false);
        setHasPreviousPage(false);
        setError('Services API returned invalid format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch services';
      setError(errorMessage);
      console.error('Failed to fetch services:', err);
      // keep previous page data on error
      setTotalServicesCount(0);
      setCurrentPage(1);
      setHasNextPage(false);
      setHasPreviousPage(false);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove servicesCache dependency to prevent infinite loops


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

  const deleteService = async (serviceId: string): Promise<void> => {
    try {
      setError(null);
      await apiService.deleteService(serviceId);
      
      // Remove service from list
      setServices(prev => prev.filter(service => service.id !== serviceId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete service';
      setError(errorMessage);
      console.error('Failed to delete service:', err);
      throw err;
    }
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      setError(null);
      await apiService.deleteProduct(productId);
      
      // Remove product from list
      setProducts(prev => prev.filter(product => product.id !== productId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      setError(errorMessage);
      console.error('Failed to delete product:', err);
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
    // Product pages are fetched on-demand by the products view to prevent duplicate requests
  }, [fetchBusinesses, fetchCategories]); // Add function dependencies

  // Fetch products on mount to populate totalProductsCount
  useEffect(() => {
    // Only fetch if we don't have products yet
    if (products.length === 0 && totalProductsCount === 0) {
      fetchProducts({ page: 1, limit: 15 });
    }
  }, []); // Empty dependency array - only run once on mount

  // Fetch services on mount to populate totalServicesCount
  useEffect(() => {
    // Only fetch if we don't have services yet
    if (services.length === 0 && totalServicesCount === 0) {
      fetchServices({ page: 1, limit: 15 });
    }
  }, []); // Empty dependency array - only run once on mount

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    businesses,
    categories,
    services,
    products,
    isLoading,
    isLoadingBusinesses,
    isLoadingProducts,
    error,
    totalCount,
    totalProductsCount,
    totalServicesCount,
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
    deleteService,
    deleteProduct,
    toggleFavorite,
    getBusinessById,
    getUserBusiness,
    clearError,
  }), [
    businesses,
    categories,
    services,
    products,
    isLoading,
    isLoadingBusinesses,
    isLoadingProducts,
    error,
    totalCount,
    totalProductsCount,
    totalServicesCount,
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
    deleteService,
    deleteProduct,
    toggleFavorite,
    getBusinessById,
    getUserBusiness,
    clearError,
  ]);

  return (
    <BusinessContext.Provider value={contextValue}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = (): BusinessContextType => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}; 