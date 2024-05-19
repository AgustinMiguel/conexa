import { Type } from 'class-transformer';
import { IsArray, IsInt } from 'class-validator';
import { FilmDto } from './film.dto';

export class PaginatedFilmsDto {
  @IsArray()
  @Type(() => FilmDto)
  films: FilmDto[];

  @IsInt()
  total: number;

  @IsInt()
  skip: number;

  @IsInt()
  take: number;
}
