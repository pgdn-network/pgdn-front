import { storage } from '@/utils/storage';
import config from '@/config';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp?: string;
}

export interface WebSocketConfig {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onReconnect?: () => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = Infinity; // Changed to keep trying indefinitely
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds between attempts
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private periodicReconnectInterval: NodeJS.Timeout | null = null;
  private config: WebSocketConfig = {};
  private isConnecting = false;
  private isManualDisconnect = false;
  private hasBeenConnected = false;

  constructor() {
    this.setupEventListeners();
  }

  private getWebSocketUrl(): string {
    const wsUrl = config.wsUrl || config.apiUrl.replace('http', 'ws').replace('https', 'wss');
    const token = storage.getAccessToken();
    
    if (!token) {
      throw new Error('No access token available for WebSocket connection');
    }
    
    return `${wsUrl}${wsUrl.endsWith('/ws') ? '' : '/ws'}?token=${token}`;
  }

  private setupEventListeners(): void {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !this.isConnected() && !this.isManualDisconnect) {
        // Try to reconnect if page becomes visible and we're not connected
        console.log('Page became visible, attempting to reconnect WebSocket...');
        this.reconnect();
      }
    });

    // Handle online/offline events
    window.addEventListener('online', () => {
      if (!this.isConnected() && !this.isManualDisconnect) {
        console.log('Network came back online, attempting to reconnect WebSocket...');
        this.reconnect();
      }
    });

    // Handle beforeunload to clean up
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }

  connect(config: WebSocketConfig = {}): Promise<void> {
    if (this.isConnecting || this.isConnected()) {
      return Promise.resolve();
    }

    this.config = config;
    this.isConnecting = true;
    this.isManualDisconnect = false;

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.getWebSocketUrl();
        console.log('Connecting to WebSocket:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected successfully');
          this.isConnecting = false;
          this.hasBeenConnected = true;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.startHeartbeat();
          this.startPeriodicReconnectCheck();
          this.config.onConnect?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.config.onMessage?.(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.config.onDisconnect?.();
          
          // Always try to reconnect unless it was a manual disconnect
          if (!this.isManualDisconnect) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          this.config.onError?.(error);
          
          // Don't reject on the first connection attempt, just let onclose handle it
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        };

      } catch (error) {
        this.isConnecting = false;
        console.error('Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.isManualDisconnect = true;
    this.stopHeartbeat();
    this.stopPeriodicReconnectCheck();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    
    // Exponential backoff with jitter, capped at maxReconnectDelay
    const baseDelay = Math.min(this.reconnectDelay * Math.pow(2, Math.min(this.reconnectAttempts - 1, 6)), this.maxReconnectDelay);
    const jitter = Math.random() * 0.3 * baseDelay; // Add up to 30% jitter
    const delay = baseDelay + jitter;
    
    console.log(`Scheduling WebSocket reconnect attempt ${this.reconnectAttempts} in ${Math.round(delay)}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnect();
    }, delay);
  }

  private reconnect(): void {
    if (this.isConnecting || this.isConnected()) {
      return;
    }

    console.log(`Attempting WebSocket reconnection (attempt ${this.reconnectAttempts + 1})...`);
    this.connect(this.config)
      .then(() => {
        console.log('WebSocket reconnected successfully');
        this.config.onReconnect?.();
      })
      .catch((error) => {
        console.error('WebSocket reconnection failed:', error);
        // scheduleReconnect will be called by onclose
      });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping', payload: {}, timestamp: new Date().toISOString() });
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Periodic check to ensure we stay connected (fallback mechanism)
  private startPeriodicReconnectCheck(): void {
    this.periodicReconnectInterval = setInterval(() => {
      if (!this.isConnected() && !this.isManualDisconnect && !this.isConnecting) {
        console.log('Periodic check: WebSocket not connected, attempting to reconnect...');
        this.reconnect();
      }
    }, 60000); // Check every minute
  }

  private stopPeriodicReconnectCheck(): void {
    if (this.periodicReconnectInterval) {
      clearInterval(this.periodicReconnectInterval);
      this.periodicReconnectInterval = null;
    }
  }

  send(message: WebSocketMessage): void {
    if (this.isConnected()) {
      this.ws!.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message:', message);
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }

  // Public method to manually trigger reconnection
  forceReconnect(): void {
    if (this.isConnected()) {
      this.ws?.close();
    }
    this.reconnect();
  }

  // Get reconnection stats for debugging
  getReconnectStats(): { attempts: number; hasBeenConnected: boolean; isManualDisconnect: boolean } {
    return {
      attempts: this.reconnectAttempts,
      hasBeenConnected: this.hasBeenConnected,
      isManualDisconnect: this.isManualDisconnect,
    };
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
export default websocketService; 