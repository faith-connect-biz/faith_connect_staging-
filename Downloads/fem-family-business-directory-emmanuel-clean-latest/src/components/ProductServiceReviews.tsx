import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Heart, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Review } from '@/services/api';
import LikeButton from './LikeButton';

interface ProductServiceReviewsProps {
  type: 'product' | 'service';
  itemId: string;
  itemName: string;
  showAllButton?: boolean;
  maxReviews?: number;
}

export const ProductServiceReviews: React.FC<ProductServiceReviewsProps> = ({
  type,
  itemId,
  itemName,
  showAllButton = true,
  maxReviews = 5
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);

  // Fetch reviews based on type
  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      let response: Review[];
      switch (type) {
        case 'product':
          response = await apiService.getProductReviews(itemId);
          break;
        case 'service':
          response = await apiService.getServiceReviews(itemId);
          break;
        default:
          response = [];
      }
      setReviews(response);
      setTotalReviews(response.length);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
      setTotalReviews(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      fetchReviews();
    }
  }, [itemId, type]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Limit reviews to maxReviews
  const displayedReviews = reviews.slice(0, maxReviews);
  const hasMoreReviews = reviews.length > maxReviews;

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fem-terracotta mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-6">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h4 className="text-sm font-medium text-gray-600 mb-1">No Reviews Yet</h4>
        <p className="text-xs text-gray-500">
          Be the first to review this {type}!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </span>
          {totalReviews > 0 && (
            <div className="flex items-center gap-1">
              {renderStars(
                reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
              )}
              <span className="text-xs text-gray-500">
                ({Math.round((reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length) * 10) / 10})
              </span>
            </div>
          )}
        </div>
        {showAllButton && hasMoreReviews && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-fem-terracotta hover:text-fem-terracotta/80 hover:bg-fem-terracotta/10"
          >
            View All
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {displayedReviews.map((review) => (
          <Card key={review.id} className="border border-gray-100 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Review Header */}
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-xs text-gray-500">
                      by {review.user}
                    </span>
                    {review.is_verified && (
                      <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  
                  {/* Review Text */}
                  {review.review_text && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {review.review_text}
                    </p>
                  )}
                  
                  {/* Review Date */}
                  <div className="text-xs text-gray-500">
                    {formatDate(review.created_at)}
                  </div>
                </div>
                
                {/* Like Button */}
                {user && review.user !== user.partnership_number && (
                  <div className="ml-2 flex-shrink-0">
                    <LikeButton
                      id={review.id.toString()}
                      type="review"
                      initialLiked={false}
                      likeCount={0}
                      onLikeChange={() => {}}
                      disabled={false}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Show More Indicator */}
      {hasMoreReviews && (
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            +{reviews.length - maxReviews} more review{reviews.length - maxReviews !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};
