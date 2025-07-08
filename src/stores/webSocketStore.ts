import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { WebSocketMessage } from '@/services/websocket';
import { eventBus } from './eventBus';

interface StoredMessage extends WebSocketMessage {
  id: string;
  receivedAt: number;
  expiresAt: number;
}

interface WebSocketState {
  isConnected: boolean;
  connectionState: string;
  error: Error | null;
  lastMessage: WebSocketMessage | null;
  messages: StoredMessage[];
  
  // Actions
  setConnection: (connected: boolean, state: string) => void;
  setError: (error: Error | null) => void;
  addMessage: (message: WebSocketMessage) => void;
  clearMessages: () => void;
  cleanup: () => void;
  getMessagesByType: (type: string, limit?: number) => StoredMessage[];
  getMessagesForNode: (nodeId: string, type?: string, limit?: number) => StoredMessage[];
}

// Configuration
const MAX_MESSAGES = 100; // Maximum number of messages to store
const MESSAGE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const CLEANUP_INTERVAL = 60 * 1000; // Run cleanup every minute

let messageIdCounter = 0;
let cleanupInterval: NodeJS.Timeout | null = null;

export const useWebSocketStore = create<WebSocketState>()(
  subscribeWithSelector((set, get) => ({
    isConnected: false,
    connectionState: 'disconnected',
    error: null,
    lastMessage: null,
    messages: [],

    setConnection: (connected, state) => {
      set({ isConnected: connected, connectionState: state });
      if (connected) {
        set({ error: null });
      }
    },

    setError: (error) => {
      set({ error });
    },

    addMessage: (message) => {
      const now = Date.now();
      const storedMessage: StoredMessage = {
        ...message,
        id: `msg_${++messageIdCounter}`,
        receivedAt: now,
        expiresAt: now + MESSAGE_TTL,
      };

      set((state) => {
        const messages = [...state.messages, storedMessage];
        
        // Remove expired messages and enforce max limit
        const validMessages = messages
          .filter(msg => msg.expiresAt > now)
          .slice(-MAX_MESSAGES); // Keep only the latest MAX_MESSAGES

        return {
          lastMessage: message,
          messages: validMessages,
        };
      });

      // Emit to event bus for subscribers
      eventBus.emit(message.type, message);
      eventBus.emit('*', message); // Wildcard for listening to all messages
    },

    clearMessages: () => {
      set({ messages: [], lastMessage: null });
    },

    cleanup: () => {
      const now = Date.now();
      set((state) => ({
        messages: state.messages.filter(msg => msg.expiresAt > now)
      }));
    },

    getMessagesByType: (type, limit = 10) => {
      const { messages } = get();
      return messages
        .filter(msg => msg.type === type)
        .slice(-limit);
    },

    getMessagesForNode: (nodeId, type, limit = 10) => {
      const { messages } = get();
      return messages
        .filter(msg => {
          const messageNodeId = msg.payload?.node_id || msg.payload?.node_uuid || msg.payload?.uuid;
          const typeMatch = !type || msg.type === type;
          const nodeMatch = messageNodeId && messageNodeId === nodeId;
          
          // Log filtering for debugging
          if (messageNodeId && messageNodeId !== nodeId) {
            console.log(`📝 Store filtering: message node ${messageNodeId} doesn't match requested ${nodeId}`);
          }
          
          return nodeMatch && typeMatch;
        })
        .slice(-limit);
    },
  }))
);

// Start cleanup interval when store is created
if (typeof window !== 'undefined') {
  cleanupInterval = setInterval(() => {
    useWebSocketStore.getState().cleanup();
  }, CLEANUP_INTERVAL);
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
    }
    eventBus.clear();
  });
}

// Subscribe to connection state changes for debugging
useWebSocketStore.subscribe(
  (state) => state.isConnected,
  (connected) => {
    console.log(`📡 WebSocket connection state changed: ${connected ? 'connected' : 'disconnected'}`);
  }
);

// Subscribe to message count for debugging
useWebSocketStore.subscribe(
  (state) => state.messages.length,
  (count) => {
    if (count > 0 && count % 10 === 0) {
      console.log(`📨 WebSocket store now has ${count} messages`);
    }
  }
); 