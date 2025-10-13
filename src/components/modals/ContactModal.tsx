import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Phone, Mail, MapPin, Globe, MessageSquare } from 'lucide-react';

interface ContactDetails {
  business_name: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  website?: string;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactDetails: ContactDetails;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  contactDetails
}) => {
  const handlePhoneCall = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`);
  };

  const handleWhatsApp = (whatsapp: string) => {
    const cleanNumber = whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`);
  };

  const handleWebsite = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Contact Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-gray-900">{contactDetails.business_name}</h3>
            {!contactDetails.email && (
              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  📧 <strong>No email available</strong> - Use phone or WhatsApp to contact this business
                </p>
              </div>
            )}
          </div>
          
          {contactDetails.phone && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-fem-terracotta" />
                <span className="text-sm font-medium">{contactDetails.phone}</span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handlePhoneCall(contactDetails.phone!)}
                className="text-fem-terracotta border-fem-terracotta hover:bg-fem-terracotta hover:text-white"
              >
                Call
              </Button>
            </div>
          )}
          
          {contactDetails.email && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-fem-terracotta" />
                <span className="text-sm font-medium">{contactDetails.email}</span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleEmail(contactDetails.email!)}
                className="text-fem-terracotta border-fem-terracotta hover:bg-fem-terracotta hover:text-white"
              >
                Email
              </Button>
            </div>
          )}
          
          {contactDetails.whatsapp && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">{contactDetails.whatsapp}</span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleWhatsApp(contactDetails.whatsapp!)}
                className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
              >
                WhatsApp
              </Button>
            </div>
          )}
          
          {contactDetails.address && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 text-fem-terracotta mt-0.5" />
              <div>
                <p className="text-sm font-medium">{contactDetails.address}</p>
                {contactDetails.city && (
                  <p className="text-sm text-gray-600">{contactDetails.city}</p>
                )}
              </div>
            </div>
          )}
          
          {contactDetails.website && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-fem-terracotta" />
                <span className="text-sm font-medium truncate">{contactDetails.website}</span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleWebsite(contactDetails.website!)}
                className="text-fem-terracotta border-fem-terracotta hover:bg-fem-terracotta hover:text-white"
              >
                Visit
              </Button>
            </div>
          )}
          
          {!contactDetails.email && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Alternative Contact Methods</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Call directly</strong> - Use the phone number above</li>
                <li>• <strong>WhatsApp</strong> - Send a message via WhatsApp</li>
                <li>• <strong>Visit in person</strong> - Use the address provided</li>
                <li>• <strong>Website</strong> - Check their website for contact forms</li>
              </ul>
            </div>
          )}
          
          <div className="pt-4">
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
