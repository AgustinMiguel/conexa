import { Role } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsEnum, IsString } from 'class-validator';

@Exclude()
export class UserDto {
  @Expose()
  @IsString()
  readonly id: number;

  @Expose()
  @IsString()
  readonly name: string;

  @Expose()
  @IsEmail()
  readonly email: string;

  @Expose()
  @IsEnum(Role)
  readonly role: Role;

  readonly password?: string;
}
