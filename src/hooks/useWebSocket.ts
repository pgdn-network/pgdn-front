import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketService, type WebSocketMessage, type WebSocketConfig } from '@/services/websocket';

export interface UseWebSocketOptions extends WebSocketConfig {
  autoConnect?: boolean;
  autoReconnect?: boolean;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  connectionState: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  send: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
  error: Error | null;
}

export const useWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const {
    autoConnect = true,
    autoReconnect = true,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    onReconnect,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const configRef = useRef<WebSocketConfig>({});

  // Update config when options change
  useEffect(() => {
    configRef.current = {
      onMessage: (message: WebSocketMessage) => {
        setLastMessage(message);
        setError(null);
        onMessage?.(message);
      },
      onConnect: () => {
        setIsConnected(true);
        setConnectionState('connected');
        setError(null);
        onConnect?.();
      },
      onDisconnect: () => {
        setIsConnected(false);
        setConnectionState('disconnected');
        onDisconnect?.();
      },
      onError: (error: Event) => {
        setError(new Error('WebSocket error occurred'));
        onError?.(error);
      },
      onReconnect: () => {
        setIsConnected(true);
        setConnectionState('connected');
        setError(null);
        onReconnect?.();
      },
    };
  }, [onMessage, onConnect, onDisconnect, onError, onReconnect]);

  const connect = useCallback(async () => {
    try {
      setError(null);
      setConnectionState('connecting');
      await websocketService.connect(configRef.current);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect'));
      setConnectionState('disconnected');
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setIsConnected(false);
    setConnectionState('disconnected');
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    websocketService.send(message);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect().catch(console.error);
    }

    // Cleanup on unmount
    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect]);

  // Update connection state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(websocketService.getConnectionState());
      setIsConnected(websocketService.isConnected());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    connectionState,
    connect,
    disconnect,
    send,
    lastMessage,
    error,
  };
}; 