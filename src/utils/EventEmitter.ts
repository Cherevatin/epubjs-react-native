import { EventTypeMap } from 'src/types';

export class EventEmitter {
  private listeners: Partial<{
    [K in keyof EventTypeMap]: Array<(data: any) => void>;
  }> = {};

  addListener<K extends keyof EventTypeMap>(
    event: K,
    callback: (data: EventTypeMap[K]) => void
  ) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback);
    return () => {
      this.listeners[event] = this.listeners[event]!.filter(
        (listener) => listener !== callback
      );
    };
  }

  trigger<K extends keyof EventTypeMap>(event: K, data?: EventTypeMap[K]) {
    this.listeners[event]?.forEach((callback) => callback(data));
  }
}
