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
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  businessType: string;
  churchAffiliation: string;
  businessTypeRadio: string;
  onlinePresence: boolean;

  // Page 2 - Profile Completion
  services: string;
  productsServices: ProductService[];
  workingHours: {
    [key: string]: {
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    };
  };
  contactDetails: {
    email: string;
    phone: string;
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
