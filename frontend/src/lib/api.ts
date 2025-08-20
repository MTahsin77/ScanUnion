/**
 * API Configuration and Utility Functions
 * 
 * This file contains the base API configuration and utility functions
 * for making requests to the Django backend.
 */

// API Base URL - Update this to point to your Django backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login/',
    CHANGE_PASSWORD: '/auth/change-password/',
    PROFILE: '/auth/profile/',
  },
  // Users
  USERS: {
    LIST: '/users/',
    DETAIL: (id: string) => `/users/${id}/`,
  },
  // Events
  EVENTS: {
    LIST: '/events/',
    DETAIL: (id: string) => `/events/${id}/`,
  },
  // Scan Logs
  SCAN_LOGS: {
    LIST: '/scan-logs/',
    DETAIL: (id: string) => `/scan-logs/${id}/`,
  },
} as const;

/**
 * Get the full API URL for an endpoint
 */
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

/**
 * Get authentication headers for API requests
 */
/**
 * Check if the user is authenticated with a valid token
 * Note: This only checks if a token exists, not if it's valid/unexpired
 * The actual validation happens during API calls
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const adminUser = localStorage.getItem('scanunion_admin');
  const scannerUser = localStorage.getItem('scanunion_user');
  
  if (adminUser) {
    try {
      const admin = JSON.parse(adminUser);
      return !!admin.access;
    } catch {
      return false;
    }
  }
  
  if (scannerUser) {
    try {
      const scanner = JSON.parse(scannerUser);
      return !!scanner.access;
    } catch {
      return false;
    }
  }
  
  return false;
}

/**
 * Get the current user role
 */
export function getCurrentUserRole(): 'admin' | 'scanner' | null {
  if (typeof window === 'undefined') return null;
  
  const adminUser = localStorage.getItem('scanunion_admin');
  if (adminUser) {
    try {
      const admin = JSON.parse(adminUser);
      if (admin.access) return 'admin';
    } catch {
      localStorage.removeItem('scanunion_admin');
    }
  }
  
  const scannerUser = localStorage.getItem('scanunion_user');
  if (scannerUser) {
    try {
      const scanner = JSON.parse(scannerUser);
      if (scanner.access) return 'scanner';
    } catch {
      localStorage.removeItem('scanunion_user');
    }
  }
  
  return null;
}

/**
 * Clear conflicting auth tokens - useful when switching between roles
 */
export function clearConflictingAuth(keepRole: 'admin' | 'scanner'): void {
  if (typeof window !== 'undefined') {
    if (keepRole === 'admin') {
      localStorage.removeItem('scanunion_user');
    } else {
      localStorage.removeItem('scanunion_admin');
    }
  }
}

/**
 * Clear all authentication tokens and redirect to login
 */
export function clearAuthAndRedirect(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('scanunion_admin');
    localStorage.removeItem('scanunion_user');
    window.location.href = '/login';
  }
}

export function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    // Priority: Admin token first, then scanner token
    // This prevents conflicts when testing both roles in same browser
    const adminUser = localStorage.getItem('scanunion_admin');
    const scannerUser = localStorage.getItem('scanunion_user');
    
    if (adminUser) {
      try {
        const admin = JSON.parse(adminUser);
        if (admin.access) {
          headers['Authorization'] = `Bearer ${admin.access}`;
          return headers;
        } else {
          console.warn('⚠️ Admin user data exists but no access token found');
          // Clear invalid admin data
          localStorage.removeItem('scanunion_admin');
        }
      } catch (error) {
        console.error('❌ Error parsing admin user from localStorage:', error);
        localStorage.removeItem('scanunion_admin');
      }
    }
    
    // Only use scanner token if no valid admin token
    if (scannerUser) {
      try {
        const scanner = JSON.parse(scannerUser);
        if (scanner.access) {
          headers['Authorization'] = `Bearer ${scanner.access}`;
        } else {
          console.warn('⚠️ Scanner user data exists but no access token found');
          // Clear invalid scanner data
          localStorage.removeItem('scanunion_user');
        }
      } catch (error) {
        console.error('❌ Error parsing scanner user from localStorage:', error);
      }
    }


  }

  return headers;
}

/**
 * Make an API request with proper error handling
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };



  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText} for ${url}`);
      
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      // Handle specific status codes
      if (response.status === 401) {
        errorMessage = 'Authentication credentials were not provided.';
        // Only redirect for 401 errors (definitely authentication related)
        console.warn('🔄 Token expired, redirecting to login...');
        clearAuthAndRedirect();
      } else if (response.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
        // For 403 errors, just show the error - don't auto-redirect
        // User might not have permissions for this specific action
        console.warn('🚫 Access forbidden - check permissions');
      } else if (response.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (response.status === 500) {
        errorMessage = 'Internal server error. Please try again later.';
      }
      
      try {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        // Use server error message if available and more descriptive
        if (errorData.error || errorData.detail) {
          const serverMessage = errorData.error || errorData.detail;
          // Only use server message if it's more descriptive than our default
          if (serverMessage.length > errorMessage.length || response.status === 400) {
            errorMessage = serverMessage;
          }
        }
      } catch {
        // If we can't parse the error response, use our default message
      }
      
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response as any;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * API helper functions for common operations
 */
export const api = {
  // Authentication
  auth: {
    login: (credentials: { pin?: string; email?: string; password?: string }) =>
      apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    
    changePassword: (data: { old_password: string; new_password: string }) =>
      apiRequest(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    getProfile: () =>
      apiRequest(API_ENDPOINTS.AUTH.PROFILE),
  },

  // Users
  users: {
    list: async (params?: { role?: string; enabled?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.role) searchParams.append('role', params.role);
      if (params?.enabled !== undefined) searchParams.append('enabled', params.enabled.toString());
      
      const query = searchParams.toString();
      const endpoint = query ? `${API_ENDPOINTS.USERS.LIST}?${query}` : API_ENDPOINTS.USERS.LIST;
      
      const response = await apiRequest(endpoint);
      // Handle Django REST Framework pagination
      return response.results || response;
    },
    
    create: (userData: any) =>
      apiRequest(API_ENDPOINTS.USERS.LIST, {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    
    get: (id: string) =>
      apiRequest(API_ENDPOINTS.USERS.DETAIL(id)),
    
    update: (id: string, userData: any) =>
      apiRequest(API_ENDPOINTS.USERS.DETAIL(id), {
        method: 'PATCH',
        body: JSON.stringify(userData),
      }),
    
    delete: (id: string) =>
      apiRequest(API_ENDPOINTS.USERS.DETAIL(id), {
        method: 'DELETE',
      }),
  },

  // Events
  events: {
    list: async (params?: { includeStats?: boolean; userId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.includeStats) searchParams.append('includeStats', 'true');
      if (params?.userId) searchParams.append('userId', params.userId);
      
      const query = searchParams.toString();
      const endpoint = query ? `${API_ENDPOINTS.EVENTS.LIST}?${query}` : API_ENDPOINTS.EVENTS.LIST;
      
      const response = await apiRequest(endpoint);
      // Handle Django REST Framework pagination
      return response.results || response;
    },
    
    create: (eventData: any) =>
      apiRequest(API_ENDPOINTS.EVENTS.LIST, {
        method: 'POST',
        body: JSON.stringify(eventData),
      }),
    
    get: (id: string) =>
      apiRequest(API_ENDPOINTS.EVENTS.DETAIL(id)),
    
    getById: (id: string) =>
      apiRequest(API_ENDPOINTS.EVENTS.DETAIL(id)),
    
    update: (id: string, eventData: any) =>
      apiRequest(API_ENDPOINTS.EVENTS.DETAIL(id), {
        method: 'PATCH',
        body: JSON.stringify(eventData),
      }),
    
    delete: (id: string) =>
      apiRequest(API_ENDPOINTS.EVENTS.DETAIL(id), {
        method: 'DELETE',
      }),
  },

  // Scan Logs
  scanLogs: {
    list: async (params?: { eventId?: string; scannerId?: string; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.eventId) searchParams.append('event_id', params.eventId);
      if (params?.scannerId) searchParams.append('scanner_id', params.scannerId);
      if (params?.status) searchParams.append('status', params.status);
      
      const query = searchParams.toString();
      const endpoint = query ? `${API_ENDPOINTS.SCAN_LOGS.LIST}?${query}` : API_ENDPOINTS.SCAN_LOGS.LIST;
      
      try {
        let allResults: any[] = [];
        let currentUrl = endpoint;
        let pageCount = 0;
        const maxPages = 10; // Safety limit to prevent infinite loops
        
        // Fetch all pages
        while (currentUrl && pageCount < maxPages) {
          const response = await apiRequest(currentUrl);
          pageCount++;
          
          // Add results from this page
          if (response.results && Array.isArray(response.results)) {
            allResults = allResults.concat(response.results);
          }
          
          // Check if there's a next page
          if (response.next && response.next !== currentUrl) {
            // Convert absolute URL to relative URL for apiRequest
            try {
              const nextUrl = new URL(response.next);
              // Remove the /api prefix since getApiUrl will add it back
              let relativePath = nextUrl.pathname + nextUrl.search;
              if (relativePath.startsWith('/api/')) {
                relativePath = relativePath.substring(4); // Remove '/api'
              }
              currentUrl = relativePath;
            } catch (urlError) {
              console.error('Error parsing next URL:', response.next, urlError);
              break;
            }
          } else {
            break;
          }
        }
        return allResults;
      } catch (error) {
        console.error('Error fetching scan logs:', error);
        // Fallback to simple request without additional parameters
        try {
          const fallbackEndpoint = query ? `${API_ENDPOINTS.SCAN_LOGS.LIST}?${query}` : API_ENDPOINTS.SCAN_LOGS.LIST;
          const fallbackResponse = await apiRequest(fallbackEndpoint);
          return fallbackResponse.results || fallbackResponse;
        } catch (fallbackError) {
          console.error('Fallback scan logs request also failed:', fallbackError);
          return [];
        }
      }
    },
    
    create: (scanData: { event_id: string; scanner_id: string; student_id: string }) =>
      apiRequest(API_ENDPOINTS.SCAN_LOGS.LIST, {
        method: 'POST',
        body: JSON.stringify(scanData),
      }),
    
    get: (id: string) =>
      apiRequest(API_ENDPOINTS.SCAN_LOGS.DETAIL(id)),
  },
};
