import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Star, Bookmark, MessageSquare, Building2 } from 'lucide-react';
import { apiService, UserActivity } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatRelativeDate } from '@/utils/dateUtils';

export const UserActivitySection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadUserActivity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadUserActivity = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getUserActivity();
      setActivities(response.activities);
    } catch (error) {
      console.error('Error loading user activity:', error);
      setError('Failed to load activity data');
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'favorite':
        return <Bookmark className="h-4 w-4 text-blue-500" />;
      case 'business_like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'review_like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'review':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      default:
        return <Building2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityTitle = (type: string) => {
    switch (type) {
      case 'favorite':
        return 'Favorited';
      case 'business_like':
        return 'Liked';
      case 'review_like':
        return 'Liked Review';
      case 'review':
        return 'Reviewed';
      default:
        return 'Activity';
    }
  };

  const getActivityBadgeVariant = (type: string) => {
    switch (type) {
      case 'favorite':
        return 'default';
      case 'business_like':
        return 'destructive';
      case 'review_like':
        return 'destructive';
      case 'review':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Use the centralized date formatting utility
  const formatDate = formatRelativeDate;

  const handleBusinessClick = (businessId: string) => {
    navigate(`/business/${businessId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Your Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fem-terracotta"></div>
            <span className="ml-2 text-gray-600">Loading activity...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Your Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadUserActivity} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Your Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
            <p className="text-gray-600 mb-4">
              Start exploring businesses, leaving reviews, and adding favorites to see your activity here.
            </p>
            <Button onClick={() => navigate('/directory')} className="bg-fem-terracotta hover:bg-fem-terracotta/90">
              Explore Businesses
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Your Activity ({activities.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={`${activity.type}-${activity.id}`}
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => handleBusinessClick(activity.business_id)}
            >
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getActivityBadgeVariant(activity.type)}>
                    {getActivityTitle(activity.type)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatDate(activity.date)}
                  </span>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-1">
                  {activity.business_name}
                </h4>
                
                <p className="text-sm text-gray-600 mb-2">
                  {activity.business_category}
                </p>
                
                {activity.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-700">{activity.rating}/5</span>
                  </div>
                )}
                
                {activity.review_text && (
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border-l-2 border-gray-200">
                    "{activity.review_text}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <Button onClick={loadUserActivity} variant="outline" size="sm">
            Refresh Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
