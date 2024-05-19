import { Expose, Type } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';
import { PlanetDto } from './planet.dto';

@Expose()
export class CharacterDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsString()
  gender: string;

  @Type(() => PlanetDto)
  homeworld: PlanetDto;
}
