import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // in milliseconds, 0 = persistent
}

interface NotificationBannerProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColorMap = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
};

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ 
  notification, 
  onClose 
}) => {
  const Icon = iconMap[notification.type];

  return (
    <div className={`border-l-4 p-4 mb-4 rounded-r-md ${colorMap[notification.type]}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColorMap[notification.type]}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{notification.title}</h3>
          {notification.message && (
            <p className="mt-1 text-sm opacity-90">{notification.message}</p>
          )}
        </div>
        <div className="ml-auto flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClose(notification.id)}
            className="h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const addNotification = React.useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration (default 5 seconds)
    if (notification.duration !== 0) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  }, []);

  const removeNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
};