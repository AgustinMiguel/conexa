import { Type } from "class-transformer";
import { IsDate, IsOptional, IsString } from "class-validator";

export class UpdateFilmDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  opening_crawl: string;

  @IsString()
  @IsOptional()
  director: string;

  @IsString()
  @IsOptional()
  producer: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  release_date: Date;
}
