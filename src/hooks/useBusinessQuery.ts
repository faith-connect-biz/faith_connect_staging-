import { useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { apiService, Business, Review } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface BusinessWithReviews extends Business {
  reviews?: Review[];
}

interface UseBusinessQueryResult extends UseQueryResult<BusinessWithReviews, Error> {
  business: BusinessWithReviews | undefined;
  reviews: Review[];
  isBusinessOwner: boolean;
}

export const useBusinessQuery = (businessId: string | undefined): UseBusinessQueryResult => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['business', businessId],
    queryFn: async (): Promise<BusinessWithReviews> => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      // Fetch business data
      const businessData = await apiService.getBusiness(businessId);
      
      if (!businessData) {
        throw new Error('Failed to fetch business data');
      }

      // Extract reviews from business data
      let reviewsArray: Review[] = [];
      if (businessData.reviews && Array.isArray(businessData.reviews)) {
        reviewsArray = businessData.reviews;
      } else {
        // Try to fetch reviews from analytics if not in business data
        try {
          const analyticsData = await apiService.getBusinessAnalytics(businessId);
          if (analyticsData?.recent_reviews && Array.isArray(analyticsData.recent_reviews)) {
            reviewsArray = analyticsData.recent_reviews.map((review: any) => ({
              id: review.id,
              user: review.user,
              rating: review.rating,
              review_text: review.review_text,
              created_at: review.created_at || new Date().toISOString(),
              updated_at: review.updated_at || new Date().toISOString(),
              business: businessId,
              is_verified: false
            }));
          }
        } catch (error) {
          console.error('Failed to fetch reviews from analytics:', error);
        }
      }

      // Check if current user owns this business
      const isBusinessOwner = user?.user_type === 'business' && 
        user.partnership_number === businessData.owner_partnership_number;

      return {
        ...businessData,
        reviews: reviewsArray
      } as BusinessWithReviews;
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  const isBusinessOwner = user?.user_type === 'business' && 
    query.data?.owner_partnership_number === user.partnership_number;

  return {
    ...query,
    business: query.data,
    reviews: query.data?.reviews || [],
    isBusinessOwner
  };
};

// Hook to get prefetch function
export const usePrefetchBusiness = () => {
  const queryClient = useQueryClient();
  
  return (businessId: string) => {
    return queryClient.prefetchQuery({
      queryKey: ['business', businessId],
      queryFn: async () => {
        const businessData = await apiService.getBusiness(businessId);
        return businessData;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
};

