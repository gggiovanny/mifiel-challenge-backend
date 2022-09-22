import { join } from 'path';
import { FILES_PATH } from 'src/constants/paths';

export default (documentId: string) =>
  join(FILES_PATH, `${documentId}-original.pdf`);
