import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Mail, Phone, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  businessEmail: string;
  onBookingSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  serviceName,
  businessEmail,
  onBookingSuccess
}) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.customer_email) {
      toast({
        title: "Required Fields",
        description: "Please fill in your name and email address.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create professional booking email
      const subject = `New Service Booking Request – ${serviceName}`;
      const body = `Hello,

I would like to book your service: ${serviceName}

My Details:
- Name: ${formData.customer_name}
- Email: ${formData.customer_email}
- Phone: ${formData.customer_phone || 'Not provided'}

Message:
${formData.message || 'No additional message provided'}

Please contact me to discuss the booking details.

Thank you!`;

      // Open default email client with pre-filled content
      const mailtoLink = `mailto:${businessEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
      
      toast({
        title: "Email Client Opened",
        description: "Your default email client has been opened with a pre-filled booking request.",
      });
      
      onBookingSuccess();
      onClose();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open email client. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Book Service</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Service:</strong> {serviceName}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Business:</strong> {businessEmail}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customer_name">Your Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="customer_name"
                  name="customer_name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="customer_email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="customer_email"
                  name="customer_email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="customer_phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="customer_phone"
                  name="customer_phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="message">Additional Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Any specific requirements or questions..."
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white">
                {isLoading ? 'Sending...' : 'Send Booking Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
