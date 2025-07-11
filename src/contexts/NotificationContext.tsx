import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

import type { ScanSessionStatus } from '@/types/node';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'scan_progress';
  title: string;
  message?: string;
  duration?: number; // in milliseconds, 0 = persistent
  scanSessionStatus?: ScanSessionStatus; // For scan progress notifications
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'> | Notification) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const MAX_NOTIFICATIONS = 5; // Maximum number of notifications to show

  const addNotification = useCallback((notification: Omit<Notification, 'id'> | Notification) => {
    const id = 'id' in notification ? notification.id : Date.now().toString();
    const newNotification: Notification = { ...notification, id };
    
    setNotifications(prev => {
      const updatedNotifications = [...prev, newNotification];
      
      // If we exceed the maximum number of notifications, remove the oldest ones
      if (updatedNotifications.length > MAX_NOTIFICATIONS) {
        return updatedNotifications.slice(-MAX_NOTIFICATIONS);
      }
      
      return updatedNotifications;
    });

    // Auto-remove after duration (default 5 seconds, scan completion notifications get 15 seconds)
    if (notification.duration !== 0) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  }, []);

  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, ...updates }
          : notification
      )
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    updateNotification,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};