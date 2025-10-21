import React, { useState } from 'react';
import { BusinessRegistrationForm } from './components/BusinessRegistrationForm';
import { ProfileCompletionForm } from './components/ProfileCompletionForm';
import { Progress } from './components/ui/progress';
import { Card, CardContent, CardHeader } from './components/ui/card';

export interface ProductService {
  id: string;
  name: string;
  description: string;
  price: string;
  type: 'product' | 'service';
  images: Array<{
    id: string;
    type: 'file' | 'url';
    file?: File;
    url?: string;
    preview: string;
    name: string;
  }>;
}

export interface BusinessData {
  // Page 1 - Business Registration
  businessName: string;
  category: string;
  subcategory: string;
  businessDescription: string;
  isPhysicalAddress: boolean;
  onlineAddress: string;
  physicalAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  churchAffiliation: string;
  businessType: 'products' | 'services' | 'both' | '';
  
  // Page 2 - Profile Completion
  services: string;
  productsServices: ProductService[];
  workingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  contactDetails: {
    phone: string;
    email: string;
    website: string;
  };
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  photos: Array<{
    id: string;
    type: 'file' | 'url';
    file?: File;
    url?: string;
    preview: string;
    name: string;
  }>;
}

const initialBusinessData: BusinessData = {
  businessName: '',
  category: '',
  subcategory: '',
  businessDescription: '',
  isPhysicalAddress: false,
  onlineAddress: '',
  physicalAddress: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
  churchAffiliation: '',
  businessType: '',
  services: '',
  productsServices: [],
  workingHours: {
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '17:00', closed: true },
    sunday: { open: '09:00', close: '17:00', closed: true },
  },
  contactDetails: {
    phone: '',
    email: '',
    website: '',
  },
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
  },
  photos: [],
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessData, setBusinessData] = useState<BusinessData>(initialBusinessData);

  const handleStepComplete = (stepData: Partial<BusinessData>) => {
    setBusinessData(prev => ({ ...prev, ...stepData }));
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = (finalData: Partial<BusinessData>) => {
    const completeData = { ...businessData, ...finalData };
    console.log('Complete business registration data:', completeData);
    // Handle final submission here
    alert('Business registration completed successfully!');
  };

  const progressValue = (currentStep / 2) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="mb-2">Business Registration</h1>
          <p className="text-muted-foreground">
            Complete your business profile in 2 simple steps
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 ${
                  currentStep >= 1 ? 'bg-[#c74a33] shadow-md' : 'bg-gray-300'
                }`}>
                  <span className="font-medium">1</span>
                </div>
                <span className={`font-medium transition-colors ${
                  currentStep >= 1 ? 'text-[#c74a33]' : 'text-gray-500'
                }`}>
                  Business Registration
                </span>
              </div>
              
              <div className="flex-1 mx-6">
                <div className="relative">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#c74a33] transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 ${
                  currentStep >= 2 ? 'bg-[#c74a33] shadow-md' : 'bg-gray-300'
                }`}>
                  <span className="font-medium">2</span>
                </div>
                <span className={`font-medium transition-colors ${
                  currentStep >= 2 ? 'text-[#c74a33]' : 'text-gray-500'
                }`}>
                  Profile Completion
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Form Content */}
        <Card>
          <CardContent className="p-8">
            {currentStep === 1 && (
              <BusinessRegistrationForm
                initialData={businessData}
                onComplete={handleStepComplete}
              />
            )}
            
            {currentStep === 2 && (
              <ProfileCompletionForm
                initialData={businessData}
                onComplete={handleFinalSubmit}
                onBack={handleBack}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}