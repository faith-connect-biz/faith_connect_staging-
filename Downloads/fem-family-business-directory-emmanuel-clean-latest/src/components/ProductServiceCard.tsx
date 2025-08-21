import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Eye } from 'lucide-react';
import { Product, Service } from '@/services/api';
import { ReviewSection } from './ReviewSection';

interface ProductServiceCardProps {
  item: Product | Service;
  type: 'product' | 'service';
}

export const ProductServiceCard: React.FC<ProductServiceCardProps> = ({ item, type }) => {
  const [showReviews, setShowReviews] = useState(false);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getPriceDisplay = () => {
    if (type === 'product') {
      const product = item as Product;
      return `${product.price_currency} ${product.price}`;
    } else {
      const service = item as Service;
      return service.price_range || 'Contact for pricing';
    }
  };

  const getAvailabilityStatus = () => {
    if (type === 'product') {
      const product = item as Product;
      return product.in_stock ? 'In Stock' : 'Out of Stock';
    } else {
      const service = item as Service;
      return service.is_available ? 'Available' : 'Unavailable';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg font-semibold text-fem-navy">{item.name}</span>
            <div className="flex items-center gap-2">
              {renderStars(4.5)} {/* You can add actual rating here */}
              <span className="text-sm text-gray-600">(4.5)</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image */}
          {item.images && item.images.length > 0 && (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          {item.description && (
            <p className="text-gray-700 leading-relaxed">{item.description}</p>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Price:</span>
              <p className="text-fem-navy font-semibold">{getPriceDisplay()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Status:</span>
              <p className={`font-semibold ${
                getAvailabilityStatus().includes('In Stock') || getAvailabilityStatus().includes('Available')
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {getAvailabilityStatus()}
              </p>
            </div>
            {type === 'service' && (item as Service).duration && (
              <div>
                <span className="font-medium text-gray-600">Duration:</span>
                <p className="text-fem-navy">{(item as Service).duration}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowReviews(!showReviews)}
              variant="outline"
              className="flex-1 border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {showReviews ? 'Hide Reviews' : 'Show Reviews'}
            </Button>
            <Button className="flex-1 bg-fem-terracotta hover:bg-fem-terracotta/90 text-white">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      {showReviews && (
        <ReviewSection
          type={type}
          itemId={item.id?.toString() || ''}
          itemName={item.name}
          canReview={true}
        />
      )}
    </div>
  );
};
