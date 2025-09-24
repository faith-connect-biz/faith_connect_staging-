import React, { useState, useEffect } from 'react';
import { Filter, X, SlidersHorizontal, MapPin, Star, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useBusiness } from '@/contexts/BusinessContext';

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

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isOpen,
  onToggle
}) => {
  const { categories, getPriceRanges } = useBusiness();
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle rating range change
  const handleRatingChange = (value: number[]) => {
    handleFilterChange('rating', value as [number, number]);
  };

  // Handle price range change
  const handlePriceChange = (value: number[]) => {
    handleFilterChange('priceRange', value as [number, number]);
  };

  // Handle clear all filters
  const handleClearAll = () => {
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
    setLocalFilters(defaultFilters);
    onClearFilters();
  };

  // Count active filters
  const activeFiltersCount = [
    localFilters.category,
    localFilters.county,
    localFilters.verifiedOnly,
    localFilters.openNow,
    localFilters.hasPhotos,
    localFilters.duration,
    localFilters.inStock,
    localFilters.priceCurrency,
    localFilters.rating[0] > 0 || localFilters.rating[1] < 5,
    localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 10000
  ].filter(Boolean).length;

  // Get price ranges
  const priceRanges = getPriceRanges();

  return (
    <div className="w-full">
      {/* Filter Toggle Button */}
      <div className="flex justify-center mb-6">
        <Button
          variant="outline"
          onClick={onToggle}
          className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Advanced Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-fem-terracotta text-white">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {isOpen && (
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                Advanced Search Filters
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Category Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-fem-navy flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Category
                </Label>
                <select
                  value={localFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white/80 backdrop-blur-sm focus:border-fem-terracotta focus:ring-1 focus:ring-fem-terracotta"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-fem-navy flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Input
                  type="text"
                  placeholder="Enter county or city"
                  value={localFilters.county}
                  onChange={(e) => handleFilterChange('county', e.target.value)}
                  className="bg-white/80 backdrop-blur-sm focus:border-fem-terracotta focus:ring-1 focus:ring-fem-terracotta"
                />
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-fem-navy flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Sort By
                </Label>
                <select
                  value={localFilters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white/80 backdrop-blur-sm focus:border-fem-terracotta focus:ring-1 focus:ring-fem-terracotta"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="-name">Name (Z-A)</option>
                  <option value="rating">Rating (Low to High)</option>
                  <option value="-rating">Rating (High to Low)</option>
                  <option value="review_count">Most Reviews</option>
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                </select>
              </div>

              {/* Rating Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-fem-navy flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Rating Range
                </Label>
                <div className="px-2">
                  <Slider
                    value={localFilters.rating}
                    onValueChange={handleRatingChange}
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{localFilters.rating[0]} ⭐</span>
                    <span>{localFilters.rating[1]} ⭐</span>
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-fem-navy flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Price Range (KSh)
                </Label>
                <div className="px-2">
                  <Slider
                    value={localFilters.priceRange}
                    onValueChange={handlePriceChange}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>KSh {localFilters.priceRange[0].toLocaleString()}</span>
                    <span>KSh {localFilters.priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Service Duration (for services) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-fem-navy flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Service Duration
                </Label>
                <select
                  value={localFilters.duration || ''}
                  onChange={(e) => handleFilterChange('duration', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white/80 backdrop-blur-sm focus:border-fem-terracotta focus:ring-1 focus:ring-fem-terracotta"
                >
                  <option value="">Any Duration</option>
                  <option value="30">30 minutes or less</option>
                  <option value="60">1 hour or less</option>
                  <option value="120">2 hours or less</option>
                  <option value="240">4 hours or less</option>
                  <option value="480">8 hours or less</option>
                  <option value="1440">1 day or less</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={localFilters.verifiedOnly}
                    onCheckedChange={(checked) => handleFilterChange('verifiedOnly', checked)}
                  />
                  <Label htmlFor="verified" className="text-sm font-medium text-fem-navy flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Verified Only
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="openNow"
                    checked={localFilters.openNow}
                    onCheckedChange={(checked) => handleFilterChange('openNow', checked)}
                  />
                  <Label htmlFor="openNow" className="text-sm font-medium text-fem-navy flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Open Now
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPhotos"
                    checked={localFilters.hasPhotos}
                    onCheckedChange={(checked) => handleFilterChange('hasPhotos', checked)}
                  />
                  <Label htmlFor="hasPhotos" className="text-sm font-medium text-fem-navy flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Has Photos
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={localFilters.inStock || false}
                    onCheckedChange={(checked) => handleFilterChange('inStock', checked)}
                  />
                  <Label htmlFor="inStock" className="text-sm font-medium text-fem-navy flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    In Stock
                  </Label>
                </div>
              </div>

              {/* Price Currency */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-fem-navy flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Currency
                </Label>
                <select
                  value={localFilters.priceCurrency || ''}
                  onChange={(e) => handleFilterChange('priceCurrency', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white/80 backdrop-blur-sm focus:border-fem-terracotta focus:ring-1 focus:ring-fem-terracotta"
                >
                  <option value="">Any Currency</option>
                  <option value="KSh">Kenyan Shilling (KSh)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-fem-navy">Active Filters:</span>
                  <Badge variant="secondary" className="bg-fem-terracotta text-white">
                    {activeFiltersCount}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {localFilters.category && (
                    <Badge variant="outline" className="bg-gradient-to-r from-fem-terracotta/10 to-fem-gold/10 text-fem-terracotta border-fem-terracotta/30 hover:from-fem-terracotta/20 hover:to-fem-gold/20 transition-all duration-200">
                      Category: {localFilters.category}
                    </Badge>
                  )}
                  {localFilters.county && (
                    <Badge variant="outline" className="bg-gradient-to-r from-fem-gold/10 to-fem-terracotta/10 text-fem-gold border-fem-gold/30 hover:from-fem-gold/20 hover:to-fem-terracotta/20 transition-all duration-200">
                      Location: {localFilters.county}
                    </Badge>
                  )}
                  {localFilters.verifiedOnly && (
                    <Badge variant="outline" className="bg-gradient-to-r from-fem-terracotta/15 to-fem-gold/15 text-fem-navy border-fem-terracotta/40 hover:from-fem-terracotta/25 hover:to-fem-gold/25 transition-all duration-200">
                      Verified Only
                    </Badge>
                  )}
                  {localFilters.openNow && (
                    <Badge variant="outline" className="bg-gradient-to-r from-fem-gold/15 to-fem-terracotta/15 text-fem-navy border-fem-gold/40 hover:from-fem-gold/25 hover:to-fem-terracotta/25 transition-all duration-200">
                      Open Now
                    </Badge>
                  )}
                  {localFilters.hasPhotos && (
                    <Badge variant="outline" className="bg-gradient-to-r from-fem-terracotta/12 to-fem-gold/12 text-fem-terracotta border-fem-terracotta/35 hover:from-fem-terracotta/22 hover:to-fem-gold/22 transition-all duration-200">
                      Has Photos
                    </Badge>
                  )}
                  {localFilters.inStock && (
                    <Badge variant="outline" className="bg-gradient-to-r from-fem-gold/12 to-fem-terracotta/12 text-fem-gold border-fem-gold/35 hover:from-fem-gold/22 hover:to-fem-terracotta/22 transition-all duration-200">
                      In Stock
                    </Badge>
                  )}
                  {(localFilters.rating[0] > 0 || localFilters.rating[1] < 5) && (
                    <Badge variant="outline" className="bg-gradient-to-r from-fem-gold/15 to-fem-terracotta/15 text-fem-navy border-fem-gold/40 hover:from-fem-gold/25 hover:to-fem-terracotta/25 transition-all duration-200">
                      Rating: {localFilters.rating[0]}-{localFilters.rating[1]} ⭐
                    </Badge>
                  )}
                  {(localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 10000) && (
                    <Badge variant="outline" className="bg-gradient-to-r from-fem-terracotta/12 to-fem-gold/12 text-fem-terracotta border-fem-terracotta/35 hover:from-fem-terracotta/22 hover:to-fem-gold/22 transition-all duration-200">
                      Price: KSh {localFilters.priceRange[0].toLocaleString()}-{localFilters.priceRange[1].toLocaleString()}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearchFilters;
