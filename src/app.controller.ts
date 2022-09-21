import { Body, Controller, Get, Post } from '@nestjs/common';
import { Signer } from '@prisma/client';
import { createWriteStream } from 'fs';
import { join } from 'path';
import * as uniqid from 'uniqid';

import { FILES_PATH } from './constants/paths';
import { PrismaService } from './prisma.service';
import base64Encode from './utils/base64Encode';
import createPdf from './utils/createPdf';
import { CreateDocument } from './validators/CreateDocument';

@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get('signers')
  async getAllSigners(): Promise<Signer[]> {
    return this.prismaService.signer.findMany();
  }

  @Post('document')
  async createDocument(@Body() body: CreateDocument) {
    const { title, content } = body;
    const pdfPath = join(FILES_PATH, `${uniqid()}.pdf`);

    await createPdf(title, content, createWriteStream(pdfPath));
    const contentB64 = base64Encode(pdfPath);

    return this.prismaService.document.create({ data: { title, contentB64 } });
  }
}
