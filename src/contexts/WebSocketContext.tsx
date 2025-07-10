import React, { createContext, useContext, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { websocketService, type WebSocketMessage } from '@/services/websocket';
import { useNotifications } from '@/contexts/NotificationContext';
import { useWebSocketStore } from '@/stores/webSocketStore';

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
  const isMountedRef = useRef(false);
  
  // Use the new WebSocket store
  const { 
    isConnected, 
    connectionState, 
    lastMessage, 
    error,
    setConnection,
    setError,
    addMessage 
  } = useWebSocketStore();

  // Handle WebSocket messages and notifications
  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log('WebSocket message received:', message);
    addMessage(message);
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
      
      case 'connection':
        // Handle connection status messages
        console.log('Connection status received:', message.payload);
        break;
      
      case 'discovery_completed':
      case 'discovery_success':
      case 'discovery_failed':
      case 'discovery_progress':
        // Handle discovery messages - these will be handled by specific subscriptions
        console.log('Discovery message received:', message.type, message.payload);
        break;
      
      default:
        console.log('Unknown WebSocket message type:', message.type, message);
    }
  }, [addNotification]);

  // Connect to WebSocket when authenticated
  useEffect(() => {
    console.log('WebSocketProvider useEffect - isAuthenticated:', isAuthenticated);
    
    // Mark as mounted after first render to avoid StrictMode issues
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return; // Skip the first render in StrictMode
    }
    
    if (isAuthenticated) {
      console.log('User authenticated, connecting to WebSocket...');
      
      websocketService.connect({
        onMessage: handleMessage,
        onConnect: () => {
          console.log('WebSocket connected');
          setConnection(true, 'connected');
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          setConnection(false, 'disconnected');
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
          setConnection(true, 'connected');
        },
      }).catch((err) => {
        console.error('Failed to connect to WebSocket:', err);
        setError(err instanceof Error ? err : new Error('Failed to connect'));
      });
    } else {
      // Disconnect when not authenticated
      console.log('User not authenticated, disconnecting WebSocket...');
      websocketService.disconnect();
      setConnection(false, 'disconnected');
    }

    // Cleanup on unmount
    return () => {
      console.log('WebSocketProvider cleanup - unmounting');
      // Only disconnect if we're actually unmounting, not just in StrictMode
      if (isMountedRef.current) {
        websocketService.disconnect();
      }
    };
  }, [isAuthenticated, addNotification]);

  // Update connection state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const state = websocketService.getConnectionState();
      const connected = websocketService.isConnected();
      setConnection(connected, state);
    }, 1000);

    return () => clearInterval(interval);
  }, [setConnection]);

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