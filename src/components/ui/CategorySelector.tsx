import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  X,
  Sparkles,
  Grid3x3,
  List
} from 'lucide-react';
import { apiService } from '@/services/api';
import { cn } from '@/lib/utils';

export interface Category {
  id: number;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category_name: string;
}

interface CategorySelectorProps {
  selectedCategoryId?: number | string;
  selectedSubcategoryId?: number | string;
  onCategorySelect: (categoryId: number, categoryName: string, categorySlug: string) => void;
  onSubcategorySelect: (subcategoryId: number, subcategoryName: string, subcategorySlug: string) => void;
  onClear?: () => void;
  className?: string;
  showSearch?: boolean;
  viewMode?: 'grid' | 'list';
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryId,
  selectedSubcategoryId,
  onCategorySelect,
  onSubcategorySelect,
  onClear,
  className,
  showSearch = true,
  viewMode: initialViewMode = 'grid'
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCategoriesWithSubcategories();
        setCategories(response.results || []);
        
        // If a category is pre-selected, find and set it
        if (selectedCategoryId) {
          const category = response.results?.find(cat => cat.id === Number(selectedCategoryId));
          if (category) {
            setSelectedCategory(category);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [selectedCategoryId]);

  // Filter categories based on search
  const filteredCategories = categories.filter(category => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(query) ||
      category.subcategories.some(sub => sub.name.toLowerCase().includes(query))
    );
  });

  // Filter subcategories based on search
  const filteredSubcategories = selectedCategory?.subcategories.filter(sub => {
    if (!searchQuery) return true;
    return sub.name.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setSearchQuery(''); // Clear search when selecting category
  };

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    if (selectedCategory) {
      onSubcategorySelect(subcategory.id, subcategory.name, subcategory.slug);
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleClear = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    if (onClear) {
      onClear();
    }
  };

  // Icon mapping for categories
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'Restaurant': '🍽️',
      'Retail': '🛍️',
      'Services': '🔧',
      'Health & Wellness': '💚',
      'Automotive': '🚗',
      'Real Estate': '🏠',
      'Education': '📚',
      'Entertainment': '🎬',
      'Financial Services': '💰',
      'Legal Services': '⚖️',
      'Construction': '🏗️',
      'Beauty & Personal Care': '💄',
      'Home & Garden': '🏡',
      'Professional Services': '💼',
      'Non-Profit': '🤝',
    };
    return iconMap[categoryName] || '📦';
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-12 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={selectedCategory ? "Search subcategories..." : "Search categories..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-gray-300 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl"
              />
            </div>
          )}
        </div>
        
        {!selectedCategory && (
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(
                "h-8 px-3",
                viewMode === 'grid' && "bg-white shadow-sm"
              )}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(
                "h-8 px-3",
                viewMode === 'list' && "bg-white shadow-sm"
              )}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Selected Category Header */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-gradient-to-r from-fem-terracotta/10 to-fem-gold/10 rounded-xl p-4 border border-fem-terracotta/20"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-8 w-8 p-0 hover:bg-white/50"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getCategoryIcon(selectedCategory.name)}</span>
              <div>
                <h3 className="font-semibold text-fem-navy">{selectedCategory.name}</h3>
                <p className="text-sm text-gray-600">
                  {selectedCategory.subcategories.length} subcategories available
                </p>
              </div>
            </div>
          </div>
          {onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 p-0 hover:bg-white/50"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </motion.div>
      )}

      {/* Categories Grid/List */}
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div
            key="categories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleCategoryClick(category);
                      onCategorySelect(category.id, category.name, category.slug);
                    }}
                  >
                    <Card
                      className={cn(
                        "cursor-pointer transition-all duration-300 border-2 h-full",
                        selectedCategoryId === category.id
                          ? "border-fem-terracotta bg-gradient-to-br from-fem-terracotta/10 to-fem-gold/10 shadow-lg"
                          : "border-gray-200 hover:border-fem-terracotta/50 hover:shadow-md"
                      )}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-3">{getCategoryIcon(category.name)}</div>
                        <h3 className="font-semibold text-fem-navy mb-2 line-clamp-2">
                          {category.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <span>{category.subcategories.length}</span>
                          <span>subcategories</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                        {selectedCategoryId === category.id && (
                          <Badge className="mt-2 bg-fem-terracotta text-white">
                            <Check className="w-3 h-3 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      handleCategoryClick(category);
                      onCategorySelect(category.id, category.name, category.slug);
                    }}
                  >
                    <Card
                      className={cn(
                        "cursor-pointer transition-all duration-300 border-2",
                        selectedCategoryId === category.id
                          ? "border-fem-terracotta bg-gradient-to-r from-fem-terracotta/10 to-fem-gold/10"
                          : "border-gray-200 hover:border-fem-terracotta/50"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">{getCategoryIcon(category.name)}</span>
                            <div>
                              <h3 className="font-semibold text-fem-navy">{category.name}</h3>
                              <p className="text-sm text-gray-600">
                                {category.subcategories.length} subcategories
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedCategoryId === category.id && (
                              <Badge className="bg-fem-terracotta text-white">
                                <Check className="w-3 h-3 mr-1" />
                                Selected
                              </Badge>
                            )}
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No categories found</h3>
                <p className="text-gray-500">Try adjusting your search query</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="subcategories"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredSubcategories.map((subcategory) => (
                <motion.div
                  key={subcategory.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSubcategoryClick(subcategory)}
                >
                  <Card
                    className={cn(
                      "cursor-pointer transition-all duration-300 border-2 h-full",
                      selectedSubcategoryId === subcategory.id
                        ? "border-fem-gold bg-gradient-to-br from-fem-gold/20 to-fem-terracotta/20 shadow-lg"
                        : "border-gray-200 hover:border-fem-gold/50 hover:shadow-md"
                    )}
                  >
                    <CardContent className="p-4 text-center">
                      <h4 className="font-medium text-fem-navy mb-2 line-clamp-2 text-sm">
                        {subcategory.name}
                      </h4>
                      {selectedSubcategoryId === subcategory.id && (
                        <Badge className="mt-2 bg-fem-gold text-white text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredSubcategories.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No subcategories found</h3>
                <p className="text-gray-500">Try adjusting your search query</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection Summary */}
      {(selectedCategoryId || selectedSubcategoryId) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-fem-terracotta/10 to-fem-gold/10 rounded-xl p-4 border border-fem-terracotta/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-fem-terracotta" />
              <div>
                <p className="text-sm font-medium text-fem-navy">Selected:</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedCategoryId && (
                    <Badge className="bg-fem-terracotta text-white">
                      {categories.find(c => c.id === Number(selectedCategoryId))?.name}
                    </Badge>
                  )}
                  {selectedSubcategoryId && selectedCategory && (
                    <>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <Badge className="bg-fem-gold text-white">
                        {selectedCategory.subcategories.find(s => s.id === Number(selectedSubcategoryId))?.name}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
            {onClear && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

