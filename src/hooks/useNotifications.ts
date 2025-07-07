import { useEffect } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { useNotifications } from '@/contexts/NotificationContext';

/**
 * Hook for components that want to handle their own WebSocket notifications
 * Note: The WebSocketProvider already handles basic notifications automatically
 * Use this hook only if you need custom notification handling
 */
export const useWebSocketNotifications = () => {
  const { lastMessage } = useWebSocketContext();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!lastMessage) return;

    // This hook can be used for custom notification handling
    // The WebSocketProvider already handles basic notifications
    console.log('Custom WebSocket notification handler:', lastMessage);
    
    // Example: Custom handling for specific message types
    switch (lastMessage.type) {
      case 'custom_scan_update':
        addNotification({
          type: 'info',
          title: 'Custom Scan Update',
          message: `Custom handling for: ${lastMessage.payload?.message || 'Unknown'}`,
          duration: 5000,
        });
        break;
      
      // Add other custom message types here
      default:
        // Let the provider handle standard messages
        break;
    }
  }, [lastMessage, addNotification]);
}; 