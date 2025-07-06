import React from 'react';
import { NotificationBanner, type Notification } from './NotificationBanner';

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
          <NotificationBanner
            notification={notification}
            onClose={onClose}
          />
        </div>
      ))}
    </div>
  );
};