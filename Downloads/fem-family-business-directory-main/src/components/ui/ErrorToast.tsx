import React from 'react';
import { AlertCircle, X, RefreshCw, HelpCircle, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { UserFriendlyError } from '@/utils/errorHandler';

interface ErrorToastProps {
  error: UserFriendlyError;
  onRetry?: () => void;
  onAction?: () => void;
  onClose?: () => void;
  showRetry?: boolean;
  className?: string;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onRetry,
  onAction,
  onClose,
  showRetry = true,
  className = ''
}) => {
  const isRetryable = onRetry && showRetry;
  const hasAction = onAction && error.action;

  return (
    <div className={`bg-white border border-red-200 rounded-lg shadow-lg p-4 max-w-md ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-3 h-3 text-red-600" />
          </div>
          <h4 className="font-semibold text-red-800 text-sm">{error.title}</h4>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close error message"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error Message */}
      <p className="text-gray-700 text-sm mb-3 leading-relaxed">
        {error.message}
      </p>

      {/* Suggestion */}
      {error.suggestion && (
        <div className="flex items-start gap-2 mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <HelpCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-blue-800 text-xs leading-relaxed">
            {error.suggestion}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {hasAction && (
          <Button
            onClick={onAction}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5"
          >
            {error.action}
          </Button>
        )}
        
        {isRetryable && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs px-3 py-1.5"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Try Again
          </Button>
        )}

        {/* Contact Support Link */}
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1.5"
          onClick={() => window.open('/contact', '_blank')}
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Get Help
        </Button>
      </div>
    </div>
  );
};

export default ErrorToast;
