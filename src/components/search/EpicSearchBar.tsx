import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, X, Filter, TrendingUp, Clock, Star, MapPin, Building2, Package, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useBusiness } from '@/contexts/BusinessContext';
import { useNavigate } from 'react-router-dom';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'business' | 'service' | 'product' | 'category' | 'popular';
  count?: number;
  icon?: React.ReactNode;
}

interface EpicSearchBarProps {
  onSearch: (query: string, filters?: any) => void;
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
}

export const EpicSearchBar: React.FC<EpicSearchBarProps> = ({
  onSearch,
  placeholder = "Search businesses, services, products...",
  showFilters = true,
  className = ""
}) => {
  const { businesses, services, products, categories } = useBusiness();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent and popular searches from localStorage
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const popular = JSON.parse(localStorage.getItem('popularSearches') || '[]');
    setRecentSearches(recent);
    setPopularSearches(popular);
  }, []);

  // Generate search suggestions based on current data
  const generateSuggestions = useCallback((query: string): SearchSuggestion[] => {
    if (!query.trim()) {
      // Show recent and popular searches when no query
      const recentSuggestions = recentSearches.slice(0, 3).map((search, index) => ({
        id: `recent-${index}`,
        text: search,
        type: 'popular' as const,
        icon: <Clock className="w-4 h-4" />
      }));
      
      const popularSuggestions = popularSearches.slice(0, 3).map((search, index) => ({
        id: `popular-${index}`,
        text: search,
        type: 'popular' as const,
        icon: <TrendingUp className="w-4 h-4" />
      }));
      
      return [...recentSuggestions, ...popularSuggestions];
    }

    const queryLower = query.toLowerCase();
    const suggestions: SearchSuggestion[] = [];

    // Business suggestions
    businesses.forEach(business => {
      if (business.business_name.toLowerCase().includes(queryLower)) {
        suggestions.push({
          id: `business-${business.id}`,
          text: business.business_name,
          type: 'business',
          icon: <Building2 className="w-4 h-4" />
        });
      }
    });

    // Service suggestions
    services.forEach(service => {
      if (service.name.toLowerCase().includes(queryLower)) {
        suggestions.push({
          id: `service-${service.id}`,
          text: service.name,
          type: 'service',
          icon: <Settings className="w-4 h-4" />
        });
      }
    });

    // Product suggestions
    products.forEach(product => {
      if (product.name.toLowerCase().includes(queryLower)) {
        suggestions.push({
          id: `product-${product.id}`,
          text: product.name,
          type: 'product',
          icon: <Package className="w-4 h-4" />
        });
      }
    });

    // Category suggestions
    categories.forEach(category => {
      if (category.name.toLowerCase().includes(queryLower)) {
        suggestions.push({
          id: `category-${category.id}`,
          text: category.name,
          type: 'category',
          icon: <Star className="w-4 h-4" />
        });
      }
    });

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.text === suggestion.text)
    );

    return uniqueSuggestions.slice(0, 8);
  }, [businesses, services, products, categories, recentSearches, popularSearches]);

  // Debounced search suggestions
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const newSuggestions = generateSuggestions(searchTerm);
      setSuggestions(newSuggestions);
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, generateSuggestions]);

  // Handle search execution
  const executeSearch = useCallback((query: string) => {
    if (!query.trim()) return;

    // Update recent searches
    const updatedRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

    // Update popular searches (simple implementation)
    const updatedPopular = [...popularSearches];
    const existingIndex = updatedPopular.indexOf(query);
    if (existingIndex > -1) {
      updatedPopular.splice(existingIndex, 1);
    }
    updatedPopular.unshift(query);
    setPopularSearches(updatedPopular.slice(0, 10));
    localStorage.setItem('popularSearches', JSON.stringify(updatedPopular.slice(0, 10)));

    // Execute search
    onSearch(query);
    setIsFocused(false);
    setSearchTerm('');
  }, [onSearch, recentSearches, popularSearches]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedIndex(-1);
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFocused || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? suggestions.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          executeSearch(suggestions[selectedIndex].text);
        } else {
          executeSearch(searchTerm);
        }
        break;
      case 'Escape':
        setIsFocused(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    executeSearch(suggestion.text);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Get suggestion type color
  const getSuggestionTypeColor = (type: string) => {
    switch (type) {
      case 'business': return 'bg-blue-100 text-blue-800';
      case 'service': return 'bg-green-100 text-green-800';
      case 'product': return 'bg-purple-100 text-purple-800';
      case 'category': return 'bg-orange-100 text-orange-800';
      case 'popular': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow clicks
            setTimeout(() => setIsFocused(false), 200);
          }}
          className="pl-12 pr-12 py-4 text-base md:text-lg bg-white border-2 border-gray-200 focus:border-fem-terracotta focus:ring-2 focus:ring-fem-terracotta/20 shadow-md hover:shadow-lg rounded-xl transition-all duration-300 placeholder:text-gray-400"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {isFocused && (searchTerm || suggestions.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden">
          <CardContent className="p-0">
            {suggestions.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    ref={index === 0 ? suggestionsRef : null}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 ${
                      index === selectedIndex 
                        ? 'bg-fem-terracotta/10 border-l-4 border-fem-terracotta' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-gray-400">
                      {suggestion.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {suggestion.text}
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getSuggestionTypeColor(suggestion.type)}`}
                    >
                      {suggestion.type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="px-4 py-6 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No suggestions found for "{searchTerm}"</p>
                <p className="text-sm">Press Enter to search anyway</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Search Stats */}
      {searchTerm && (
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            <span>{businesses.length} businesses</span>
          </div>
          <div className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            <span>{services.length} services</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            <span>{products.length} products</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EpicSearchBar;
