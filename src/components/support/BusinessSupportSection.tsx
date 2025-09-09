import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HeadphonesIcon, 
  Code, 
  Camera, 
  PenTool, 
  TrendingUp, 
  Smartphone,
  Video,
  FileText,
  Users,
  Calculator,
  Scale,
  Wrench,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ProfessionalServiceRequestModal } from './ProfessionalServiceRequestModal';
import { PhotoRequestModal } from '../PhotoRequestModal';
import { ProfessionalServiceRequest } from '@/services/api';
import { formatToBritishDate } from '@/utils/dateUtils';

interface BusinessSupportSectionProps {
  businessId: string;
  businessName: string;
  requests?: ProfessionalServiceRequest[];
}

export const BusinessSupportSection: React.FC<BusinessSupportSectionProps> = ({
  businessId,
  businessName,
  requests = []
}) => {
  const [showServiceRequestModal, setShowServiceRequestModal] = useState(false);
  const [showPhotoRequestModal, setShowPhotoRequestModal] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');

  const supportServices = [
    {
      type: 'website_development',
      title: 'Website Development',
      description: 'Professional website design and development',
      icon: Code,
      color: 'bg-blue-500',
      popular: true
    },
    {
      type: 'mobile_app',
      title: 'Mobile App Development',
      description: 'Custom mobile applications for your business',
      icon: Smartphone,
      color: 'bg-green-500'
    },
    {
      type: 'digital_marketing',
      title: 'Digital Marketing',
      description: 'Social media and online marketing strategies',
      icon: TrendingUp,
      color: 'bg-purple-500',
      popular: true
    },
    {
      type: 'seo_optimization',
      title: 'SEO Optimization',
      description: 'Improve your search engine rankings',
      icon: TrendingUp,
      color: 'bg-orange-500'
    },
    {
      type: 'logo_design',
      title: 'Logo & Branding',
      description: 'Professional logo and brand identity design',
      icon: PenTool,
      color: 'bg-pink-500'
    },
    {
      type: 'photography',
      title: 'Professional Photography',
      description: 'High-quality photos for your business',
      icon: Camera,
      color: 'bg-red-500',
      isPhotoRequest: true
    },
    {
      type: 'video_production',
      title: 'Video Production',
      description: 'Professional video content creation',
      icon: Video,
      color: 'bg-indigo-500'
    },
    {
      type: 'content_writing',
      title: 'Content Writing',
      description: 'Professional content for your website and marketing',
      icon: FileText,
      color: 'bg-teal-500'
    },
    {
      type: 'business_consulting',
      title: 'Business Consulting',
      description: 'Strategic business advice and consultation',
      icon: Users,
      color: 'bg-yellow-500'
    },
    {
      type: 'accounting_services',
      title: 'Accounting Services',
      description: 'Professional bookkeeping and financial services',
      icon: Calculator,
      color: 'bg-emerald-500'
    },
    {
      type: 'legal_services',
      title: 'Legal Services',
      description: 'Legal advice and documentation support',
      icon: Scale,
      color: 'bg-slate-500'
    },
    {
      type: 'other',
      title: 'Other Services',
      description: 'Custom professional services for your needs',
      icon: Wrench,
      color: 'bg-gray-500'
    }
  ];

  const handleServiceRequest = (serviceType: string, isPhotoRequest: boolean = false) => {
    if (isPhotoRequest) {
      setShowPhotoRequestModal(true);
    } else {
      setSelectedServiceType(serviceType);
      setShowServiceRequestModal(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-gradient-to-r from-fem-terracotta/5 to-fem-gold/5 border-fem-terracotta/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <HeadphonesIcon className="h-6 w-6 text-fem-terracotta" />
            <span>Business Support Center</span>
          </CardTitle>
          <p className="text-gray-600">
            Get professional help to grow your business. Our internal team provides expert services 
            including website development, digital marketing, photography, and more.
          </p>
        </CardHeader>
      </Card>

      {/* Active Requests */}
      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Support Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{request.title}</h4>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status_display}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{request.request_type_display}</p>
                    <p className="text-xs text-gray-400">
                      Requested {formatToBritishDate(request.request_date)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Professional Services Available</CardTitle>
          <p className="text-sm text-gray-600">
            Click on any service to request professional assistance from our internal team.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={service.type}
                  className="relative p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleServiceRequest(service.type, service.isPhotoRequest)}
                >
                  {service.popular && (
                    <Badge className="absolute -top-2 -right-2 bg-fem-terracotta text-white text-xs">
                      Popular
                    </Badge>
                  )}
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${service.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-fem-terracotta transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      <div className="flex items-center space-x-1 mt-2 text-fem-terracotta text-sm">
                        <span>Request Service</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-gradient-to-r from-fem-navy/5 to-fem-terracotta/5">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-fem-navy mb-2">
              Need Something Else?
            </h3>
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for? Contact our support team directly for custom solutions.
            </p>
            <Button 
              variant="outline" 
              className="border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
            >
              Contact Support Team
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ProfessionalServiceRequestModal
        isOpen={showServiceRequestModal}
        onClose={() => {
          setShowServiceRequestModal(false);
          setSelectedServiceType('');
        }}
        businessId={businessId}
        businessName={businessName}
        preselectedType={selectedServiceType}
      />

      <PhotoRequestModal
        isOpen={showPhotoRequestModal}
        onClose={() => setShowPhotoRequestModal(false)}
        businessId=""
        businessName="Internal Support Team"
      />
    </div>
  );
};