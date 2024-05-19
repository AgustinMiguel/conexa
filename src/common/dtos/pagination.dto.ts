import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  skip: number = 0;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(25)
  @Type(() => Number)
  take: number = 5;
}
