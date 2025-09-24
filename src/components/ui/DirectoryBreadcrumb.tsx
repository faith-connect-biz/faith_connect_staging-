import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home, Settings, Building2, Package } from 'lucide-react';

interface DirectoryBreadcrumbProps {
  activeTab: 'services' | 'businesses' | 'products';
  className?: string;
}

export const DirectoryBreadcrumb: React.FC<DirectoryBreadcrumbProps> = ({ 
  activeTab, 
  className = '' 
}) => {
  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'services':
        return <Settings className="w-4 h-4" />;
      case 'businesses':
        return <Building2 className="w-4 h-4" />;
      case 'products':
        return <Package className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'services':
        return 'Services';
      case 'businesses':
        return 'Businesses';
      case 'products':
        return 'Products';
      default:
        return tab;
    }
  };

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
        <li className="flex items-center">
          <Link
            to="/"
            className="flex items-center space-x-1 text-white hover:text-fem-gold transition-colors duration-200 drop-shadow-lg font-medium"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </li>
        <li className="flex items-center">
          <ChevronRight className="w-4 h-4 text-white/80 mx-2 drop-shadow-lg" />
          <Link
            to="/directory"
            className="flex items-center space-x-1 text-white hover:text-fem-gold transition-colors duration-200 drop-shadow-lg font-medium"
          >
            <span>Directory</span>
          </Link>
        </li>
        <li className="flex items-center">
          <ChevronRight className="w-4 h-4 text-white/80 mx-2 drop-shadow-lg" />
          <span className="flex items-center space-x-1 text-white font-bold drop-shadow-lg">
            {getTabIcon(activeTab)}
            <span>{getTabLabel(activeTab)}</span>
          </span>
        </li>
      </ol>
    </nav>
  );
};
