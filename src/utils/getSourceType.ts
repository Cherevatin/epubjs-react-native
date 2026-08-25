import { OfflineAccess } from 'src/types';
import { SourceType } from './enums/source-type.enum';

export function getSourceType(
  source: string,
  offlineAccess?: OfflineAccess
): SourceType | undefined {
  if (offlineAccess) {
    return offlineAccess.fileType;
  }

  const normalizedSource = source.trim();

  if (normalizedSource.includes('base64,') || normalizedSource.length > 1000) {
    return SourceType.BASE64;
  }

  if (normalizedSource.toLowerCase().includes('.epub')) {
    return SourceType.EPUB;
  }

  if (normalizedSource.toLowerCase().includes('.opf')) {
    return SourceType.OPF;
  }

  const lastPathSegment = normalizedSource.split(/[/?#]/).filter(Boolean).pop();

  const hasFileExtension = Boolean(
    lastPathSegment && /\.[a-z0-9]+$/i.test(lastPathSegment)
  );

  if (
    !hasFileExtension &&
    /^(blob:|https?:|file:|\/|\.)/i.test(normalizedSource)
  ) {
    return SourceType.EPUB;
  }

  return undefined;
}
