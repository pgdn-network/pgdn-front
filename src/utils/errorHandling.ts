/**
 * Utility functions for consistent error handling across the application
 */

export interface ErrorResponse {
  response?: {
    status?: number;
    data?: {
      detail?: string | Array<{ msg: string }>;
    };
  };
  message?: string;
  code?: string;
}

/**
 * Formats any error object into a user-friendly string message
 * @param error - The error object from API calls or other sources
 * @returns A user-friendly error message string
 */
export const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  
  // Handle HTTP status codes
  const status = error?.response?.status;
  if (status) {
    // Server errors (5xx)
    if (status >= 500) {
      return 'A server error occurred. Please try again later or contact support if the problem persists.';
    }
    // Client errors (4xx) - try to get specific message
    if (status >= 400 && status < 500) {
      if (error?.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          return error.response.data.detail.map((err: any) => err.msg).join(', ');
        }
        return String(error.response.data.detail);
      }
      // Generic 4xx messages
      if (status === 400) return 'Invalid request. Please check your input and try again.';
      if (status === 401) return 'Authentication required. Please log in again.';
      if (status === 403) return 'Access denied. You do not have permission to perform this action.';
      if (status === 404) return 'The requested resource was not found.';
      if (status === 409) return 'Conflict detected. The resource may already exist.';
      if (status === 422) return 'Validation error. Please check your input and try again.';
      return 'Request failed. Please try again.';
    }
  }
  
  // Network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  
  // Timeout errors
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  // Other error messages
  if (error?.message) return String(error.message);
  
  // Fallback
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Checks if an error is a server error (5xx status code)
 * @param error - The error object
 * @returns True if it's a server error
 */
export const isServerError = (error: any): boolean => {
  const status = error?.response?.status;
  return status !== undefined && status >= 500;
};

/**
 * Checks if an error is a client error (4xx status code)
 * @param error - The error object
 * @returns True if it's a client error
 */
export const isClientError = (error: any): boolean => {
  const status = error?.response?.status;
  return status !== undefined && status >= 400 && status < 500;
};

/**
 * Checks if an error is a network error
 * @param error - The error object
 * @returns True if it's a network error
 */
export const isNetworkError = (error: any): boolean => {
  return error?.code === 'NETWORK_ERROR' || 
         error?.message?.includes('Network Error') ||
         error?.message?.includes('Failed to fetch');
};

/**
 * Checks if an error is a timeout error
 * @param error - The error object
 * @returns True if it's a timeout error
 */
export const isTimeoutError = (error: any): boolean => {
  return error?.code === 'ECONNABORTED' || 
         error?.message?.includes('timeout') ||
         error?.message?.includes('Request timeout');
}; 