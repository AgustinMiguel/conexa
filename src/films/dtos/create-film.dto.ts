import { Type } from 'class-transformer';
import { IsArray, IsDate, IsString } from 'class-validator';
import { CreateCharacterDto } from './create-character.dto';

export class CreateFilmDto {
  @IsString()
  title: string;

  @IsString()
  opening_crawl: string;

  @IsString()
  director: string;

  @IsString()
  producer: string;

  @IsDate()
  @Type(() => Date)
  release_date: Date;

  @IsArray()
  @Type(() => CreateCharacterDto)
  characters: CreateCharacterDto[];
}
