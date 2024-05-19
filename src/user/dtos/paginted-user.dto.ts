import { Type } from 'class-transformer';
import { IsArray, IsInt } from 'class-validator';
import { UserDto } from './user.dto';

export class PaginatedUsersDto {
  @IsArray()
  @Type(() => UserDto)
  users: UserDto[];

  @IsInt()
  total: number;

  @IsInt()
  skip: number;

  @IsInt()
  take: number;
}
