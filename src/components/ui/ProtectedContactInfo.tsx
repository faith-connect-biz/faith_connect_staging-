import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, Mail, Eye, EyeOff, Lock } from 'lucide-react';

interface ProtectedContactInfoProps {
  phone?: string;
  email?: string;
  className?: string;
  variant?: 'inline' | 'card';
}

export const ProtectedContactInfo: React.FC<ProtectedContactInfoProps> = ({
  phone,
  email,
  className = '',
  variant = 'inline'
}) => {
  const { isAuthenticated } = useAuth();
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  // For non-logged-in users, show nothing
  if (!isAuthenticated) {
    return (
      <div className={`space-y-2 ${className}`}>
        {phone && (
          <div className="flex items-center gap-2 text-gray-400">
            <Phone className="w-4 h-4" />
            <span className="text-sm">Phone number hidden</span>
            <Lock className="w-3 h-3" />
          </div>
        )}
        {email && (
          <div className="flex items-center gap-2 text-gray-400">
            <Mail className="w-4 h-4" />
            <span className="text-sm">Email hidden</span>
            <Lock className="w-3 h-3" />
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2">
          Sign in to view contact information
        </div>
      </div>
    );
  }

  // For logged-in users, show clickable reveal buttons
  const renderInline = () => (
    <div className={`space-y-2 ${className}`}>
      {phone && (
        <div className="flex items-center gap-2 text-gray-600">
          <Phone className="w-4 h-4 text-fem-terracotta" />
          {showPhone ? (
            <span>{phone}</span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-gray-600 hover:text-fem-terracotta"
              onClick={() => setShowPhone(true)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Click to show phone
            </Button>
          )}
        </div>
      )}
      
      {email && (
        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="w-4 h-4 text-fem-terracotta" />
          {showEmail ? (
            <span>{email}</span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-gray-600 hover:text-fem-terracotta"
              onClick={() => setShowEmail(true)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Click to show email
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const renderCard = () => (
    <div className={`space-y-4 ${className}`}>
      {phone && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-fem-terracotta" />
            <span className="text-sm text-gray-600">Phone</span>
          </div>
          {showPhone ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{phone}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowPhone(false)}
              >
                <EyeOff className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setShowPhone(true)}
            >
              <Eye className="w-3 h-3 mr-1" />
              Show
            </Button>
          )}
        </div>
      )}
      
      {email && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-fem-terracotta" />
            <span className="text-sm text-gray-600">Email</span>
          </div>
          {showEmail ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{email}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowEmail(false)}
              >
                <EyeOff className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setShowEmail(true)}
            >
              <Eye className="w-3 h-3 mr-1" />
              Show
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return variant === 'card' ? renderCard() : renderInline();
};
