import React from "react";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps {
  src: string | null | undefined;
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
  // Use a ref to directly manipulate the DOM for error handling
  const imgRef = React.useRef<HTMLImageElement>(null);

  const handleError = () => {
    if (imgRef.current && imgRef.current.src !== fallbackSrc) {
      imgRef.current.src = fallbackSrc;
      onError?.();
    }
  };

  return (
    <img
      ref={imgRef}
      src={src || fallbackSrc}
      alt={alt}
      className={cn("object-cover", className)}
      onError={handleError}
      onLoad={onLoad}
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
      fallbackSrc="/placeholder.svg"
      onError={() => {
        console.warn(`Failed to load image for business: ${business.business_name}`);
      }}
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
      fallbackSrc="/placeholder.svg"
      onError={() => {
        console.warn(`Failed to load logo for business: ${business.business_name}`);
      }}
      {...props}
    />
  );
};
