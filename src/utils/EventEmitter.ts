import type {
  Orientation,
  PageCompleteEvent,
  ReadyEvent,
  NavigationLoadedEvent,
  LocationsReadyEvent,
  LayoutEvent,
  SearchEvent,
  LocationChangeEvent,
  Annotation,
  Footnote,
  CustomMenuSelectionEvent,
  Bookmark,
  ScrollEvent,
  SelectedEvent,
  DisplayErrorEvent,
} from 'src/types';
import type { EventType } from './enums/event-type.enum';

export type EventPayloadByEvent = {
  [EventType.OnStarted]: never;
  [EventType.OnReady]: ReadyEvent;
  [EventType.OnDisplayError]: DisplayErrorEvent;
  [EventType.OnResized]: LayoutEvent;
  [EventType.OnLocationChange]: LocationChangeEvent;
  [EventType.OnSearch]: SearchEvent;
  [EventType.OnLocationsReady]: LocationsReadyEvent;
  [EventType.OnSelected]: SelectedEvent;
  [EventType.OnUnselected]: never;
  [EventType.OnOrientationChange]: Orientation;
  [EventType.OnBeginning]: never;
  [EventType.OnFinish]: never;
  [EventType.OnLayout]: LayoutEvent;
  [EventType.OnNavigationLoaded]: NavigationLoadedEvent;
  [EventType.OnAddAnnotation]: Annotation;
  [EventType.OnPressAnnotation]: Annotation;
  [EventType.OnChangeAnnotations]: Annotation[];
  [EventType.OnPressFootnote]: Footnote;
  [EventType.OnAddBookmark]: Bookmark;
  [EventType.OnChangeBookmarks]: Bookmark[];
  [EventType.OnRemoveBookmark]: Bookmark;
  [EventType.OnUpdateBookmark]: Bookmark;
  [EventType.OnRemoveBookmark]: Bookmark;
  [EventType.OnSwipeLeft]: never;
  [EventType.OnSwipeRight]: never;
  [EventType.OnSwipeUp]: never;
  [EventType.OnSwipeDown]: never;
  [EventType.OnPress]: never;
  [EventType.OnSingleTap]: never;
  [EventType.OnDoubleTap]: never;
  [EventType.OnLongPress]: never;
  [EventType.OnCustomMenuSelection]: CustomMenuSelectionEvent;
  [EventType.OnScroll]: ScrollEvent;
  [EventType.OnPageComplete]: PageCompleteEvent;
};

export class EventEmitter {
  private listeners: {
    [K in keyof EventPayloadByEvent]?: Array<
      EventPayloadByEvent[K] extends never
        ? () => void
        : (event: EventPayloadByEvent[K]) => void
    >;
  } = {};

  addListener<K extends keyof EventPayloadByEvent>(
    event: K,
    listener: EventPayloadByEvent[K] extends never
      ? () => void
      : (event: EventPayloadByEvent[K]) => void
  ) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
    return () => {
      if (this.listeners[event]) {
        const listeners = this.listeners[event].slice();
        this.listeners[event] = [];
        listeners
          .filter((l) => l !== listener)
          .forEach((i) => {
            this.listeners[event]!.push(i);
          });
      }
    };
  }

  trigger<K extends keyof EventPayloadByEvent>(
    event: K,
    ...args: EventPayloadByEvent[K] extends never
      ? never[]
      : [EventPayloadByEvent[K]]
  ) {
    this.listeners[event]?.forEach((listener) => {
      listener(args[0] as EventPayloadByEvent[K]);
    });
  }
}
