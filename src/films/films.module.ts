import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { FilmsController } from './controllers/films.controller';
import { FilmsService } from './services/films.service';

@Module({
  controllers: [FilmsController],
  providers: [FilmsService, PrismaService],
})
export class FilmsModule {}
