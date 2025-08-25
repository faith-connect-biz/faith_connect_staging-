// Error handling utility for user-friendly error messages
export interface UserFriendlyError {
  title: string;
  message: string;
  suggestion?: string;
  action?: string;
}

export class ErrorHandler {
  /**
   * Convert technical error messages to user-friendly ones
   */
  static getUserFriendlyError(error: any, context?: string): UserFriendlyError {
    // Default error
    const defaultError: UserFriendlyError = {
      title: "Something went wrong",
      message: "We encountered an unexpected error. Please try again.",
      suggestion: "If this problem continues, please contact support."
    };

    if (!error) return defaultError;

    // Handle different types of errors
    if (typeof error === 'string') {
      return this.parseStringError(error, context);
    }

    if (error.response) {
      return this.parseHttpError(error.response, context);
    }

    if (error.message) {
      return this.parseMessageError(error.message, context);
    }

    if (error.name) {
      return this.parseNamedError(error.name, context);
    }

    return defaultError;
  }

  /**
   * Parse HTTP response errors
   */
  private static parseHttpError(response: any, context?: string): UserFriendlyError {
    const status = response.status;
    const data = response.data;

    // Common HTTP status codes
    switch (status) {
      case 400:
        // If backend returned field errors, show only the field message without a title
        {
          const fieldMessage = this.extractFieldErrorMessage(data?.errors);
          if (fieldMessage) {
            return {
              title: '',
              message: fieldMessage,
              suggestion: 'Please check your information and try again.'
            };
          }
        }
        return {
          title: "Invalid Request",
          message: this.getBadRequestMessage(data, context),
          suggestion: "Please check your information and try again."
        };

      case 401:
        return {
          title: "Authentication Required",
          message: "Please log in to continue.",
          action: "Login",
          suggestion: "Your session may have expired. Please log in again."
        };

      case 403:
        return {
          title: "Access Denied",
          message: "You don't have permission to perform this action.",
          suggestion: "Please contact support if you believe this is an error."
        };

      case 404:
        return {
          title: "Not Found",
          message: this.getNotFoundMessage(context),
          suggestion: "The information you're looking for may have been moved or removed."
        };

      case 409:
        return {
          title: "Conflict",
          message: this.getConflictMessage(data, context),
          suggestion: "Please check if the information already exists or try a different approach."
        };

      case 422:
        return {
          title: "Validation Error",
          message: this.getValidationMessage(data, context),
          suggestion: "Please correct the highlighted fields and try again."
        };

      case 429:
        return {
          title: "Too Many Requests",
          message: "You've made too many requests. Please wait a moment.",
          suggestion: "Try again in a few minutes."
        };

      case 500:
        return {
          title: "Server Error",
          message: "Our servers are experiencing issues. Please try again later.",
          suggestion: "We're working to fix this. Please check back soon."
        };

      case 502:
      case 503:
      case 504:
        return {
          title: "Service Unavailable",
          message: "Our service is temporarily unavailable. Please try again later.",
          suggestion: "We're experiencing technical difficulties. Please check back soon."
        };

      default:
        return {
          title: "Connection Error",
          message: "Unable to connect to our servers. Please check your internet connection.",
          suggestion: "Try refreshing the page or check your network connection."
        };
    }
  }

  /**
   * Parse error messages for common patterns
   */
  private static parseMessageError(message: string, context?: string): UserFriendlyError {
    const lowerMessage = message.toLowerCase();

    // Network/Connection errors
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return {
        title: "Connection Problem",
        message: "Unable to connect to our servers. Please check your internet connection.",
        suggestion: "Try refreshing the page or check your network connection."
      };
    }

    // Timeout errors
    if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
      return {
        title: "Request Timeout",
        message: "The request took too long to complete. Please try again.",
        suggestion: "This usually happens when our servers are busy. Please try again."
      };
    }

    // Authentication errors
    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('invalid token')) {
      return {
        title: "Login Required",
        message: "Please log in to continue.",
        action: "Login",
        suggestion: "Your session may have expired. Please log in again."
      };
    }

    // Validation errors
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
      return {
        title: "Invalid Information",
        message: "Please check the information you entered and try again.",
        suggestion: "Make sure all required fields are filled correctly."
      };
    }

    // File upload errors
    if (lowerMessage.includes('file') || lowerMessage.includes('upload')) {
      return {
        title: "File Upload Error",
        message: "Unable to upload your file. Please try again.",
        suggestion: "Check that your file is the correct size and format."
      };
    }

    // Business specific errors
    if (lowerMessage.includes('business') || lowerMessage.includes('company')) {
      return {
        title: "Business Error",
        message: "There was a problem with your business information.",
        suggestion: "Please verify your business details and try again."
      };
    }

    // OTP/Verification errors
    if (lowerMessage.includes('otp') || lowerMessage.includes('verification') || lowerMessage.includes('code')) {
      return {
        title: "Verification Error",
        message: "Unable to verify your code. Please try again.",
        suggestion: "Make sure you entered the correct verification code."
      };
    }

    // Default message parsing
    return {
      title: "Error",
      message: this.cleanErrorMessage(message),
      suggestion: "Please try again or contact support if the problem continues."
    };
  }

  /**
   * Parse named errors
   */
  private static parseNamedError(name: string, context?: string): UserFriendlyError {
    switch (name) {
      case 'TypeError':
        return {
          title: "Invalid Operation",
          message: "The operation you're trying to perform is not supported.",
          suggestion: "Please try a different approach or contact support."
        };

      case 'ReferenceError':
        return {
          title: "System Error",
          message: "There's a problem with our system. Please try again.",
          suggestion: "If this continues, please contact support."
        };

      case 'SyntaxError':
        return {
          title: "Data Error",
          message: "There's a problem with the data format.",
          suggestion: "Please try refreshing the page or contact support."
        };

      default:
        return {
          title: "System Error",
          message: "An unexpected error occurred. Please try again.",
          suggestion: "If this problem continues, please contact support."
        };
    }
  }

  /**
   * Parse string errors
   */
  private static parseStringError(error: string, context?: string): UserFriendlyError {
    const lowerError = error.toLowerCase();

    if (lowerError.includes('required') || lowerError.includes('missing')) {
      return {
        title: "Missing Information",
        message: "Please fill in all required fields.",
        suggestion: "Check that all required fields are completed."
      };
    }

    if (lowerError.includes('invalid') || lowerError.includes('incorrect')) {
      return {
        title: "Invalid Information",
        message: "Please check the information you entered.",
        suggestion: "Make sure all fields are filled correctly."
      };
    }

    if (lowerError.includes('not found') || lowerError.includes('does not exist')) {
      return {
        title: "Not Found",
        message: this.getNotFoundMessage(context),
        suggestion: "The information you're looking for may have been moved or removed."
      };
    }

    return {
      title: "Error",
      message: this.cleanErrorMessage(error),
      suggestion: "Please try again or contact support if the problem continues."
    };
  }

  /**
   * Get context-specific messages
   */
  private static getBadRequestMessage(data: any, context?: string): string {
    // 1) Prefer field-level errors from DRF
    const fieldMessage = this.extractFieldErrorMessage(data?.errors);
    if (fieldMessage) {
      return fieldMessage;
    }

    // 2) Then use top-level message if it's not a generic placeholder
    if (data?.message) {
      const cleaned = this.cleanErrorMessage(data.message);
      const genericPlaceholders = [
        'Invalid data provided.',
        'Validation error.',
        'Bad request.'
      ];
      if (!genericPlaceholders.includes(cleaned)) {
        return cleaned;
      }
      // If generic, continue to context-specific fallback below
    }

    switch (context) {
      case 'login':
        return "Please check your login credentials and try again.";
      case 'signup':
        return "Please check your registration information and try again.";
      case 'business':
        return "Please check your business information and try again.";
      case 'profile':
        return "Please check your profile information and try again.";
      case 'upload':
        return "Please check your file and try uploading again.";
      default:
        return "Please check your information and try again.";
    }
  }

  private static getNotFoundMessage(context?: string): string {
    switch (context) {
      case 'business':
        return "The business you're looking for was not found.";
      case 'profile':
        return "The profile you're looking for was not found.";
      case 'file':
        return "The file you're looking for was not found.";
      default:
        return "The information you're looking for was not found.";
    }
  }

  private static getConflictMessage(data: any, context?: string): string {
    if (data?.message) {
      return this.cleanErrorMessage(data.message);
    }

    switch (context) {
      case 'signup':
        return "An account with this information already exists.";
      case 'business':
        return "A business with this information already exists.";
      case 'email':
        return "This email address is already registered.";
      case 'phone':
        return "This phone number is already registered.";
      default:
        return "This information conflicts with existing data.";
    }
  }

  private static getValidationMessage(data: any, context?: string): string {
    if (data?.message) {
      return this.cleanErrorMessage(data.message);
    }

    if (data?.errors && Array.isArray(data.errors)) {
      const firstError = data.errors[0];
      if (firstError?.message) {
        return this.cleanErrorMessage(firstError.message);
      }
    }

    // Also try extracting from object-based errors
    const fieldMessage = this.extractFieldErrorMessage(data?.errors);
    if (fieldMessage) {
      return fieldMessage;
    }

    return "Please check the information you entered and try again.";
  }

  /**
   * Clean error messages for user display
   */
  private static cleanErrorMessage(message: string): string {
    // Remove technical prefixes
    let cleaned = message
      .replace(/^error:\s*/i, '')
      .replace(/^failed:\s*/i, '')
      .replace(/^invalid:\s*/i, '')
      .replace(/^validation\s+error:\s*/i, '')
      .replace(/^api\s+error:\s*/i, '');

    // Capitalize first letter
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

    // Remove technical details in parentheses or brackets
    cleaned = cleaned.replace(/\s*\([^)]*\)/g, '');
    cleaned = cleaned.replace(/\s*\[[^\]]*\]/g, '');

    // Remove file paths or technical references
    cleaned = cleaned.replace(/\s*at\s+.*$/g, '');
    cleaned = cleaned.replace(/\s*in\s+.*$/g, '');

    return cleaned.trim();
  }

  /**
   * Attempt to extract first field error message from a typical DRF errors object
   */
  private static extractFieldErrorMessage(errors: any): string | null {
    if (!errors) return null;

    // If errors is an object like { field: ["msg1", "msg2"], other: ["msg"] }
    if (typeof errors === 'object' && !Array.isArray(errors)) {
      const firstKey = Object.keys(errors)[0];
      if (firstKey) {
        const val = errors[firstKey];
        if (Array.isArray(val) && val.length > 0) {
          return this.cleanErrorMessage(String(val[0]));
        }
        if (typeof val === 'string') {
          return this.cleanErrorMessage(val);
        }
      }
    }

    // If errors is already a string
    if (typeof errors === 'string') {
      return this.cleanErrorMessage(errors);
    }

    return null;
  }

  /**
   * Get retry suggestion based on error type
   */
  static getRetrySuggestion(error: any): string {
    if (error?.response?.status === 429) {
      return "Please wait a few minutes before trying again.";
    }

    if (error?.response?.status >= 500) {
      return "Please try again in a few minutes.";
    }

    return "Please try again.";
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: any): boolean {
    if (error?.response?.status >= 500) return true;
    if (error?.message?.includes('timeout')) return true;
    if (error?.message?.includes('network')) return true;
    return false;
  }
}

export default ErrorHandler;
