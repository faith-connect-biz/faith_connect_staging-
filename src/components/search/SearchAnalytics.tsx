import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, Clock, Star, BarChart3, Eye, MousePointer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SearchAnalyticsProps {
  searchTerm?: string;
  onPopularSearchClick?: (term: string) => void;
}

interface SearchStats {
  totalSearches: number;
  popularSearches: string[];
  recentSearches: string[];
  searchTrends: { term: string; count: number; trend: 'up' | 'down' | 'stable' }[];
  categoryStats: { category: string; searches: number }[];
  timeStats: { hour: number; searches: number }[];
}

export const SearchAnalytics: React.FC<SearchAnalyticsProps> = ({
  searchTerm,
  onPopularSearchClick
}) => {
  const [stats, setStats] = useState<SearchStats>({
    totalSearches: 0,
    popularSearches: [],
    recentSearches: [],
    searchTrends: [],
    categoryStats: [],
    timeStats: []
  });

  const [isVisible, setIsVisible] = useState(false);

  // Load search analytics from localStorage
  useEffect(() => {
    const loadAnalytics = () => {
      try {
        const analytics = JSON.parse(localStorage.getItem('searchAnalytics') || '{}');
        const popularSearches = JSON.parse(localStorage.getItem('popularSearches') || '[]');
        const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        
        // Calculate search trends
        const searchCounts = JSON.parse(localStorage.getItem('searchCounts') || '{}');
        const trends = Object.entries(searchCounts)
          .map(([term, count]) => ({
            term,
            count: count as number,
            trend: 'stable' as const // Simplified for now
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Mock category stats (in real app, this would come from API)
        const categoryStats = [
          { category: 'Food & Dining', searches: Math.floor(Math.random() * 100) },
          { category: 'Health & Wellness', searches: Math.floor(Math.random() * 100) },
          { category: 'Professional Services', searches: Math.floor(Math.random() * 100) },
          { category: 'Retail', searches: Math.floor(Math.random() * 100) },
          { category: 'Technology', searches: Math.floor(Math.random() * 100) }
        ].sort((a, b) => b.searches - a.searches);

        // Mock time stats (in real app, this would come from API)
        const timeStats = Array.from({ length: 24 }, (_, hour) => ({
          hour,
          searches: Math.floor(Math.random() * 50)
        }));

        setStats({
          totalSearches: analytics.totalSearches || 0,
          popularSearches: popularSearches.slice(0, 10),
          recentSearches: recentSearches.slice(0, 5),
          searchTrends: trends,
          categoryStats,
          timeStats
        });
      } catch (error) {
        console.error('Error loading search analytics:', error);
      }
    };

    loadAnalytics();
    
    // Show analytics after a short delay
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Track search when searchTerm changes
  useEffect(() => {
    if (searchTerm && searchTerm.trim()) {
      const analytics = JSON.parse(localStorage.getItem('searchAnalytics') || '{}');
      const searchCounts = JSON.parse(localStorage.getItem('searchCounts') || '{}');
      
      // Update total searches
      analytics.totalSearches = (analytics.totalSearches || 0) + 1;
      
      // Update search counts
      searchCounts[searchTerm] = (searchCounts[searchTerm] || 0) + 1;
      
      localStorage.setItem('searchAnalytics', JSON.stringify(analytics));
      localStorage.setItem('searchCounts', JSON.stringify(searchCounts));
    }
  }, [searchTerm]);

  // Handle popular search click
  const handlePopularSearchClick = (term: string) => {
    if (onPopularSearchClick) {
      onPopularSearchClick(term);
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default: return <BarChart3 className="w-3 h-3 text-gray-500" />;
    }
  };

  // Get trend color
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* Search Insights Header */}
      <Card className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Search Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalSearches}</div>
              <div className="text-sm opacity-90">Total Searches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.popularSearches.length}</div>
              <div className="text-sm opacity-90">Popular Terms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.categoryStats.length}</div>
              <div className="text-sm opacity-90">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Searches */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fem-navy">
              <TrendingUp className="w-5 h-5" />
              Popular Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.popularSearches.length > 0 ? (
              <div className="space-y-2">
                {stats.popularSearches.map((term, index) => (
                  <div
                    key={term}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    onClick={() => handlePopularSearchClick(term)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-fem-terracotta text-white">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium text-gray-900">{term}</span>
                    </div>
                    <MousePointer className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No popular searches yet</p>
                <p className="text-sm">Start searching to see trends!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Searches */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fem-navy">
              <Clock className="w-5 h-5" />
              Recent Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentSearches.length > 0 ? (
              <div className="space-y-2">
                {stats.recentSearches.map((term, index) => (
                  <div
                    key={`${term}-${index}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    onClick={() => handlePopularSearchClick(term)}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{term}</span>
                    </div>
                    <MousePointer className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No recent searches</p>
                <p className="text-sm">Your search history will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Trends */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fem-navy">
              <BarChart3 className="w-5 h-5" />
              Search Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.searchTrends.length > 0 ? (
              <div className="space-y-3">
                {stats.searchTrends.slice(0, 5).map((trend, index) => (
                  <div key={trend.term} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-gray-50 text-gray-700">
                        {index + 1}
                      </Badge>
                      <span className="font-medium text-gray-900">{trend.term}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{trend.count} searches</span>
                      <div className={`flex items-center ${getTrendColor(trend.trend)}`}>
                        {getTrendIcon(trend.trend)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No search trends yet</p>
                <p className="text-sm">Trends will appear as you search more</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Statistics */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fem-navy">
              <Star className="w-5 h-5" />
              Category Popularity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.categoryStats.map((category, index) => (
                <div key={category.category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{category.category}</span>
                    <span className="text-sm text-gray-600">{category.searches} searches</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-fem-terracotta to-fem-gold h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(category.searches / Math.max(...stats.categoryStats.map(c => c.searches))) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Tips */}
      <Card className="bg-gradient-to-r from-fem-gold to-fem-terracotta text-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Search Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">💡 Pro Tips</h4>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Use specific keywords for better results</li>
                <li>• Try searching by business name or service type</li>
                <li>• Use filters to narrow down your search</li>
                <li>• Check verified businesses for quality assurance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🔍 Search Examples</h4>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• "restaurant" - Find food businesses</li>
                <li>• "plumber" - Find plumbing services</li>
                <li>• "laptop" - Find tech products</li>
                <li>• "Nairobi" - Find local businesses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchAnalytics;
