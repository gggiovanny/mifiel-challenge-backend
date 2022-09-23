import { DocumentResponse } from '@mifiel/models';

export type GetDocumentsResponse = Array<
  DocumentResponse & { pdf_original_b64?: string }
>;

type Signer = DocumentResponse['signers'];

export interface OnCreateDocumentPayload {
  id: string;
  send_mail: boolean;
  original_hash: string;
  name: null;
  signed: boolean;
  signed_at: Date;
  created_at: Date;
  burned_at: null;
  external_id: null;
  remind_every: null;
  expires_at: null;
  days_to_expire: null;
  created_by: number;
  state: string;
  manual_close: boolean;
  encrypted: boolean;
  file_file_name: string;
  callback_url: null;
  sign_callback_url: null;
  file: string;
  file_signed: string;
  file_xml: string;
  signers: Signer[];
  viewers: any[];
}
