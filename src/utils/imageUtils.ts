/**
 * Utility functions for handling image URLs and fallbacks
 */

export const getImageUrl = (imageUrl: string | null | undefined, fallbackUrl: string = "/placeholder.svg"): string => {
  if (!imageUrl) {
    return fallbackUrl;
  }

  // Check if it's a local URL (starts with /)
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  // Check if it's a relative URL
  if (imageUrl.startsWith('./') || imageUrl.startsWith('../')) {
    return imageUrl;
  }

  // For external URLs (like CloudFront), return as is
  // The onError handler will catch failures and show fallback
  return imageUrl;
};

export const getBusinessImageUrl = (business: any, fallbackUrl: string = "/placeholder.svg"): string => {
  // Priority: business_image_url > business_logo_url > fallback
  const imageUrl = business.business_image_url || business.business_logo_url;
  
  // If it's a placeholder URL, generate a better placeholder with business initials
  if (imageUrl && imageUrl.includes('via.placeholder.com')) {
    return generateBusinessPlaceholder(business.business_name);
  }
  
  return imageUrl || fallbackUrl;
};

export const getBusinessLogoUrl = (business: any, fallbackUrl: string = "/placeholder.svg"): string => {
  // Priority: business_logo_url > business_image_url > fallback
  const logoUrl = business.business_logo_url || business.business_image_url;
  
  // If it's a placeholder URL, generate a better placeholder with business initials
  if (logoUrl && logoUrl.includes('via.placeholder.com')) {
    return generateBusinessPlaceholder(business.business_name);
  }
  
  return logoUrl || fallbackUrl;
};

export const getServiceImageUrl = (service: any, business: any, fallbackUrl: string = "/placeholder.svg"): string => {
  // Priority: service.service_image_url > business image > fallback
  const imageUrl = service.service_image_url || getBusinessImageUrl(business);
  
  // If it's a placeholder URL, generate a better placeholder with service/business initials
  if (imageUrl && imageUrl.includes('via.placeholder.com')) {
    return generateServicePlaceholder(service.name || business.business_name);
  }
  
  return imageUrl || fallbackUrl;
};

export const getProductImageUrl = (product: any, business: any, fallbackUrl: string = "/placeholder.svg"): string => {
  // Priority: product.product_image_url > product.images[0] > business image > fallback
  const imageUrl = product.product_image_url || product.images?.[0] || getBusinessImageUrl(business);
  
  // If it's a placeholder URL, generate a better placeholder with product/business initials
  if (imageUrl && imageUrl.includes('via.placeholder.com')) {
    return generateProductPlaceholder(product.name || business.business_name);
  }
  
  return imageUrl || fallbackUrl;
};

export const isImageUrlValid = (url: string): boolean => {
  if (!url) return false;
  
  // Basic URL validation
  try {
    new URL(url);
    return true;
  } catch {
    // If it's a relative path, consider it valid
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
};

export const getImageFallback = (businessName: string): string => {
  // Return a placeholder with the business name initials
  return "/placeholder.svg";
};

export const generateBusinessPlaceholder = (businessName: string): string => {
  // Generate initials from business name
  const initials = businessName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Create a data URL for a simple placeholder with initials
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 300, 200);
    gradient.addColorStop(0, '#1e3a8a'); // fem-navy
    gradient.addColorStop(1, '#dc2626'); // fem-terracotta
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 200);
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 150, 100);
  }
  
  return canvas.toDataURL();
};

export const generateServicePlaceholder = (serviceName: string): string => {
  // Generate initials from service name
  const initials = serviceName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Create a data URL for a service placeholder with different colors
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Background gradient - different colors for services
    const gradient = ctx.createLinearGradient(0, 0, 300, 200);
    gradient.addColorStop(0, '#059669'); // emerald-600
    gradient.addColorStop(1, '#0891b2'); // cyan-600
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 200);
    
    // Add a subtle pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 300; i += 20) {
      for (let j = 0; j < 200; j += 20) {
        if ((i + j) % 40 === 0) {
          ctx.fillRect(i, j, 10, 10);
        }
      }
    }
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 150, 100);
    
    // Add a small service icon indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('⚙️', 150, 150);
  }
  
  return canvas.toDataURL();
};

export const generateProductPlaceholder = (productName: string): string => {
  // Generate initials from product name
  const initials = productName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Create a data URL for a product placeholder with different colors
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Background gradient - different colors for products
    const gradient = ctx.createLinearGradient(0, 0, 300, 200);
    gradient.addColorStop(0, '#7c3aed'); // violet-600
    gradient.addColorStop(1, '#ec4899'); // pink-600
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 200);
    
    // Add a subtle pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 300; i += 15) {
      for (let j = 0; j < 200; j += 15) {
        if ((i + j) % 30 === 0) {
          ctx.fillRect(i, j, 8, 8);
        }
      }
    }
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 150, 100);
    
    // Add a small product icon indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('📦', 150, 150);
  }
  
  return canvas.toDataURL();
};
