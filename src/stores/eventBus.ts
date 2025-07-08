import type { WebSocketMessage } from '@/services/websocket';

export type EventCallback<T = any> = (data: T) => void;

interface EventSubscription {
  id: string;
  callback: EventCallback;
  filter?: (message: WebSocketMessage) => boolean;
  transform?: (message: WebSocketMessage) => any;
}

class EventBus {
  private subscriptions = new Map<string, EventSubscription[]>();
  private idCounter = 0;

  /**
   * Subscribe to specific event types with optional filtering and transformation
   */
  subscribe<T = any>(
    eventType: string,
    callback: EventCallback<T>,
    options?: {
      filter?: (message: WebSocketMessage) => boolean;
      transform?: (message: WebSocketMessage) => T;
    }
  ): () => void {
    const id = `sub_${++this.idCounter}`;
    const subscription: EventSubscription = {
      id,
      callback,
      filter: options?.filter,
      transform: options?.transform,
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    
    this.subscriptions.get(eventType)!.push(subscription);

    // Return unsubscribe function
    return () => {
      const subs = this.subscriptions.get(eventType);
      if (subs) {
        const index = subs.findIndex(s => s.id === id);
        if (index !== -1) {
          subs.splice(index, 1);
          if (subs.length === 0) {
            this.subscriptions.delete(eventType);
          }
        }
      }
    };
  }

  /**
   * Emit an event to all subscribers
   */
  emit(eventType: string, message: WebSocketMessage): void {
    const subscribers = this.subscriptions.get(eventType);
    if (!subscribers) return;

    subscribers.forEach(sub => {
      try {
        // Apply filter if provided
        if (sub.filter && !sub.filter(message)) {
          return;
        }

        // Apply transformation if provided
        const data = sub.transform ? sub.transform(message) : message;
        
        // Call the callback
        sub.callback(data);
      } catch (error) {
        console.error(`Error in event subscription for ${eventType}:`, error);
      }
    });
  }

  /**
   * Get subscriber count for debugging
   */
  getSubscriberCount(eventType?: string): number {
    if (eventType) {
      return this.subscriptions.get(eventType)?.length || 0;
    }
    return Array.from(this.subscriptions.values()).reduce((total, subs) => total + subs.length, 0);
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.subscriptions.clear();
  }
}

export const eventBus = new EventBus(); 