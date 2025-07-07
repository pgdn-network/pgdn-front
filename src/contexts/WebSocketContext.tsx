import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { websocketService, type WebSocketMessage } from '@/services/websocket';
import { useNotifications } from '@/contexts/NotificationContext';

interface WebSocketContextType {
  isConnected: boolean;
  connectionState: string;
  lastMessage: WebSocketMessage | null;
  error: Error | null;
  send: (message: WebSocketMessage) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Handle WebSocket messages and notifications
  const handleMessage = (message: WebSocketMessage) => {
    console.log('WebSocket message received:', message);
    setLastMessage(message);
    setError(null);
    
    // Handle different message types
    switch (message.type) {
      case 'scan_started':
        addNotification({
          type: 'info',
          title: 'Scan Started',
          message: `Scan started for node ${message.payload?.node_id || 'unknown'}`,
          duration: 8000,
        });
        break;
      
      case 'scan_progress':
        // Update progress in UI - this will be handled by scan tracker
        console.log('Scan progress received:', message.payload);
        break;
      
      case 'scan_completed':
        addNotification({
          type: 'success',
          title: 'Scan Completed',
          message: 'Scan completed successfully!',
          duration: 15000,
        });
        break;
      
      case 'scan_failed':
        addNotification({
          type: 'error',
          title: 'Scan Failed',
          message: `Scan failed: ${message.payload?.error || 'Unknown error'}`,
          duration: 15000,
        });
        break;
      
      case 'notification':
      case 'info':
        // Handle general notifications and info messages
        addNotification({
          type: message.payload?.type || 'info',
          title: message.payload?.title || 'Notification',
          message: message.payload?.message || 'New notification',
          duration: message.payload?.duration || 5000,
        });
        break;
      
      case 'pong':
        // Handle heartbeat response
        console.log('Heartbeat response received');
        break;
      
      default:
        console.log('Unknown WebSocket message type:', message.type, message);
    }
  };

  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, connecting to WebSocket...');
      
      websocketService.connect({
        onMessage: handleMessage,
        onConnect: () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setConnectionState('connected');
          setError(null);
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          setConnectionState('disconnected');
        },
        onError: (error) => {
          console.error('WebSocket error:', error);
          setError(new Error('WebSocket connection error'));
          
          addNotification({
            type: 'error',
            title: 'Connection Error',
            message: 'Failed to connect to real-time updates. Please refresh the page.',
            duration: 5000,
          });
        },
        onReconnect: () => {
          console.log('WebSocket reconnected');
          setIsConnected(true);
          setConnectionState('connected');
          setError(null);
        },
      }).catch((err) => {
        console.error('Failed to connect to WebSocket:', err);
        setError(err instanceof Error ? err : new Error('Failed to connect'));
      });
    } else {
      // Disconnect when not authenticated
      websocketService.disconnect();
      setIsConnected(false);
      setConnectionState('disconnected');
    }

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, [isAuthenticated, addNotification]);

  // Update connection state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(websocketService.getConnectionState());
      setIsConnected(websocketService.isConnected());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const send = (message: WebSocketMessage) => {
    websocketService.send(message);
  };

  const value: WebSocketContextType = {
    isConnected,
    connectionState,
    lastMessage,
    error,
    send,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}; 