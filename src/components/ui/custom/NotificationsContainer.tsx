import React from 'react';
import { NotificationBanner } from './NotificationBanner';
import { ScanProgressNotification } from './ScanProgressNotification';
import type { Notification } from '@/contexts/NotificationContext';

interface NotificationsContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

export const NotificationsContainer: React.FC<NotificationsContainerProps> = ({
  notifications,
  onClose,
}) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="transform transition-all duration-300 ease-in-out"
        >
          {notification.type === 'scan_progress' && notification.scanSessionStatus ? (
            <ScanProgressNotification
              sessionStatus={notification.scanSessionStatus}
              onClose={() => onClose(notification.id)}
            />
          ) : (
            <NotificationBanner
              notification={notification}
              onClose={onClose}
            />
          )}
        </div>
      ))}
    </div>
  );
};