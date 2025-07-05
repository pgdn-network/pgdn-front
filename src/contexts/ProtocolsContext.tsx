import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { storage } from '@/utils/storage';

export interface Protocol {
  uuid: string;
  name: string;
  display_name: string;
  category: string;
}

interface ProtocolsContextType {
  protocols: Protocol[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  clearCache: () => void;
  getProtocol: (uuid: string) => Protocol | null;
}

const ProtocolsContext = createContext<ProtocolsContextType | undefined>(undefined);

export const useProtocols = () => {
  const context = useContext(ProtocolsContext);
  if (context === undefined) {
    throw new Error('useProtocols must be used within a ProtocolsProvider');
  }
  return context;
};

interface ProtocolsProviderProps {
  children: ReactNode;
}

// Cache key for localStorage
const PROTOCOLS_CACHE_KEY = 'protocols_cache';
const PROTOCOLS_CACHE_TIMESTAMP_KEY = 'protocols_cache_timestamp';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (protocols change less frequently)

export const ProtocolsProvider: React.FC<ProtocolsProviderProps> = ({ children }) => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);
  const isFetching = useRef(false);

  // Load protocols from cache
  const loadFromCache = (): boolean => {
    try {
      const cachedData = localStorage.getItem(PROTOCOLS_CACHE_KEY);
      const cacheTimestamp = localStorage.getItem(PROTOCOLS_CACHE_TIMESTAMP_KEY);
      
      if (!cachedData || !cacheTimestamp) {
        return false;
      }
      
      const timestamp = parseInt(cacheTimestamp, 10);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(PROTOCOLS_CACHE_KEY);
        localStorage.removeItem(PROTOCOLS_CACHE_TIMESTAMP_KEY);
        return false;
      }
      
      const protocols = JSON.parse(cachedData);
      setProtocols(protocols);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error loading protocols from cache:', error);
      return false;
    }
  };
  
  // Save protocols to cache
  const saveToCache = (protocolsData: Protocol[]) => {
    try {
      localStorage.setItem(PROTOCOLS_CACHE_KEY, JSON.stringify(protocolsData));
      localStorage.setItem(PROTOCOLS_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving protocols to cache:', error);
    }
  };
  
  // Clear cache
  const clearCache = () => {
    localStorage.removeItem(PROTOCOLS_CACHE_KEY);
    localStorage.removeItem(PROTOCOLS_CACHE_TIMESTAMP_KEY);
  };

  const fetchProtocols = async (forceRefresh = false) => {
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
      const token = storage.getAccessToken();
      
      if (!token) {
        console.error('No access token found for protocols request. User may need to log in.');
        setError('No access token found');
        return;
      }

      const url = 'http://localhost:8000/api/v1/protocols';
      const response = await fetch(url, {
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setProtocols(data);
        saveToCache(data);
      }
      
    } catch (error) {
      console.error('Error fetching protocols:', error);
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
      fetchProtocols();
    }
  }, []);

  // Helper function to get protocol by UUID
  const getProtocol = (uuid: string): Protocol | null => {
    return protocols.find(protocol => protocol.uuid === uuid) || null;
  };

  const value = {
    protocols,
    loading,
    error,
    refetch: () => fetchProtocols(true), // Force refresh when explicitly called
    clearCache,
    getProtocol
  };

  return (
    <ProtocolsContext.Provider value={value}>
      {children}
    </ProtocolsContext.Provider>
  );
};