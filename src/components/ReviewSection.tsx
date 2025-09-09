import React, { useState, useEffect } from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, Plus, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiService, Review } from '@/services/api';
import LikeButton from './LikeButton';
import { formatToBritishDate } from '@/utils/dateUtils';

interface ReviewSectionProps {
  type: 'business' | 'product' | 'service';
  itemId: string;
  itemName: string;
  canReview?: boolean;
  className?: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  type,
  itemId,
  itemName,
  canReview = true,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    review_text: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        case 'business':
        default:
          response = await apiService.getBusinessReviews(itemId);
          break;
      }
      setReviews(response);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [itemId, type]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to submit a review',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let response: Review;
      switch (type) {
        case 'product':
          response = await apiService.createProductReview(itemId, reviewData);
          break;
        case 'service':
          response = await apiService.createServiceReview(itemId, reviewData);
          break;
        case 'business':
        default:
          response = await apiService.createReview(itemId, reviewData);
          break;
      }

      // Add new review to the list
      setReviews(prev => [response, ...prev]);
      
      // Reset form
      setReviewData({ rating: 5, review_text: '' });
      setShowReviewForm(false);
      
      toast({
        title: 'Review Submitted!',
        description: 'Thank you for your review',
      });
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewChange = (field: 'rating' | 'review_text', value: string | number) => {
    setReviewData(prev => ({ ...prev, [field]: value }));
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onChange?.(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : ''} transition-all`}
            disabled={!interactive}
          >
            <Star
              className={`h-4 w-4 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card className={`backdrop-blur-sm bg-white/80 border-0 shadow-xl ${className}`}>
      <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {type === 'business' ? 'Business' : type === 'product' ? 'Product' : 'Service'} Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Review Form */}
        {canReview && user && (
          <div className="mb-6">
            {!showReviewForm ? (
              <Button
                onClick={() => setShowReviewForm(true)}
                className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Write a Review
              </Button>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-fem-navy">Review {itemName}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReviewForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <div className="mt-2">
                    {renderStars(reviewData.rating, true, (rating) => handleReviewChange('rating', rating))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="review_text">Review (Optional)</Label>
                  <Textarea
                    id="review_text"
                    value={reviewData.review_text}
                    onChange={(e) => handleReviewChange('review_text', e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    className="mt-1 focus:ring-fem-terracotta focus:border-fem-terracotta"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-fem-terracotta hover:bg-fem-terracotta/90 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-fem-terracotta" />
              <p className="text-gray-600 mt-2">Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        by {review.user}
                      </span>
                      {review.is_verified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    
                    {review.review_text && (
                      <p className="text-gray-700 mb-2">{review.review_text}</p>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      {formatToBritishDate(review.created_at)}
                    </div>
                  </div>
                  
                                     {/* Like Button */}
                   {user && review.user !== user.partnership_number && (
                     <LikeButton
                       id={review.id.toString()}
                       type="review"
                       initialLiked={false}
                       likeCount={0}
                       onLikeChange={() => {}}
                       disabled={false}
                     />
                   )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-fem-navy mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">
                Be the first to review this {type}!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
