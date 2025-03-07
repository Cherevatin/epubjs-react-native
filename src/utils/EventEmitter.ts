import {
  Annotation,
  Bookmark,
  ePubCfi,
  Footnote,
  Landmark,
  Location,
  Orientation,
  SearchResult,
  Section,
  Toc,
} from 'src/types';
import { EventType } from './enums/event-type.enum';

type EventTypeMap = {
  [EventType.OnStarted]: undefined;
  [EventType.OnReady]: {
    totalLocations: number;
    currentLocation: Location;
    progress: number;
  };
  [EventType.OnDisplayError]: { reason: string };
  [EventType.OnResized]: { layout: any };
  [EventType.OnLocationChange]: {
    totalLocations: number;
    currentLocation: Location;
    progress: number;
    currentSection: Section | null;
  };
  [EventType.OnSearch]: { results: SearchResult[]; totalResults: number };
  [EventType.OnLocationsReady]: {
    epubKey: string;
    locations: ePubCfi[];
  };
  [EventType.OnSelected]: { text: string; cfiRange: ePubCfi };
  [EventType.OnOrientationChange]: Orientation;
  [EventType.OnBeginning]: undefined;
  [EventType.OnFinish]: undefined;
  [EventType.OnLayout]: { layout: any };
  [EventType.OnNavigationLoaded]: { toc: Toc; landmarks: Landmark[] };
  [EventType.OnAddAnnotation]: Annotation;
  [EventType.OnPressAnnotation]: Annotation;
  [EventType.OnChangeAnnotations]: Annotation[];
  [EventType.OnPressFootnote]: Footnote;
  [EventType.OnAddBookmark]: Bookmark;
  [EventType.OnChangeBookmarks]: Bookmark[];
  [EventType.OnRemoveBookmark]: Bookmark;
  [EventType.OnUpdateBookmark]: Bookmark;
  [EventType.OnRemoveBookmark]: Bookmark;
  [EventType.OnSwipeLeft]: undefined;
  [EventType.OnSwipeRight]: undefined;
  [EventType.OnSwipeUp]: undefined;
  [EventType.OnSwipeDown]: undefined;
  [EventType.OnPress]: undefined;
  [EventType.OnSingleTap]: undefined;
  [EventType.OnDoubleTap]: undefined;
  [EventType.OnLongPress]: undefined;
};

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
