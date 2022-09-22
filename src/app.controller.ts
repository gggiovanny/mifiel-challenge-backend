import { Document } from '@mifiel/api-client';
import { Body, Controller, Get, ParseArrayPipe, Post } from '@nestjs/common';
import { unlinkSync } from 'fs';
import { kebabCase } from 'lodash';
import * as uniqid from 'uniqid';

import { PrismaService } from './prisma.service';
import { GetDocumentsResponse } from './types/documents';
import base64Encode from './utils/base64Encode';
import createPdf from './utils/createPdf';
import getOriginalPdfPath from './utils/getOriginalPdfPath';
import { CreateDocument } from './validators/CreateDocument';
import { Signatory } from './validators/Signatory';

@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  @Post('documents')
  async createDocument(
    @Body() body: CreateDocument,
    @Body('signatories', new ParseArrayPipe({ items: Signatory }))
    signatories: Signatory[],
  ) {
    const { title, content, callback_url } = body;
    const id = uniqid();
    const pdfPath = getOriginalPdfPath(id);

    const pdfFileBuffer = await createPdf(title, content, pdfPath);

    // registers the document on mifiel
    const newMifielDocument = await Document.create({
      original_hash: await Document.getHash(pdfFileBuffer),
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

      if (!localDocument) break;

      response.push({
        ...doc,
        pdf_original_b64: base64Encode(getOriginalPdfPath(localDocument.id)),
      });
    }

    return response;
  }
}
