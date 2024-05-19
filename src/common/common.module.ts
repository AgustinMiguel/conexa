import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({})
export class CommonModule {
  exports: [PrismaService];
}
