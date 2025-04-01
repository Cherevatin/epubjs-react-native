import { EventType } from "./enums/event-type.enum";

const INTERNAL_EVENTS = [
  'meta',
  'onStarted',
  'onReady',
  'onDisplayError',
  'onResized',
  'onLocationChange',
  'onSearch',
  'onLocationsReady',
  'onSelected',
  'onUnselected',
  'onOrientationChange',
  'onBeginning',
  'onFinish',
  'onRendered',
  'onLayout',
  'onNavigationLoaded',
  'onAddAnnotation',
  'onChangeAnnotations',
  'onSetInitialAnnotations',
  'onPressAnnotation',
  'onPressFootnote',
  'onScroll',
  'onAddBookmark',
  'onRemoveBookmark',
  'onRemoveBookmarks',
  'onUpdateBookmark',
  EventType.OnDoubleTap,
  EventType.OnSingleTap
];

export default INTERNAL_EVENTS;
