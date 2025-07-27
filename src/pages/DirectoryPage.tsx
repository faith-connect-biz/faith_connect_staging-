import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BusinessFilters } from "@/components/directory/BusinessFilters";
import { BusinessList } from "@/components/directory/BusinessList";

const DirectoryPage = () => {
  const [filters, setFilters] = useState({});
  
  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };
  
  const handleClearFilters = () => {
    setFilters({});
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-fem-navy">Business Directory</h1>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/4">
              <BusinessFilters 
                onApplyFilters={handleApplyFilters} 
                onClearFilters={handleClearFilters} 
              />
            </div>
            <div className="w-full lg:w-3/4">
              <BusinessList filters={filters} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DirectoryPage;