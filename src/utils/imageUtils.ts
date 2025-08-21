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
  return getImageUrl(imageUrl, fallbackUrl);
};

export const getBusinessLogoUrl = (business: any, fallbackUrl: string = "/placeholder.svg"): string => {
  // Priority: business_logo_url > business_image_url > fallback
  const logoUrl = business.business_logo_url || business.business_image_url;
  return getImageUrl(logoUrl, fallbackUrl);
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
