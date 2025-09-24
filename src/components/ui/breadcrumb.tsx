import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const location = useLocation();

  // Generate breadcrumbs from current route if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Map route segments to readable labels
      let label = segment;
      let icon: React.ReactNode | undefined;

      switch (segment) {
        case 'directory':
          label = 'Directory';
          icon = <ChevronRight className="w-4 h-4" />;
          break;
        case 'business':
          label = 'Business';
          break;
        case 'profile':
          label = 'Profile';
          break;
        case 'about':
          label = 'About';
          break;
        case 'contact':
          label = 'Contact';
          break;
        case 'register-business':
          label = 'Register Business';
          break;
        case 'manage-business':
          label = 'Manage Business';
          break;
        default:
          // Handle UUIDs or other dynamic segments
          if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            // It's a UUID, try to determine context from previous segment
            const prevSegment = pathSegments[index - 1];
            if (prevSegment === 'business') {
              label = 'Business Details';
            } else {
              label = 'Details';
            }
          } else {
            // Capitalize first letter and replace hyphens with spaces
            label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
          }
          break;
      }

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        icon
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  return (
    <nav 
      className={`relative flex items-center space-x-1 text-sm rounded-lg overflow-hidden border border-white/20 ${className}`} 
      aria-label="Breadcrumb"
      style={{
        backgroundImage: `url('/images/breadcrumb-bg.jpg'), linear-gradient(135deg, #8B4513 0%, #D2691E 100%)`,
        backgroundSize: 'cover, cover',
        backgroundPosition: 'center, center',
        backgroundRepeat: 'no-repeat, no-repeat',
        minHeight: '160px'
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <ol className="relative z-10 flex items-center justify-center space-x-1 p-8 w-full h-full">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-white/80 mx-2 drop-shadow-lg" />
            )}
            {item.href ? (
              <Link
                to={item.href}
                className="flex items-center space-x-1 text-white hover:text-fem-gold transition-colors duration-200 drop-shadow-lg font-medium"
              >
                {item.icon && <span className="flex items-center">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className="flex items-center space-x-1 text-white font-bold drop-shadow-lg">
                {item.icon && <span className="flex items-center">{item.icon}</span>}
                <span>{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};