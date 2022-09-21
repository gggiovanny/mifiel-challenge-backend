import { Controller, Get } from '@nestjs/common';
import { Signer } from '@prisma/client';

import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get('signers')
  async getAllSigners(): Promise<Signer[]> {
    return this.prismaService.signer.findMany();
  }
}
