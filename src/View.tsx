import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, View as RNView } from 'react-native';
import { WebView } from 'react-native-webview';
import type {
  ShouldStartLoadRequest,
  WebViewMessageEvent,
} from 'react-native-webview/lib/WebViewTypes';
import { defaultTheme as initialTheme, ReaderContext } from './context';
import type {
  Annotation,
  Bookmark,
  ePubCfi,
  Landmark,
  Location,
  Orientation,
  ReaderProps,
  SearchResult,
  Section,
  Toc,
} from './types';
import { OpeningBook } from './utils/OpeningBook';
import INTERNAL_EVENTS from './utils/internalEvents.util';
import { GestureHandler } from './utils/GestureHandler';
import { EventType } from './utils/enums/event-type.enum';

export type ViewProps = Omit<ReaderProps, 'src' | 'fileSystem'> & {
  templateUri: string;
  allowedUris: string;
};

export function View({
  templateUri,
  allowedUris,
  onStarted = () => {},
  onReady = () => {},
  onDisplayError = () => {},
  onResized = () => {},
  onLocationChange = () => {},
  onRendered = () => {},
  onSearch = () => {},
  onLocationsReady = () => {},
  onSelected = () => {},
  onPressAnnotation = () => {},
  onPressFootnote = () => {},
  onOrientationChange = () => {},
  onLayout = () => {},
  onNavigationLoaded = () => {},
  onBeginning = () => {},
  onFinish = () => {},
  onPress = () => {},
  onSingleTap = () => {},
  onDoublePress = () => {},
  onDoubleTap = () => {},
  onLongPress = () => {},
  width,
  height,
  initialLocation,
  enableSwipe = true,
  onSwipeLeft = () => {},
  onSwipeRight = () => {},
  onSwipeUp = () => {},
  onSwipeDown = () => {},
  defaultTheme = initialTheme,
  renderOpeningBookComponent = () => (
    <OpeningBook
      width={width}
      height={height}
      backgroundColor={defaultTheme.body.background}
    />
  ),
  openingBookComponentContainerStyle = {
    width: width || Dimensions.get('screen').width,
    height: height || Dimensions.get('screen').height,
  },
  onPressExternalLink,
  menuItems,
  onAddAnnotation = () => {},
  onChangeAnnotations = () => {},
  initialAnnotations,
  onAddBookmark = () => {},
  onRemoveBookmark = () => {},
  onUpdateBookmark = () => {},
  onChangeBookmarks = () => {},
  onIsBookmarked = () => {},
  initialBookmarks,
  injectedJavascript,
  getInjectionJavascriptFn,
  onWebViewMessage,
  waitForLocationsReady = false,
  keepScrollOffsetOnLocationChange,
  flow,
  onChangeSection = () => {},
}: ViewProps) {
  const {
    registerBook,
    setTotalLocations,
    setCurrentLocation,
    setMeta,
    setProgress,
    setLocations,
    setAtStart,
    setAtEnd,
    goNext,
    goPrevious,
    isRendering,
    setIsRendering,
    goToLocation,
    changeTheme,
    setKey,
    setSearchResults,
    theme,
    removeSelection,
    setAnnotations,
    setInitialAnnotations,
    section,
    setSection,
    setToc,
    setLandmarks,
    setBookmarks,
    bookmarks,
    setIsBookmarked,
    currentLocation: currLoc,
    setIsSearching,
    setFlow,
    eventEmitter,
  } = useContext(ReaderContext);
  const book = useRef<WebView>(null);
  const [selectedText, setSelectedText] = useState<{
    cfiRange: string;
    cfiRangeText: string;
  }>({ cfiRange: '', cfiRangeText: '' });

  useEffect(() => {
    setFlow(flow || 'auto');
  }, [flow, setFlow]);

  useEffect(() => {
    if (getInjectionJavascriptFn && book.current) {
      getInjectionJavascriptFn(book.current.injectJavaScript);
    }
  }, [getInjectionJavascriptFn]);

  const handleChangeIsBookmarked = (
    items: Bookmark[],
    currentLoc = currLoc
  ) => {
    const isBookmarked = items.some(
      (bookmark) =>
        bookmark.location.start.cfi === currentLoc?.start.cfi &&
        bookmark.location.end.cfi === currentLoc?.end.cfi
    );

    setIsBookmarked(isBookmarked);
    onIsBookmarked(isBookmarked);
  };

  const onMessage = (event: WebViewMessageEvent) => {
    const parsedEvent = JSON.parse(event.nativeEvent.data);

    const { type } = parsedEvent;

    if (!INTERNAL_EVENTS.includes(type) && onWebViewMessage) {
      return onWebViewMessage(parsedEvent);
    }

    delete parsedEvent.type;

    if (type === 'meta') {
      const { metadata } = parsedEvent;
      setMeta(metadata);
    }

    if (type === 'onStarted') {
      setIsRendering(true);

      changeTheme(defaultTheme);
      eventEmitter.trigger(EventType.OnStarted);
      return onStarted();
    }

    if (type === 'onReady') {
      const {
        totalLocations,
        currentLocation,
        progress,
      }: {
        totalLocations: number;
        currentLocation: Location;
        progress: number;
      } = parsedEvent;
      if (!waitForLocationsReady) {
        setIsRendering(false);
      }

      if (initialAnnotations) {
        setInitialAnnotations(initialAnnotations);
      }

      if (initialLocation) {
        goToLocation(initialLocation);
      }

      if (injectedJavascript) {
        book.current?.injectJavaScript(injectedJavascript);
      }
      eventEmitter.trigger(EventType.OnReady, {
        totalLocations,
        currentLocation,
        progress,
      });
      return onReady(totalLocations, currentLocation, progress);
    }

    if (type === 'onDisplayError') {
      const { reason }: { reason: string } = parsedEvent;
      setIsRendering(false);
      eventEmitter.trigger(EventType.OnDisplayError, { reason });
      return onDisplayError(reason);
    }

    if (type === 'onResized') {
      const { layout } = parsedEvent;
      eventEmitter.trigger(EventType.OnResized, { layout });
      return onResized(layout);
    }

    if (type === 'onLocationChange') {
      const {
        totalLocations,
        currentLocation,
        progress,
        currentSection,
      }: {
        totalLocations: number;
        currentLocation: Location;
        progress: number;
        currentSection: Section | null;
      } = parsedEvent;
      setTotalLocations(totalLocations);
      setCurrentLocation(currentLocation);
      setProgress(progress);
      setSection(currentSection);

      if (section?.href !== currentSection?.href) {
        onChangeSection(currentSection);
      }

      handleChangeIsBookmarked(bookmarks, currentLocation);

      if (currentLocation.atStart) setAtStart(true);
      else if (currentLocation.atEnd) setAtEnd(true);
      else {
        setAtStart(false);
        setAtEnd(false);
      }
      eventEmitter.trigger(EventType.OnLocationChange, {
        totalLocations,
        currentLocation,
        progress,
        currentSection,
      });
      return onLocationChange(
        totalLocations,
        currentLocation,
        progress,
        currentSection
      );
    }

    if (type === 'onSearch') {
      const {
        results,
        totalResults,
      }: { results: SearchResult[]; totalResults: number } = parsedEvent;
      setSearchResults({ results, totalResults });
      setIsSearching(false);
      eventEmitter.trigger(EventType.OnSearch, { results, totalResults });
      return onSearch(results, totalResults);
    }

    if (type === 'onLocationsReady') {
      const {
        epubKey,
        totalLocations,
        currentLocation,
        progress,
      }: {
        epubKey: string;
        locations: ePubCfi[];
        totalLocations: number;
        currentLocation: Location;
        progress: number;
      } = parsedEvent;
      setLocations(parsedEvent.locations);
      setKey(epubKey);
      setTotalLocations(totalLocations);
      setCurrentLocation(currentLocation);
      setProgress(progress);

      if (waitForLocationsReady) {
        setIsRendering(false);
      }
      eventEmitter.trigger(EventType.OnLocationsReady, {
        epubKey,
        locations: parsedEvent.locations,
      });
      return onLocationsReady(epubKey, parsedEvent.locations);
    }

    if (type === 'onSelected') {
      const { cfiRange, text }: { text: string; cfiRange: ePubCfi } =
        parsedEvent;
      setSelectedText({ cfiRange, cfiRangeText: text });
      eventEmitter.trigger(EventType.OnSelected, { text, cfiRange });
      return onSelected(text, cfiRange);
    }

    if (type === 'onOrientationChange') {
      const {
        orientation,
      }: {
        orientation: Orientation;
      } = parsedEvent;
      eventEmitter.trigger(EventType.OnOrientationChange, orientation);
      return onOrientationChange(orientation);
    }

    if (type === 'onBeginning') {
      setAtStart(true);
      eventEmitter.trigger(EventType.OnBeginning);
      return onBeginning();
    }

    if (type === 'onFinish') {
      setAtEnd(true);
      eventEmitter.trigger(EventType.OnFinish);
      return onFinish();
    }

    if (type === 'onRendered') {
      const { currentSection } = parsedEvent;
      return onRendered(parsedEvent.section, currentSection);
    }

    if (type === 'onLayout') {
      const { layout } = parsedEvent;
      eventEmitter.trigger(EventType.OnLayout, { layout });
      return onLayout(layout);
    }

    if (type === 'onNavigationLoaded') {
      const { toc, landmarks }: { toc: Toc; landmarks: Landmark[] } =
        parsedEvent;
      setToc(toc);
      setLandmarks(landmarks);
      eventEmitter.trigger(EventType.OnNavigationLoaded, { toc, landmarks });
      return onNavigationLoaded({ toc, landmarks });
    }

    if (type === 'onAddAnnotation') {
      const { annotation }: { annotation: Annotation } = parsedEvent;
      eventEmitter.trigger(EventType.OnAddAnnotation, annotation);
      return onAddAnnotation(annotation);
    }

    if (type === 'onChangeAnnotations') {
      const { annotations }: { annotations: Annotation[] } = parsedEvent;
      setAnnotations(annotations);
      eventEmitter.trigger(EventType.OnChangeAnnotations, annotations);
      return onChangeAnnotations(annotations);
    }

    if (type === 'onSetInitialAnnotations') {
      const { annotations }: { annotations: Annotation[] } = parsedEvent;
      setAnnotations(annotations);
      return () => {};
    }

    if (type === 'onPressAnnotation') {
      const { annotation }: { annotation: Annotation } = parsedEvent;
      eventEmitter.trigger(EventType.OnPressAnnotation, annotation);
      return onPressAnnotation(annotation);
    }

    if (type === 'onPressFootnote') {
      const { innerHTML }: { innerHTML: string } = parsedEvent;
      eventEmitter.trigger(EventType.OnPressFootnote, { innerHTML });
      return onPressFootnote({ innerHTML });
    }

    if (type === 'onAddBookmark') {
      const { bookmark }: { bookmark: Bookmark } = parsedEvent;

      setBookmarks([...bookmarks, bookmark]);
      eventEmitter.trigger(EventType.OnAddBookmark, bookmark);
      onAddBookmark(bookmark);
      handleChangeIsBookmarked([...bookmarks, bookmark]);
      eventEmitter.trigger(EventType.OnChangeBookmarks, [
        ...bookmarks,
        bookmark,
      ]);
      return onChangeBookmarks([...bookmarks, bookmark]);
    }

    if (type === 'onRemoveBookmark') {
      const { bookmark }: { bookmark: Bookmark } = parsedEvent;

      onRemoveBookmark(bookmark);
      eventEmitter.trigger(EventType.OnRemoveBookmark, bookmark);
      const filteredBookmarks = bookmarks.filter(
        ({ id }) => id !== bookmark.id
      );
      handleChangeIsBookmarked(filteredBookmarks);
      eventEmitter.trigger(EventType.OnChangeBookmarks, filteredBookmarks);
      return onChangeBookmarks(filteredBookmarks);
    }

    if (type === 'onRemoveBookmarks') {
      handleChangeIsBookmarked([]);
      eventEmitter.trigger(EventType.OnChangeBookmarks, []);
      return onChangeBookmarks([]);
    }

    if (type === 'onUpdateBookmark') {
      const { bookmark }: { bookmark: Bookmark } = parsedEvent;
      const Bookmarks = bookmarks;

      const index = Bookmarks.findIndex((item) => item.id === bookmark.id);
      Bookmarks[index] = bookmark;

      onUpdateBookmark(bookmark);
      eventEmitter.trigger(EventType.OnUpdateBookmark, bookmark);
      handleChangeIsBookmarked(Bookmarks);
      eventEmitter.trigger(EventType.OnChangeBookmarks, Bookmarks);
      return onChangeBookmarks(Bookmarks);
    }

    return () => {};
  };

  const handleOnCustomMenuSelection = (event: {
    nativeEvent: {
      label: string;
      key: string;
      selectedText: string;
    };
  }) => {
    menuItems
      ?.filter((item) => item.key === event.nativeEvent.key)
      .forEach((item) => {
        eventEmitter.trigger(
          EventType.OnCustomMenuSelection,
          event.nativeEvent
        );
        if (item.action) {
          const removeSelectionMenu = item.action(
            selectedText.cfiRange,
            selectedText.cfiRangeText
          );

          if (removeSelectionMenu) {
            removeSelection();
          }
          return;
        }
        removeSelection();
      });
  };

  const handleOnShouldStartLoadWithRequest = (
    request: ShouldStartLoadRequest
  ) => {
    if (
      !isRendering &&
      request.mainDocumentURL &&
      request.url !== request.mainDocumentURL
    ) {
      goToLocation(request.url.replace(request.mainDocumentURL, ''));
    }

    if (
      (request.url.includes('mailto:') || request.url.includes('tel:')) &&
      onPressExternalLink
    ) {
      onPressExternalLink(request.url);
    }

    return true;
  };

  useEffect(() => {
    if (initialBookmarks) {
      setBookmarks(initialBookmarks);
    }
  }, [initialBookmarks, setBookmarks]);

  useEffect(() => {
    if (book.current) registerBook(book.current);
  }, [registerBook]);

  return (
    <GestureHandler
      width={width}
      height={height}
      onSingleTap={() => {
        eventEmitter.trigger(EventType.OnPress);
        onPress();
        eventEmitter.trigger(EventType.OnSingleTap);
        onSingleTap();
      }}
      onDoubleTap={() => {
        onDoublePress();
        eventEmitter.trigger(EventType.OnDoubleTap);
        onDoubleTap();
      }}
      onLongPress={() => {
        onLongPress();
        eventEmitter.trigger(EventType.OnLongPress);
      }}
      onSwipeLeft={() => {
        if (enableSwipe) {
          goNext({
            keepScrollOffset: keepScrollOffsetOnLocationChange,
          });
          eventEmitter.trigger(EventType.OnSwipeLeft);
          onSwipeLeft();
        }
      }}
      onSwipeRight={() => {
        if (enableSwipe) {
          goPrevious({
            keepScrollOffset: keepScrollOffsetOnLocationChange,
          });
          eventEmitter.trigger(EventType.OnSwipeRight);
          onSwipeRight();
        }
      }}
      onSwipeUp={() => {
        if (enableSwipe) {
          eventEmitter.trigger(EventType.OnSwipeUp);
          onSwipeUp();
        }
      }}
      onSwipeDown={() => {
        if (enableSwipe) {
          eventEmitter.trigger(EventType.OnSwipeDown);
          onSwipeDown();
        }
      }}
    >
      {isRendering && (
        <RNView
          style={{
            ...openingBookComponentContainerStyle,
            position: 'absolute',
            zIndex: 2,
          }}
        >
          {renderOpeningBookComponent()}
        </RNView>
      )}

      <WebView
        ref={book}
        source={{ uri: templateUri }}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled
        originWhitelist={['*']}
        scrollEnabled={false}
        mixedContentMode="compatibility"
        onMessage={onMessage}
        menuItems={menuItems}
        onCustomMenuSelection={handleOnCustomMenuSelection}
        allowingReadAccessToURL={allowedUris}
        allowUniversalAccessFromFileURLs
        allowFileAccessFromFileURLs
        allowFileAccess
        javaScriptCanOpenWindowsAutomatically
        onOpenWindow={(event) => {
          event.preventDefault();

          if (onPressExternalLink) {
            onPressExternalLink(event.nativeEvent.targetUrl);
          }
        }}
        onShouldStartLoadWithRequest={handleOnShouldStartLoadWithRequest}
        style={{
          width,
          backgroundColor: theme.body.background,
          height,
        }}
      />
    </GestureHandler>
  );
}
