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
          <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-24 rounded-full" />
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
