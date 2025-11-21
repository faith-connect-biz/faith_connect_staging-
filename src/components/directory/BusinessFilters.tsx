import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { CategorySelector } from "@/components/ui/CategorySelector";

interface BusinessFiltersProps {
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
}

export const BusinessFilters = ({ onApplyFilters, onClearFilters }: BusinessFiltersProps) => {
  const { categories } = useBusiness();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | undefined>(undefined);
  const [selectedSubcategoryName, setSelectedSubcategoryName] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);

  const handleApplyFilters = () => {
    const filters = {
      searchTerm,
      category: selectedCategoryName || "",
      category_id: selectedCategoryId,
      subcategory: selectedSubcategoryName || "",
      subcategory_id: selectedSubcategoryId,
      verifiedOnly,
      sortBy: sortBy === "default" ? "" : sortBy
    };
    
    // Create applied filters array for display
    const newAppliedFilters = [];
    if (searchTerm) newAppliedFilters.push(`Search: ${searchTerm}`);
    if (selectedCategoryName) {
      newAppliedFilters.push(`Category: ${selectedCategoryName}`);
      if (selectedSubcategoryName) {
        newAppliedFilters.push(`Subcategory: ${selectedSubcategoryName}`);
      }
    }
    if (verifiedOnly) newAppliedFilters.push("Verified Only");
    if (sortBy !== "default") newAppliedFilters.push(`Sort: ${sortBy}`);
    
    setAppliedFilters(newAppliedFilters);
    onApplyFilters(filters);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategoryId(undefined);
    setSelectedCategoryName("");
    setSelectedSubcategoryId(undefined);
    setSelectedSubcategoryName("");
    setVerifiedOnly(false);
    setSortBy("default");
    setAppliedFilters([]);
    onClearFilters();
  };

  const removeFilter = (filterToRemove: string) => {
    const updatedFilters = appliedFilters.filter(filter => filter !== filterToRemove);
    setAppliedFilters(updatedFilters);
    
    // Reset the corresponding filter state
    if (filterToRemove.startsWith("Search:")) setSearchTerm("");
    if (filterToRemove.startsWith("Category:")) {
      setSelectedCategoryId(undefined);
      setSelectedCategoryName("");
      setSelectedSubcategoryId(undefined);
      setSelectedSubcategoryName("");
    }
    if (filterToRemove.startsWith("Subcategory:")) {
      setSelectedSubcategoryId(undefined);
      setSelectedSubcategoryName("");
    }
    if (filterToRemove === "Verified Only") setVerifiedOnly(false);
    if (filterToRemove.startsWith("Sort:")) setSortBy("default");
    
    handleApplyFilters();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-fem-navy">Filter Businesses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Business name, service, etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category & Subcategory */}
          <div className="space-y-2">
            <Label>Category & Subcategory</Label>
            <CategorySelector
              selectedCategoryId={selectedCategoryId}
              selectedSubcategoryId={selectedSubcategoryId}
              onCategorySelect={(categoryId, categoryName) => {
                setSelectedCategoryId(categoryId);
                setSelectedCategoryName(categoryName);
                setSelectedSubcategoryId(undefined);
                setSelectedSubcategoryName("");
              }}
              onSubcategorySelect={(subcategoryId, subcategoryName) => {
                setSelectedSubcategoryId(subcategoryId);
                setSelectedSubcategoryName(subcategoryName);
              }}
              onClear={() => {
                setSelectedCategoryId(undefined);
                setSelectedCategoryName("");
                setSelectedSubcategoryId(undefined);
                setSelectedSubcategoryName("");
              }}
              showSearch={true}
              viewMode="grid"
            />
          </div>

          {/* Verified Only */}
          <div className="flex items-center space-x-2">
            <Switch
              id="verified"
              checked={verifiedOnly}
              onCheckedChange={setVerifiedOnly}
            />
            <Label htmlFor="verified">Verified businesses only</Label>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleApplyFilters}
              className="flex-1 bg-fem-terracotta hover:bg-fem-terracotta/90"
            >
              Apply Filters
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="border-fem-navy text-fem-navy hover:bg-fem-navy hover:text-white"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applied Filters */}
      {appliedFilters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-fem-navy">Active Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {appliedFilters.map((filter) => (
                <Badge 
                  key={filter} 
                  variant="secondary" 
                  className="flex items-center gap-1 bg-fem-gold/10 text-fem-navy border-fem-gold/20"
                >
                  {filter}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-600" 
                    onClick={() => removeFilter(filter)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};