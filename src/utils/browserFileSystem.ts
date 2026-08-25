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

    return response.text();
  },
  async writeAsStringAsync() {
    return Promise.resolve();
  },
  async deleteAsync() {
    return Promise.resolve();
  },
  async downloadFile(fromUrl: string) {
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
  },
  async getFileInfo(fileUri: string) {
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
      return {
        uri: fileUri,
        exists: false,
        isDirectory: false,
        size: undefined,
      };
    }
  },
});
