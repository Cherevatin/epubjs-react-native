const debugEnabled = () =>
  typeof globalThis !== 'undefined' &&
  Boolean((globalThis as any).epubjsReactNativeDebug);

const log = (...args: any[]) => {
  if (debugEnabled()) {
    console.log('[epubjs-react-native:web]', ...args);
  }
};

const logError = (...args: any[]) => {
  if (debugEnabled()) {
    console.error('[epubjs-react-native:web]', ...args);
  }
};

export const browserFileSystem = () => ({
  file: null,
  progress: 0,
  downloading: false,
  size: 0,
  error: null,
  success: true,
  documentDirectory: null,
  cacheDirectory: null,
  bundleDirectory: undefined,
  async readAsStringAsync(
    fileUri: string,
    options?: { encoding?: 'utf8' | 'base64' }
  ) {
    log('readAsStringAsync', fileUri, options);

    try {
      const response = await fetch(fileUri);

      if (!response.ok) {
        throw new Error(
          `Failed to read file: ${response.status} ${response.statusText}`
        );
      }

      if (options?.encoding === 'base64') {
        const buffer = await response.arrayBuffer();
        let binary = '';
        const bytes = new Uint8Array(buffer);
        bytes.forEach((byte) => {
          binary += String.fromCharCode(byte);
        });

        return btoa(binary);
      }

      return await response.text();
    } catch (error) {
      logError('readAsStringAsync failed', fileUri, error);
      throw error;
    }
  },
  async writeAsStringAsync() {
    log('writeAsStringAsync noop on web');
    await Promise.resolve();
  },
  async deleteAsync() {
    log('deleteAsync noop on web');
    await Promise.resolve();
  },
  async downloadFile(fromUrl: string) {
    log('downloadFile', fromUrl);

    try {
      const response = await fetch(fromUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to download file: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const uri = URL.createObjectURL(blob);

      return {
        uri,
        mimeType: blob.type || null,
      };
    } catch (error) {
      logError('downloadFile failed', fromUrl, error);
      throw error;
    }
  },
  async getFileInfo(fileUri: string) {
    log('getFileInfo', fileUri);

    try {
      const response = await fetch(fileUri, { method: 'HEAD' });

      return {
        uri: fileUri,
        exists: response.ok,
        isDirectory: false,
        size: response.headers.get('content-length')
          ? Number(response.headers.get('content-length'))
          : undefined,
      };
    } catch (error) {
      logError('getFileInfo failed', fileUri, error);
      return {
        uri: fileUri,
        exists: false,
        isDirectory: false,
        size: undefined,
      };
    }
  },
});
