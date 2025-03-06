import { OfflineAccess } from 'src/types';
import { SourceType } from './enums/source-type.enum';
import { getSourceType } from './getSourceType';

export function getSourceName(
  source: string,
  offlineAccess?: OfflineAccess
): string | undefined {
  const extension = getSourceType(source, offlineAccess);

  if (offlineAccess) {
    return `${offlineAccess.fileName}.${offlineAccess.fileType}`;
  }

  const randomName = Date.now().toString();

  if (extension === SourceType.BASE64) {
    return randomName;
  }

  if (extension === SourceType.EPUB) {
    return `${randomName}.epub`;
  }

  if (extension === SourceType.OPF) {
    return `${randomName}.opf`;
  }

  return undefined;
}
