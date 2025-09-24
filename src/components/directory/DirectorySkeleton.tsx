import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface DirectorySkeletonProps {
  count?: number;
  type?: 'business' | 'service' | 'product';
}

export const DirectorySkeleton: React.FC<DirectorySkeletonProps> = ({ 
  count = 6, 
  type = 'business' 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'business':
        return (
          <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        );
      
      case 'service':
        return (
          <div className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
            {/* Service Image Skeleton - matches actual service card height */}
            <div className="relative h-48 overflow-hidden">
              <Skeleton className="w-full h-full" />
            </div>
            
            {/* Service Content Skeleton */}
            <div className="p-6 space-y-4">
              {/* Service Title and Business */}
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              
              {/* Service Description */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              
              {/* Location and Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              
              {/* Action Button */}
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        );
      
      case 'product':
        return (
          <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};
