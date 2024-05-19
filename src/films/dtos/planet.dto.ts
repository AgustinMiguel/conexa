import { Expose } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

@Expose()
export class PlanetDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;
}
