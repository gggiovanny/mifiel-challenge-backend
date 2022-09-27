import { join } from 'path';
import { FILES_PATH } from 'src/constants/paths';

export type AllowedFileType = 'original' | 'signed' | 'signed-page-only';
export type AllowedFileExtension = 'pdf' | 'xml';

export const getFileName = (
  documentId: string,
  type: AllowedFileType,
  extension: AllowedFileExtension,
) => `${documentId}-${type}.${extension}`;

export default (...args: Parameters<typeof getFileName>) =>
  join(FILES_PATH, getFileName(...args));
