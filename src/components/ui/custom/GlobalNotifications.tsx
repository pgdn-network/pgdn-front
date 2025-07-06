import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationsContainer } from './NotificationsContainer';

export const GlobalNotifications: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <NotificationsContainer 
      notifications={notifications} 
      onClose={removeNotification} 
    />
  );
};