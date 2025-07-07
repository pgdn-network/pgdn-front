import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface NodeBannerProps {
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

const NodeBanner: React.FC<NodeBannerProps> = ({
  type,
  title,
  message,
  onClose,
  actions,
  className = ''
}) => {
  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-l-4 border-yellow-400',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          message: 'text-yellow-700'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-l-4 border-red-400',
          icon: 'text-red-400',
          title: 'text-red-800',
          message: 'text-red-700'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-l-4 border-blue-400',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          message: 'text-blue-700'
        };
      case 'success':
        return {
          container: 'bg-green-50 border-l-4 border-green-400',
          icon: 'text-green-400',
          title: 'text-green-800',
          message: 'text-green-700'
        };
      default:
        return {
          container: 'bg-gray-50 border-l-4 border-gray-400',
          icon: 'text-gray-400',
          title: 'text-gray-800',
          message: 'text-gray-700'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`${styles.container} p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className={`h-4 w-4 ${styles.icon} mr-2`} />
          <div>
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {title}
            </h3>
            <p className={`text-sm ${styles.message} mt-0.5`}>
              {message}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {actions}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`h-6 px-2 ${styles.message} hover:${styles.title}`}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeBanner; 