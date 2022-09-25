import { Module } from '@nestjs/common';
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';

import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';

@Module({
  imports: [NestjsFormDataModule.config({ storage: MemoryStoredFile })],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
