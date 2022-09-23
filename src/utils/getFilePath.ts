import { join } from 'path';
import { FILES_PATH } from 'src/constants/paths';

export default (
  documentId: string,
  type: 'original' | 'signed',
  extension: 'pdf' | 'xml',
) => join(FILES_PATH, `${documentId}-${type}.${extension}`);
