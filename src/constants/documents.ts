import { AllowedFileExtension, AllowedFileType } from 'src/utils/getFilePath';
import { FileType } from 'src/validators/DownloadFileParams';

export const fileTypeConfig: {
  [Property in FileType]: {
    type: AllowedFileType;
    extension: AllowedFileExtension;
    mifielType: 'file' | 'file_signed' | 'xml';
  };
} = {
  [FileType.SignedPdf]: {
    type: 'signed',
    extension: 'pdf',
    mifielType: 'file_signed',
  },
  [FileType.SignedXml]: {
    type: 'signed',
    extension: 'xml',
    mifielType: 'xml',
  },
};
