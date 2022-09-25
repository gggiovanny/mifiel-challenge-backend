import { Document } from '@mifiel/api-client';
import { DocumentResponse } from '@mifiel/models';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  ParseArrayPipe,
  Post,
} from '@nestjs/common';
import { unlinkSync } from 'fs';
import { kebabCase } from 'lodash';
import { FormDataRequest } from 'nestjs-form-data';
import uniqid from 'uniqid';

import { PrismaService } from './prisma.service';
import {
  GetDocumentsResponse,
  OnCreateDocumentPayload,
} from './types/documents';
import base64Encode from './utils/base64Encode';
import createPdf from './utils/createPdf';
import getFilePath from './utils/getFilePath';
import mergePdfs from './utils/mergePdfs';
import { CreateDocument } from './validators/CreateDocument';
import { Signatory } from './validators/Signatory';

@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  @Post('documents')
  @FormDataRequest()
  async createDocument(
    @Body() body: CreateDocument,
    @Body('signatories', new ParseArrayPipe({ items: Signatory }))
    signatories: Signatory[],
  ): Promise<DocumentResponse> {
    const { title, content, callback_url } = body;
    const id = uniqid();
    const pdfPath = getFilePath(id, 'original', 'pdf');

    await createPdf(title, content, pdfPath);

    // registers the document on mifiel
    const newMifielDocument = await Document.create({
      original_hash: await Document.getHash(pdfPath),
      name: `${kebabCase(title)}.pdf`,
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
            }
          : doc,
      );
    }

    return response;
  }

  @Post('on-document-signed')
  @FormDataRequest()
  async onDocumentSigned(@Body() body: OnCreateDocumentPayload) {
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

      // fetching the signed page
      await Document.saveFile({
        type: 'file_signed',
        documentId: mifielId,
        path: signedPagePath,
      });

      // merging the signed page with the original pdf
      await mergePdfs([originalPdfPath, signedPagePath], signedPdfPath);
      unlinkSync(signedPagePath);

      // TODO: remove, just temp saving original xml to test the PDF -> XML merge
      Document.saveFile({
        type: 'xml',
        documentId: mifielId,
        path: getFilePath(localDocument.id, 'original', 'xml'),
      });

      return { signedPdfPath };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
