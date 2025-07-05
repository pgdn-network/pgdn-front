import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  AuthContextType,
  JWTPayload,
} from '@/types/auth';
import { storage } from '@/utils/storage';
import axios from 'axios';
import config from '@/config';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Decode JWT to extract user information
  const decodeToken = (token: string): JWTPayload | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Extract user from token
  const getUserFromToken = (token: string): User | null => {
    const decoded = decodeToken(token);
    if (!decoded) return null;

    return {
      id: decoded.user_id,
      username: decoded.sub,
      email: '', // Email not in token, would need to fetch from API
      first_name: decoded.first_name || '',
      last_name: '',
      org_uuid: decoded.org_uuid,
      role: decoded.role,
    };
  };

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    const decoded = decodeToken(token);
    if (!decoded) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  };

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = storage.getAccessToken();
        
        if (accessToken && !isTokenExpired(accessToken)) {
          const userFromToken = getUserFromToken(accessToken);
          if (userFromToken) {
            // Optionally fetch full user profile here
            setUser(userFromToken);
          }
        } else if (storage.getRefreshToken()) {
          // Try to refresh token
          await refreshToken();
        } else {
          storage.clearTokens();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        storage.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      // Create form data for login
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      const response = await axios.post<AuthTokens>(
        `${config.apiUrl}${config.apiPrefix}/login`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const tokens: AuthTokens = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        token_type: response.data.token_type,
      };

      storage.setTokens(tokens);
      
      const userFromToken = getUserFromToken(tokens.access_token);
      if (userFromToken) {
        setUser(userFromToken);
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post<AuthTokens>(
        `${config.apiUrl}${config.apiPrefix}/register`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const tokens: AuthTokens = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        token_type: response.data.token_type,
      };

      storage.setTokens(tokens);
      
      const userFromToken = getUserFromToken(tokens.access_token);
      if (userFromToken) {
        setUser(userFromToken);
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      const refreshTokenValue = storage.getRefreshToken();
      
      if (refreshTokenValue) {
        // Call logout API
        await axios.post(
          `${config.apiUrl}${config.apiPrefix}/logout`,
          { refresh_token: refreshTokenValue },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${storage.getAccessToken()}`,
            },
          }
        );
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local storage and redirect
      storage.clearTokens();
      
      // Clear organizations cache
      localStorage.removeItem('organizations_cache');
      localStorage.removeItem('organizations_cache_timestamp');
      
      // Clear protocols cache  
      localStorage.removeItem('protocols_cache');
      localStorage.removeItem('protocols_cache_timestamp');
      
      setUser(null);
      navigate('/login');
    }
  }, [navigate]);

  const refreshToken = useCallback(async () => {
    const refreshTokenValue = storage.getRefreshToken();
    
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post<AuthTokens>(
        `${config.apiUrl}${config.apiPrefix}/refresh`,
        { refresh_token: refreshTokenValue },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const tokens: AuthTokens = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        token_type: response.data.token_type,
      };

      storage.setTokens(tokens);
      
      const userFromToken = getUserFromToken(tokens.access_token);
      if (userFromToken) {
        setUser(userFromToken);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      throw error;
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};