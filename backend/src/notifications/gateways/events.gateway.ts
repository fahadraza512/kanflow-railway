import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventsGateway {
  private readonly logger = new Logger(EventsGateway.name);
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();

  constructor(private eventEmitter: EventEmitter2) {}

  /**
   * Subscribe to an event
   */
  subscribe(eventName: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, new Set());
    }
    this.subscribers.get(eventName)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(eventName)?.delete(callback);
    };
  }

  /**
   * Emit an event to all subscribers
   */
  emit(eventName: string, data: any): void {
    this.logger.debug(`Emitting event: ${eventName}`, data);
    const callbacks = this.subscribers.get(eventName);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          this.logger.error(`Error in event callback for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Get all subscribers for an event
   */
  getSubscriberCount(eventName: string): number {
    return this.subscribers.get(eventName)?.size || 0;
  }
}
