import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useBusiness } from './BusinessContext';

interface SearchFilters {
  searchTerm: string;
  category: string;
  county: string;
  rating: [number, number];
  priceRange: [number, number];
  verifiedOnly: boolean;
  openNow: boolean;
  hasPhotos: boolean;
  sortBy: string;
  duration?: string;
  inStock?: boolean;
  priceCurrency?: string;
}

interface SearchContextType {
  // Search state
  searchTerm: string;
  filters: SearchFilters;
  isSearching: boolean;
  searchResults: any[];
  totalResults: number;
  
  // Search actions
  setSearchTerm: (term: string) => void;
  setFilters: (filters: SearchFilters) => void;
  executeSearch: (term: string, filters?: Partial<SearchFilters>) => void;
  clearSearch: () => void;
  clearFilters: () => void;
  
  // Search analytics
  searchHistory: string[];
  popularSearches: string[];
  searchStats: {
    totalSearches: number;
    lastSearchTime: Date | null;
  };
  
  // Search suggestions
  getSuggestions: (query: string) => string[];
  
  // Search performance
  searchDebounceMs: number;
  setSearchDebounceMs: (ms: number) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

const defaultFilters: SearchFilters = {
  searchTerm: '',
  category: '',
  county: '',
  rating: [0, 5],
  priceRange: [0, 10000],
  verifiedOnly: false,
  openNow: false,
  hasPhotos: false,
  sortBy: 'name'
};

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { businesses, services, products, fetchBusinesses, fetchServicesWithPagination, fetchProductsWithPagination } = useBusiness();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  
  // Search analytics
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [searchStats, setSearchStats] = useState({
    totalSearches: 0,
    lastSearchTime: null as Date | null
  });
  
  // Performance settings
  const [searchDebounceMs, setSearchDebounceMs] = useState(300);
  const debounceRef = useRef<NodeJS.Timeout>();
  const searchCacheRef = useRef<Map<string, any>>(new Map());

  // Load search data from localStorage
  useEffect(() => {
    const loadSearchData = () => {
      try {
        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        const popular = JSON.parse(localStorage.getItem('popularSearches') || '[]');
        const stats = JSON.parse(localStorage.getItem('searchStats') || '{}');
        
        setSearchHistory(history);
        setPopularSearches(popular);
        setSearchStats({
          totalSearches: stats.totalSearches || 0,
          lastSearchTime: stats.lastSearchTime ? new Date(stats.lastSearchTime) : null
        });
      } catch (error) {
        console.error('Error loading search data:', error);
      }
    };

    loadSearchData();
  }, []);

  // Save search data to localStorage
  const saveSearchData = useCallback(() => {
    try {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
      localStorage.setItem('popularSearches', JSON.stringify(popularSearches));
      localStorage.setItem('searchStats', JSON.stringify(searchStats));
    } catch (error) {
      console.error('Error saving search data:', error);
    }
  }, [searchHistory, popularSearches, searchStats]);

  // Save data whenever it changes
  useEffect(() => {
    saveSearchData();
  }, [saveSearchData]);

  // Generate search suggestions
  const getSuggestions = useCallback((query: string): string[] => {
    if (!query.trim()) {
      return [...popularSearches.slice(0, 5), ...searchHistory.slice(0, 3)];
    }

    const queryLower = query.toLowerCase();
    const suggestions = new Set<string>();

    // Add matching businesses
    businesses.forEach(business => {
      if (business.business_name.toLowerCase().includes(queryLower)) {
        suggestions.add(business.business_name);
      }
    });

    // Add matching services
    services.forEach(service => {
      if (service.name.toLowerCase().includes(queryLower)) {
        suggestions.add(service.name);
      }
    });

    // Add matching products
    products.forEach(product => {
      if (product.name.toLowerCase().includes(queryLower)) {
        suggestions.add(product.name);
      }
    });

    // Add matching categories
    // Note: categories would need to be loaded from the business context

    return Array.from(suggestions).slice(0, 10);
  }, [businesses, services, products, popularSearches, searchHistory]);

  // Execute search with debouncing
  const executeSearch = useCallback(async (term: string, customFilters?: Partial<SearchFilters>) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (!term.trim()) {
        setSearchResults([]);
        setTotalResults(0);
        return;
      }

      setIsSearching(true);

      try {
        // Check cache first
        const cacheKey = `${term}-${JSON.stringify(customFilters || filters)}`;
        const cachedResult = searchCacheRef.current.get(cacheKey);
        
        if (cachedResult) {
          setSearchResults(cachedResult.results);
          setTotalResults(cachedResult.total);
          setIsSearching(false);
          return;
        }

        // Update search analytics
        const newHistory = [term, ...searchHistory.filter(s => s !== term)].slice(0, 10);
        setSearchHistory(newHistory);

        // Update popular searches
        const searchCounts = JSON.parse(localStorage.getItem('searchCounts') || '{}');
        searchCounts[term] = (searchCounts[term] || 0) + 1;
        localStorage.setItem('searchCounts', JSON.stringify(searchCounts));

        const sortedPopular = Object.entries(searchCounts)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([term]) => term);

        setPopularSearches(sortedPopular);

        // Update search stats
        setSearchStats(prev => ({
          totalSearches: prev.totalSearches + 1,
          lastSearchTime: new Date()
        }));

        // Execute searches across all types
        const searchParams = {
          search: term,
          ...customFilters,
          page: 1,
          limit: 50
        };

        const [businessResults, serviceResults, productResults] = await Promise.all([
          fetchBusinesses(searchParams),
          fetchServicesWithPagination(searchParams),
          fetchProductsWithPagination(searchParams)
        ]);

        // Combine results
        const combinedResults = [
          ...(businessResults || []),
          ...(serviceResults || []),
          ...(productResults || [])
        ];

        const totalCount = combinedResults.length;

        // Cache results
        searchCacheRef.current.set(cacheKey, {
          results: combinedResults,
          total: totalCount
        });

        // Limit cache size
        if (searchCacheRef.current.size > 50) {
          const firstKey = searchCacheRef.current.keys().next().value;
          searchCacheRef.current.delete(firstKey);
        }

        setSearchResults(combinedResults);
        setTotalResults(totalCount);

      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setTotalResults(0);
      } finally {
        setIsSearching(false);
      }
    }, searchDebounceMs);
  }, [filters, searchHistory, fetchBusinesses, fetchServicesWithPagination, fetchProductsWithPagination, searchDebounceMs]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setTotalResults(0);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Handle search term changes
  const handleSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      executeSearch(term);
    } else {
      clearSearch();
    }
  }, [executeSearch, clearSearch]);

  // Handle filter changes
  const handleSetFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (searchTerm.trim()) {
      executeSearch(searchTerm, newFilters);
    }
  }, [searchTerm, executeSearch]);

  const value: SearchContextType = {
    // Search state
    searchTerm,
    filters,
    isSearching,
    searchResults,
    totalResults,
    
    // Search actions
    setSearchTerm: handleSetSearchTerm,
    setFilters: handleSetFilters,
    executeSearch,
    clearSearch,
    clearFilters,
    
    // Search analytics
    searchHistory,
    popularSearches,
    searchStats,
    
    // Search suggestions
    getSuggestions,
    
    // Search performance
    searchDebounceMs,
    setSearchDebounceMs
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
