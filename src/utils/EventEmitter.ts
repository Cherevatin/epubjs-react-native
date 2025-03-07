import { EventTypeMap } from 'src/types';

export class EventEmitter {
  private listeners: {
    [K in keyof EventTypeMap]?: Array<(data: EventTypeMap[K]) => void>;
  } = {};

  addListener<K extends keyof EventTypeMap>(
    event: K,
    callback: (data: EventTypeMap[K]) => void
  ) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback);
    return () => {
      if (this.listeners[event]) {
        const callbacks = this.listeners[event].slice();
        this.listeners[event] = [];
        callbacks
          .filter((cb) => cb !== callback)
          .forEach((i) => {
            this.listeners[event]!.push(i);
          });
      }
    };
  }

  trigger<K extends keyof EventTypeMap>(event: K, data: EventTypeMap[K]) {
    this.listeners[event]?.forEach((callback) =>
      callback(data as EventTypeMap[K])
    );
  }
}
