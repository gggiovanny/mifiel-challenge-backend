import { DocumentResponse } from '@mifiel/models';

export type GetDocumentsResponse = Array<
  DocumentResponse & { pdf_original_b64: string }
>;
