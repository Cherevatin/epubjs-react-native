import { useContext } from 'react';
import { ReaderContext, ReaderContextProps } from '../context';

export type UseReader = Omit<
  ReaderContextProps,
  | 'registerBook'
  | 'setAtStart'
  | 'setAtEnd'
  | 'setTotalLocations'
  | 'setCurrentLocation'
  | 'setMeta'
  | 'setProgress'
  | 'setLocations'
  | 'setIsLoading'
  | 'setIsRendering'
  | 'setIsSearching'
  | 'setAnnotations'
  | 'setInitialAnnotations'
  | 'setKey'
  | 'setSection'
  | 'setToc'
  | 'setLandmarks'
  | 'setBookmarks'
  | 'setIsBookmarked'
  | 'setSearchResults'
  | 'setFlow'
  | 'meta'
  | 'removeAnnotations'
>;

export function useReader(): UseReader {
  const context = useContext(ReaderContext);
  if (!context) {
    throw new Error('useReader must be used within a ReaderProvider');
  }

  const {
    changeFontSize,
    changeFontFamily,
    changeTheme,
    goToLocation,
    goPrevious,
    goNext,
    getLocations,
    getCurrentLocation,
    getMeta,
    search,
    clearSearchResults,
    isSearching,
    theme,
    atStart,
    atEnd,
    totalLocations,
    currentLocation,
    progress,
    locations,
    isLoading,
    key,
    searchResults,
    addAnnotation,
    addAnnotationByTagId,
    updateAnnotation,
    updateAnnotationByTagId,
    removeAnnotation,
    removeAnnotationByTagId,
    removeAnnotationByCfi,
    removeSelection,
    annotations,
    section,
    toc,
    landmarks,
    addBookmark,
    removeBookmark,
    removeBookmarks,
    updateBookmark,
    bookmarks,
    isBookmarked,
    injectJavascript,
    changeFlow,
    isRendering,
    flow,
    eventEmitter,
  } = context;

  return {
    changeFontSize,
    changeFontFamily,
    changeTheme,
    goToLocation,
    goPrevious,
    goNext,
    getLocations,
    getCurrentLocation,
    getMeta,
    search,
    clearSearchResults,
    addAnnotation,
    addAnnotationByTagId,
    updateAnnotation,
    updateAnnotationByTagId,
    removeAnnotation,
    removeAnnotationByTagId,
    removeAnnotationByCfi,
    removeSelection,
    theme,
    atStart,
    atEnd,
    totalLocations,
    currentLocation,
    progress,
    locations,
    isLoading,
    key,
    isSearching,
    searchResults,
    annotations,
    section,
    toc,
    landmarks,
    addBookmark,
    removeBookmark,
    removeBookmarks,
    updateBookmark,
    bookmarks,
    isBookmarked,
    injectJavascript,
    changeFlow,
    isRendering,
    flow,
    eventEmitter,
  };
}
