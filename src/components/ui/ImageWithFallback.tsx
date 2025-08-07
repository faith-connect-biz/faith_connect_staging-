import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
  [key: string]: any;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  className,
  onError,
  onLoad,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
      onError?.();
    }
  };

  const handleLoad = () => {
    setHasError(false);
    onLoad?.();
  };

  // Update src when prop changes
  React.useEffect(() => {
    if (src && src !== imgSrc) {
      setImgSrc(src);
      setHasError(false);
    }
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={cn(
        "object-cover transition-opacity duration-300",
        hasError && "opacity-50",
        className
      )}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

// Specialized components for different use cases
export const BusinessImage: React.FC<{
  business: any;
  className?: string;
  [key: string]: any;
}> = ({ business, className, ...props }) => {
  const imageSrc = business.business_image_url || business.business_logo_url;
  
  return (
    <ImageWithFallback
      src={imageSrc}
      alt={`${business.business_name} photo`}
      className={className}
      {...props}
    />
  );
};

export const BusinessLogo: React.FC<{
  business: any;
  className?: string;
  [key: string]: any;
}> = ({ business, className, ...props }) => {
  const logoSrc = business.business_logo_url || business.business_image_url;
  
  return (
    <ImageWithFallback
      src={logoSrc}
      alt={`${business.business_name} logo`}
      className={cn("object-contain", className)}
      {...props}
    />
  );
};
