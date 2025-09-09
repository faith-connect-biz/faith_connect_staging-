import { useCallback } from 'react';
import { useToast } from './use-toast';
import ErrorHandler, { UserFriendlyError } from '@/utils/errorHandler';

interface UseErrorHandlerOptions {
  context?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  onAction?: () => void;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const { toast } = useToast();
  const { context, showRetry = true, onRetry, onAction } = options;

  const handleError = useCallback((error: unknown, customContext?: string) => {
    const errorContext = customContext || context;
    const userFriendlyError = ErrorHandler.getUserFriendlyError(error, errorContext);

    // Log the original error for developers (in development mode)
    if (process.env.NODE_ENV === 'development') {
      console.error('Original error:', error);
      console.log('User-friendly error:', userFriendlyError);
    }

    // Show user-friendly error toast
    toast({
      title: userFriendlyError.title,
      description: (
        <div className="space-y-2">
          <p>{userFriendlyError.message}</p>
          {userFriendlyError.suggestion && (
            <p className="text-sm text-gray-600">{userFriendlyError.suggestion}</p>
          )}
        </div>
      ),
      variant: 'destructive',
      duration: 8000, // Longer duration for error messages
    });

    return userFriendlyError;
  }, [toast, context]);

  const handleErrorWithRetry = useCallback((error: unknown, retryFunction: () => void, customContext?: string) => {
    const userFriendlyError = handleError(error, customContext);
    
    // If error is retryable and retry function is provided, show retry option
    if (ErrorHandler.isRetryable(error) && showRetry && onRetry) {
      // You can implement a custom retry UI here if needed
      // For now, we'll just show the error with retry suggestion
    }

    return userFriendlyError;
  }, [handleError, showRetry, onRetry]);

  const handleAsyncError = useCallback(async function<T>(
    asyncFunction: () => Promise<T>,
    customContext?: string
  ): Promise<T | null> {
    try {
      return await asyncFunction();
    } catch (error) {
      handleError(error, customContext);
      return null;
    }
  }, [handleError]);

  const handleAsyncErrorWithRetry = useCallback(async function<T>(
    asyncFunction: () => Promise<T>,
    retryFunction: () => void,
    customContext?: string
  ): Promise<T | null> {
    try {
      return await asyncFunction();
    } catch (error) {
      handleErrorWithRetry(error, retryFunction, customContext);
      return null;
    }
  }, [handleErrorWithRetry]);

  return {
    handleError,
    handleErrorWithRetry,
    handleAsyncError,
    handleAsyncErrorWithRetry,
    isRetryable: ErrorHandler.isRetryable,
    getRetrySuggestion: ErrorHandler.getRetrySuggestion,
  };
};

export default useErrorHandler;