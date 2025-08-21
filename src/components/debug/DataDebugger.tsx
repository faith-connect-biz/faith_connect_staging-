import React from "react";
import { useBusiness } from "@/contexts/BusinessContext";

export const DataDebugger = () => {
  const { businesses, categories, isLoading, error } = useBusiness();

  if (isLoading) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <h3 className="font-bold text-yellow-800">Loading...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 rounded">
        <h3 className="font-bold text-red-800">Error:</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded mb-4">
      <h3 className="font-bold text-blue-800 mb-2">Data Debug Info:</h3>
      
      <div className="mb-4">
                 <h4 className="font-semibold text-blue-700">Categories ({Array.isArray(categories) ? categories.length : 'Not an array'}):</h4>
         <pre className="text-sm bg-white p-2 rounded overflow-auto max-h-40">
           {JSON.stringify(categories?.map(c => ({
             id: c.id,
             name: c.name,
             slug: c.slug,
             id_type: typeof c.id
           })), null, 2)}
         </pre>
      </div>

             <div className="mb-4">
         <h4 className="font-semibold text-blue-700">Businesses ({businesses.length}):</h4>
         <pre className="text-sm bg-white p-2 rounded overflow-auto max-h-40">
                       {JSON.stringify(businesses.map(b => ({
              id: b.id,
              name: b.business_name,
              category: b.category,
              category_id: typeof b.category === 'object' ? b.category?.id : b.category,
              category_name: typeof b.category === 'object' ? b.category?.name : 'N/A',
              category_type: typeof b.category,
              is_active: b.is_active,
              is_verified: b.is_verified
            })), null, 2)}
         </pre>
       </div>

      <div>
                 <h4 className="font-semibold text-blue-700">Category-Business Mapping:</h4>
         <div className="bg-white p-2 rounded">
                       {Array.isArray(categories) ? categories.map(category => {
              const allBusinesses = businesses.filter(b => {
                const businessCategoryId = typeof b.category === 'object' ? b.category?.id : b.category;
                return businessCategoryId == category.id;
              });
              return (
                <div key={category.id} className="text-sm">
                  <strong>{category.name}</strong>: {allBusinesses.length} businesses
                  {allBusinesses.length > 0 && (
                    <div className="ml-4 text-xs text-gray-600">
                      {allBusinesses.map(b => (
                        <div key={b.id}>
                          - {b.business_name} (Active: {b.is_active ? 'Yes' : 'No'}, Verified: {b.is_verified ? 'Yes' : 'No'})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }) : (
             <div className="text-sm text-red-600">
               Categories is not an array: {typeof categories}
             </div>
           )}
         </div>
      </div>
    </div>
  );
}; 