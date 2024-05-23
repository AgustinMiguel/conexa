import { Module } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { FilmsController } from "./controllers";
import { FilmsService } from "./services";

@Module({
  controllers: [FilmsController],
  providers: [FilmsService, PrismaService],
})
export class FilmsModule {}
