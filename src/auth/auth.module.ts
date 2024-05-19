import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../common/prisma.service';
import { UserService } from '../user/services';
import { UserModule } from '../user/user.module';
import { AuthController } from './controllers';
import { AuthService } from './services';
import { JwtStrategy } from './strategies';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, PrismaService, UserService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
