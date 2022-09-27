import { Document } from '@mifiel/api-client';
import { DocumentResponse } from '@mifiel/models';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { readFileSync, unlinkSync } from 'fs';
import { FormDataRequest } from 'nestjs-form-data';
import uniqid from 'uniqid';

import { fileTypeConfig } from './constants/documents';
import { PrismaService } from './prisma.service';
import {
  GetDocumentsResponse,
  OnCreateDocumentPayload,
} from './types/documents';
import base64Encode from './utils/base64Encode';
import createPdf from './utils/createPdf';
import createXmlWithPdf from './utils/createXmlWithPdf';
import getFilePath, { getFileName } from './utils/getFilePath';
import mergePdfs from './utils/mergePdfs';
import { CreateDocument } from './validators/CreateDocument';
import { DownloadFileParams } from './validators/DownloadFileParams';

@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  @Post('documents')
  @FormDataRequest()
  async createDocument(
    @Body() body: CreateDocument,
  ): Promise<DocumentResponse | HttpException> {
    try {
      const { title, content, callback_url, signatories } = body;
      const id = uniqid();
      const pdfPath = getFilePath(id, 'original', 'pdf');

      await createPdf(title, content, pdfPath);

      // registers the document on mifiel
      const newMifielDocument = await Document.create({
        original_hash: await Document.getHash(pdfPath),
        name: `${title}.pdf`,
        signatories,
        callback_url,
      });

      if (newMifielDocument.id) {
        // links the mifiel document with the local stored pdf file
        await this.prismaService.document.create({
          data: { id, mifielId: newMifielDocument.id },
        });
      } else {
        // deletes the pdf file
        unlinkSync(pdfPath);
      }

      return newMifielDocument;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('documents')
  async getDocuments(): Promise<GetDocumentsResponse> {
    const mifielDocuments = await Document.all();
    const response: GetDocumentsResponse = [];

    for (const doc of mifielDocuments) {
      const localDocument = await this.prismaService.document.findFirst({
        where: { mifielId: doc.id },
      });

      response.push(
        localDocument
          ? {
              ...doc,
              file_b64: base64Encode(
                getFilePath(localDocument.id, 'original', 'pdf'),
              ),
              localDocumentId: localDocument.id,
            }
          : doc,
      );
    }

    return response;
  }

  @Post('on-document-signed')
  @FormDataRequest()
  async onDocumentSigned(
    @Body() body: OnCreateDocumentPayload,
  ): Promise<{ signedPdfPath: string; signedXmlPath: string } | HttpException> {
    try {
      const { id: mifielId } = body;
      // eslint-disable-next-line no-console
      console.log('onDocumentSigned body', body);

      const localDocument = await this.prismaService.document.findFirst({
        where: { mifielId },
      });

      if (!localDocument) {
        throw new Error('No local document found');
      }

      // creating all files involved paths
      const originalPdfPath = getFilePath(localDocument.id, 'original', 'pdf');
      const signedPdfPath = getFilePath(localDocument.id, 'signed', 'pdf');
      const signedPagePath = getFilePath(
        localDocument.id,
        'signed-page-only',
        'pdf',
      );
      const originalXmlPath = getFilePath(localDocument.id, 'original', 'xml');
      const signedXmlPath = getFilePath(localDocument.id, 'signed', 'xml');

      // saving the signed page and the xml with no file content
      await Document.saveFile({
        type: 'file_signed',
        documentId: mifielId,
        path: signedPagePath,
      });
      await Document.saveFile({
        type: 'xml',
        documentId: mifielId,
        path: originalXmlPath,
      });

      // merging the signed page with the original pdf
      await mergePdfs({
        originalPdfPath,
        signedPagePath,
        outputPath: signedPdfPath,
      });
      unlinkSync(signedPagePath);

      createXmlWithPdf({
        originalPdfPath,
        originalXmlPath,
        outputXmlPath: signedXmlPath,
      });

      return { signedPdfPath, signedXmlPath };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('documents/:id/:fileType')
  async downloadFile(
    @Param() params: DownloadFileParams,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { id, fileType } = params;
    const { type, extension, mifielType } = fileTypeConfig[fileType];

    const filePath = getFilePath(id, type, extension);
    const fileName = getFileName(id, type, extension);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    try {
      const file = readFileSync(filePath);
      return new StreamableFile(file);
    } catch (_error) {
      try {
        await Document.saveFile({
          type: mifielType,
          documentId: id,
          path: filePath,
        });
        const file = readFileSync(filePath);
        return new StreamableFile(file);
      } catch (_error) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }
    }
  }
}
