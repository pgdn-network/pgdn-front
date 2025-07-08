import { useEffect, useState, useRef, useCallback } from 'react';
import type { WebSocketMessage } from '@/services/websocket';
import { eventBus } from '@/stores/eventBus';
import { useWebSocketStore } from '@/stores/webSocketStore';

interface SubscriptionOptions<T = any> {
  filter?: (message: WebSocketMessage) => boolean;
  transform?: (message: WebSocketMessage) => T;
  nodeId?: string; // Convenience filter for node-specific messages
}

/**
 * Subscribe to specific WebSocket event types
 */
export function useWebSocketSubscription<T = WebSocketMessage>(
  eventType: string | string[],
  options?: SubscriptionOptions<T>
): T | null {
  const [data, setData] = useState<T | null>(null);
  const unsubscribeRefs = useRef<(() => void)[]>([]);

  const eventTypes = Array.isArray(eventType) ? eventType : [eventType];

  const handleMessage = useCallback((message: T) => {
    console.log(`🔔 Subscription received message:`, message);
    setData(message);
  }, []);

  // Memoize the filter function to prevent unnecessary re-subscriptions
  const combinedFilter = useCallback((message: WebSocketMessage): boolean => {
    // Apply node filter if provided
    if (options?.nodeId) {
      // Try multiple possible field names for node UUID
      const messageNodeId = message.payload?.node_id || 
                           message.payload?.node_uuid || 
                           message.payload?.uuid ||
                           message.payload?.nodeId ||
                           message.payload?.nodeId;
      
      if (!messageNodeId) {
        // For discovery messages, if no node UUID is found, let it through
        // as it might be a broadcast message
        if (message.type.startsWith('discovery_')) {
          return true;
        }
        return false;
      }
      
      if (messageNodeId !== options.nodeId) {
        return false;
      }
    }

    // Apply custom filter if provided
    if (options?.filter) {
      return options.filter(message);
    }

    return true;
  }, [options?.nodeId, options?.filter]);

  useEffect(() => {
    console.log(`📡 Setting up WebSocket subscriptions for: ${eventTypes.join(', ')} (nodeId: ${options?.nodeId})`);

    // Clear previous subscriptions
    unsubscribeRefs.current.forEach(unsub => unsub());
    unsubscribeRefs.current = [];

    // Subscribe to each event type
    eventTypes.forEach(type => {
      const unsubscribe = eventBus.subscribe(type, handleMessage, {
        filter: combinedFilter,
        transform: options?.transform,
      });
      unsubscribeRefs.current.push(unsubscribe);
    });

    return () => {
      console.log(`🧹 Cleaning up WebSocket subscriptions for: ${eventTypes.join(', ')}`);
      unsubscribeRefs.current.forEach(unsub => unsub());
      unsubscribeRefs.current = [];
    };
  }, [eventTypes.join(','), options?.nodeId]);

  return data;
}

/**
 * Subscribe to discovery events for a specific node
 */
export function useNodeDiscoverySubscription(nodeId: string) {
  return useWebSocketSubscription(
    ['discovery_progress', 'discovery_success', 'discovery_failed', 'discovery_completed'],
    {
      nodeId,
      transform: (message) => ({
        type: message.type,
        payload: message.payload,
        timestamp: message.timestamp,
      }),
    }
  );
}

/**
 * Subscribe to scan events for a specific node
 */
export function useNodeScanSubscription(nodeId: string) {
  return useWebSocketSubscription(
    ['scan_started', 'scan_progress', 'scan_completed', 'scan_failed'],
    {
      nodeId,
      transform: (message) => ({
        type: message.type,
        progress: message.payload?.progress,
        status: message.payload?.status,
        error: message.payload?.error,
        timestamp: message.timestamp,
      }),
    }
  );
}

/**
 * Get connection status and stats
 */
export function useWebSocketConnection() {
  const isConnected = useWebSocketStore((state) => state.isConnected);
  const connectionState = useWebSocketStore((state) => state.connectionState);
  const error = useWebSocketStore((state) => state.error);
  
  return { isConnected, connectionState, error };
}

/**
 * Get message history from the store
 */
export function useWebSocketHistory() {
  const getMessagesByType = useWebSocketStore((state) => state.getMessagesByType);
  const getMessagesForNode = useWebSocketStore((state) => state.getMessagesForNode);
  const messages = useWebSocketStore((state) => state.messages);
  
  return {
    messages,
    getMessagesByType,
    getMessagesForNode,
  };
}

/**
 * Subscribe to all WebSocket messages (for debugging)
 */
export function useWebSocketDebug() {
  const [allMessages, setAllMessages] = useState<WebSocketMessage[]>([]);
  
  useWebSocketSubscription('*', {
    transform: (message) => {
      setAllMessages(prev => [...prev.slice(-20), message]); // Keep last 20 messages
      return message;
    },
  });

  return { allMessages };
} 