import { EventType } from './enums/event-type.enum';

export class EventEmitter {
  private listeners: { [event: string]: Array<(data: any) => void> } = {};

  addListener<T>(event: EventType, callback: (data: T) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(
        (listener) => listener !== callback
      );
    };
  }

  trigger<T>(event: EventType, data: T) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }
}
