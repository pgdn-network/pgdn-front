import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { storage } from '@/utils/storage';

interface Organization {
  uuid: string;
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

export const OrganizationsProvider: React.FC<OrganizationsProviderProps> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = storage.getAccessToken();
      
      if (!token) {
        console.error('No access token found. User may need to log in.');
        setError('No access token found');
        return;
      }

      const url = 'http://localhost:8000/api/v1/organizations';
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
      
      if (data.organizations && Array.isArray(data.organizations)) {
        setOrganizations(data.organizations);
      }
      
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const value = {
    organizations,
    loading,
    error,
    refetch: fetchOrganizations
  };

  return (
    <OrganizationsContext.Provider value={value}>
      {children}
    </OrganizationsContext.Provider>
  );
};