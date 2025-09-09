import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  CheckCircle, 
  Code, 
  Smartphone, 
  TrendingUp, 
  PenTool, 
  Camera, 
  Video, 
  FileText, 
  Users, 
  Calculator, 
  Scale, 
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiService, CreateProfessionalServiceRequestData } from '@/services/api';

interface ProfessionalServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  preselectedType?: string;
}

export const ProfessionalServiceRequestModal: React.FC<ProfessionalServiceRequestModalProps> = ({
  isOpen,
  onClose,
  businessId,
  businessName,
  preselectedType = ''
}) => {
  const [formData, setFormData] = useState<CreateProfessionalServiceRequestData>({
    request_type: preselectedType,
    title: '',
    description: '',
    budget_range: '',
    timeline: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset form when modal opens with preselected type
  React.useEffect(() => {
    if (isOpen && preselectedType) {
      setFormData(prev => ({
        ...prev,
        request_type: preselectedType
      }));
    }
  }, [isOpen, preselectedType]);

  const serviceTypes = [
    { value: 'website_development', label: 'Website Development', icon: Code },
    { value: 'mobile_app', label: 'Mobile App Development', icon: Smartphone },
    { value: 'digital_marketing', label: 'Digital Marketing', icon: TrendingUp },
    { value: 'seo_optimization', label: 'SEO Optimization', icon: TrendingUp },
    { value: 'logo_design', label: 'Logo & Branding Design', icon: PenTool },
    { value: 'photography', label: 'Professional Photography', icon: Camera },
    { value: 'video_production', label: 'Video Production', icon: Video },
    { value: 'content_writing', label: 'Content Writing', icon: FileText },
    { value: 'business_consulting', label: 'Business Consulting', icon: Users },
    { value: 'accounting_services', label: 'Accounting Services', icon: Calculator },
    { value: 'legal_services', label: 'Legal Services', icon: Scale },
    { value: 'other', label: 'Other Professional Services', icon: Wrench }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low Priority', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const budgetRanges = [
    'KSh 50,000 - KSh 100,000',
    'KSh 100,000 - KSh 250,000',
    'KSh 250,000 - KSh 500,000',
    'KSh 500,000 - KSh 1,000,000',
    'KSh 1,000,000+',
    'To be discussed'
  ];

  const timelineOptions = [
    'Within 1 week',
    'Within 2 weeks',
    'Within 1 month',
    'Within 2 months',
    'Within 3 months',
    'Flexible timeline'
  ];

  const handleSubmit = async () => {
    if (!formData.request_type || !formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await apiService.createProfessionalServiceRequest(formData);
      
      setIsSubmitted(true);
      toast({
        title: "Request Submitted Successfully!",
        description: "Our team will review your request and get back to you soon.",
      });
      
      // Close modal after showing success state
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setFormData({
          request_type: '',
          title: '',
          description: '',
          budget_range: '',
          timeline: '',
          priority: 'medium'
        });
      }, 2000);
      
    } catch (error: any) {
      console.error('Error submitting professional service request:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setIsSubmitted(false);
      setFormData({
        request_type: '',
        title: '',
        description: '',
        budget_range: '',
        timeline: '',
        priority: 'medium'
      });
    }
  };

  const selectedServiceType = serviceTypes.find(type => type.value === formData.request_type);

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Request Submitted!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Professional Service Request Sent
            </h3>
            <p className="text-gray-600 mb-2">
              Your request for <strong>{selectedServiceType?.label}</strong> has been successfully submitted.
            </p>
            <p className="text-sm text-gray-500">
              Our internal team will review your request and contact you within 1-2 business days.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-fem-terracotta" />
            <span>Request Professional Services</span>
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Get expert help from our internal team to grow your business
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Service Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="service-type" className="text-sm font-medium">
              Service Type <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.request_type} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, request_type: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select the type of service you need" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Request Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Request Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Brief title for your request (e.g., 'New e-commerce website for my bakery')"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Detailed Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what you need in detail. Include your goals, requirements, and any specific features you want..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-sm font-medium">
              Budget Range
            </Label>
            <Select value={formData.budget_range} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, budget_range: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select your budget range (optional)" />
              </SelectTrigger>
              <SelectContent>
                {budgetRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline" className="text-sm font-medium">
              Preferred Timeline
            </Label>
            <Select value={formData.timeline} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, timeline: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="When do you need this completed?" />
              </SelectTrigger>
              <SelectContent>
                {timelineOptions.map((timeline) => (
                  <SelectItem key={timeline} value={timeline}>
                    {timeline}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium">
              Priority Level
            </Label>
            <Select value={formData.priority} onValueChange={(value: any) => 
              setFormData(prev => ({ ...prev, priority: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityLevels.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <div className="flex items-center space-x-2">
                      <Badge className={priority.color}>{priority.label}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">How it works</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Our internal team will review your request and provide a detailed proposal 
                  including timeline and cost estimates within 1-2 business days.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.request_type || !formData.title.trim() || !formData.description.trim()}
              className="flex-1 bg-fem-terracotta hover:bg-fem-terracotta/90"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};