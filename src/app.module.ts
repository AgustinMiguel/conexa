import { Module } from "@nestjs/common";

import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { PrismaService } from "./common/prisma.service";
import { FilmsModule } from "./films/films.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    FilmsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
