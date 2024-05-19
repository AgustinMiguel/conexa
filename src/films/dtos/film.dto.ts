import { Expose, Type } from 'class-transformer';
import { IsArray, IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import { CharacterDto } from './character.dto';

@Expose()
export class FilmDto {
  @IsInt()
  id: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  opening_crawl?: string;

  @IsString()
  @IsOptional()
  director?: string;

  @IsString()
  @IsOptional()
  producer?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  release_date?: Date;

  @IsArray()
  @IsOptional()
  @Type(() => CharacterDto)
  characters?: CharacterDto[];
}
