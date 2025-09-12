import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EpicSearchBar } from '@/components/search/EpicSearchBar';
import { AdvancedSearchFilters } from '@/components/search/AdvancedSearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchAnalytics } from '@/components/search/SearchAnalytics';
import { SearchProvider, useSearch } from '@/contexts/SearchContext';
import { Sparkles, Search, TrendingUp, Filter, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const EpicSearchContent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    searchTerm,
    filters,
    isSearching,
    searchResults,
    totalResults,
    setSearchTerm,
    setFilters,
    executeSearch,
    clearSearch,
    clearFilters,
    searchHistory,
    popularSearches,
    searchStats
  } = useSearch();

  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  // Handle URL parameters
  useEffect(() => {
    const urlSearchTerm = searchParams.get('q');
    const urlCategory = searchParams.get('category');
    
    if (urlSearchTerm) {
      setSearchTerm(decodeURIComponent(urlSearchTerm));
    }
    
    if (urlCategory) {
      setFilters({ ...filters, category: decodeURIComponent(urlCategory) });
    }
  }, [searchParams, setSearchTerm, setFilters, filters]);

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set('q', searchTerm);
    }
    if (filters.category) {
      params.set('category', filters.category);
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    if (window.location.search !== newUrl) {
      setSearchParams(params, { replace: true });
    }
  }, [searchTerm, filters.category, setSearchParams]);

  // Handle search execution
  const handleSearch = (query: string, customFilters?: any) => {
    setSearchTerm(query);
    if (customFilters) {
      setFilters({ ...filters, ...customFilters });
    }
    executeSearch(query, customFilters);
  };

  // Handle result click
  const handleResultClick = (result: any, type: 'business' | 'service' | 'product') => {
    // Analytics tracking could go here
    console.log('Result clicked:', { result, type });
  };

  // Handle popular search click
  const handlePopularSearchClick = (term: string) => {
    handleSearch(term);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          
          {/* Epic Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-fem-navy to-fem-terracotta text-white px-6 py-4 rounded-full shadow-lg mb-4">
              <Sparkles className="w-6 h-6" />
              <h1 className="text-2xl sm:text-3xl font-bold">Epic Search</h1>
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-gray-600 max-w-3xl mx-auto px-4 text-base sm:text-lg">
              Discover the best businesses, services, and products in our community. 
              Search with intelligence, filter with precision, and find exactly what you need.
            </p>
          </div>

          {/* Search Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center mx-auto mb-2">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-fem-navy">{searchStats.totalSearches}</div>
                <div className="text-sm text-gray-600">Total Searches</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-fem-navy to-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-fem-navy">{popularSearches.length}</div>
                <div className="text-sm text-gray-600">Popular Terms</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-fem-gold to-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-2">
                  <Filter className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-fem-navy">{searchHistory.length}</div>
                <div className="text-sm text-gray-600">Recent Searches</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-fem-terracotta to-fem-navy rounded-full flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-fem-navy">{totalResults}</div>
                <div className="text-sm text-gray-600">Current Results</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Search Interface */}
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl mb-8">
            <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Intelligent Search
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 backdrop-blur-sm mb-6">
                  <TabsTrigger 
                    value="search" 
                    className="flex items-center gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </TabsTrigger>
                  <TabsTrigger 
                    value="filters" 
                    className="flex items-center gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics" 
                    className="flex items-center gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>

                {/* Search Tab */}
                <TabsContent value="search" className="space-y-6">
                  {/* Epic Search Bar */}
                  <div className="max-w-4xl mx-auto">
                    <EpicSearchBar
                      onSearch={handleSearch}
                      placeholder="Search businesses, services, products, categories..."
                      showFilters={true}
                      className="w-full"
                    />
                  </div>

                  {/* Search Results */}
                  {searchTerm && (
                    <div className="mt-8">
                      <SearchResults
                        searchTerm={searchTerm}
                        filters={filters}
                        onResultClick={handleResultClick}
                      />
                    </div>
                  )}

                  {/* No Search State */}
                  {!searchTerm && (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-fem-navy mb-4">Start Your Epic Search</h3>
                      <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                        Use our intelligent search to find exactly what you're looking for. 
                        Get suggestions, filter results, and discover amazing businesses in our community.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {popularSearches.slice(0, 6).map((term) => (
                          <Badge
                            key={term}
                            variant="outline"
                            className="cursor-pointer hover:bg-fem-terracotta hover:text-white transition-colors duration-200"
                            onClick={() => handlePopularSearchClick(term)}
                          >
                            {term}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Filters Tab */}
                <TabsContent value="filters">
                  <AdvancedSearchFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClearFilters={clearFilters}
                    isOpen={true}
                    onToggle={() => setShowFilters(!showFilters)}
                  />
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics">
                  <SearchAnalytics
                    searchTerm={searchTerm}
                    onPopularSearchClick={handlePopularSearchClick}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export const EpicSearchPage: React.FC = () => {
  return (
    <SearchProvider>
      <EpicSearchContent />
    </SearchProvider>
  );
};

export default EpicSearchPage;
