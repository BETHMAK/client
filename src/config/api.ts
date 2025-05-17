/**
 * API configuration and constants
 */

/**
 * Base API URL - set from environment variables with fallback
 */
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Authentication header utility
 * Retrieves the token from localStorage and formats it for API requests
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * API Error response interface
 */
export interface ApiErrorResponse {
  message?: string;
  statusCode?: number;
  error?: string;
}

/**
 * Error handling utility
 * Extracts relevant error information from Axios errors
 */
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with an error status
    const data = error.response.data as ApiErrorResponse;
    return data.message || data.error || `Server error: ${error.response.status}`;
  } else if (error.request) {
    // Request was made but no response received
    return 'No response from server. Please check your connection.';
  } else {
    // Error in setting up the request
    return error.message || 'An unexpected error occurred';
  }
};

