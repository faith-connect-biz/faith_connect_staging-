import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/api";

export const ApiTester = () => {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);

  const testEndpoint = async (endpoint: string, testFn: () => Promise<any>) => {
    setLoading(endpoint);
    try {
      const result = await testFn();
      setResults(prev => ({
        ...prev,
        [endpoint]: { success: true, data: result }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [endpoint]: { success: false, error: error instanceof Error ? error.message : String(error) }
      }));
    } finally {
      setLoading(null);
    }
  };

  const testCategories = () => testEndpoint('categories', () => apiService.getCategories());
  const testBusinesses = () => testEndpoint('businesses', () => apiService.getBusinesses());
  
  // Test raw API endpoints
  const testRawCategories = () => testEndpoint('raw_categories', async () => {
    const response = await fetch('http://localhost:8000/api/business/categories');
    return response.json();
  });
  
  const testRawBusinesses = () => testEndpoint('raw_businesses', async () => {
    const response = await fetch('http://localhost:8000/api/business/');
    return response.json();
  });

  return (
    <div className="p-4 bg-green-100 border border-green-400 rounded mb-4">
      <h3 className="font-bold text-green-800 mb-2">API Endpoint Tester:</h3>
      
      <div className="space-y-2 mb-4">
        <Button 
          onClick={testCategories}
          disabled={loading === 'categories'}
          className="mr-2"
        >
          {loading === 'categories' ? 'Testing...' : 'Test Categories API'}
        </Button>
        
                 <Button 
           onClick={testBusinesses}
           disabled={loading === 'businesses'}
         >
           {loading === 'businesses' ? 'Testing...' : 'Test Businesses API'}
         </Button>
         
         <Button 
           onClick={testRawCategories}
           disabled={loading === 'raw_categories'}
           className="mr-2"
         >
           {loading === 'raw_categories' ? 'Testing...' : 'Test Raw Categories'}
         </Button>
         
         <Button 
           onClick={testRawBusinesses}
           disabled={loading === 'raw_businesses'}
         >
           {loading === 'raw_businesses' ? 'Testing...' : 'Test Raw Businesses'}
         </Button>
      </div>

      <div className="space-y-2">
        {Object.entries(results).map(([endpoint, result]) => (
          <div key={endpoint} className="bg-white p-2 rounded">
            <h4 className="font-semibold text-sm">
              {endpoint}: {(result as any).success ? '✅ Success' : '❌ Failed'}
            </h4>
            <pre className="text-xs bg-gray-100 p-1 rounded overflow-auto max-h-20">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}; 