import React, { useState } from 'react';
import { Play, Zap, Search, Filter, BarChart3, TrendingUp, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export const SearchDemo: React.FC = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "AI-Powered Suggestions",
      description: "Get intelligent search suggestions based on your data and popular searches",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Filter className="w-6 h-6" />,
      title: "Advanced Filters",
      description: "Filter by category, location, rating, price, and more with real-time updates",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Search Analytics",
      description: "Track search trends, popular terms, and get insights into what's trending",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Unified Results",
      description: "Search across businesses, services, and products in one powerful interface",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized with smart caching, debouncing, and server-side search",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Smart Sorting",
      description: "Sort by relevance, rating, popularity, or custom criteria",
      color: "from-pink-500 to-pink-600"
    }
  ];

  const handleTryEpicSearch = () => {
    navigate('/epic-search');
  };

  const handlePlayDemo = () => {
    setIsPlaying(true);
    // Simulate demo animation
    setTimeout(() => setIsPlaying(false), 3000);
  };

  return (
    <div className="py-16 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-fem-navy to-fem-terracotta text-white px-6 py-3 rounded-full shadow-lg mb-6">
            <Zap className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Epic Search Features</h2>
            <Zap className="w-6 h-6" />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Experience the future of search with our intelligent, fast, and comprehensive search system
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleTryEpicSearch}
              className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg"
            >
              <Search className="w-5 h-5 mr-2" />
              Try Epic Search
            </Button>
            <Button
              variant="outline"
              onClick={handlePlayDemo}
              disabled={isPlaying}
              className="border-2 border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white transition-all duration-300 px-8 py-3 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              {isPlaying ? 'Playing...' : 'Watch Demo'}
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <CardHeader>
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-fem-navy">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-fem-terracotta mb-2">300ms</div>
              <div className="text-sm text-gray-600">Search Response Time</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-fem-terracotta mb-2">10x</div>
              <div className="text-sm text-gray-600">Faster Than Before</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-fem-terracotta mb-2">95%</div>
              <div className="text-sm text-gray-600">Search Accuracy</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-fem-terracotta mb-2">∞</div>
              <div className="text-sm text-gray-600">Search Possibilities</div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Experience Epic Search?</h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have discovered the power of intelligent search. 
              Find exactly what you're looking for, faster than ever before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleTryEpicSearch}
                className="bg-white text-fem-navy hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Searching Now
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/directory')}
                className="border-2 border-white text-white hover:bg-white hover:text-fem-navy transition-all duration-300 px-8 py-3 text-lg"
              >
                <Search className="w-5 h-5 mr-2" />
                View Directory
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-fem-navy mb-8">What Users Are Saying</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The search is incredibly fast and accurate. I found exactly what I was looking for in seconds!"
                </p>
                <div className="font-semibold text-fem-navy">Sarah M.</div>
                <div className="text-sm text-gray-500">Business Owner</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The filters are amazing! I can narrow down my search to exactly what I need."
                </p>
                <div className="font-semibold text-fem-navy">John D.</div>
                <div className="text-sm text-gray-500">Customer</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The search suggestions are so helpful. It's like the system knows what I want before I do!"
                </p>
                <div className="font-semibold text-fem-navy">Maria L.</div>
                <div className="text-sm text-gray-500">Service Provider</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchDemo;
