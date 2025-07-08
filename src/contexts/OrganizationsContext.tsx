import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { apiService } from '@/services/api';

interface Organization {
  uuid: string;
  slug: string;
  name: string;
  role_name: string;
  membership_active: boolean;
  joined_at: string;
}

interface OrganizationsContextType {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  clearCache: () => void;
}

const OrganizationsContext = createContext<OrganizationsContextType | undefined>(undefined);

export const useOrganizations = () => {
  const context = useContext(OrganizationsContext);
  if (context === undefined) {
    throw new Error('useOrganizations must be used within an OrganizationsProvider');
  }
  return context;
};

interface OrganizationsProviderProps {
  children: ReactNode;
}

// Cache key for localStorage
const ORG_CACHE_KEY = 'organizations_cache';
const ORG_CACHE_TIMESTAMP_KEY = 'organizations_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const OrganizationsProvider: React.FC<OrganizationsProviderProps> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);
  const isFetching = useRef(false);

  // Load organizations from cache
  const loadFromCache = (): boolean => {
    try {
      const cachedData = localStorage.getItem(ORG_CACHE_KEY);
      const cacheTimestamp = localStorage.getItem(ORG_CACHE_TIMESTAMP_KEY);
      
      if (!cachedData || !cacheTimestamp) {
        return false;
      }
      
      const timestamp = parseInt(cacheTimestamp, 10);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(ORG_CACHE_KEY);
        localStorage.removeItem(ORG_CACHE_TIMESTAMP_KEY);
        return false;
      }
      
      const organizations = JSON.parse(cachedData);
      setOrganizations(organizations);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error loading organizations from cache:', error);
      return false;
    }
  };
  
  // Save organizations to cache
  const saveToCache = (orgs: Organization[]) => {
    try {
      localStorage.setItem(ORG_CACHE_KEY, JSON.stringify(orgs));
      localStorage.setItem(ORG_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving organizations to cache:', error);
    }
  };
  
  // Clear cache
  const clearCache = () => {
    localStorage.removeItem(ORG_CACHE_KEY);
    localStorage.removeItem(ORG_CACHE_TIMESTAMP_KEY);
  };

  const fetchOrganizations = async (forceRefresh = false) => {
    // Prevent multiple concurrent requests
    if (isFetching.current) {
      return;
    }
    
    // If not forcing refresh and we have cached data, use it
    if (!forceRefresh && loadFromCache()) {
      return;
    }
    
    try {
      isFetching.current = true;
      setLoading(true);
      setError(null);

      const response = await apiService.get('/organizations');
      const data = response.data;
      
      if (data.organizations && Array.isArray(data.organizations)) {
        setOrganizations(data.organizations);
        saveToCache(data.organizations);
      }
      
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    // Only initialize once
    if (hasInitialized.current) {
      return;
    }
    
    hasInitialized.current = true;
    
    // Try to load from cache first, then fetch if needed
    if (!loadFromCache()) {
      fetchOrganizations();
    }
  }, []);

  const value = {
    organizations,
    loading,
    error,
    refetch: () => fetchOrganizations(true), // Force refresh when explicitly called
    clearCache
  };

  return (
    <OrganizationsContext.Provider value={value}>
      {children}
    </OrganizationsContext.Provider>
  );
};