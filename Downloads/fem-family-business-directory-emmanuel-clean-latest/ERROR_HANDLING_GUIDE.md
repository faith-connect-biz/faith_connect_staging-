# Error Handling Guide

This guide explains how to use the new user-friendly error handling system in the Faith Connect application.

## Overview

The new error handling system converts technical error messages into user-friendly ones that are easy to understand. It provides:

- **Clear error titles** that explain what went wrong
- **Simple error messages** without technical jargon
- **Helpful suggestions** on how to resolve the issue
- **Action buttons** when appropriate (e.g., "Login", "Try Again")
- **Consistent error handling** across the entire application

## Components

### 1. ErrorHandler Utility (`src/utils/errorHandler.ts`)

The core utility that converts technical errors to user-friendly messages.

```typescript
import ErrorHandler from '@/utils/errorHandler';

// Convert any error to user-friendly format
const userFriendlyError = ErrorHandler.getUserFriendlyError(error, 'login');

// Check if error is retryable
const canRetry = ErrorHandler.isRetryable(error);

// Get retry suggestion
const suggestion = ErrorHandler.getRetrySuggestion(error);
```

### 2. useErrorHandler Hook (`src/hooks/useErrorHandler.tsx`)

A custom hook that provides easy-to-use error handling functions.

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

const MyComponent = () => {
  const { handleError, handleAsyncError } = useErrorHandler({ 
    context: 'business' 
  });

  // Handle errors in async functions
  const result = await handleAsyncError(
    async () => await apiService.createBusiness(data),
    'business-creation'
  );

  // Handle errors manually
  try {
    // ... some operation
  } catch (error) {
    handleError(error, 'business-update');
  }
};
```

### 3. ErrorToast Component (`src/components/ui/ErrorToast.tsx`)

A visual component for displaying errors (optional, for custom error UIs).

```typescript
import { ErrorToast } from '@/components/ui/ErrorToast';

<ErrorToast
  error={userFriendlyError}
  onRetry={() => retryFunction()}
  onAction={() => actionFunction()}
  showRetry={true}
/>
```

## Usage Examples

### Basic Error Handling

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

const MyComponent = () => {
  const { handleError } = useErrorHandler({ context: 'profile' });

  const updateProfile = async () => {
    try {
      await apiService.updateProfile(data);
      toast({ title: "Success!", description: "Profile updated successfully." });
    } catch (error) {
      handleError(error, 'profile-update');
    }
  };
};
```

### Async Error Handling

```typescript
const { handleAsyncError } = useErrorHandler({ context: 'business' });

const createBusiness = async () => {
  const result = await handleAsyncError(
    async () => await apiService.createBusiness(businessData),
    'business-creation'
  );
  
  if (result) {
    // Success - result contains the response
    navigate('/business-management');
  }
  // Error is automatically handled and displayed
};
```

### With Retry Logic

```typescript
const { handleErrorWithRetry } = useErrorHandler({ 
  context: 'upload',
  showRetry: true,
  onRetry: () => retryUpload()
});

const uploadFile = async () => {
  try {
    await apiService.uploadFile(file);
  } catch (error) {
    handleErrorWithRetry(error, retryUpload, 'file-upload');
  }
};
```

## Context-Specific Error Messages

The error handler provides different messages based on the context you specify:

- `'login'` - Authentication errors
- `'signup'` - Registration errors
- `'business'` - Business-related errors
- `'profile'` - Profile update errors
- `'upload'` - File upload errors
- `'otp-verification'` - OTP verification errors
- `'password-reset'` - Password reset errors

## Error Types Handled

### HTTP Status Codes
- **400** - Invalid Request
- **401** - Authentication Required
- **403** - Access Denied
- **404** - Not Found
- **409** - Conflict
- **422** - Validation Error
- **429** - Too Many Requests
- **500** - Server Error
- **502/503/504** - Service Unavailable

### Common Error Patterns
- Network/Connection issues
- Timeout errors
- Authentication failures
- Validation errors
- File upload problems
- Business-specific issues
- OTP/Verification errors

## Migration Guide

### Before (Old Way)
```typescript
try {
  await apiService.createBusiness(data);
} catch (error) {
  toast({
    title: "Error",
    description: error.message || "Something went wrong",
    variant: "destructive"
  });
}
```

### After (New Way)
```typescript
const { handleError } = useErrorHandler({ context: 'business' });

try {
  await apiService.createBusiness(data);
} catch (error) {
  handleError(error, 'business-creation');
}
```

### Or Even Better (Async Handler)
```typescript
const { handleAsyncError } = useErrorHandler({ context: 'business' });

const result = await handleAsyncError(
  async () => await apiService.createBusiness(data),
  'business-creation'
);
```

## Best Practices

1. **Always specify context** - This helps provide better error messages
2. **Use handleAsyncError** - Simplifies error handling for async operations
3. **Provide retry functions** - When operations can be retried
4. **Log errors in development** - Original errors are logged for debugging
5. **Keep error messages simple** - Users don't need technical details

## Error Message Examples

### Before (Technical)
```
"TypeError: Cannot read property 'data' of undefined at BusinessService.create (BusinessService.js:45:12)"
```

### After (User-Friendly)
```
Title: "System Error"
Message: "There's a problem with our system. Please try again."
Suggestion: "If this continues, please contact support."
```

### Before (Technical)
```
"HTTP 422: Validation failed: email is invalid, phone is required"
```

### After (User-Friendly)
```
Title: "Invalid Information"
Message: "Please check the information you entered and try again."
Suggestion: "Make sure all required fields are filled correctly."
```

## Support and Contact

If you encounter issues with the error handling system:

1. Check the browser console for original error details (in development mode)
2. Verify the context parameter is appropriate for your use case
3. Ensure the ErrorHandler utility is properly imported
4. Contact the development team for assistance

## Future Enhancements

- Custom error UI components
- Error analytics and reporting
- Retry with exponential backoff
- Offline error handling
- Localized error messages
