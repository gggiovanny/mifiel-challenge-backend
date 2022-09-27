import { IsEnum, IsNotEmpty } from 'class-validator';

export enum FileType {
  SignedPdf = 'signed_pdf',
  SignedXml = 'signed_xml',
}

export class DownloadFileParams {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsEnum(FileType)
  fileType: FileType;
}
